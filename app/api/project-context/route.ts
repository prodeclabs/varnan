import {NextRequest, NextResponse} from 'next/server'
import {db} from '@/lib/db'
import {projectContexts, userProjectContexts} from '@/lib/db/schema'
import {cookies} from 'next/headers'
import {eq, and} from 'drizzle-orm'

// GET: Fetch project context by GitHub URL
export async function GET(request: NextRequest) {
	try {
		const githubUrl = request.nextUrl.searchParams.get('githubUrl')
		
		if (!githubUrl) {
			return NextResponse.json(
				{error: 'GitHub URL is required'},
				{status: 400}
			)
		}
		
		// Check if context exists
		const context = await db
			.select()
			.from(projectContexts)
			.where(eq(projectContexts.githubUrl, githubUrl))
			.limit(1)
		
		if (context.length === 0) {
			return NextResponse.json(
				{error: 'Project context not found'},
				{status: 404}
			)
		}

		// Return with fresh flag
		// A context is fresh if it's less than 7 days old
		const createdAt = context[0].createdAt || new Date()
		const now = new Date()
		const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
		const isFresh = diffDays < 7

		return NextResponse.json({
			...context[0],
			isFresh
		})
	} catch (error) {
		console.error('Error fetching project context:', error)
		return NextResponse.json(
			{error: 'Failed to fetch project context'},
			{status: 500}
		)
	}
}

// POST: Create or update project context
export async function POST(request: NextRequest) {
	try {
		let userId = null
		
		// Try to get the user ID if available, but don't require it
		try {
			const cookieStore = await cookies()
			userId = cookieStore.get('varnan_userId')?.value
		} catch (e) {
			console.log('No user ID available, continuing anonymously')
		}
		
		const {githubUrl, projectContext, metadataFileType} = await request.json()

		if (!githubUrl || !projectContext) {
			return NextResponse.json(
				{error: 'GitHub URL and project context are required'},
				{status: 400}
			)
		}

		// Check if project context already exists
		const existingContext = await db
			.select()
			.from(projectContexts)
			.where(eq(projectContexts.githubUrl, githubUrl))

		let contextId: number
		
		if (existingContext.length > 0) {
			// Update existing project context
			const [updated] = await db
				.update(projectContexts)
				.set({
					projectContext,
					metadataFileType,
					updatedAt: new Date()
				})
				.where(eq(projectContexts.githubUrl, githubUrl))
				.returning({id: projectContexts.id})
			
			contextId = updated.id
		} else {
			// Create new project context
			const [created] = await db
				.insert(projectContexts)
				.values({
					githubUrl,
					projectContext,
					metadataFileType: metadataFileType || ''
				})
				.returning({id: projectContexts.id})
			
			contextId = created.id
		}

		// Associate with user if user ID is available
		if (userId) {
			// Check if already associated
			const userAssociation = await db
				.select()
				.from(userProjectContexts)
				.where(
					and(
						eq(userProjectContexts.userId, userId),
						eq(userProjectContexts.projectContextId, contextId)
					)
				)

			if (userAssociation.length === 0) {
				await db
					.insert(userProjectContexts)
					.values({
						userId,
						projectContextId: contextId
					})
			}
		}

		return NextResponse.json({success: true})
	} catch (error) {
		console.error('Error saving project context:', error)
		return NextResponse.json(
			{error: 'Failed to save project context'},
			{status: 500}
		)
	}
}
