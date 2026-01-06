-- Migration for creating diet_plans table
-- Run this in your database to create the table

CREATE TABLE IF NOT EXISTS diet_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  plan_name VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  profile_data JSONB,
  nutrition_targets JSONB,
  daily_schedule JSONB,
  late_night_options JSONB,
  important_points JSONB,
  portion_size_reference JSONB,
  goals JSONB,
  is_active BOOLEAN DEFAULT true,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_current ON diet_plans(user_id, is_current) WHERE is_current = true;

