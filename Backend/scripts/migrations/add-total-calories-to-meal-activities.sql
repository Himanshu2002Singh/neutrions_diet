-- Migration: Add total_calories column to daily_meal_activities table
-- This SQL adds the total_calories column for tracking meal calorie totals

ALTER TABLE daily_meal_activities
ADD COLUMN IF NOT EXISTS total_calories INT DEFAULT 0 COMMENT 'Total calories for this meal' AFTER notes;

-- Create index for faster queries on total_calories
-- Note: Only create index if it doesn't exist (MySQL syntax varies)
-- This is optional but can help with performance
-- CREATE INDEX idx_total_calories ON daily_meal_activities (total_calories);

