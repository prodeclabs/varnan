import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

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
		const {issueIdentifier, issueTitle, issueDescription} = body

		if (!issueIdentifier) {
			return Response.json(
				{error: 'Issue identifier is required'},
				{status: 400}
			)
		}

		/*
		 * Try to extract branch name from issue using Linear convention
		 * Common format: feature/ABC-123-short-description or fix/ABC-123-description
		 */
		const branchIdentifier = issueIdentifier.toLowerCase()

		/*
		 * First check if we can find any repository that has a branch matching the Linear issue
		 * Get user's repos
		 */
		const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100', {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		})

		if (!reposResponse.ok) {
			return Response.json(
				{error: 'Failed to fetch repositories'},
				{status: reposResponse.status}
			)
		}

		const repos = await reposResponse.json()

		// Possible branch prefixes based on Linear convention
		const possiblePrefixes = ['feature/', 'fix/', 'bugfix/', 'hotfix/', 'release/', 'chore/']

		// For each repo, check if there's a branch with the Linear issue identifier
		let foundBranch = null
		let foundRepo = null
		let defaultBranch = null
		let codeDiff = null

		// Extract words from title to use in branch name search (excluding common words)
		const titleWords = issueTitle
			? issueTitle
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.split(/\s+/)
				.filter((word: string) => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word))
			: []

		// Create possible branch naming patterns
		const branchPatterns = [
			branchIdentifier,
			...possiblePrefixes.map(prefix => `${prefix}${branchIdentifier}`),
			...possiblePrefixes.map(prefix => `${prefix}${branchIdentifier.replace('-', '/')}`),
			...titleWords.map((word: string) => `${branchIdentifier}-${word}`),
			...possiblePrefixes.map(prefix => titleWords.map((word: string) => `${prefix}${branchIdentifier}-${word}`)).flat()
		]

		for (const repo of repos) {
			defaultBranch = repo.default_branch

			// Fetch branches for this repo
			const branchesResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/branches`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/vnd.github+json',
					'X-GitHub-Api-Version': '2022-11-28'
				}
			})

			if (!branchesResponse.ok) continue

			const branches = await branchesResponse.json()

			// Check if any branch matches our patterns
			for (const branch of branches) {
				const branchName = branch.name.toLowerCase()

				// Check if branch name contains the Linear issue identifier or matches our patterns
				if (branchPatterns.some(pattern => branchName.includes(pattern))) {
					foundBranch = branch.name
					foundRepo = repo
					break
				}
			}

			if (foundBranch && foundRepo) break
		}

		if (!foundBranch || !foundRepo) {
			return Response.json(
				{
					error: 'No matching branch found for this issue',
					possibleBranches: branchPatterns,
					repos: repos.map((r: any) => r.full_name)
				},
				{status: 404}
			)
		}

		// Fetch the diff between the found branch and the default branch
		const diffResponse = await fetch(
			`https://api.github.com/repos/${foundRepo.full_name}/compare/${defaultBranch}...${foundBranch}`,
			{
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/vnd.github+json',
					'X-GitHub-Api-Version': '2022-11-28'
				}
			}
		)

		if (!diffResponse.ok) {
			return Response.json(
				{error: 'Failed to fetch diff'},
				{status: diffResponse.status}
			)
		}

		const diffData = await diffResponse.json()

		// Extract the relevant files and changes
		const files = diffData.files.map((file: any) => ({
			filename: file.filename,
			status: file.status,
			additions: file.additions,
			deletions: file.deletions,
			patch: file.patch
		}))


		return Response.json({
			repository: foundRepo.full_name,
			sourceBranch: foundBranch,
			targetBranch: defaultBranch,
			files,
			totalChanges: {
				commits: diffData.commits.length,
				additions: diffData.files.reduce((sum: number, file: any) => sum + file.additions, 0),
				deletions: diffData.files.reduce((sum: number, file: any) => sum + file.deletions, 0),
				changedFiles: diffData.files.length
			}
		})
	} catch (error) {
		// console.error('Error fetching branch diff:', error)
		return Response.json(
			{error: 'Failed to process request'},
			{status: 500}
		)
	}
}
