import {cookies} from 'next/headers'
import {NextRequest, NextResponse} from 'next/server'

async function exchangeCodeForToken(code: string) {
	const clientId = process.env.GITHUB_CLIENT_ID
	const clientSecret = process.env.GITHUB_CLIENT_SECRET

	if (!clientId || !clientSecret) {
		throw new Error('GitHub credentials not configured')
	}

	const response = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code
		})
	})

	return await response.json()
}

async function fetchUserRepos(token: string) {
	const response = await fetch('https://api.github.com/user/repos', {
		headers: {
			'Authorization': `Bearer ${token}`,
			'Accept': 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28'
		}
	})

	return await response.json()
}

export async function GET(request: NextRequest) {
	// Get URL parameters
	const searchParams = request.nextUrl.searchParams
	const code = searchParams.get('code')
	const state = searchParams.get('state')
	const cookieStore = await cookies()

	// Get the saved state from cookies
	const savedState = cookieStore.get('github_oauth_state')?.value

	// Validate the state parameter to prevent CSRF attacks
	if (!code || !state || !savedState || state !== savedState) {
		return NextResponse.redirect(new URL('/github?error=invalid_state', request.url))
	}

	try {
		// Exchange the authorization code for an access token
		const tokenResponse = await exchangeCodeForToken(code)

		if (!tokenResponse.access_token) {
			throw new Error('Failed to obtain access token')
		}

		// Set the access token in a cookie
		cookieStore.set('github_access_token', tokenResponse.access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		})

		// Clear the state cookie as it's no longer needed
		cookieStore.delete('github_oauth_state')

		// Fetch user repositories for demo purposes (this will be logged server-side)
		const repos = await fetchUserRepos(tokenResponse.access_token)

		// Redirect to the GitHub status page instead of the home page
		return NextResponse.redirect(new URL('/github/status', request.url))
	} catch (error) {
		// console.error('GitHub OAuth Error:', error)

		// Redirect to error page
		return NextResponse.redirect(new URL(`/github?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url))
	}
} 