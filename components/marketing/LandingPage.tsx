import Link from 'next/link'
import {Metadata} from 'next'
import {ArrowRight, GitPullRequest, Zap, RefreshCw} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {HeroSection} from './HeroSection'

export const metadata: Metadata = {
	title: 'Varnan - AI-Powered PR Descriptions from Linear Issues',
	description: 'Generate professional pull request descriptions automatically from your Linear issues using AI.',
	openGraph: {
		title: 'Varnan - AI-Powered PR Descriptions',
		description: 'Generate professional pull request descriptions automatically from your Linear issues using AI.',
		type: 'website'
	}
}

const LandingPage = () => {
	return (
		<div className="min-h-screen bg-[#030014] text-white relative overflow-hidden">
			{/* Enhanced Background Gradients */}
			<div className="absolute inset-0 z-0">
				{/* Main gradient orbs */}
				<div
					className="absolute top-[-6%] right-[11%] h-[600px] w-[600px] rounded-full
					bg-gradient-to-r from-indigo-500 to-blue-600 blur-[120px] opacity-20"
				/>
				<div
					className="absolute top-[-1%] left-[-35%] h-[800px] w-[800px] rounded-full
					bg-gradient-to-r from-purple-600 to-purple-800 blur-[120px] opacity-20"
				/>
				<div
					className="absolute bottom-[-10%] right-[-35%] h-[600px] w-[600px] rounded-full
					bg-gradient-to-r from-blue-600 to-cyan-400 blur-[120px] opacity-20"
				/>

				{/* Additional accent gradients */}
				<div
					className="absolute top-[20%] left-[15%] h-[400px] w-[400px] rounded-full
					bg-gradient-to-r from-emerald-500 to-green-300 blur-[120px] opacity-10"
				/>
				<div
					className="absolute bottom-[20%] left-[15%] h-[400px] w-[400px] rounded-full
					bg-gradient-to-r from-purple-400 to-pink-400 blur-[120px] opacity-10"
				/>

				{/* Radial gradient overlay for depth */}
				<div
					className="absolute inset-0 bg-gradient-radial from-transparent
					via-[#030014] to-[#030014] opacity-80"
				/>

				{/* Grain texture overlay */}
				<div
					className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]
					mix-blend-soft-light pointer-events-none"
				/>
			</div>

			{/* Content wrapper with relative positioning */}
			<div className="relative z-10">
				{/* Navigation */}
				<nav className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div className="text-xl font-semibold">Varnan</div>
						<div className="flex items-center gap-6">
							<Link
								href="#"
								className="text-sm text-neutral-400 hover:text-white transition-colors"
							>
								Sign in
							</Link>
							<Button asChild>
								<Link href="https://varnan.site">
									Try Varnan Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</nav>

				{/* Hero Section */}
				<HeroSection />

				{/* Features Grid with enhanced styling */}
				<main className="container mx-auto px-4 py-32">
					<div className="grid md:grid-cols-3 gap-8">
						<div className="p-6 rounded-xl border border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm hover:border-neutral-700/50 transition-colors">
							<div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
								<Zap className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Instant Insights</h3>
							<p className="text-neutral-400">
								Quickly understand project requirements with AI-driven insights.
							</p>
						</div>

						<div className="p-6 rounded-xl border border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm hover:border-neutral-700/50 transition-colors">
							<div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
								<GitPullRequest className="h-6 w-6 text-purple-500" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Collaborative Features</h3>
							<p className="text-neutral-400">
								Work together with your team to refine PR descriptions in real-time.
							</p>
						</div>

						<div className="p-6 rounded-xl border border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm hover:border-neutral-700/50 transition-colors">
							<div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
								<RefreshCw className="h-6 w-6 text-green-500" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Continuous Improvement</h3>
							<p className="text-neutral-400">
								Iterate on your PR descriptions with feedback and suggestions.
							</p>
						</div>
					</div>
				</main>

				{/* Updated Footer */}
				<footer className="bg-neutral-900/50 backdrop-blur-sm pt-16 pb-8">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-neutral-800/50">
							{/* Brand Column */}
							<div className="col-span-1 md:col-span-2">
								<Link href="/" className="text-white text-xl font-bold">
									Varnan
								</Link>
								<p className="mt-4 text-neutral-400 max-w-md">
									Streamline your PR workflow with automatically generated descriptions from Linear issues.
								</p>
								<div className="mt-6 flex space-x-4">
									<Link href="https://twitter.com" className="text-neutral-400 hover:text-white transition-colors">
										<span className="sr-only">Twitter</span>
										<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
											<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
										</svg>
									</Link>
									<Link href="https://github.com" className="text-neutral-400 hover:text-white transition-colors">
										<span className="sr-only">GitHub</span>
										<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
											<path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
										</svg>
									</Link>
								</div>
							</div>

							{/* Product Links */}
							<div>
								<h3 className="text-sm font-semibold text-white tracking-wider uppercase">
									Product
								</h3>
								<ul className="mt-4 space-y-2">
									<li><Link href="#features" className="text-neutral-400 hover:text-white transition-colors">Features</Link></li>
									<li><Link href="#pricing" className="text-neutral-400 hover:text-white transition-colors">Pricing</Link></li>
									<li><Link href="#testimonials" className="text-neutral-400 hover:text-white transition-colors">Testimonials</Link></li>
									<li><Link href="#faq" className="text-neutral-400 hover:text-white transition-colors">FAQ</Link></li>
								</ul>
							</div>

							{/* Company Links */}
							<div>
								<h3 className="text-sm font-semibold text-white tracking-wider uppercase">
									Company
								</h3>
								<ul className="mt-4 space-y-2">
									<li><Link href="#" className="text-neutral-400 hover:text-white transition-colors">About</Link></li>
									<li><Link href="#" className="text-neutral-400 hover:text-white transition-colors">Blog</Link></li>
									<li><Link href="#" className="text-neutral-400 hover:text-white transition-colors">Contact</Link></li>
									<li><Link href="#" className="text-neutral-400 hover:text-white transition-colors">Careers</Link></li>
								</ul>
							</div>
						</div>

						{/* Bottom Section */}
						<div className="mt-8 pt-8 md:flex md:items-center md:justify-between">
							<div className="flex space-x-6 md:order-2">
								<Link href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
									Privacy Policy
								</Link>
								<Link href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
									Terms of Service
								</Link>
							</div>
							<p className="mt-8 text-base text-neutral-400 md:mt-0 md:order-1">
								© {new Date().getFullYear()} Varnan. All rights reserved.
							</p>
						</div>
					</div>
				</footer>
			</div>
		</div>
	)
}

export default LandingPage
