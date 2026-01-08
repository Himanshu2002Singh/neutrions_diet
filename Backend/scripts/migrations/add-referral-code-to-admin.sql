-- Migration: Add referral_code column to admin table
-- Run this to add referral tracking for doctors

-- Add referral_code column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin' AND column_name = 'referral_code'
    ) THEN
        ALTER TABLE admin ADD COLUMN referral_code VARCHAR(50) UNIQUE;
    END IF;
END $$;

-- Update existing doctors with a referral code if they don't have one
UPDATE admin 
SET referral_code = 'DR-' || UPPER(SUBSTRING(firstName, 1, 3)) || '-' || id::TEXT
WHERE role = 'member' AND category IS NOT NULL AND referral_code IS NULL;

