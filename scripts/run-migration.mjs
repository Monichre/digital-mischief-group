import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import fs from "fs"
import path from "path"

// Load env
config({ path: ".env.local" })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Add it to .env.local before running migrations.")
  process.exit(1)
}

const sql = neon(DATABASE_URL)
const migrationsDir = path.join(process.cwd(), "scripts", "migrations")

function splitStatements(sqlText) {
  return sqlText
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((stmt) => stmt.trim())
    .filter(Boolean)
}

async function runMigrationFile(fileName, content) {
  const statements = splitStatements(content)
  console.log(`\n📝 ${fileName} (${statements.length} statements)`) // keep logs concise

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    const preview = statement.substring(0, 120).replace(/\s+/g, " ")
    console.log(`   → [${i + 1}/${statements.length}] ${preview}${statement.length > 120 ? "..." : ""}`)
    await sql(statement)
  }
}

async function runMigrations() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((name) => /^\d{3}.*\.sql$/i.test(name))
    .sort()

  if (files.length === 0) {
    console.log("No migration files found in ./scripts")
    return
  }

  console.log("🔄 Running migrations from ./scripts/migrations")
  console.log(`📡 Database: ${DATABASE_URL.split("@")[1]?.split("/")[0] || "unknown"}`)

  try {
    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf8")
      await runMigrationFile(file, content)
    }
    console.log("\n✅ All migrations completed")
  } catch (error) {
    console.error("❌ Migration failed:", error?.message || error)
    process.exit(1)
  }
}

runMigrations()

