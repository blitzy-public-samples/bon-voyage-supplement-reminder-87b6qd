-- 001_initial_schema.sql
-- Initial database migration script to create the necessary tables and indexes for the supplement reminder application
-- This migration addresses the following requirements:
-- 1. Data Storage and Management (2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management)
-- 2. Database Indexing (APPENDICES/A. ADDITIONAL TECHNICAL INFORMATION/A.4 Database Indexing)

-- Set the appropriate schema
SET search_path TO public;

-- Function to apply the migration
CREATE OR REPLACE FUNCTION apply_migration_001() RETURNS void AS $$
BEGIN
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        timezone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Create reminders table
    CREATE TABLE IF NOT EXISTS reminders (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scheduled_time TIME NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Create analytics_events table
    CREATE TABLE IF NOT EXISTS analytics_events (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for optimizing query performance
    CREATE INDEX IF NOT EXISTS idx_user_phone_number ON users(phone_number);
    CREATE INDEX IF NOT EXISTS idx_user_timezone ON users(timezone);
    CREATE INDEX IF NOT EXISTS idx_reminder_scheduled_time ON reminders(scheduled_time);
    CREATE INDEX IF NOT EXISTS idx_reminder_user_id ON reminders(user_id);
    CREATE INDEX IF NOT EXISTS idx_reminder_status ON reminders(status);
    CREATE INDEX IF NOT EXISTS idx_analytics_event_time ON analytics_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);

    -- Create a GIN index for the JSONB event_data column
    CREATE INDEX IF NOT EXISTS idx_analytics_event_data ON analytics_events USING GIN (event_data);

    -- Add triggers for updating the 'updated_at' column
    CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_users_modtime
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();

    CREATE TRIGGER update_reminders_modtime
        BEFORE UPDATE ON reminders
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
END;
$$ LANGUAGE plpgsql;

-- Function to revert the migration
CREATE OR REPLACE FUNCTION revert_migration_001() RETURNS void AS $$
BEGIN
    -- Drop triggers
    DROP TRIGGER IF EXISTS update_users_modtime ON users;
    DROP TRIGGER IF EXISTS update_reminders_modtime ON reminders;
    DROP FUNCTION IF EXISTS update_modified_column();

    -- Drop all created indexes
    DROP INDEX IF EXISTS idx_user_phone_number;
    DROP INDEX IF EXISTS idx_user_timezone;
    DROP INDEX IF EXISTS idx_reminder_scheduled_time;
    DROP INDEX IF EXISTS idx_reminder_user_id;
    DROP INDEX IF EXISTS idx_reminder_status;
    DROP INDEX IF EXISTS idx_analytics_event_time;
    DROP INDEX IF EXISTS idx_analytics_user_id;
    DROP INDEX IF EXISTS idx_analytics_event_type;
    DROP INDEX IF EXISTS idx_analytics_event_data;

    -- Drop tables
    DROP TABLE IF EXISTS analytics_events;
    DROP TABLE IF EXISTS reminders;
    DROP TABLE IF EXISTS users;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
SELECT apply_migration_001();

-- To revert the migration, uncomment the following line:
-- SELECT revert_migration_001();

-- Comments:
-- This migration file creates the initial database schema for the supplement reminder application.
-- It includes tables for users, reminders, and analytics events, along with necessary indexes for query optimization.
-- The schema is designed to support the core functionalities of user management, reminder scheduling, and basic analytics tracking.
-- Indexes are created to improve query performance on frequently accessed columns.
-- A GIN index is added for the JSONB event_data column in the analytics_events table for efficient querying of JSON data.
-- Triggers are added to automatically update the 'updated_at' column when rows are modified.
-- This migration should be run once to set up the initial database structure.
-- The migration can be reverted by calling the revert_migration_001() function if needed.

-- Additional notes:
-- 1. BIGSERIAL and BIGINT are used for id columns to support a larger range of values.
-- 2. TIMESTAMP WITH TIME ZONE is used to ensure proper timezone handling.
-- 3. ON DELETE CASCADE is added to the reminders table to automatically delete associated reminders when a user is deleted.
-- 4. ON DELETE SET NULL is added to the analytics_events table to preserve analytics data even if a user is deleted.
-- 5. A CHECK constraint is added to the reminders table to ensure valid status values.
-- 6. The schema is set to 'public' explicitly for clarity, though it's the default in PostgreSQL.