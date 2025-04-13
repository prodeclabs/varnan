import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

export async function POST() {
	const cookieStore = cookies()

	// Delete the GitHub access token cookie
	cookieStore.delete('github_access_token')

	return NextResponse.json({
		success: true,
		message: 'Successfully disconnected from GitHub'
	})
}
