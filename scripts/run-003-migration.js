const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);

  console.log("Adding missing columns...");

  try {
    // Add normalized_url to enrichment_jobs
    await sql`
      ALTER TABLE enrichment_jobs 
      ADD COLUMN IF NOT EXISTS normalized_url TEXT
    `;
    console.log("✓ Added normalized_url to enrichment_jobs");
  } catch (e) {
    if (e.message?.includes("already exists")) {
      console.log("✓ normalized_url already exists");
    } else {
      console.error("Error adding normalized_url:", e.message);
    }
  }

  try {
    // Add status to usage_events
    await sql`
      ALTER TABLE usage_events 
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unknown'
    `;
    console.log("✓ Added status to usage_events");
  } catch (e) {
    if (e.message?.includes("already exists")) {
      console.log("✓ status already exists");
    } else {
      console.error("Error adding status:", e.message);
    }
  }

  console.log("Migration complete!");
}

runMigration().catch(console.error);
