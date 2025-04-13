import {checkLinearAuth} from '../actions/checkLinearAuth'
import {redirect} from 'next/navigation'
import OnboardingForm from '@/components/onboarding/OnboardingForm'

export default async function OnboardingPage() {
	// Check if user is authenticated
	const {isAuthenticated, user} = await checkLinearAuth()

	// If not authenticated, redirect to login
	if (!isAuthenticated) {
		redirect('/login')
	}

	// If user has already completed onboarding, redirect to home
	if (user?.profession) {
		redirect('/')
	}

	return (
		<div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="space-y-6">
					<div className="text-center">
						<h1 className="text-3xl font-bold text-white">Welcome to Varnan</h1>
						<p className="mt-2 text-neutral-400">Let's set up your profile to get started</p>
					</div>

					<OnboardingForm initialEmail={user?.email || ''} initialName={user?.name || ''} />
				</div>
			</div>
		</div>
	)
}
