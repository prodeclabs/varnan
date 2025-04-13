import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

export async function GET() {
	try {
		const cookieStore = await cookies()
		const token = cookieStore.get('github_access_token')?.value

		if (!token) {
			return Response.json(
				{error: 'GitHub authentication required'},
				{status: 401}
			)
		}

		// Fetch repositories with more details and sorted by last updated
		const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		})

		if (!response.ok) {
			return Response.json(
				{error: 'Failed to fetch repositories'},
				{status: response.status}
			)
		}

		const repos = await response.json()

		// Return only the data we need to keep the response small
		const simplifiedRepos = repos.map((repo: any) => ({
			id: repo.id,
			name: repo.name,
			full_name: repo.full_name,
			default_branch: repo.default_branch
		}))

		return Response.json(simplifiedRepos)
	} catch (error) {
		// console.error('Error fetching repositories:', error)
		return Response.json(
			{error: 'Failed to process request'},
			{status: 500}
		)
	}
}
