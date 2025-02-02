import {Metadata} from 'next'
import {LinearOAuth} from '@/components/generate-pr/LinearOAuth'

export const metadata: Metadata = {
	title: 'Login | Varnan',
	description: 'Connect your Linear account to get started'
}

const LoginPage = () => {
	return (
		<div className="min-h-screen grid place-items-center bg-neutral-50/50 dark:bg-neutral-950/50">
			<div className="w-full">
				<LinearOAuth />
			</div>
		</div>
	)
}

export default LoginPage
