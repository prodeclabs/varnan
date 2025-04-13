import {cookies} from 'next/headers'
import Link from 'next/link'
import {redirect} from 'next/navigation'
import {DisconnectButton} from '@/components/github/DisconnectButton'

async function fetchUserInfo(token: string) {
	const response = await fetch('https://api.github.com/user', {
		headers: {
			'Authorization': `Bearer ${token}`,
			'Accept': 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28'
		}
	})

	return await response.json()
}

async function fetchUserRepos(token: string) {
	const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=5', {
		headers: {
			'Authorization': `Bearer ${token}`,
			'Accept': 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28'
		}
	})

	return await response.json()
}

export default async function GitHubStatusPage() {
	const cookieStore = await cookies()
	const token = cookieStore.get('github_access_token')?.value

	if (!token) {
		redirect('/github')
	}

	try {
		// Fetch user information from GitHub
		const userInfo = await fetchUserInfo(token)
		const repos = await fetchUserRepos(token)

		return (
			<div className="container mx-auto px-4 py-8 bg-neutral-900 min-h-[calc(100vh-64px)]">
				<div className="flex items-center gap-4 mb-8">
					{userInfo.avatar_url && (
						<img
							src={userInfo.avatar_url}
							alt={`${userInfo.login}'s avatar`}
							className="w-16 h-16 rounded-full border-2 border-neutral-700"
						/>
					)}
					<div>
						<h1 className="text-2xl font-bold text-neutral-100">
							Connected to GitHub as {userInfo.name || userInfo.login}
						</h1>
						<p className="text-neutral-400">
							Username: {userInfo.login}
						</p>
					</div>
				</div>

				<div className="mb-8">
					<h2 className="text-xl font-semibold mb-4 text-neutral-200">Recent Repositories</h2>
					<div className="grid gap-4">
						{repos.map((repo: any) => (
							<div key={repo.id} className="border border-neutral-700 rounded-lg p-4 hover:bg-neutral-800 transition-colors bg-neutral-800/50">
								<div className="flex justify-between items-start">
									<h3 className="font-medium text-neutral-100">{repo.name}</h3>
									<span className="text-sm px-2 py-1 bg-neutral-700 rounded text-neutral-300">
										{repo.private ? 'Private' : 'Public'}
									</span>
								</div>
								{repo.description && (
									<p className="text-neutral-400 text-sm mt-1">{repo.description}</p>
								)}
								<div className="flex gap-4 mt-3 text-sm text-neutral-400">
									<span>⭐ {repo.stargazers_count}</span>
									<span>🍴 {repo.forks_count}</span>
									<span>{repo.language}</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="flex gap-4">
					<Link
						href="/"
						className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-md hover:bg-neutral-600 transition-colors"
					>
						Back to Home
					</Link>
					<DisconnectButton />
				</div>
			</div>
		)
	} catch (error) {
		// console.error('GitHub API Error:', error)

		return (
			<div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-neutral-900">
				<h1 className="text-2xl font-bold text-neutral-100">GitHub Connection Error</h1>
				<p className="text-neutral-400 mt-2">Failed to fetch GitHub data.</p>
				<pre className="mt-4 p-4 bg-neutral-800 rounded text-xs overflow-auto text-neutral-300 border border-neutral-700">
					{error instanceof Error ? error.message : 'Unknown error'}
				</pre>
				<div className="flex gap-4 mt-4">
					<Link
						href="/"
						className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-md hover:bg-neutral-600 transition-colors"
					>
						Back to Home
					</Link>
					<Link
						href="/github"
						className="px-4 py-2 bg-neutral-800 text-neutral-100 rounded-md hover:bg-neutral-700 transition-colors"
					>
						Reconnect GitHub
					</Link>
				</div>
			</div>
		)
	}
}
