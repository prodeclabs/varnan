import {NextResponse} from 'next/server'
import {db} from '@/lib/db'
import {projectContexts} from '@/lib/db/schema'
import {desc} from 'drizzle-orm'

export async function GET() {
	try {
		// Fetch all project contexts without user restriction
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
