'use client'

import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {ChevronDown, LogOut} from 'lucide-react'
import {SiLinear} from 'react-icons/si'
import useLinearWorkspace from '@/hooks/useLinearWorkspace'
import {deleteCookie} from 'cookies-next'

const WorkspaceSwitcher = () => {
  const {name, loading, error} = useLinearWorkspace()

  const handleSwitchWorkspace = () => {
    // Clear the token
    deleteCookie('linear_access_token')
    // Redirect to Linear OAuth
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID!,
      redirect_uri: process.env.NEXT_PUBLIC_APP_URL + '/api/linear/callback',
      response_type: 'code',
      state: crypto.randomUUID(),
      prompt: 'consent',
      scope: 'read'
    })
    window.location.href = `https://linear.app/oauth/authorize?${params.toString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5">
        <SiLinear className="h-4 w-4 text-neutral-400" />
        <div className="h-4 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
      </div>
    )
  }

  if (error || !name) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 px-2"
        onClick={handleSwitchWorkspace}
      >
        <SiLinear className="h-4 w-4" />
        <span>Connect Workspace</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 px-2"
        >
          <SiLinear className="h-4 w-4" />
          <span className="truncate">{name}</span>
          <ChevronDown className="ml-auto h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuItem onClick={handleSwitchWorkspace}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Switch Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WorkspaceSwitcher 