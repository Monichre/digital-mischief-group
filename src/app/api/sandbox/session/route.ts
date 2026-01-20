/**
 * War Games Sandbox - Session Management API
 *
 * Endpoints:
 * - POST /api/sandbox/session - Create new anonymous session
 * - GET /api/sandbox/session - Get current session info
 * - DELETE /api/sandbox/session - Delete session (for testing)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSession, getSession, deleteSession, validateSession } from '@/platform/sandbox/session-manager'
import { getUsageStats } from '@/platform/sandbox/rate-limiter'

const COOKIE_NAME = 'sandbox_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours

/**
 * POST - Create new sandbox session
 * Returns session ID in cookie and response body
 */
export async function POST(req: NextRequest) {
  try {
    // Check if session already exists
    const existingSessionId = req.cookies.get(COOKIE_NAME)?.value
    if (existingSessionId) {
      const isValid = await validateSession(existingSessionId)
      if (isValid) {
        // Return existing session
        const session = await getSession(existingSessionId)
        const stats = await getUsageStats(existingSessionId)

        return NextResponse.json({
          session_id: existingSessionId,
          session,
          usage: stats,
        })
      }
    }

    // Create new session
    const sessionId = await createSession()
    const session = await getSession(sessionId)
    const stats = await getUsageStats(sessionId)

    const response = NextResponse.json({
      session_id: sessionId,
      session,
      usage: stats,
    })

    // Set cookie
    response.cookies.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get current session info and usage stats
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(COOKIE_NAME)?.value

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 404 }
      )
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 404 }
      )
    }

    const stats = await getUsageStats(sessionId)

    return NextResponse.json({
      session_id: sessionId,
      session,
      usage: stats,
    })
  } catch (error) {
    console.error('Session retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete current session (for testing/cleanup)
 */
export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(COOKIE_NAME)?.value

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 404 }
      )
    }

    await deleteSession(sessionId)

    const response = NextResponse.json({ success: true })
    response.cookies.delete(COOKIE_NAME)

    return response
  } catch (error) {
    console.error('Session deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
