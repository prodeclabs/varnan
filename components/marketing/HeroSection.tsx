'use client'

import {motion, AnimatePresence} from 'motion/react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'
import {useState, useRef} from 'react'
import {Filter, GitPullRequest, Link2, ListChecks, CheckCircle2} from 'lucide-react'
import {SiLinear} from 'react-icons/si'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'

// Mock Linear issues
const MOCK_ISSUES = [
	{id: 'VAR-123', title: 'Implement user authentication flow', status: 'In Progress'},
	{id: 'VAR-124', title: 'Add dashboard analytics', status: 'In Progress'},
	{id: 'VAR-125', title: 'Optimize database queries', status: 'Todo'}
]

const DemoTerminal = () => {
	const [selectedIssue, setSelectedIssue] = useState<string>('')
	const [isGenerating, setIsGenerating] = useState(false)
	const [showResult, setShowResult] = useState(false)
	const contentRef = useRef<HTMLDivElement>(null)

	const handleIssueSelect = (value: string) => {
		setSelectedIssue(value)
		setIsGenerating(false)
		setShowResult(false)
	}

	const handleGenerate = () => {
		if (!selectedIssue) return
		setIsGenerating(true)
		setShowResult(false)

		setTimeout(() => {
			setIsGenerating(false)
			setTimeout(() => {
				setShowResult(true)
			}, 100)
		}, 2000)
	}

	return (
		<motion.div
			className="bg-neutral-900/80 backdrop-blur-xl rounded-lg border border-neutral-800/50 shadow-2xl overflow-hidden w-full max-w-2xl"
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{delay: 0.4, duration: 0.5}}
		>
			{/* Terminal Header */}
			<div className="flex items-center gap-3 p-3 border-b border-neutral-800/50">
				<div className="flex items-center space-x-2">
					<div className="h-3 w-3 rounded-full bg-red-500/90" />
					<div className="h-3 w-3 rounded-full bg-yellow-500/90" />
					<div className="h-3 w-3 rounded-full bg-green-500/90" />
				</div>
			</div>

			{/* Rest of terminal content */}
			<div className="p-5">
				<div className="space-y-4">
					<div className="space-y-3">
						<div className="flex items-center gap-1.5">
							<SiLinear className="h-4 w-4 text-neutral-400" />
							<label className="text-sm font-medium text-neutral-300">
								Select Linear Issue
							</label>
						</div>

						<Select onValueChange={handleIssueSelect} value={selectedIssue}>
							<SelectTrigger className="w-full bg-neutral-950/50 border-neutral-800 text-neutral-200">
								<SelectValue placeholder="Choose an issue..." />
							</SelectTrigger>
							<SelectContent
								className="bg-neutral-900 border-neutral-800"
								position="popper"
								sideOffset={8}
							>
								{MOCK_ISSUES.map((issue) => (
									<SelectItem
										key={issue.id}
										value={issue.id}
										className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
									>
										{issue.id}: {issue.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Generation Area */}
			<div className="border-t border-neutral-800/50" ref={contentRef}>
				<div className="p-5 min-h-[280px] relative">
					<AnimatePresence mode="wait">
						{!selectedIssue && (
							<motion.div
								key="empty"
								initial={{opacity: 0}}
								animate={{opacity: 1}}
								exit={{opacity: 0}}
								className="text-sm text-neutral-400 text-center pt-12"
							>
								Select an issue to generate a PR description
							</motion.div>
						)}

						{selectedIssue && !isGenerating && !showResult && (
							<motion.div
								key="ready"
								initial={{opacity: 0}}
								animate={{opacity: 1}}
								exit={{opacity: 0}}
								className="text-center pt-12"
							>
								<Button
									onClick={handleGenerate}
									variant="secondary"
									className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
								>
									<GitPullRequest className="h-4 w-4 mr-2" />
									Generate Description
								</Button>
							</motion.div>
						)}

						{isGenerating && (
							<motion.div
								key="generating"
								initial={{opacity: 0}}
								animate={{opacity: 1}}
								exit={{opacity: 0}}
								className="flex flex-col items-center justify-center pt-12 gap-3"
							>
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-transparent" />
								<p className="text-sm text-neutral-400">
									Generating PR description...
								</p>
							</motion.div>
						)}

						{showResult && (
							<motion.div
								key="result"
								initial={{opacity: 0}}
								animate={{opacity: 1}}
								exit={{opacity: 0}}
								className="space-y-4"
							>
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-emerald-400" />
									<p className="text-emerald-400 text-sm">PR Description Generated</p>
								</div>

								<div className="bg-neutral-950/50 rounded-lg p-4 border border-neutral-800/50">
									<p className="font-medium text-sm mb-3">feat: Implement user authentication flow</p>
									<div className="space-y-2 text-sm text-neutral-400">
										<p className="text-xs text-neutral-300">Description:</p>
										<p className="text-xs">This PR implements the core user authentication flow.</p>

										<p className="text-xs text-neutral-300 mt-3">Changes:</p>
										<ul className="list-disc list-inside space-y-1 text-xs">
											<li>Add login and signup forms</li>
											<li>Integrate with Auth provider</li>
											<li>Add protected routes</li>
										</ul>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	)
}

export const HeroSection = () => {
	return (
		<section className="pt-32 pb-20 relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid lg:grid-cols-[0.8fr,1.2fr] gap-12 items-start">
					{/* Left Column - Content */}
					<div className="space-y-8">
						<div className="space-y-6">
							<motion.h1
								className="text-4xl sm:text-4xl font-bold"
								initial={{opacity: 0, y: 20}}
								animate={{opacity: 1, y: 0}}
								transition={{duration: 0.5}}
							>
								Generate PR Descriptions
								<br />
								<motion.span
									className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-white"
								>
									Automatically
								</motion.span>
							</motion.h1>

							<motion.p
								className="text-lg text-neutral-400"
								initial={{opacity: 0, y: 20}}
								animate={{opacity: 1, y: 0}}
								transition={{delay: 0.2, duration: 0.5}}
							>
								Transform your Linear issues into detailed PR descriptions in seconds
							</motion.p>

							<motion.div
								className="space-y-4 text-neutral-300"
								initial={{opacity: 0, y: 20}}
								animate={{opacity: 1, y: 0}}
								transition={{delay: 0.4, duration: 0.5}}
							>
								<div className="flex items-center space-x-3">
									<div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-800">
										<Link2 className="h-4 w-4 text-white" />
									</div>
									<span>Seamless integration with Linear for effortless workflow</span>
								</div>
								<div className="flex items-center space-x-3">
									<div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-800">
										<ListChecks className="h-4 w-4 text-white" />
									</div>
									<span>Fetching available in progress issues from Linear</span>
								</div>
								<div className="flex items-center space-x-3">
									<div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-800">
										<GitPullRequest className="h-4 w-4 text-white" />
									</div>
									<span>AI-generated descriptions tailored to your project needs</span>
								</div>
								<div className="flex items-center space-x-3">
									<div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-800">
										<CheckCircle2 className="h-4 w-4 text-white" />
									</div>
									<span>Boost productivity with automated PR creation</span>
								</div>
							</motion.div>
						</div>

						<motion.div
							className="flex flex-row gap-4"
							initial={{opacity: 0, y: 20}}
							animate={{opacity: 1, y: 0}}
							transition={{delay: 0.6, duration: 0.5}}
						>
							<Button
								size="lg"
								variant="default"
								className="bg-white text-neutral-900 hover:bg-neutral-100 px-8"
								asChild
							>
								<Link href="https://varnan.site">
									Try Varnan Now
								</Link>
							</Button>
						</motion.div>
					</div>

					{/* Right Column - Demo Terminal */}
					<div className="lg:pl-8">
						<DemoTerminal />
					</div>
				</div>
			</div>

			{/* Gradient border */}
			<motion.div
				className="absolute bottom-0 left-0 right-0 h-px"
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				transition={{delay: 4.0, duration: 0.5}}
			>
				<div className="h-full bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
			</motion.div>
		</section>
	)
}
