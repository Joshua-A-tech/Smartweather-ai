-- Add missing columns to weather_data table
ALTER TABLE weather_data 
ADD COLUMN IF NOT EXISTS altitude FLOAT,
ADD COLUMN IF NOT EXISTS device_name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS light INTEGER,
ADD COLUMN IF NOT EXISTS rain_percentage INTEGER,
ADD COLUMN IF NOT EXISTS uptime INTEGER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weather_device_time ON weather_data(device_id, created_at DESC);

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'weather_data'
ORDER BY ordinal_position;
