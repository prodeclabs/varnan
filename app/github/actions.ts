'use server'

import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {generateRandomString} from '@/lib/utils'

export async function initiateGitHubOAuth() {
	const clientId = process.env.GITHUB_CLIENT_ID

	if (!clientId) {
		throw new Error('GitHub client ID is not configured')
	}

	// Generate a random state value to prevent CSRF attacks
	const state = generateRandomString(32)

	const cookieStore = await cookies()

	// Store the state in a cookie for validation in the callback
	cookieStore.set('github_oauth_state', state, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 5 // 5 minutes
	})

	// GitHub OAuth authorization URL
	const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
	githubAuthUrl.searchParams.append('client_id', clientId)
	githubAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`)
	githubAuthUrl.searchParams.append('state', state)
	githubAuthUrl.searchParams.append('scope', 'repo')

	// Redirect to GitHub authorization page
	redirect(githubAuthUrl.toString())
}
