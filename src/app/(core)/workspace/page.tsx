import {headers} from 'next/headers'
import {redirect} from 'next/navigation'
import {WorkspaceShell} from '@/components/workspace/WorkspaceShell'
import {auth} from '@/platform/auth/server'

export default async function WorkspacePage() {
  const session = await auth.api.getSession({headers: await headers()})

  if (!session?.user) {
    redirect('/sign-in?callbackUrl=%2Fworkspace')
  }

  return (
    <WorkspaceShell
      user={{
        name: session.user.name || null,
        email: session.user.email,
      }}
    />
  )
}
