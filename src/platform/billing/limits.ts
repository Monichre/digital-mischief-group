import { sql } from "@/platform/db/neon"

/**
 * Plan limits per module (per month)
 * 0 = unlimited
 */
export const PLAN_LIMITS = {
  free: {
    enrich: 10,
    extract: 20,
    observe: 5,
    scout: 3,
    agent: 10,
  },
  active: {
    enrich: 500,
    extract: 1000,
    observe: 50,
    scout: 25,
    agent: 200,
  },
  enterprise: {
    enrich: 0, // unlimited
    extract: 0,
    observe: 0,
    scout: 0,
    agent: 0,
  },
} as const

export type PlanType = keyof typeof PLAN_LIMITS
export type ModuleType = keyof (typeof PLAN_LIMITS)["free"]

/**
 * Get limits for a given plan
 */
export function getPlanLimits(plan: string): Record<ModuleType, number> {
  if (plan === "active" || plan === "trialing") {
    return PLAN_LIMITS.active
  }
  if (plan === "enterprise") {
    return PLAN_LIMITS.enterprise
  }
  return PLAN_LIMITS.free
}

/**
 * Check if a user can perform an action based on their usage limits
 */
export async function checkUsageLimits(
  userId: string,
  module: ModuleType
): Promise<{ allowed: boolean; remaining: number; limit: number; used: number }> {
  // Get user's subscription status
  const [user] = await sql`
    SELECT subscription_status FROM public."user" WHERE id = ${userId}
  `

  const plan = user?.subscription_status || "inactive"
  const limits = getPlanLimits(plan)
  const moduleLimit = limits[module]

  // 0 = unlimited
  if (moduleLimit === 0) {
    return { allowed: true, remaining: -1, limit: 0, used: 0 }
  }

  // Count usage this month
  const [usage] = await sql`
    SELECT COUNT(*) as count
    FROM usage_events
    WHERE user_id = ${userId}
      AND module = ${module}
      AND (
        status = 'success'
        OR COALESCE(metadata->>'billable', 'false') = 'true'
      )
      AND created_at >= date_trunc('month', NOW())
  `

  const usedCount = parseInt(usage?.count || "0", 10)
  const remaining = moduleLimit - usedCount

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: moduleLimit,
    used: usedCount,
  }
}

/**
 * Enforce usage limits - throws if limit exceeded
 */
export async function enforceUsageLimits(
  userId: string,
  module: ModuleType
): Promise<void> {
  const { allowed, limit } = await checkUsageLimits(userId, module)

  if (!allowed) {
    throw new Error(
      `Usage limit exceeded for ${module}. You've used ${limit} of ${limit} this month. ` +
        `Upgrade your plan for more usage.`
    )
  }
}

/**
 * Get usage stats for all modules for a user
 */
export async function getUsageStats(
  userId: string
): Promise<Record<ModuleType, { used: number; limit: number; remaining: number }>> {
  // Get user's subscription status
  const [user] = await sql`
    SELECT subscription_status FROM public."user" WHERE id = ${userId}
  `

  const plan = user?.subscription_status || "inactive"
  const limits = getPlanLimits(plan)

  // Get usage counts per module this month
  const usageRows = await sql`
    SELECT module, COUNT(*) as count
    FROM usage_events
    WHERE user_id = ${userId}
      AND (
        status = 'success'
        OR COALESCE(metadata->>'billable', 'false') = 'true'
      )
      AND created_at >= date_trunc('month', NOW())
    GROUP BY module
  `

  const usageByModule: Record<string, number> = {}
  for (const row of usageRows) {
    usageByModule[row.module] = parseInt(row.count, 10)
  }

  const modules: ModuleType[] = ["enrich", "extract", "observe", "scout", "agent"]
  const stats = {} as Record<ModuleType, { used: number; limit: number; remaining: number }>

  for (const mod of modules) {
    const used = usageByModule[mod] || 0
    const limit = limits[mod]
    stats[mod] = {
      used,
      limit,
      remaining: limit === 0 ? -1 : Math.max(0, limit - used),
    }
  }

  return stats
}
