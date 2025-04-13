import {useState, useEffect} from 'react'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {GitBranch, Loader2} from 'lucide-react'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'

type Repository = {
  id: string;
  name: string;
  full_name: string;
};

type Branch = {
  name: string;
  isDefault?: boolean;
};

type BranchSelectionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (sourceBranch: string, targetBranch: string, repository: string) => void
  currentRepository?: string
  currentSourceBranch?: string
  currentTargetBranch?: string
}

export function BranchSelectionModal({
	open,
	onOpenChange,
	onSelect,
	currentRepository,
	currentSourceBranch,
	currentTargetBranch
}: BranchSelectionModalProps) {
	const [repositories, setRepositories] = useState<Repository[]>([])
	const [branches, setBranches] = useState<Branch[]>([])
	const [selectedRepo, setSelectedRepo] = useState(currentRepository || '')
	const [sourceBranch, setSourceBranch] = useState(currentSourceBranch || '')
	const [targetBranch, setTargetBranch] = useState(currentTargetBranch || '')
	const [isLoadingRepos, setIsLoadingRepos] = useState(false)
	const [isLoadingBranches, setIsLoadingBranches] = useState(false)
	const [error, setError] = useState('')

	// Fetch repositories when component mounts
	useEffect(() => {
		const fetchRepositories = async () => {
			setIsLoadingRepos(true)
			setError('')

			try {
				const response = await fetch('/api/github/repositories')

				if (!response.ok) {
					throw new Error('Failed to fetch repositories')
				}

				const data = await response.json()
				setRepositories(data)

				// If there's a current repository, select it
				if (currentRepository && data.some((repo: Repository) => repo.full_name === currentRepository)) {
					setSelectedRepo(currentRepository)
				} else if (data.length > 0) {
					setSelectedRepo(data[0].full_name)
				}
			} catch (err) {
				setError('Failed to load repositories')
				// console.error(err)
			} finally {
				setIsLoadingRepos(false)
			}
		}

		if (open) {
			fetchRepositories()
		}
	}, [open, currentRepository])

	// Fetch branches when repository changes
	useEffect(() => {
		const fetchBranches = async () => {
			if (!selectedRepo) return

			setIsLoadingBranches(true)
			setError('')

			try {
				const response = await fetch(`/api/github/branches?repository=${encodeURIComponent(selectedRepo)}`)

				if (!response.ok) {
					throw new Error('Failed to fetch branches')
				}

				const data = await response.json()
				setBranches(data)

				// Set default branches based on current values or first available branch
				if (data.length > 0) {
					const defaultBranch = data.find((branch: Branch) => branch.isDefault)?.name || data[0].name

					if (!sourceBranch || !data.some((branch: Branch) => branch.name === sourceBranch)) {
						setSourceBranch(currentSourceBranch && data.some((branch: Branch) => branch.name === currentSourceBranch)
							? currentSourceBranch
							: data[0].name)
					}

					if (!targetBranch || !data.some((branch: Branch) => branch.name === targetBranch)) {
						setTargetBranch(currentTargetBranch && data.some((branch: Branch) => branch.name === currentTargetBranch)
							? currentTargetBranch
							: defaultBranch)
					}
				}
			} catch (err) {
				setError('Failed to load branches')
				// console.error(err)
			} finally {
				setIsLoadingBranches(false)
			}
		}

		if (selectedRepo) {
			fetchBranches()
		}
	}, [selectedRepo, currentSourceBranch, currentTargetBranch])

	const handleApply = () => {
		if (sourceBranch && targetBranch && selectedRepo) {
			onSelect(sourceBranch, targetBranch, selectedRepo)
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Custom Branch Selection</DialogTitle>
					<DialogDescription>
						Select repository and branches to compare for PR generation
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{error && (
						<div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-950 rounded-md">
							{error}
						</div>
					)}

					<div className="space-y-2">
						<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Repository
						</label>
						{isLoadingRepos ? (
							<div className="flex items-center gap-2 h-9 px-3 text-sm rounded-md border border-neutral-200 dark:border-neutral-800">
								<Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
								<span className="text-neutral-500">Loading repositories...</span>
							</div>
						) : (
							<Select
								value={selectedRepo}
								onValueChange={setSelectedRepo}
								disabled={isLoadingRepos || repositories.length === 0}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a repository" />
								</SelectTrigger>
								<SelectContent>
									{repositories.map(repo => (
										<SelectItem key={repo.id} value={repo.full_name}>
											{repo.full_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
								Source Branch (Changes)
							</label>
							{isLoadingBranches ? (
								<div className="flex items-center gap-2 h-9 px-3 text-sm rounded-md border border-neutral-200 dark:border-neutral-800">
									<Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
									<span className="text-neutral-500">Loading...</span>
								</div>
							) : (
								<Select
									value={sourceBranch}
									onValueChange={setSourceBranch}
									disabled={isLoadingBranches || branches.length === 0}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select branch" />
									</SelectTrigger>
									<SelectContent>
										{branches.map(branch => (
											<SelectItem key={branch.name} value={branch.name}>
												{branch.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
								Target Branch (Base)
							</label>
							{isLoadingBranches ? (
								<div className="flex items-center gap-2 h-9 px-3 text-sm rounded-md border border-neutral-200 dark:border-neutral-800">
									<Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
									<span className="text-neutral-500">Loading...</span>
								</div>
							) : (
								<Select
									value={targetBranch}
									onValueChange={setTargetBranch}
									disabled={isLoadingBranches || branches.length === 0}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select branch" />
									</SelectTrigger>
									<SelectContent>
										{branches.map(branch => (
											<SelectItem key={branch.name} value={branch.name}>
												{branch.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 mt-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleApply}
						disabled={!sourceBranch || !targetBranch || sourceBranch === targetBranch || !selectedRepo}
						className="gap-1"
					>
						<GitBranch className="h-4 w-4" />
						Apply
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
