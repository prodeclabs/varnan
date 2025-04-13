'use client'

import {useEffect, useState} from 'react'
import {Github} from 'lucide-react'
import Link from 'next/link'
import {SidebarMenuButton} from '@/components/ui/sidebar'
import {Badge} from '@/components/ui/badge'

const GitHubSidebarLink = () => {
	const [isConnected, setIsConnected] = useState(false)

	const checkAuth = async () => {
		try {
			// Fetch the status page with credentials to check if the cookie exists
			const response = await fetch('/api/github/status', {
				credentials: 'include'
			})

			if (response.ok) {
				const data = await response.json()
				setIsConnected(data.authenticated)
			}
		} catch (error) {
			// Silent fail - user is not authenticated
		}
	}

	useEffect(() => {
		// Check if user has a GitHub access token
		checkAuth()
	}, [])

	return (
		<SidebarMenuButton asChild>
			<Link prefetch={true} href={isConnected ? '/github/status' : '/github'}>
				<Github className="h-4 w-4" />
				<span>GitHub</span>
				{isConnected && (
					<Badge variant="outline" className="ml-auto py-0 h-5">
						Connected
					</Badge>
				)}
			</Link>
		</SidebarMenuButton>
	)
}

export default GitHubSidebarLink
