import {eq} from 'drizzle-orm'
import {db} from './index'
import {users} from './schema'

type UserCreateData = {
  linearId: string;
  name: string;
  email: string;
  accessToken: string;
};

export async function createOrUpdateUser(userData: UserCreateData) {
	const {linearId, name, email, accessToken} = userData

	// Check if user exists by email (not linearId)
	const existingUser = await db.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1)

	if (existingUser.length > 0) {
		// Update existing user
		return db.update(users)
			.set({
				linearId, // Update linearId in case it changed
				name,
				accessToken,
				updatedAt: new Date()
			})
			.where(eq(users.email, email))
			.returning()
	} else {
		// Create new user
		return db.insert(users)
			.values({linearId, name, email, accessToken})
			.returning()
	}
}

export async function getUserByLinearId(linearId: string) {
	const result = await db.select()
		.from(users)
		.where(eq(users.linearId, linearId))
		.limit(1)

	return result[0] || null
}

export async function getUserByEmail(email: string) {
	const result = await db.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1)

	return result[0] || null
}
