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
  console.log("Running migration: 008-add-brand-recon-schema.sql")

  const migrationPath = path.join(process.cwd(), "scripts", "migrations", "008-add-brand-recon-schema.sql")
  const migrationSQL = fs.readFileSync(migrationPath, "utf8")

  // Remove line comments first
  const lines = migrationSQL.split("\n")
  const sqlLines = lines.filter(line => {
    const trimmed = line.trim()
    return trimmed.length > 0 && !trimmed.startsWith("--")
  })
  const cleanSQL = sqlLines.join("\n")

  // Split by semicolons, but only outside of parentheses, quotes, and dollar-quotes
  const statements: string[] = []
  let currentStatement = ""
  let parenDepth = 0
  let inSingleQuote = false
  let inDoubleQuote = false
  let inDollarQuote = false

  for (let i = 0; i < cleanSQL.length; i++) {
    const char = cleanSQL[i]
    const prevChar = i > 0 ? cleanSQL[i - 1] : ""
    const nextChar = i < cleanSQL.length - 1 ? cleanSQL[i + 1] : ""

    // Track dollar quotes ($$)
    if (char === "$" && nextChar === "$" && !inSingleQuote && !inDoubleQuote) {
      inDollarQuote = !inDollarQuote
    }

    // Track quotes (ignore escaped quotes)
    if (char === "'" && prevChar !== "\\" && !inDollarQuote) inSingleQuote = !inSingleQuote
    if (char === '"' && prevChar !== "\\" && !inDollarQuote) inDoubleQuote = !inDoubleQuote

    // Track parentheses depth (only when not in quotes)
    if (!inSingleQuote && !inDoubleQuote && !inDollarQuote) {
      if (char === "(") parenDepth++
      if (char === ")") parenDepth--
    }

    // Split on semicolon only when outside parens, quotes, and dollar quotes
    if (char === ";" && parenDepth === 0 && !inSingleQuote && !inDoubleQuote && !inDollarQuote) {
      if (currentStatement.trim().length > 0) {
        statements.push(currentStatement.trim())
      }
      currentStatement = ""
    } else {
      currentStatement += char
    }
  }

  // Add final statement if exists
  if (currentStatement.trim().length > 0) {
    statements.push(currentStatement.trim())
  }

  console.log(`Executing ${statements.length} statements...`)
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    console.log(`[${i + 1}/${statements.length}] ${stmt.substring(0, 60)}...`)
    await sql(stmt)
  }

  console.log("✅ Migration completed successfully!")
}

runMigration().catch((error) => {
  console.error("❌ Migration failed:", error)
  process.exit(1)
})
