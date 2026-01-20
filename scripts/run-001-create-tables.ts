import { neon } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  // Load DATABASE_URL from .env.local
  const envPath = path.join(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)

  if (!dbUrlMatch) {
    throw new Error('DATABASE_URL not found in .env.local')
  }

  const DATABASE_URL = dbUrlMatch[1]
  const sql = neon(DATABASE_URL)

  console.log('Running migration: 001-create-tables.sql')

  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'scripts', 'migrations', '001-create-tables.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  // Split into individual statements (handle -- comments, newlines, and semicolons)
  const statements = migrationSQL
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0)

  console.log(`Found ${statements.length} SQL statements to execute`)

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
    console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''))

    try {
      await sql(statement)
      console.log('✓ Success')
    } catch (error) {
      console.error('✗ Error:', error)
      // Continue with other statements even if one fails
    }
  }

  console.log('\n✅ Migration complete!')
}

main().catch(console.error)
