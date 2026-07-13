import type {Meta, StoryObj} from '@storybook/nextjs'
import {type ComponentProps, useEffect, useState} from 'react'

import {WorkspaceShell} from './WorkspaceShell'

function MockedWorkspace({user}: ComponentProps<typeof WorkspaceShell>) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url

      if (url.includes('/api/workspace/tasks')) {
        const payload =
          init?.method === 'POST'
            ? {
                task: {
                  id: 'story-task',
                  skill: 'research',
                  primitive: 'agent',
                  title: 'Research: Storybook mission',
                  prompt: 'Storybook mission',
                  status: 'launched',
                  target_href: '/research/live?query=Storybook+mission',
                  created_at: new Date(0).toISOString(),
                },
              }
            : {tasks: []}
        return new Response(JSON.stringify(payload), {
          headers: {'Content-Type': 'application/json'},
        })
      }

      if (url.includes('/api/knowledge')) {
        return new Response(JSON.stringify({sources: [], results: []}), {
          headers: {'Content-Type': 'application/json'},
        })
      }

      if (url.includes('/api/workspace/search')) {
        return new Response(JSON.stringify({tasks: [], sources: [], knowledge: []}), {
          headers: {'Content-Type': 'application/json'},
        })
      }

      return originalFetch(input, init)
    }
    const timeoutId = window.setTimeout(() => setReady(true), 0)

    return () => {
      window.clearTimeout(timeoutId)
      window.fetch = originalFetch
    }
  }, [])

  return ready ? <WorkspaceShell user={user} /> : null
}

const meta = {
  title: 'Workspace/Daedalus',
  component: WorkspaceShell,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/workspace',
      },
    },
  },
  args: {
    user: {
      name: 'Liam Ellis',
      email: 'liam@digitalmischiefgroup.com',
    },
  },
  render: (args) => <MockedWorkspace {...args} />,
} satisfies Meta<typeof WorkspaceShell>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}
