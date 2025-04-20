import IssuePromptGenerator from '@/components/IssuePromptGenerator'
import ProjectContextButton from '@/components/ProjectContextButton'

export default function IssuePage() {
	return (
		<div className="container mx-auto py-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Issues</h1>
				<ProjectContextButton/>
			</div>
			<div className="mb-8">
				<p className="text-neutral-500 dark:text-neutral-400 mb-4">
					Write issue descriptions in natural language.
					The AI will generate a formatted Linear issue using any project context you've added.
				</p>
			</div>
			<IssuePromptGenerator />
		</div>
	)
}
