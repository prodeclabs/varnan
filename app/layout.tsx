import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/providers/theme-provider'
import MainSidebar from '@/components/MainSidebar'
import {SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export const metadata: Metadata = {
	title: 'Varnan',
	description: 'Generate beautiful PR descriptions with AI'
}

const RootLayout = ({
	children
}: Readonly<{
  children: React.ReactNode;
}>) => (
	<html lang="en" suppressHydrationWarning>
		<body
			className={`${geistSans.variable} ${geistMono.variable} antialiased`}
		>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<SidebarProvider>
					<MainSidebar />
					<main className="bg-sidebar w-full p-1.5">
						<div className="h-full w-full bg-background rounded-lg p-4 overflow-y-auto">
							{/* <SidebarTrigger />*/}
							{children}
						</div>
					</main>
				</SidebarProvider>
			</ThemeProvider>
		</body>
	</html>
)
export default RootLayout
