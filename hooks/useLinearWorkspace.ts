'use client'

import {LinearClient} from '@linear/sdk'
import {useEffect, useState} from 'react'
import {getCookie} from 'cookies-next'

type WorkspaceInfo = {
  name: string
  loading: boolean
  error: string | null
}

const useLinearWorkspace = () => {
  const [workspace, setWorkspace] = useState<WorkspaceInfo>({
    name: '',
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const token = getCookie('linear_access_token')

        if (!token) {
          setWorkspace({
            name: '',
            loading: false,
            error: 'No access token found'
          })
          return
        }

        const linearClient = new LinearClient({
          accessToken: token.toString()
        })

        const organization = await linearClient.organization
        setWorkspace({
          name: organization.name,
          loading: false,
          error: null
        })
      } catch (err) {
        setWorkspace({
          name: '',
          loading: false,
          error: 'Failed to fetch workspace'
        })
      }
    }

    fetchWorkspace()
  }, [])

  return workspace
}

export default useLinearWorkspace 