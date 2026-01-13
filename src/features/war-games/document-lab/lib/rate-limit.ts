// Simple in-memory rate limiting for development
// Replace with proper Redis implementation for production

const requests = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = 3
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function checkRateLimit(identifier: string) {
  const now = Date.now()
  const userRequests = requests.get(identifier)

  if (!userRequests || now > userRequests.resetTime) {
    // Reset or initialize
    requests.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return {
      success: true,
      limit: RATE_LIMIT,
      reset: now + WINDOW_MS,
      remaining: RATE_LIMIT - 1,
    }
  }

  if (userRequests.count >= RATE_LIMIT) {
    return {
      success: false,
      limit: RATE_LIMIT,
      reset: userRequests.resetTime,
      remaining: 0,
    }
  }

  // Increment count
  userRequests.count++
  requests.set(identifier, userRequests)

  return {
    success: true,
    limit: RATE_LIMIT,
    reset: userRequests.resetTime,
    remaining: RATE_LIMIT - userRequests.count,
  }
}
