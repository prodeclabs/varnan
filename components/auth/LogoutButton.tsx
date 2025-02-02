'use client'

import {LogOut} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {deleteCookie} from 'cookies-next'
import {useRouter} from 'next/navigation'

export const LogoutButton = () => {
	const router = useRouter()

	const handleLogout = () => {
		deleteCookie('linear_access_token')
		router.push('/')
		router.refresh()
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleLogout}
			className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
		>
			<LogOut className="h-4 w-4 text-neutral-500" />
		</Button>

	)
}
