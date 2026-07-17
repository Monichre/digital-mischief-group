import type {Meta, StoryObj} from '@storybook/nextjs'
import {type ComponentProps, useEffect, useRef, useState} from 'react'
import {expect, userEvent, within} from 'storybook/test'

import type {KnowledgeSource} from '@/daedalus/agent/knowledge/types'

import {WorkspaceShell} from './WorkspaceShell'

function MockedWorkspace({user}: ComponentProps<typeof WorkspaceShell>) {
  const [ready, setReady] = useState(false)
  const sourcesRef = useRef<KnowledgeSource[]>([])

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
        const method = init?.method?.toUpperCase() || 'GET'

        if (method === 'POST') {
          const body = init?.body
          const file = body instanceof FormData ? body.get('file') : null
          const json = typeof body === 'string' ? JSON.parse(body) : null
          const sourceType: KnowledgeSource['source_type'] =
            file instanceof File ? 'file' : json?.type === 'url' ? 'url' : 'text'
          const textTitle =
            sourceType === 'text'
              ? String(json?.text || '').trim().split('\n')[0].slice(0, 180)
              : ''
          const title =
            (body instanceof FormData && String(body.get('title') || '').trim()) ||
            (file instanceof File && file.name) ||
            json?.title ||
            (sourceType === 'url'
              ? new URL(json.url).hostname
              : textTitle || 'Untitled knowledge')
          const source: KnowledgeSource = {
            id: `story-source-${sourcesRef.current.length + 1}`,
            source_type: sourceType,
            title,
            source_url: sourceType === 'url' ? json.url : null,
            file_name: file instanceof File ? file.name : null,
            mime_type: file instanceof File ? file.type : null,
            size_bytes: file instanceof File ? file.size : null,
            blob_pathname: file instanceof File ? `story/${file.name}` : null,
            summary: `${title} is indexed and ready for retrieval.`,
            status: 'ready',
            error_message: null,
            chunk_count: 1,
            created_at: new Date(0).toISOString(),
          }
          sourcesRef.current = [source, ...sourcesRef.current]
          return new Response(JSON.stringify({source}), {
            status: 201,
            headers: {'Content-Type': 'application/json'},
          })
        }

        if (method === 'DELETE') {
          const id = new URL(url, window.location.origin).searchParams.get('id')
          sourcesRef.current = sourcesRef.current.filter((source) => source.id !== id)
          return new Response(JSON.stringify({success: true}), {
            headers: {'Content-Type': 'application/json'},
          })
        }

        return new Response(JSON.stringify({sources: sourcesRef.current}), {
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

export const Memory: Story = {
  play: async ({canvasElement}) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {name: 'Memory'})
    )
  },
}

export const PdfUpload: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', {name: 'Memory'}))

    const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')
    if (!fileInput) throw new Error('Knowledge file input is missing')

    await userEvent.upload(
      fileInput,
      new File(['%PDF-1.4\n%%EOF'], 'Delphi-demo.pdf', {type: 'application/pdf'})
    )
    await userEvent.click(canvas.getByRole('button', {name: 'Integrate'}))

    await expect(
      await canvas.findByText('Delphi-demo.pdf is now part of Delphi.')
    ).toBeInTheDocument()
  },
}
