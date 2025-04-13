'use server'

import {cookies} from 'next/headers'
import {db} from '@/lib/db/index'
import {eq} from 'drizzle-orm'
import {users} from '@/lib/db/schema'

type ProfileData = {
  name: string;
  profession: string;
};

export async function saveUserProfile({name, profession}: ProfileData) {
	const cookieStore = await cookies()
	const token = cookieStore.get('linear_access_token')?.value

	if (!token) {
		throw new Error('Unauthorized')
	}

	try {
		// Get user email from Linear
		const userResponse = await fetch('https://api.linear.app/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
				query: `
          query {
            viewer {
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

		const userEmail = userData.data.viewer.email

		// Update user in database using email as identifier
		const updatedUser = await db.update(users)
			.set({
				name,
				profession,
				updatedAt: new Date()
			})
			.where(eq(users.email, userEmail))
			.returning()

		if (!updatedUser || updatedUser.length === 0) {
			throw new Error('Failed to update user profile')
		}

		return updatedUser[0]
	} catch (error) {
		throw error
	}
}
