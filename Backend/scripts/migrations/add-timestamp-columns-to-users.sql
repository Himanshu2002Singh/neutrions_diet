-- Migration: Add timestamp columns to users table
-- This fixes the "Unknown column 'createdAt' in 'field list'" error
-- Database: MySQL

-- Check if created_at column exists, if not add it
-- We need to check and add columns using ALTER TABLE

-- Add created_at column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

