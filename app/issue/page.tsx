import ProjectContextGenerator from '@/components/ProjectContextGenerator'

export default function IssuePage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">Issues</h1>
			<div className="mb-8">
				<p className="text-neutral-500 dark:text-neutral-400 mb-4">
					Select GitHub repositories to generate project context for your issues.
					This context will help provide better understanding of your codebase.
				</p>
			</div>
			<ProjectContextGenerator />
		</div>
	)
}
