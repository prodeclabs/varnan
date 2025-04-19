import {cookies} from 'next/headers'
import {db} from '@/lib/db'
import {projectContexts, userProjectContexts, users} from '@/lib/db/schema'
import {eq, and} from 'drizzle-orm'

// GET: Fetch project context by GitHub URL
export async function GET(request: Request) {
	try {
		const {searchParams} = new URL(request.url)
		const githubUrl = searchParams.get('githubUrl')

		if (!githubUrl) {
			return Response.json({error: 'GitHub URL is required'}, {status: 400})
		}

		// Get the current user
		const cookieStore = await cookies()
		const token = cookieStore.get('linear_access_token')?.value

		if (!token) {
			return Response.json({error: 'Authentication required'}, {status: 401})
		}

		// Find the project context in database
		const result = await db.select().from(projectContexts).where(eq(projectContexts.githubUrl, githubUrl)).limit(1)

		if (result.length === 0) {
			return Response.json({error: 'Project context not found'}, {status: 404})
		}

		const projectContext = result[0]

		// Find the user by access token
		const userResult = await db.select().from(users).where(eq(users.accessToken, token)).limit(1)

		if (userResult.length === 0) {
			return Response.json({error: 'User not found'}, {status: 404})
		}

		const user = userResult[0]

		// Check if user already has this project context associated
		const userContextResult = await db.select()
			.from(userProjectContexts)
			.where(
				and(
					eq(userProjectContexts.userId, user.id),
					eq(userProjectContexts.projectContextId, projectContext.id)
				)
			)
			.limit(1)

		// If not associated, create the association
		if (userContextResult.length === 0) {
			await db.insert(userProjectContexts).values({
				userId: user.id,
				projectContextId: projectContext.id
			})
		}

		return Response.json(projectContext)
	} catch (error) {
		console.error('Error fetching project context:', error)
		return Response.json(
			{error: 'Failed to process request', details: error instanceof Error ? error.message : String(error)},
			{status: 500}
		)
	}
}

// POST: Create or update project context
export async function POST(request: Request) {
	try {
		const cookieStore = await cookies()
		const token = cookieStore.get('linear_access_token')?.value

		if (!token) {
			return Response.json({error: 'Authentication required'}, {status: 401})
		}

		const body = await request.json()
		const {githubUrl, projectContext, metadataFileType} = body

		if (!githubUrl || !projectContext) {
			return Response.json(
				{error: 'GitHub URL and project context are required'},
				{status: 400}
			)
		}

		// Find the user by access token
		const userResult = await db.select().from(users).where(eq(users.accessToken, token)).limit(1)

		if (userResult.length === 0) {
			return Response.json({error: 'User not found'}, {status: 404})
		}

		const user = userResult[0]

		// Check if project context already exists
		const existingContext = await db.select()
			.from(projectContexts)
			.where(eq(projectContexts.githubUrl, githubUrl))
			.limit(1)

		let projectContextId: number

		if (existingContext.length > 0) {
			// Update existing context
			await db.update(projectContexts)
				.set({
					projectContext,
					metadataFileType,
					updatedAt: new Date()
				})
				.where(eq(projectContexts.id, existingContext[0].id))

			projectContextId = existingContext[0].id
		} else {
			// Create new context
			const result = await db.insert(projectContexts)
				.values({
					githubUrl,
					projectContext,
					metadataFileType
				})
				.returning({id: projectContexts.id})

			projectContextId = result[0].id
		}

		// Check if user already has this project context associated
		const userContextResult = await db.select()
			.from(userProjectContexts)
			.where(
				and(
					eq(userProjectContexts.userId, user.id),
					eq(userProjectContexts.projectContextId, projectContextId)
				)
			)
			.limit(1)

		// If not associated, create the association
		if (userContextResult.length === 0) {
			await db.insert(userProjectContexts).values({
				userId: user.id,
				projectContextId
			})
		}

		return Response.json({success: true, projectContextId})
	} catch (error) {
		console.error('Error saving project context:', error)
		return Response.json(
			{error: 'Failed to process request', details: error instanceof Error ? error.message : String(error)},
			{status: 500}
		)
	}
}
