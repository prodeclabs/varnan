'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {saveUserProfile} from '@/app/actions/saveUserProfile'

const professions = [
	'Software Engineer',
	'Product Manager',
	'Designer',
	'Data Scientist',
	'Marketing',
	'Sales',
	'Customer Support',
	'Other'
]

interface OnboardingFormProps {
  initialName: string;
  initialEmail: string;
}

export default function OnboardingForm({initialName, initialEmail}: OnboardingFormProps) {
	const router = useRouter()
	const [name, setName] = useState(initialName)
	const [profession, setProfession] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError('')

		try {
			await saveUserProfile({name, profession})
			router.push('/')
			router.refresh()
		} catch (err) {
			setError('Failed to save profile. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-900/30 border border-red-800 p-3 rounded-md text-red-400 text-sm">
					{error}
				</div>
			)}

			<div className="space-y-4">
				<div>
					<label htmlFor="email" className="block text-sm font-medium text-neutral-400 mb-1">
						Email
					</label>
					<input
						type="email"
						id="email"
						value={initialEmail}
						disabled
						className="bg-neutral-900 border border-neutral-800 w-full px-4 py-2 rounded-md text-neutral-300 disabled:opacity-70"
					/>
					<p className="mt-1 text-xs text-neutral-500">This email is associated with your Linear account</p>
				</div>

				<div>
					<label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-1">
						Name
					</label>
					<input
						type="text"
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="bg-neutral-900 border border-neutral-800 w-full px-4 py-2 rounded-md text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
						required
					/>
				</div>

				<div>
					<label htmlFor="profession" className="block text-sm font-medium text-neutral-400 mb-1">
						Profession
					</label>
					<select
						id="profession"
						value={profession}
						onChange={(e) => setProfession(e.target.value)}
						className="bg-neutral-900 border border-neutral-800 w-full px-4 py-2 rounded-md text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
						required
					>
						<option value="" disabled>Select your profession</option>
						{professions.map((prof) => (
							<option key={prof} value={prof}>
								{prof}
							</option>
						))}
					</select>
				</div>
			</div>

			<button
				type="submit"
				disabled={isSubmitting || !profession || !name}
				className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:text-neutral-400 transition-colors text-white py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-neutral-900"
			>
				{isSubmitting ? 'Saving...' : 'Complete Setup'}
			</button>
		</form>
	)
}
