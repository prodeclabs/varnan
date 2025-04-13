import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
	SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarSeparator
} from '@/components/ui/sidebar'
import {GitPullRequest, FileText, Settings, Github} from 'lucide-react'
import Link from 'next/link'
import WorkspaceSwitcher from '@/components/linear/WorkspaceSwitcher'
import GitHubSidebarLink from '@/components/github/GitHubSidebarLink'

const items = [
	{
		title: 'PR Generator',
		url: '/',
		icon: GitPullRequest
	},
	{
		title: 'Templates',
		url: '/templates',
		icon: FileText
	}
]

const MainSidebar = () => (
	<Sidebar>
		<SidebarHeader className="p-4">
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex items-center gap-2">
						<p className="font-medium text-sm">Varnan</p>
					</div>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>

		<SidebarSeparator />

		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel>Workspace</SidebarGroupLabel>
				<SidebarGroupContent>
					<WorkspaceSwitcher />
				</SidebarGroupContent>
			</SidebarGroup>

			<SidebarSeparator />

			<SidebarGroup>
				<SidebarGroupLabel>Navigation</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{items.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild>
									<Link prefetch={true} href={item.url}>
										<item.icon className="h-4 w-4" />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
						<SidebarMenuItem>
							<GitHubSidebarLink />
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<Link prefetch={true} href="/settings">
							<Settings className="h-4 w-4" />
							<span>Settings</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
	</Sidebar>
)

export default MainSidebar
