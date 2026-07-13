import {sql} from '@/platform/db/neon'

type WorkspaceRateAction = 'ingest' | 'search'

export async function consumeWorkspaceRateLimit({
  userId,
  action,
  limit,
  windowMinutes,
}: {
  userId: string
  action: WorkspaceRateAction
  limit: number
  windowMinutes: number
}): Promise<{allowed: boolean; count: number; limit: number}> {
  const windowMs = windowMinutes * 60_000
  const windowStart = new Date(
    Math.floor(Date.now() / windowMs) * windowMs
  ).toISOString()

  const [row] = await sql`
    INSERT INTO workspace_rate_limits (user_id, action, window_start, request_count)
    VALUES (${userId}, ${action}, ${windowStart}, 1)
    ON CONFLICT (user_id, action, window_start)
    DO UPDATE SET request_count = workspace_rate_limits.request_count + 1
    RETURNING request_count
  `

  await sql`
    DELETE FROM workspace_rate_limits
    WHERE user_id = ${userId}
      AND action = ${action}
      AND window_start < NOW() - INTERVAL '7 days'
  `

  const count = Number(row.request_count)
  return {allowed: count <= limit, count, limit}
}
