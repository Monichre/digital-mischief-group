import { neon } from "@neondatabase/serverless"

// Create a singleton SQL client
const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Helper to format timestamps
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString()
}

// Helper to generate UUIDs (using crypto)
export function generateId(): string {
  return crypto.randomUUID()
}
