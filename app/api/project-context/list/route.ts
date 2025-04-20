import {NextResponse} from 'next/server'
import {db} from '@/lib/db'
import {projectContexts, userProjectContexts} from '@/lib/db/schema'
import {cookies} from 'next/headers'
import {eq, desc} from 'drizzle-orm'

export async function GET() {
	try {
		const cookieStore = await cookies()
		const userId = cookieStore.get('varnan_userId')?.value

		if (!userId) {
			return NextResponse.json(
				{error: 'Authentication required'},
				{status: 401}
			)
		}

		// Fetch only project contexts associated with this user
		const contexts = await db
			.select({
				id: projectContexts.id,
				githubUrl: projectContexts.githubUrl,
				projectContext: projectContexts.projectContext,
				metadataFileType: projectContexts.metadataFileType,
				createdAt: projectContexts.createdAt,
				updatedAt: projectContexts.updatedAt
			})
			.from(projectContexts)
			.innerJoin(
				userProjectContexts,
				eq(projectContexts.id, userProjectContexts.projectContextId)
			)
			.where(eq(userProjectContexts.userId, userId))
			.orderBy(desc(projectContexts.updatedAt))

		return NextResponse.json(contexts)
	} catch (error) {
		console.error('Error fetching project contexts:', error)
		return NextResponse.json(
			{error: 'Failed to fetch project contexts'},
			{status: 500}
		)
	}
}
