'use client'

import {useState, useEffect} from 'react'
import {GitPullRequest, Filter, Github, Code, Loader2, GitBranch} from 'lucide-react'
import {SiLinear} from 'react-icons/si'
import {Button} from '@/components/ui/button'
import useLinearClient from '@/hooks/useLinearClient'
import IssueSelect from '@/components/generate-pr/IssueSelect'
import {CustomInstructionsDialog} from '@/components/generate-pr/CustomInstructionsDialog'
import {PRDescription} from '@/components/generate-pr/PRDescription'
import {BranchSelectionModal} from '@/components/generate-pr/BranchSelectionModal'

type DiffStatus = 'loading' | 'fetching' | 'success' | 'error' | 'not-found' | 'custom' | null;

type DiffData = {
	repository: string;
	sourceBranch: string;
	targetBranch: string;
	files: Array<{
		filename: string;
		status: string;
		additions: number;
		deletions: number;
		patch?: string;
	}>;
	totalChanges: {
		commits: number;
		additions: number;
		deletions: number;
		changedFiles: number;
	};
};

const PRGenerator = () => {
	const {issues, isLoading, error: linearError} = useLinearClient()
	const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)
	const [completion, setCompletion] = useState<string | null>(null)
	const [generationError, setGenerationError] = useState<string | null>(null)
	const [customInstructions, setCustomInstructions] = useState('')
	const [hasDiffData, setHasDiffData] = useState(false)
	const [diffStatus, setDiffStatus] = useState<DiffStatus>(null)
	const [diffData, setDiffData] = useState<DiffData | null>(null)
	const [githubConnected, setGithubConnected] = useState(false)
	const [isCustomBranchModalOpen, setIsCustomBranchModalOpen] = useState(false)
	const [customBranchLoading, setCustomBranchLoading] = useState(false)
	const [previousDiffStatus, setPreviousDiffStatus] = useState<DiffStatus>(null)

	const selectedIssue = issues.find(issue => issue.id === selectedIssueId)

	// Check if GitHub token exists to know if we can fetch code diff
	useEffect(() => {
		const checkGitHubAuth = async () => {
			try {
				const response = await fetch('/api/github/status', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				})
				setGithubConnected(response.ok)
			} catch (error) {
				setGithubConnected(false)
			}
		}

		checkGitHubAuth()
	}, [])

	// Fetch diff data when an issue is selected
	useEffect(() => {
		// Reset states when issue changes
		setDiffStatus(null)
		setPreviousDiffStatus(null)
		setDiffData(null)
		setHasDiffData(false)

		if (!selectedIssue || !githubConnected) return

		const fetchDiffData = async () => {
			setDiffStatus('fetching')

			try {
				const response = await fetch('/api/github/branch-diff', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						issueIdentifier: selectedIssue.identifier,
						issueTitle: selectedIssue.title,
						issueDescription: selectedIssue.description
					})
				})

				if (response.status === 404) {
					// Branch not found for this issue
					setDiffStatus('not-found')
					setHasDiffData(false)
					return
				}

				if (!response.ok) {
					throw new Error('Failed to fetch diff data')
				}

				const data = await response.json()
				setDiffData(data)

				// Check if we have actual diffs in the files
				const hasDiffs = data.files.some((file: any) => file.patch)
				setHasDiffData(hasDiffs)
				setDiffStatus('success')
			} catch (error) {
				// console.error('Error fetching diff:', error)
				setDiffStatus('error')
				setHasDiffData(false)
			}
		}

		fetchDiffData()
	}, [selectedIssue, githubConnected])

	const handleGeneratePR = async () => {
		if (!selectedIssue) return
		setIsGenerating(true)
		setGenerationError(null)

		// Only set to loading if we have a diff status that provides data
		if (diffStatus === 'success' || diffStatus === 'custom') {
			setPreviousDiffStatus(diffStatus)
			setDiffStatus('loading')
		}

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					issue: selectedIssue,
					customInstructions: customInstructions.trim(),
					// Pass the already fetched diff data if available
					diffData: diffData && hasDiffData ? diffData : undefined
				})
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate PR description')
			}

			// Check if the diff data was used based on the response
			if (data.usedDiff) {
				// Preserve the custom status if it was custom before
				setDiffStatus(previousDiffStatus === 'custom' ? 'custom' : 'success')
			} else {
				// If it wasn't used, revert to previous status
				setDiffStatus(diffStatus === 'loading' ? previousDiffStatus : diffStatus)
			}

			setCompletion(data.text)
		} catch (err) {
			setGenerationError(err instanceof Error ? err.message : 'Something went wrong')

			// Revert back to previous state if we were loading
			if (diffStatus === 'loading') {
				setDiffStatus(previousDiffStatus || null)
			}
		} finally {
			setIsGenerating(false)
		}
	}

	const handleSelectCustomBranches = async (sourceBranch: string, targetBranch: string, repository: string) => {
		if (!selectedIssue) return

		setCustomBranchLoading(true)

		if (!repository) {
			/*
			 * console.warn('No repository provided, attempting to use fallback')
			 * If no repository provided, fallback to current repository or fetch one
			 */
			if (diffData?.repository) {
				repository = diffData.repository
			} else {
				try {
					// Try to get the first repository as fallback
					const reposResponse = await fetch('/api/github/repositories')

					if (!reposResponse.ok) {
						throw new Error('Failed to fetch repositories')
					}

					const repos = await reposResponse.json()

					if (repos.length > 0) {
						repository = repos[0].full_name
					} else {
						throw new Error('No repositories found')
					}
				} catch (error) {
					// console.error('Error getting repository:', error)
					setDiffStatus('error')
					setHasDiffData(false)
					setCustomBranchLoading(false)
					return
				}
			}
		}

		try {
			const response = await fetch('/api/github/custom-diff', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					repository,
					sourceBranch,
					targetBranch
				})
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				// console.error('Custom diff API error:', response.status, errorData)
				throw new Error(`Failed to fetch custom branch diff: ${response.status} ${errorData.error || ''}`)
			}

			const data = await response.json()
			setDiffData(data)

			// Check if we have actual diffs in the files
			const hasDiffs = data.files.some((file: any) => file.patch)
			setHasDiffData(hasDiffs)
			setDiffStatus('custom')
		} catch (error) {
			// console.error('Error fetching custom diff:', error)
			setDiffStatus('error')
			setHasDiffData(false)
		} finally {
			setCustomBranchLoading(false)
		}
	}

	// Determine if the generate button should be disabled
	const isGenerateButtonDisabled = !selectedIssueId || isGenerating || diffStatus === 'fetching' || customBranchLoading

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 px-1">
				<Filter className="h-3.5 w-3.5 text-neutral-400" />
				<p className="text-sm text-neutral-500 dark:text-neutral-400">
					Filtered to show in-progress issues assigned to you
				</p>
			</div>

			<div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
				<div className="p-5">
					<div className="space-y-1.5">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-1.5">
								<SiLinear className="h-3 w-3" />
								<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
									Linear Issue
								</label>
							</div>
							<CustomInstructionsDialog
								value={customInstructions}
								onChange={setCustomInstructions}
							/>
						</div>
						<IssueSelect
							issues={issues}
							isLoading={isLoading}
							error={linearError}
							onSelect={setSelectedIssueId}
						/>

						{selectedIssue && (
							<div className="mt-2 flex items-center gap-1.5">
								{diffStatus === 'fetching' || customBranchLoading ? (
									<>
										<Loader2 className="h-3 w-3 text-neutral-500 animate-spin" />
										<span className="text-xs text-neutral-500 dark:text-neutral-400">
											{customBranchLoading ? 'Fetching custom branch diff...' : 'Checking for GitHub branch...'}
										</span>
									</>
								) : diffStatus === 'success' ? (
									<>
										<Github className="h-3 w-3 text-green-500" />
										<span className="text-xs text-green-500 dark:text-green-400">
											Found branch: {diffData?.sourceBranch}
										</span>
										<button
											onClick={() => setIsCustomBranchModalOpen(true)}
											className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-1 underline"
										>
											Custom
										</button>
									</>
								) : diffStatus === 'custom' ? (
									<>
										<GitBranch className="h-3 w-3 text-blue-500" />
										<span className="text-xs text-blue-500 dark:text-blue-400">
											Using custom: {diffData?.sourceBranch} → {diffData?.targetBranch}
										</span>
										<button
											onClick={() => setIsCustomBranchModalOpen(true)}
											className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-1 underline"
										>
											Change
										</button>
									</>
								) : diffStatus === 'not-found' ? (
									<>
										<Github className="h-3 w-3 text-neutral-500" />
										<span className="text-xs text-neutral-500 dark:text-neutral-400">
											No matching GitHub branch found
										</span>
										<button
											onClick={() => setIsCustomBranchModalOpen(true)}
											className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-1 underline"
										>
											Custom
										</button>
									</>
								) : diffStatus === 'error' ? (
									<>
										<Github className="h-3 w-3 text-red-500" />
										<span className="text-xs text-red-500 dark:text-red-400">
											Error fetching branch data
										</span>
										<button
											onClick={() => setIsCustomBranchModalOpen(true)}
											className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-1 underline"
										>
											Custom
										</button>
									</>
								) : githubConnected ? (
									<>
										<Github className="h-3 w-3 text-neutral-500" />
										<span className="text-xs text-neutral-500 dark:text-neutral-400">
											Checking GitHub branch status...
										</span>
									</>
								) : null}
							</div>
						)}
					</div>
				</div>

				{isGenerating && <GeneratingIndicator />}

				{completion && !isGenerating && (
					<div className="border-t border-neutral-200 dark:border-neutral-800">
						<div className="p-5">
							<PRDescription content={completion} onChange={setCompletion} />

							{(diffStatus === 'success' || diffStatus === 'custom') && (
								<div className="mt-2 flex items-center gap-1.5">
									<Code className="h-3.5 w-3.5 text-green-500" />
									<span className="text-xs text-green-500 dark:text-green-400">
										Generated with code diff from {diffStatus === 'custom' ? 'custom branches' : 'GitHub'}
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{generationError && <ErrorMessage error={generationError} />}

				<div className="border-t border-neutral-200 dark:border-neutral-800">
					<div className="p-4 flex items-center justify-between">
						<StatusMessage
							completion={completion}
							selectedIssueId={selectedIssueId}
							diffStatus={diffStatus}
							hasDiffData={hasDiffData}
						/>
						<Button
							disabled={isGenerateButtonDisabled}
							onClick={handleGeneratePR}
							variant="secondary"
							size="sm"
							className="h-8 px-3 text-xs font-medium"
						>
							{diffStatus === 'fetching' || customBranchLoading ? (
								<>
									<Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
									{customBranchLoading ? 'Fetching diff...' : 'Checking branch...'}
								</>
							) : isGenerating ? (
								<>
									<GitPullRequest className="h-3.5 w-3.5 mr-1" />
									Generating...
								</>
							) : (
								<>
									<GitPullRequest className="h-3.5 w-3.5 mr-1" />
									Generate Description
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Custom Branch Selection Modal */}
			<BranchSelectionModal
				open={isCustomBranchModalOpen}
				onOpenChange={setIsCustomBranchModalOpen}
				onSelect={handleSelectCustomBranches}
				currentRepository={diffData?.repository}
				currentSourceBranch={diffData?.sourceBranch}
				currentTargetBranch={diffData?.targetBranch}
			/>
		</div>
	)
}

const GeneratingIndicator = () => (
	<div className="border-t border-neutral-200 dark:border-neutral-800">
		<div className="p-5">
			<div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-8">
				<div className="flex flex-col items-center justify-center gap-3">
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent dark:border-neutral-200 dark:border-t-transparent" />
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
						Generating PR description...
					</p>
				</div>
			</div>
		</div>
	</div>
)

const ErrorMessage = ({error}: {error: string}) => (
	<div className="border-t border-neutral-200 dark:border-neutral-800">
		<div className="p-5">
			<div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-3">
				<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
			</div>
		</div>
	</div>
)

const StatusMessage = ({
	completion,
	selectedIssueId,
	diffStatus,
	hasDiffData
}: {
	completion: string | null
	selectedIssueId: string | null
	diffStatus: DiffStatus
	hasDiffData: boolean
}) => (
	<p className="text-sm text-neutral-500 dark:text-neutral-400">
		{completion
			? 'PR description generated successfully'
			: selectedIssueId
				? diffStatus === 'fetching'
					? 'Checking for GitHub branch...'
					: diffStatus === 'success' || diffStatus === 'custom'
						? `Ready to generate PR description with ${diffStatus === 'custom' ? 'custom branch' : ''} code diff`
						: 'Ready to generate PR description'
				: 'Select an in-progress issue to continue'}
	</p>
)

export default PRGenerator
