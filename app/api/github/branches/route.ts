import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

export async function GET(request: Request) {
	try {
		const cookieStore = await cookies()
		const token = cookieStore.get('github_access_token')?.value

		if (!token) {
			return Response.json(
				{error: 'GitHub authentication required'},
				{status: 401}
			)
		}

		// Get the repository from query parameters
		const {searchParams} = new URL(request.url)
		const repository = searchParams.get('repository')

		if (!repository) {
			return Response.json(
				{error: 'Repository parameter is required'},
				{status: 400}
			)
		}

		// Fetch repository to get the default branch
		const repoResponse = await fetch(`https://api.github.com/repos/${repository}`, {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		})

		if (!repoResponse.ok) {
			return Response.json(
				{error: 'Failed to fetch repository details'},
				{status: repoResponse.status}
			)
		}

		const repoData = await repoResponse.json()
		const defaultBranch = repoData.default_branch

		// Fetch all branches for the repository
		const branchesResponse = await fetch(`https://api.github.com/repos/${repository}/branches?per_page=100`, {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		})

		if (!branchesResponse.ok) {
			return Response.json(
				{error: 'Failed to fetch branches'},
				{status: branchesResponse.status}
			)
		}

		const branches = await branchesResponse.json()

		// Return branches with a flag for the default branch
		const processedBranches = branches.map((branch: any) => ({
			name: branch.name,
			isDefault: branch.name === defaultBranch
		}))

		// Sort branches to have default branch first, then alphabetically
		processedBranches.sort((a: any, b: any) => {
			if (a.isDefault) return -1
			if (b.isDefault) return 1
			return a.name.localeCompare(b.name)
		})

		return Response.json(processedBranches)
	} catch (error) {
		// console.error('Error fetching branches:', error)
		return Response.json(
			{error: 'Failed to process request'},
			{status: 500}
		)
	}
}
