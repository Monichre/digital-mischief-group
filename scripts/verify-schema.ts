import { neon } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const envPath = path.join(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)

  if (!dbUrlMatch) throw new Error('DATABASE_URL not found')

  const sql = neon(dbUrlMatch[1])

  // Check brand_extractions columns
  const brandCols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'brand_extractions'
    ORDER BY ordinal_position
  `

  console.log('✓ brand_extractions columns:')
  console.log(brandCols.map(r => r.column_name).join(', '))
  console.log()

  // Check usage_events columns
  const usageCols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'usage_events'
    ORDER BY ordinal_position
  `

  console.log('✓ usage_events columns:')
  console.log(usageCols.map(r => r.column_name).join(', '))
}

main().catch(console.error)
