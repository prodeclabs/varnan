export default function OnboardingLayout({
	children
}: {
  children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen h-full w-full bg-neutral-950">
			{children}
		</div>
	)
}
