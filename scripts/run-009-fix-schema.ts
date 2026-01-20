import { neon } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const envPath = path.join(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)

  if (!dbUrlMatch) {
    throw new Error('DATABASE_URL not found in .env.local')
  }

  const DATABASE_URL = dbUrlMatch[1]
  const sql = neon(DATABASE_URL)

  console.log('Running migration: 009-fix-brand-schema-mismatch.sql')

  const migrationPath = path.join(process.cwd(), 'scripts', 'migrations', '009-fix-brand-schema-mismatch.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  // Split SQL by semicolons, handling comments
  const statements = migrationSQL
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0)

  console.log(`Found ${statements.length} SQL statements\n`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`Executing statement ${i + 1}/${statements.length}...`)
    console.log(statement.substring(0, 80) + (statement.length > 80 ? '...' : ''))

    try {
      await sql(statement)
      console.log('✓ Success\n')
    } catch (error) {
      console.error('✗ Error:', error)
      console.log()
    }
  }

  console.log('✅ Migration complete!')
}

main().catch(console.error)
