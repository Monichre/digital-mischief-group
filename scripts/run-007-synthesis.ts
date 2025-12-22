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
  console.log("Running migration: 007-add-synthesis-field.sql")

  const migrationPath = path.join(process.cwd(), "scripts", "007-add-synthesis-field.sql")
  const migrationSQL = fs.readFileSync(migrationPath, "utf8")

  // Split by semicolons and filter out comments
  const statements = migrationSQL
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"))

  for (const statement of statements) {
    if (statement.length > 0) {
      console.log(`Executing: ${statement.substring(0, 100)}...`)
      await sql(statement)
    }
  }

  console.log("✅ Migration completed successfully!")
}

runMigration().catch((error) => {
  console.error("❌ Migration failed:", error)
  process.exit(1)
})
