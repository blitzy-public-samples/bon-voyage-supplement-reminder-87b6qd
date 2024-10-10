-- This seed file populates the database with initial test data for development and testing purposes.
-- The data includes sample users, reminders, and analytics events.
-- Ensure that the database schema is up to date before running this seed file.
-- The phone numbers used are dummy numbers and should be replaced with valid ones in a production environment.
-- The timezone data should be validated against the IANA Time Zone Database.
-- Analytics event types and data structures should match those defined in the analytics model.
-- This seed data is not meant for production use and should only be used in development and testing environments.

-- Function to populate the database with test data
CREATE OR REPLACE FUNCTION seed_database() RETURNS void AS $$
DECLARE
    user_id_1 INTEGER;
    user_id_2 INTEGER;
    user_id_3 INTEGER;
    user_id_4 INTEGER;
    user_id_5 INTEGER;
BEGIN
    -- Begin transaction
    BEGIN
        -- Execute INSERT statements for users table
        INSERT INTO users (phone_number, timezone, created_at, updated_at)
        VALUES
            ('+11234567890', 'America/New_York', NOW(), NOW()),
            ('+12345678901', 'America/Los_Angeles', NOW(), NOW()),
            ('+13456789012', 'Europe/London', NOW(), NOW()),
            ('+14567890123', 'Asia/Tokyo', NOW(), NOW()),
            ('+15678901234', 'Australia/Sydney', NOW(), NOW())
        RETURNING id INTO user_id_1, user_id_2, user_id_3, user_id_4, user_id_5;

        -- Execute INSERT statements for reminders table
        INSERT INTO reminders (user_id, scheduled_time, status, created_at, updated_at)
        VALUES
            (user_id_1, '08:00:00', 'pending', NOW(), NOW()),
            (user_id_1, '20:00:00', 'pending', NOW(), NOW()),
            (user_id_2, '09:00:00', 'pending', NOW(), NOW()),
            (user_id_3, '10:00:00', 'pending', NOW(), NOW()),
            (user_id_4, '07:00:00', 'pending', NOW(), NOW()),
            (user_id_5, '22:00:00', 'pending', NOW(), NOW());

        -- Execute INSERT statements for analytics_events table
        INSERT INTO analytics_events (user_id, event_type, event_data, created_at)
        VALUES
            (user_id_1, 'registration', '{"source": "qr_code"}', NOW()),
            (user_id_2, 'reminder_set', '{"time": "09:00:00"}', NOW()),
            (user_id_3, 'reminder_sent', '{"status": "success"}', NOW()),
            (user_id_4, 'reminder_modified', '{"old_time": "08:00:00", "new_time": "07:00:00"}', NOW()),
            (user_id_5, 'unsubscribe', '{"reason": "no_longer_needed"}', NOW());

        -- Commit transaction if all inserts are successful
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback transaction if any error occurs
            ROLLBACK;
            RAISE EXCEPTION 'Error seeding database: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to remove all test data from the database
CREATE OR REPLACE FUNCTION clear_test_data() RETURNS void AS $$
BEGIN
    -- Begin transaction
    BEGIN
        -- Disable triggers to avoid foreign key conflicts
        ALTER TABLE analytics_events DISABLE TRIGGER ALL;
        ALTER TABLE reminders DISABLE TRIGGER ALL;
        ALTER TABLE users DISABLE TRIGGER ALL;

        -- DELETE FROM analytics_events
        DELETE FROM analytics_events;
        -- DELETE FROM reminders
        DELETE FROM reminders;
        -- DELETE FROM users
        DELETE FROM users;

        -- Re-enable triggers
        ALTER TABLE analytics_events ENABLE TRIGGER ALL;
        ALTER TABLE reminders ENABLE TRIGGER ALL;
        ALTER TABLE users ENABLE TRIGGER ALL;

        -- Commit transaction if all deletes are successful
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback transaction if any error occurs
            ROLLBACK;
            RAISE EXCEPTION 'Error clearing test data: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- Seed the database with test data
SELECT seed_database();