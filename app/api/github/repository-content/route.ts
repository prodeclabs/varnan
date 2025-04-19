import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

// Define interfaces for GitHub repository content items
interface GitHubContentItem {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  content?: string
  encoding?: string
  _links: {
    self: string
    git: string
    html: string
  }
}

// Extended interface for directory items with contents
interface DirectoryWithContents extends GitHubContentItem {
  contents: GitHubContentItem[]
}

export async function POST(request: Request) {
	try {
		const cookieStore = await cookies()
		const token = cookieStore.get('github_access_token')?.value

		if (!token) {
			return Response.json(
				{error: 'GitHub authentication required'},
				{status: 401}
			)
		}

		const body = await request.json()
		const {repository, path = '', recursive = false} = body

		if (!repository) {
			return Response.json(
				{error: 'Repository is required'},
				{status: 400}
			)
		}

		console.log(`Fetching repo content for ${repository}, path: ${path || 'root'}, recursive: ${recursive}`)

		// Fetch repository contents
		const contentsUrl = `https://api.github.com/repos/${repository}/contents/${path}`
		const fetchOptions = {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		}

		const contentsResponse = await fetch(contentsUrl, fetchOptions)

		if (!contentsResponse.ok) {
			const errorData = await contentsResponse.json().catch(() => ({}))
			console.error('GitHub API error:', contentsResponse.status, errorData)

			return Response.json(
				{
					error: 'Failed to fetch repository contents',
					status: contentsResponse.status,
					details: errorData
				},
				{status: contentsResponse.status}
			)
		}

		const contentsData = await contentsResponse.json()

		// If recursive is true and we have directories, fetch their contents too
		if (recursive && Array.isArray(contentsData)) {
			const directories = contentsData.filter(item => item.type === 'dir') as GitHubContentItem[]

			if (directories.length > 0) {
				// Process directories in parallel with rate limiting (max 5 at a time)
				const processDirectory = async (dir: GitHubContentItem): Promise<DirectoryWithContents> => {
					const dirPath = dir.path
					const dirUrl = `https://api.github.com/repos/${repository}/contents/${dirPath}`
					const dirResponse = await fetch(dirUrl, fetchOptions)

					if (!dirResponse.ok) {
						console.warn(`Failed to fetch directory: ${dirPath}`)
						return {
							...dir,
							contents: []
						}
					}

					const dirContents = await dirResponse.json()

					// If recursive is true, process subdirectories
					if (recursive && Array.isArray(dirContents)) {
						const subdirectories = dirContents.filter(item => item.type === 'dir') as GitHubContentItem[]

						if (subdirectories.length > 0) {
							const subDirWithContents = await processDirectoriesWithLimit(subdirectories, 5)

							// Replace subdirectory entries with their full contents
							for (let i = 0; i < dirContents.length; i++) {
								if (dirContents[i].type === 'dir') {
									const subDirContent = subDirWithContents.find(sd => sd.path === dirContents[i].path)
									if (subDirContent) {
										dirContents[i] = subDirContent
									}
								}
							}
						}
					}

					return {
						...dir,
						contents: dirContents
					}
				}

				// Limit concurrency to avoid rate limiting
				const processDirectoriesWithLimit = async (directories: GitHubContentItem[], limit = 5): Promise<DirectoryWithContents[]> => {
					const results: DirectoryWithContents[] = []
					for (let i = 0; i < directories.length; i += limit) {
						const batch = directories.slice(i, i + limit)
						const batchResults = await Promise.all(batch.map(processDirectory))
						results.push(...batchResults)
					}
					return results
				}

				const directoriesWithContents = await processDirectoriesWithLimit(directories)

				// Replace directories in contentsData with versions that include contents
				for (let i = 0; i < contentsData.length; i++) {
					if (contentsData[i].type === 'dir') {
						const dirWithContents = directoriesWithContents.find(d => d.path === contentsData[i].path)
						if (dirWithContents) {
							contentsData[i] = dirWithContents
						}
					}
				}
			}
		}

		// Decode base64 content for files
		const processContent = (item: GitHubContentItem) => {
			// If it's a file with base64 content, decode it
			if (item.type === 'file' && item.content && item.encoding === 'base64') {
				// Remove line breaks that GitHub adds to base64
				const cleanedBase64 = item.content.replace(/\n/g, '')
				item.content = Buffer.from(cleanedBase64, 'base64').toString('utf-8')
				delete item.encoding // Remove encoding property since it's now decoded
			}

			// If it's a directory with contents, process each content item
			if (item.type === 'dir' && (item as DirectoryWithContents).contents) {
				(item as DirectoryWithContents).contents.forEach(processContent)
			}

			return item
		}

		// Process the content
		if (Array.isArray(contentsData)) {
			contentsData.forEach(processContent)
		} else {
			processContent(contentsData)
		}

		return Response.json({
			repository,
			path: path || '/',
			contents: contentsData
		})
	} catch (error) {
		console.error('Error fetching repository content:', error)
		return Response.json(
			{error: 'Failed to process request', details: error instanceof Error ? error.message : String(error)},
			{status: 500}
		)
	}
}
