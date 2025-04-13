'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'

export function DisconnectButton() {
	const [isDisconnecting, setIsDisconnecting] = useState(false)
	const router = useRouter()

	const handleDisconnect = async () => {
		try {
			setIsDisconnecting(true)

			const response = await fetch('/api/github/disconnect', {
				method: 'POST',
				credentials: 'include'
			})

			if (response.ok) {
				// Refresh the page to show the disconnected state
				router.refresh()
			} else {
				// console.error('Failed to disconnect from GitHub')
			}
		} catch (error) {
			// console.error('Error disconnecting from GitHub:', error)
		} finally {
			setIsDisconnecting(false)
		}
	}

	return (
		<button
			onClick={handleDisconnect}
			disabled={isDisconnecting}
			className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isDisconnecting ? 'Disconnecting...' : 'Disconnect GitHub'}
		</button>
	)
}
