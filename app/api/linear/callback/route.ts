import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createOrUpdateUser} from '@/lib/db/users'

type ErrorResponse = {
  error: string;
};

export const GET = async (request: Request) => {
	const {searchParams} = new URL(request.url)
	const code = searchParams.get('code')
	const state = searchParams.get('state')
	const cookieStore = await cookies()

	if (!code) {
		return NextResponse.json<ErrorResponse>(
			{error: 'No code provided'},
			{status: 400}
		)
	}

	try {
		// Exchange code for token
		const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				code,
				client_id: process.env.LINEAR_CLIENT_ID!,
				client_secret: process.env.LINEAR_CLIENT_SECRET!,
				redirect_uri: process.env.NEXT_PUBLIC_APP_URL + '/api/linear/callback',
				grant_type: 'authorization_code'
			})
		})

		const data = await tokenResponse.json()

		if (!tokenResponse.ok) {
			throw new Error(data.error || 'Failed to exchange code for token')
		}

		// Fetch user data from Linear
		const userResponse = await fetch('https://api.linear.app/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${data.access_token}`
			},
			body: JSON.stringify({
				query: `
					query {
						viewer {
							id
							name
							email
						}
					}
				`
			})
		})

		const userData = await userResponse.json()

		if (!userResponse.ok || userData.errors) {
			throw new Error('Failed to fetch user data from Linear')
		}

		const linearUser = userData.data.viewer

		// Save user data to database
		try {
			const savedUser = await createOrUpdateUser({
				linearId: linearUser.id,
				name: linearUser.name,
				email: linearUser.email,
				accessToken: data.access_token
			})

			// Check if user has completed onboarding by checking for profession
			const shouldRedirectToOnboarding = !savedUser[0]?.profession
			const redirectPath = shouldRedirectToOnboarding ? '/onboarding' : '/'

			const response = NextResponse.redirect(new URL(redirectPath, request.url))

			cookieStore.set('linear_access_token', data.access_token, {
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60 // 30 days
			})

			return response
		} catch (dbError) {
			throw dbError
		}
	} catch (error) {
		return NextResponse.redirect(
			new URL('/?error=Failed to authenticate with Linear', request.url)
		)
	}
}
