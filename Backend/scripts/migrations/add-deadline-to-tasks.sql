-- Add deadline column to tasks table for referral countdown timer
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline DATETIME NULL AFTER due_date;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS referral_timer_minutes INTEGER DEFAULT 1440 AFTER target_count;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_referral_at DATETIME NULL AFTER referral_timer_minutes;

