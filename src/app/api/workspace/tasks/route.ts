import {headers} from 'next/headers'
import {NextResponse} from 'next/server'
import {z} from 'zod'
import {auth} from '@/platform/auth/server'
import {sql} from '@/platform/db/neon'
import {
  buildWorkspaceLaunchHref,
  getWorkspaceSkill,
  WORKSPACE_SKILL_IDS,
} from '@/daedalus/agent/workspace/config'

const CreateTaskSchema = z.object({
  skill: z.enum(WORKSPACE_SKILL_IDS),
  prompt: z.string().trim().min(1).max(4_000),
})

async function getUserId() {
  const session = await auth.api.getSession({headers: await headers()})
  return session?.user?.id || null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const tasks = await sql`
    SELECT id, skill, primitive, title, prompt, status, target_href, created_at
    FROM workspace_tasks
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `
  return NextResponse.json({tasks})
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const parsed = CreateTaskSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      {error: parsed.error.issues[0]?.message || 'Invalid task'},
      {status: 400}
    )
  }

  const {skill: skillId, prompt} = parsed.data
  const skill = getWorkspaceSkill(skillId)
  const title = `${skill.label}: ${prompt}`.slice(0, 120)
  const targetHref = buildWorkspaceLaunchHref(skillId, prompt)

  const [task] = await sql`
    INSERT INTO workspace_tasks (
      user_id, skill, primitive, title, prompt, status, target_href
    )
    VALUES (
      ${userId}, ${skillId}, ${skill.primitive}, ${title}, ${prompt}, 'launched', ${targetHref}
    )
    RETURNING id, skill, primitive, title, prompt, status, target_href, created_at
  `

  return NextResponse.json({task}, {status: 201})
}
