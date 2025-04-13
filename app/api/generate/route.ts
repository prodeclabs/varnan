import {generateText} from 'ai'
import {Issue} from '@linear/sdk'
import {createOpenAI} from '@ai-sdk/openai'
import {cookies} from 'next/headers'

export const POST = async (req: Request) => {
	try {
		const openai = createOpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			compatibility: 'strict'
		})
		const body = await req.json()
		const {issue, customInstructions, diffData: preloadedDiffData} = body as {
			issue: Issue
			customInstructions?: string
			diffData?: any
		}

		if (!issue) {
			return Response.json(
				{error: 'Issue data is required'},
				{status: 400}
			)
		}

		let diffContext = ''
		let usedDiff = false

		// Use the pre-loaded diff data if available, otherwise fetch it
		if (preloadedDiffData && preloadedDiffData.files && preloadedDiffData.files.some((file: any) => file.patch)) {
			// Use the diff data passed from the frontend
			const fileChanges = preloadedDiffData.files
				.filter((file: any) => file.patch) // Only include files with patches
				.slice(0, 5) // Limit to 5 files to avoid token limits
				.map((file: any) => {
					// Trim patches to avoid token overflow
					const patchLines = file.patch.split('\n').slice(0, 20) // Limit to 20 lines per file
					const trimmedPatch = patchLines.join('\n') + (patchLines.length < file.patch.split('\n').length ? '\n... (additional changes omitted)' : '')

					return `File: ${file.filename}\nStatus: ${file.status}\nChanges: +${file.additions} -${file.deletions}\n\n${trimmedPatch}\n`
				})
				.join('\n---\n\n')

			// Set the flag since we have actual file changes
			usedDiff = true

			// Add summary and code diff to context
			diffContext = `
Code Changes Summary:
- Repository: ${preloadedDiffData.repository}
- From branch: ${preloadedDiffData.sourceBranch}
- To branch: ${preloadedDiffData.targetBranch}
- Total commits: ${preloadedDiffData.totalChanges.commits}
- Files changed: ${preloadedDiffData.totalChanges.changedFiles}
- Additions: ${preloadedDiffData.totalChanges.additions}
- Deletions: ${preloadedDiffData.totalChanges.deletions}

Key changed files:
${fileChanges}`
		} else {
			// Try to fetch code diff data if GitHub is connected and no pre-loaded data
			const cookieStore = await cookies()
			const githubToken = cookieStore.get('github_access_token')?.value

			if (githubToken) {
				try {
					// Call our branch-diff API to get the diff data
					const diffResponse = await fetch(new URL('/api/github/branch-diff', req.url).toString(), {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Cookie': `github_access_token=${githubToken}`
						},
						body: JSON.stringify({
							issueIdentifier: issue.identifier,
							issueTitle: issue.title,
							issueDescription: issue.description
						})
					})

					if (diffResponse.ok) {
						const diffData = await diffResponse.json()

						// Format the diff data for the prompt
						const fileChanges = diffData.files
							.filter((file: any) => file.patch) // Only include files with patches
							.slice(0, 5) // Limit to 5 files to avoid token limits
							.map((file: any) => {
								// Trim patches to avoid token overflow
								const patchLines = file.patch.split('\n').slice(0, 20) // Limit to 20 lines per file
								const trimmedPatch = patchLines.join('\n') + (patchLines.length < file.patch.split('\n').length ? '\n... (additional changes omitted)' : '')

								return `File: ${file.filename}\nStatus: ${file.status}\nChanges: +${file.additions} -${file.deletions}\n\n${trimmedPatch}\n`
							})
							.join('\n---\n\n')

						// Set the flag if we have actual file changes
						usedDiff = diffData.files.some((file: any) => file.patch)

						// Add summary and code diff to context
						diffContext = `
Code Changes Summary:
- Repository: ${diffData.repository}
- From branch: ${diffData.sourceBranch}
- To branch: ${diffData.targetBranch}
- Total commits: ${diffData.totalChanges.commits}
- Files changed: ${diffData.totalChanges.changedFiles}
- Additions: ${diffData.totalChanges.additions}
- Deletions: ${diffData.totalChanges.deletions}

Key changed files:
${fileChanges}`
					}
				} catch (error) {
					/*
					 * If there's an error fetching the diff, just continue without it
					 * console.error('Error fetching diff data:', error)
					 */
				}
			}
		}

		const customInstructionsPrompt = customInstructions
			? `\n\nAdditional Instructions:\n${customInstructions}\n\nMake sure to incorporate these instructions while maintaining the template structure.`
			: ''

		const diffPrompt = diffContext ? `\n\nThe following code changes were made for this issue. Use this information to make the PR description more accurate and specific:\n${diffContext}` : ''

		const {text} = await generateText({
			model: openai('gpt-3.5-turbo'),
			system:
				'You are a senior software engineer writing pull request descriptions. You write clear, concise, and technically accurate descriptions based on issue information and code changes.',
			prompt: `Generate a pull request description for the following Linear issue:

Issue Title: ${issue.title}
Issue ID: ${issue.identifier}
Issue URL: ${issue.url}
Issue Description: ${issue.description}${diffPrompt}

Please follow this exact template:

### Issue:
[${issue.title}](${issue.url})

### Description:
[Generate a brief, clear description of what the PR is about based on the issue title and code changes]

### Changes Made:
[Generate 3-5 specific, clear bullet points about the actual changes made based on the code diff or likely changes based on the issue title]

### Closing Note:
[Generate a brief conclusion about why this PR is important]

Make the description professional, clear and concise. Focus on technical accuracy and clarity.${customInstructionsPrompt}`
		})

		if (!text) {
			return Response.json(
				{error: 'Failed to generate description'},
				{status: 500}
			)
		}

		return Response.json({
			text,
			usedDiff
		})
	} catch (error) {
		// console.error('Error generating PR description:', error)
		return Response.json(
			{error: 'Failed to process request'},
			{status: 500}
		)
	}
}
