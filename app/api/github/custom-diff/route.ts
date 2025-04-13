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
		const {repository, sourceBranch, targetBranch} = body


		if (!repository || !sourceBranch || !targetBranch) {
			const missingParams = []
			if (!repository) missingParams.push('repository')
			if (!sourceBranch) missingParams.push('sourceBranch')
			if (!targetBranch) missingParams.push('targetBranch')

			// console.error('Missing required parameters:', missingParams)

			return Response.json(
				{error: `Missing required parameters: ${missingParams.join(', ')}`},
				{status: 400}
			)
		}

		// Fetch the diff between the branches
		const diffResponse = await fetch(
			`https://api.github.com/repos/${repository}/compare/${targetBranch}...${sourceBranch}`,
			{
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/vnd.github+json',
					'X-GitHub-Api-Version': '2022-11-28'
				}
			}
		)

		if (!diffResponse.ok) {
			const errorData = await diffResponse.json().catch(() => ({}))
			// console.error('GitHub API error:', diffResponse.status, errorData)

			return Response.json(
				{
					error: 'Failed to fetch diff',
					status: diffResponse.status,
					details: errorData
				},
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
			repository,
			sourceBranch,
			targetBranch,
			files,
			totalChanges: {
				commits: diffData.commits.length,
				additions: diffData.files.reduce((sum: number, file: any) => sum + file.additions, 0),
				deletions: diffData.files.reduce((sum: number, file: any) => sum + file.deletions, 0),
				changedFiles: diffData.files.length
			}
		})
	} catch (error) {
		// console.error('Error fetching custom diff:', error)
		return Response.json(
			{error: 'Failed to process request', details: error instanceof Error ? error.message : String(error)},
			{status: 500}
		)
	}
}
