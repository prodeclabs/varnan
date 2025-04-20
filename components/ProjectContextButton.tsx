'use client'

import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {GitFork} from 'lucide-react'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import ProjectContextGenerator from '@/components/ProjectContextGenerator'

export default function ProjectContextButton() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setIsOpen(true)}
				className="flex items-center gap-1.5"
			>
				<GitFork className="h-4 w-4" />
				<span>Project Context</span>
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Project Context Generator</DialogTitle>
					</DialogHeader>
					<ProjectContextGenerator inDialog={true} onContextGenerated={() => setIsOpen(false)} />
				</DialogContent>
			</Dialog>
		</>
	)
}
