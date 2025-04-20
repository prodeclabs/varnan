'use client'

import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Loader2, GitPullRequestDraft} from 'lucide-react'
import {PRDescription} from '@/components/generate-pr/PRDescription'

type ProjectContext = {
  id: number;
  githubUrl: string;
  projectContext: string;
  metadataFileType: string;
  createdAt: string;
  updatedAt: string;
};

export default function IssuePromptGenerator() {
	const [projectContexts, setProjectContexts] = useState<ProjectContext[]>([])
	const [selectedContext, setSelectedContext] = useState<string>('') // githubUrl
	const [isLoading, setIsLoading] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)
	const [prompt, setPrompt] = useState('')
	const [generatedIssue, setGeneratedIssue] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	// Fetch all project contexts on component mount
	useEffect(() => {
		const fetchProjectContexts = async () => {
			setIsLoading(true)
			try {
				const response = await fetch('/api/project-context/list')
				if (!response.ok) {
					throw new Error('Failed to fetch project contexts')
				}
				
				const data = await response.json()
				setProjectContexts(data)
				
				// Auto-select the first context if available
				if (data.length > 0) {
					setSelectedContext(data[0].githubUrl)
				}
			} catch (error) {
				console.error('Error fetching project contexts:', error)
				setError('Failed to load project contexts')
			} finally {
				setIsLoading(false)
			}
		}
		
		fetchProjectContexts()
	}, [])

	const handleGenerateIssue = async () => {
		if (!prompt.trim()) {
			setError('Please enter a prompt')
			return
		}
		
		setIsGenerating(true)
		setError(null)
		
		try {
			// Find the selected context
			const contextData = projectContexts.find(ctx => ctx.githubUrl === selectedContext)
			
			const response = await fetch('/api/generate-issue', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: prompt,
					projectContext: contextData?.projectContext || null
				})
			})
			
			if (!response.ok) {
				throw new Error('Failed to generate issue')
			}
			
			const data = await response.json()
			setGeneratedIssue(data.text)
		} catch (error) {
			console.error('Error generating issue:', error)
			setError('Failed to generate issue description')
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<div className="space-y-6">
			{/* Issue preview section - only shown when an issue is generated */}
			{generatedIssue && (
				<div className="mb-8">
					<PRDescription
						content={generatedIssue}
						onChange={setGeneratedIssue}
					/>
				</div>
			)}

			{/* Input section - always visible */}
			<div className="border rounded-lg p-6 space-y-4">
				{error && (
					<div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-950 rounded-md">
						{error}
					</div>
				)}

				<div className="flex flex-col gap-4">
					<div className="flex items-start gap-3 w-full">
						<div className="w-64">
							<label className="text-sm font-medium mb-1.5 block">Project Context</label>
							{isLoading ? (
								<div className="flex items-center gap-2 h-10 px-3 text-sm rounded-md border border-neutral-200 dark:border-neutral-800">
									<Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
									<span className="text-neutral-500">Loading...</span>
								</div>
							) : projectContexts.length === 0 ? (
								<div className="flex items-center gap-2 h-10 px-3 text-sm rounded-md border border-neutral-200 dark:border-neutral-800">
									<span className="text-neutral-500">No project contexts</span>
								</div>
							) : (
								<Select
									value={selectedContext}
									onValueChange={setSelectedContext}
									disabled={isLoading || projectContexts.length === 0}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a repository" />
									</SelectTrigger>
									<SelectContent>
										{projectContexts.map(context => (
											<SelectItem key={context.id} value={context.githubUrl}>
												{context.githubUrl}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>

						<div className="flex-1">
							<label className="text-sm font-medium mb-1.5 block">Describe the issue</label>
							<Textarea
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								placeholder="Describe the issue you want to create in natural language..."
								className="min-h-[120px] resize-none"
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<Button
							onClick={handleGenerateIssue}
							disabled={isGenerating || !prompt.trim() || (projectContexts.length > 0 && !selectedContext)}
						>
							{isGenerating ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Generating...
								</>
							) : (
								<>
									<GitPullRequestDraft className="h-4 w-4 mr-2" />
									Generate Issue
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
