'use client'

import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Loader2, RefreshCw, Check} from 'lucide-react'

type Repository = {
  id: string;
  name: string;
  full_name: string;
  default_branch: string;
};

type ProjectContextData = {
  id: number;
  githubUrl: string;
  projectContext: string;
  metadataFileType: string;
  createdAt: string;
  updatedAt: string;
  isFresh?: boolean;
};

interface ProjectContextGeneratorProps {
  inDialog?: boolean;
  onContextGenerated?: () => void;
}

export default function ProjectContextGenerator({inDialog = false, onContextGenerated}: ProjectContextGeneratorProps) {
	const [repositories, setRepositories] = useState<Repository[]>([])
	const [selectedRepo, setSelectedRepo] = useState<string>('')
	const [loading, setLoading] = useState(false)
	const [isLoadingRepos, setIsLoadingRepos] = useState(false)
	const [projectContext, setProjectContext] = useState<string>('')
	const [error, setError] = useState('')
	const [savedContext, setSavedContext] = useState<ProjectContextData | null>(null)
	const [needsRefresh, setNeedsRefresh] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)

	// Fetch repositories when component mounts
	useEffect(() => {
		const fetchRepositories = async () => {
			setIsLoadingRepos(true)
			setError('')

			try {
				const response = await fetch('/api/github/repositories')

				if (!response.ok) {
					throw new Error('Failed to fetch repositories')
				}

				const data = await response.json()
				setRepositories(data)
			} catch (err) {
				setError('Failed to load repositories')
				console.error(err)
			} finally {
				setIsLoadingRepos(false)
			}
		}

		fetchRepositories()
	}, [])

	const updateSelectedRepo = async (repoFullName: string) => {
		setSelectedRepo(repoFullName)

		// Reset context state
		setProjectContext('')
		setSavedContext(null)
		setNeedsRefresh(false)
		setShowSuccess(false)

		if (!repoFullName) return

		// Check if we already have this context in the database
		try {
			const response = await fetch(`/api/project-context?githubUrl=${encodeURIComponent(repoFullName)}`)
			if (response.ok) {
				const data = await response.json()
				if (data.projectContext) {
					setSavedContext(data)
					// API now returns isFresh flag directly
					setNeedsRefresh(!data.isFresh)
					if (inDialog) {
						setShowSuccess(true)
					}
				}
			}
		} catch (error) {
			console.error('Error checking for existing project context:', error)
		}
	}

	const refreshContext = async () => {
		await generateContext(true)
	}

	const generateContext = async (forceRefresh = false) => {
		if (!selectedRepo) {
			setError('Please select a repository')
			return
		}

		setLoading(true)
		try {
			// If we have a saved context and it doesn't need refresh, use it
			if (!forceRefresh && savedContext && savedContext.isFresh) {
				console.log(`Using saved context for ${selectedRepo}`)
				setProjectContext(savedContext.projectContext)
				if (inDialog) {
					setShowSuccess(true)
					if (onContextGenerated) {
						setTimeout(onContextGenerated, 1500)
					}
				}
				return
			}

			console.log(`Generating new context for ${selectedRepo}`)

			// 1. Get file tree (recursive)
			const fileTreeResponse = await fetch('/api/github/repository-content', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({repository: selectedRepo, recursive: true})
			})

			if (!fileTreeResponse.ok) {
				console.error(`Failed to fetch file tree for ${selectedRepo}`)
				setError(`Failed to fetch file tree for ${selectedRepo}`)
				return
			}

			const fileTreeData = await fileTreeResponse.json()

			// 2. Get README content
			const readmeResponse = await fetch('/api/github/repository-content', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({repository: selectedRepo, path: 'README.md'})
			})

			let readmeContent = ''
			if (readmeResponse.ok) {
				const readmeData = await readmeResponse.json()
				readmeContent = readmeData.contents.content || ''
			}

			// Check if we have metadata file information from a previous save
			let targetMetadataFile = null
			let metadataContents: Record<string, string> = {}

			if (!forceRefresh && savedContext?.metadataFileType) {
				targetMetadataFile = savedContext.metadataFileType

				// Fetch only the known metadata file
				const metadataResponse = await fetch('/api/github/repository-content', {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({repository: selectedRepo, path: targetMetadataFile})
				})

				if (metadataResponse.ok) {
					const metadataData = await metadataResponse.json()
					if (metadataData.contents && metadataData.contents.content) {
						metadataContents[targetMetadataFile] = metadataData.contents.content
					}
				}
			} else {
				// 3. Get package metadata files - grouped by language/technology
				const metadataFilesGroups = {
					javascript: ['package.json', 'tsconfig.json', 'next.config.js'],
					python: ['requirements.txt', 'setup.py', 'pyproject.toml'],
					rust: ['Cargo.toml'],
					go: ['go.mod', 'go.sum'],
					java: ['pom.xml', 'build.gradle']
				}

				let metadataFound = false

				// Try each metadata group, exit early if we find a match
				for (const [language, files] of Object.entries(metadataFilesGroups)) {
					if (metadataFound) break

					for (const file of files) {
						const metadataResponse = await fetch('/api/github/repository-content', {
							method: 'POST',
							headers: {'Content-Type': 'application/json'},
							body: JSON.stringify({repository: selectedRepo, path: file})
						})

						if (metadataResponse.ok) {
							const metadataData = await metadataResponse.json()
							if (metadataData.contents && metadataData.contents.content) {
								metadataContents[file] = metadataData.contents.content
								targetMetadataFile = file
								metadataFound = true
								console.log(`Found metadata file: ${file} for ${selectedRepo}`)
								break // Exit the inner loop once we find a file in this group
							}
						}
					}
				}
			}

			// Format the project context as markdown
			const formattedContext = formatProjectContext(selectedRepo, fileTreeData, readmeContent, metadataContents)

			// Save to database
			try {
				const saveResponse = await fetch('/api/project-context', {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						githubUrl: selectedRepo,
						projectContext: formattedContext,
						metadataFileType: targetMetadataFile
					})
				})

				// Update local state
				setNeedsRefresh(false)
				setSavedContext({
					id: savedContext?.id || 0,
					githubUrl: selectedRepo,
					projectContext: formattedContext,
					metadataFileType: targetMetadataFile || '',
					createdAt: savedContext?.createdAt || new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					isFresh: true
				})
			} catch (error) {
				console.error('Error saving project context:', error)
			}

			if (inDialog) {
				setShowSuccess(true)
				if (onContextGenerated) {
					setTimeout(onContextGenerated, 1500)
				}
			} else {
				setProjectContext(formattedContext)
			}
		} catch (error) {
			console.error('Error generating project context:', error)
			setError('Failed to generate project context')
		} finally {
			setLoading(false)
		}
	}

	// Helper function to build a file tree string recursively
	const buildFileTree = (items: any[], path = '', depth = 0): string => {
		let result = ''

		for (const item of items) {
			const indent = '  '.repeat(depth)
			const name = item.name

			if (item.type === 'dir') {
				result += `${indent}- 📁 ${name}/\n`

				if (item.contents && Array.isArray(item.contents)) {
					result += buildFileTree(item.contents, `${path}/${name}`, depth + 1)
				}
			} else if (item.type === 'file') {
				result += `${indent}- 📄 ${name}\n`
			}
		}

		return result
	}

	// Format the project context as markdown
	const formatProjectContext = (
		repo: string,
		fileTreeData: any,
		readmeContent: string,
		metadataContents: Record<string, string>
	): string => {
		let context = `# Project Context: ${repo}\n\n`

		// 1. File Tree
		context += '## File Structure\n\n```\n'
		if (fileTreeData.contents && Array.isArray(fileTreeData.contents)) {
			context += buildFileTree(fileTreeData.contents)
		}
		context += '```\n\n'

		// 2. README Content
		if (readmeContent) {
			context += `## README\n\n${readmeContent}\n\n`
		}

		// 3. Metadata Files
		if (Object.keys(metadataContents).length > 0) {
			context += '## Project Dependencies and Configuration\n\n'

			for (const [filename, content] of Object.entries(metadataContents)) {
				context += `### ${filename}\n\n\`\`\`\n${content}\n\`\`\`\n\n`
			}
		}

		return context
	}

	return (
		<div className="space-y-6 border rounded-lg p-6">
			<h2 className="text-xl font-semibold">Generate Project Context</h2>

			{error && (
				<div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-950 rounded-md">
					{error}
				</div>
			)}

			<div className="space-y-4">
				<h3 className="text-md font-medium">Select GitHub Repository</h3>

				<div className="flex items-center gap-2">
					{isLoadingRepos ? (
						<div className="flex items-center gap-2 h-10 px-3 text-sm rounded-md border border-neutral-200 dark:border-neutral-800 flex-1">
							<Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
							<span className="text-neutral-500">Loading repositories...</span>
						</div>
					) : (
						<div className="flex-1 flex items-center gap-2">
							<Select
								value={selectedRepo}
								onValueChange={updateSelectedRepo}
								disabled={isLoadingRepos || repositories.length === 0}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a repository" />
								</SelectTrigger>
								<SelectContent>
									{repositories.map(repo => (
										<SelectItem key={repo.id} value={repo.full_name}>
											{repo.full_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{needsRefresh && (
								<Button
									variant="ghost"
									size="icon"
									onClick={refreshContext}
									title="Refresh context (older than 7 days)"
								>
									<RefreshCw className="h-4 w-4" />
								</Button>
							)}
						</div>
					)}
				</div>
			</div>

			{showSuccess ? (
				<div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-md">
					<Check className="h-5 w-5 text-green-500" />
					<span className="text-green-700 dark:text-green-300">
						Project context has been created and saved for {selectedRepo}
					</span>
				</div>
			) : (
				<Button
					onClick={() => generateContext()}
					disabled={loading || !selectedRepo}
				>
					{loading ? 'Generating...' : 'Generate Context'}
				</Button>
			)}

			{!inDialog && projectContext && (
				<div className="mt-6 space-y-2">
					<h3 className="text-md font-medium">Generated Context:</h3>
					<pre className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md overflow-auto max-h-[400px] text-xs whitespace-pre-wrap">
						{projectContext}
					</pre>
				</div>
			)}
		</div>
	)
}
