
import { sql } from "@/platform/db/neon"

/**
 * Checks if a user has an active 'Pro' subscription.
 * @param userId The user's ID
 * @returns true if subscription_status is 'active'
 */
export async function isProMember( userId: string ): Promise<boolean> {
  try {
    const result = await sql`
      SELECT email, subscription_status 
      FROM "user" 
      WHERE id = ${userId}
    `

    const user = result[0]
    if ( !user ) return false

    // Check for active subscription
    if ( user.subscription_status === 'active' ) {
      return true
    }

    // Check whitelist
    const adminEmails = ( process.env.ADMIN_EMAILS || "" ).split( "," ).map( e => e.trim() )
    if ( adminEmails.includes( user.email ) ) {
      return true
    }

    return false
  } catch ( error ) {
    console.error( "Error checking subscription status:", error )
    return false
  }
}
