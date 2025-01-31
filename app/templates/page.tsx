import {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Templates | Varnan',
	description: 'Manage your PR description templates'
}

const TemplatesPage = () => (
	<div className="container mx-auto px-4 py-6">
		<div className="max-w-2xl space-y-6">
			<div>
				<h1 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">
					Templates
				</h1>
				<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
					Manage your PR description templates
				</p>
			</div>
			{/* Add template management UI here */}
		</div>
	</div>
)

export default TemplatesPage
