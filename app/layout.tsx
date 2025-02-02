import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/providers/theme-provider'
import {cookies} from 'next/headers'
import AuthLayout from '@/components/auth/AuthLayout'

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

const RootLayout = async ({
	children
}: Readonly<{
	children: React.ReactNode;
}>) => {
	const cookieStore = await cookies()
	const token = cookieStore.get('linear_access_token')
	const isAuthenticated = Boolean(token)

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<AuthLayout isAuthenticated={isAuthenticated}>
						{children}
					</AuthLayout>
				</ThemeProvider>
			</body>
		</html>
	)
}

export default RootLayout
