'use server'

import {cookies} from 'next/headers'
import {getUserByEmail} from '@/lib/db/users'

export const checkLinearAuth = async () => {
	const cookieStore = await cookies()
	const token = cookieStore.get('linear_access_token')
	const isAuthenticated = Boolean(token)

	let userData = null

	if (isAuthenticated && token?.value) {
		try {
			// Fetch user data from Linear to get user info including email
			const userResponse = await fetch('https://api.linear.app/graphql', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token.value}`
				},
				body: JSON.stringify({
					query: `
						query {
							viewer {
								id
								email
							}
						}
					`
				})
			})

			const linearData = await userResponse.json()

			if (userResponse.ok && !linearData.errors && linearData.data?.viewer?.email) {
				// Get user data from our database using email
				userData = await getUserByEmail(linearData.data.viewer.email)
			}
		} catch (error) {
			// Silently handle error
		}
	}

	return {
		isAuthenticated,
		token: token?.value,
		user: userData
	}
}
