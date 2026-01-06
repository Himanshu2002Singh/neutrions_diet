-- Migration: Create daily_meal_activities table
-- This SQL creates the daily_meal_activities table for tracking user meal consumption

CREATE TABLE IF NOT EXISTS daily_meal_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  meal_type VARCHAR(50) NOT NULL COMMENT 'e.g., breakfast, mid-morning, lunch, pre-workout, evening-snacks, dinner, bedtime',
  selected_items TEXT COMMENT 'JSON array of selected food items',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  INDEX idx_user_id (user_id),
  INDEX idx_date (date),
  INDEX idx_user_date (user_id, date),
  INDEX idx_user_date_meal (user_id, date, meal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

