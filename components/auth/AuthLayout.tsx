'use client'

import {usePathname} from 'next/navigation'
import {SidebarProvider} from '@/components/ui/sidebar'
import MainSidebar from '@/components/MainSidebar'
import LandingPage from '@/components/marketing/LandingPage'
import {LogoutButton} from '@/components/auth/LogoutButton'

type AuthLayoutProps = {
  children: React.ReactNode
  isAuthenticated: boolean
}

const AuthLayout = ({children, isAuthenticated}: AuthLayoutProps) => {
	const pathname = usePathname()
	const isHomePage = pathname === '/'
	const isMarketingPage = pathname === '/homepage'

	if (isMarketingPage) {
		return <LandingPage isAuthenticated={isAuthenticated} />
	}

	if (!isAuthenticated) {
		if (isHomePage) {
			return <LandingPage isAuthenticated={isAuthenticated} />
		}

		return children
	}

	return (
		<SidebarProvider>
			<MainSidebar />
			<main className="bg-sidebar w-full p-1.5">
				<div className="relative h-full w-full bg-background rounded-lg p-4 overflow-y-auto">
					<div className="absolute right-4 top-4 z-10">
						<LogoutButton />
					</div>
					{children}
				</div>
			</main>
		</SidebarProvider>
	)
}

export default AuthLayout
