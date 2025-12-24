import { neon } from "@neondatabase/serverless"
import * as fs from "fs"
import * as path from "path"

// Load DATABASE_URL from .env.local
const envPath = path.join(process.cwd(), ".env.local")
const envContent = fs.readFileSync(envPath, "utf8")
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL not found in .env.local")
}

const sql = neon(DATABASE_URL)

async function runMigration() {
  console.log("Running migration 010: Add Sentinel AI Schema...")

  const migrationPath = path.join(process.cwd(), "scripts", "010-add-sentinel-ai-schema.sql")
  const migrationSQL = fs.readFileSync(migrationPath, "utf8")

  // Remove comments
  const lines = migrationSQL.split("\n")
  const sqlLines = lines.filter(line => {
    const trimmed = line.trim()
    return trimmed.length > 0 && !trimmed.startsWith("--")
  })
  const cleanSQL = sqlLines.join("\n")

  // Split by semicolons
  const statements: string[] = []
  let currentStatement = ""
  let parenDepth = 0
  let inSingleQuote = false
  let inDoubleQuote = false

  for (let i = 0; i < cleanSQL.length; i++) {
    const char = cleanSQL[i]
    const prevChar = i > 0 ? cleanSQL[i - 1] : ""

    if (char === "'" && prevChar !== "\\") inSingleQuote = !inSingleQuote
    if (char === '"' && prevChar !== "\\") inDoubleQuote = !inDoubleQuote

    if (!inSingleQuote && !inDoubleQuote) {
      if (char === "(") parenDepth++
      if (char === ")") parenDepth--
    }

    if (char === ";" && parenDepth === 0 && !inSingleQuote && !inDoubleQuote) {
      if (currentStatement.trim().length > 0) {
        statements.push(currentStatement.trim())
      }
      currentStatement = ""
    } else {
      currentStatement += char
    }
  }

  if (currentStatement.trim().length > 0) {
    statements.push(currentStatement.trim())
  }

  console.log(`Executing ${statements.length} statements...`)
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    console.log(`[${i + 1}/${statements.length}] ${stmt.substring(0, 60)}...`)
    await sql(stmt)
  }

  console.log("✅ Migration 010 completed successfully!")
  console.log("Added tables:")
  console.log("  - sentinel_insights")
  console.log("  - sentinel_agent_runs")
  console.log("  - competitive_intel")
  console.log("  - sentinel_trends")
  console.log("Updated scout_results with AI analysis fields")
}

runMigration().catch((error) => {
  console.error("❌ Migration failed:", error)
  process.exit(1)
})
