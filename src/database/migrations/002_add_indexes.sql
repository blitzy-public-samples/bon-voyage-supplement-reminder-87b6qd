-- Migration: 002_add_indexes
-- Description: Add additional indexes to optimize query performance for the supplement reminder application
-- Author: AI Lead Developer
-- Date: 2023-06-15

-- Function to apply the migration
CREATE OR REPLACE FUNCTION public.apply_002_add_indexes()
RETURNS void AS $$
BEGIN
    -- Create composite index on user_id and scheduled_time columns in the reminders table
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_reminder_user_scheduled'
    ) THEN
        CREATE INDEX idx_reminder_user_scheduled ON public.reminders(user_id, scheduled_time);
        RAISE NOTICE 'Created index: idx_reminder_user_scheduled';
    ELSE
        RAISE NOTICE 'Index idx_reminder_user_scheduled already exists, skipping creation';
    END IF;

    -- Create composite index on user_id, event_type, and created_at columns in the analytics_events table
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_analytics_user_event_time'
    ) THEN
        CREATE INDEX idx_analytics_user_event_time ON public.analytics_events(user_id, event_type, created_at);
        RAISE NOTICE 'Created index: idx_analytics_user_event_time';
    ELSE
        RAISE NOTICE 'Index idx_analytics_user_event_time already exists, skipping creation';
    END IF;

    -- Create index on the created_at column in the users table
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_user_created_at'
    ) THEN
        CREATE INDEX idx_user_created_at ON public.users(created_at);
        RAISE NOTICE 'Created index: idx_user_created_at';
    ELSE
        RAISE NOTICE 'Index idx_user_created_at already exists, skipping creation';
    END IF;

    -- Log the migration execution
    INSERT INTO public.schema_migrations (version, executed_at)
    VALUES ('002_add_indexes', CURRENT_TIMESTAMP);

    RAISE NOTICE 'Migration 002_add_indexes completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to revert the migration
CREATE OR REPLACE FUNCTION public.revert_002_add_indexes()
RETURNS void AS $$
BEGIN
    -- Drop the created indexes if they exist
    DROP INDEX IF EXISTS public.idx_reminder_user_scheduled;
    DROP INDEX IF EXISTS public.idx_analytics_user_event_time;
    DROP INDEX IF EXISTS public.idx_user_created_at;

    -- Remove the migration record
    DELETE FROM public.schema_migrations
    WHERE version = '002_add_indexes';

    RAISE NOTICE 'Migration 002_add_indexes has been reverted';
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
DO $$
BEGIN
    -- Check if the migration has already been applied
    IF NOT EXISTS (
        SELECT 1 FROM public.schema_migrations
        WHERE version = '002_add_indexes'
    ) THEN
        -- Apply the migration
        PERFORM public.apply_002_add_indexes();
    ELSE
        RAISE NOTICE 'Migration 002_add_indexes has already been applied, skipping execution';
    END IF;
END $$;

-- Uncomment the following block to revert the migration if needed:
/*
DO $$
BEGIN
    -- Check if the migration exists before reverting
    IF EXISTS (
        SELECT 1 FROM public.schema_migrations
        WHERE version = '002_add_indexes'
    ) THEN
        -- Revert the migration
        PERFORM public.revert_002_add_indexes();
    ELSE
        RAISE NOTICE 'Migration 002_add_indexes does not exist, skipping reversion';
    END IF;
END $$;
*/

-- Migration requirements addressed:
-- 1. Database Indexing (APPENDICES/A. ADDITIONAL TECHNICAL INFORMATION/A.4 Database Indexing)
-- 2. Performance Optimization (2. TECHNICAL REQUIREMENTS/2.8 Performance Optimization)

-- Notes:
-- 1. This migration script adds three new indexes to improve query performance.
-- 2. The script includes both apply and revert functions for better migration management.
-- 3. Execution is idempotent, checking for existing indexes and migration records before applying changes.
-- 4. Error handling and logging have been improved for better traceability.
-- 5. The script assumes the existence of a 'schema_migrations' table to track applied migrations.
-- 6. Always test this migration in a staging environment before applying to production.
-- 7. Monitor query performance and index usage after applying this migration to ensure desired improvements.