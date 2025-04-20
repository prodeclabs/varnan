import {NextRequest, NextResponse} from 'next/server'
import {generateObject} from 'ai'
import {z} from 'zod'
import {createOpenAI} from '@ai-sdk/openai'

// Define schema for the generated issue
const issueSchema = z.object({
	title: z.string().describe('Issue title with component prefix followed by a colon and a clear description'),
	description: z.string().describe('Detailed markdown description of the issue'),
	labels: z.array(z.string()).describe('Relevant labels for the issue (e.g., bug, feature, enhancement)')
})

// Type for the generated issue
type GeneratedIssue = z.infer<typeof issueSchema>

export async function POST(req: NextRequest) {
	try {
		const openai = createOpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			compatibility: 'strict'
		})

		const {prompt, projectContext} = await req.json()

		if (!prompt) {
			return NextResponse.json(
				{error: 'Prompt is required'},
				{status: 400}
			)
		}

		// Build the system prompt
		let systemPrompt = `You are an expert software developer assistant that helps with creating well-structured Linear issues.
Generate a Linear issue based on the user's request. 
Format the issue with a clear title (component prefix followed by a colon), detailed description with problem statement, success criteria, acceptance criteria, and additional notes.
Ensure the issue is descriptive, actionable, and follows best practices for issue tracking.`

		if (projectContext) {
			systemPrompt += `\n\nUse the following project context to better understand the codebase and generate a relevant issue:\n\n${projectContext}`
		}

		const {object: issue} = await generateObject({
			model: openai('gpt-4o'),
			schema: issueSchema,
			system: systemPrompt,
			prompt: prompt
		})

		// Format the response as markdown for the UI
		const formattedIssue = `# ${issue.title}

${issue.description}

**Labels:** ${issue.labels.map((label: string) => `\`${label}\``).join(', ')}
`

		return NextResponse.json({
			text: formattedIssue,
			structuredData: issue
		})
	} catch (error) {
		console.error('Error generating issue:', error)
		return NextResponse.json(
			{error: 'Failed to generate issue'},
			{status: 500}
		)
	}
}
