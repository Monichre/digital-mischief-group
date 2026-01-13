-- Add geolocation columns to user table for location-based features
-- This enables personalized, location-relevant data and experiences

-- Add geolocation fields to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS geolocation_updated_at TIMESTAMPTZ;

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_user_country_code ON "user"(country_code);
CREATE INDEX IF NOT EXISTS idx_user_timezone ON "user"(timezone);

-- Optional: Add a composite index for geographic queries
CREATE INDEX IF NOT EXISTS idx_user_lat_lng ON "user"(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

