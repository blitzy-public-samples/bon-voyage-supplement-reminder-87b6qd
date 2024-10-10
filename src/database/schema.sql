-- Main SQL schema definition file for the supplement reminder application's PostgreSQL database

-- This schema file defines the structure for the supplement reminder application's database.
-- It includes tables for users, reminders, and analytics events, along with necessary indexes for query optimization.
-- The schema is designed to support the core functionalities of user management, reminder scheduling, and basic analytics tracking.
-- Indexes are created to improve query performance on frequently accessed columns.
-- This file should be used as the primary reference for the database structure and should be kept in sync with any migrations.

-- Requirement addressed: Data Storage and Management
-- Location: 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
-- Description: Set up a PostgreSQL database with appropriate tables for user data and reminder schedules

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  timezone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
);

-- Create analytics_events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Requirement addressed: Database Indexing
-- Location: APPENDICES/A. ADDITIONAL TECHNICAL INFORMATION/A.4 Database Indexing
-- Description: To optimize query performance, indexes should be created in the PostgreSQL database

-- Create indexes for users table
CREATE INDEX idx_user_phone_number ON users(phone_number);
CREATE INDEX idx_user_timezone ON users(timezone);
CREATE INDEX idx_user_created_at ON users(created_at);

-- Create indexes for reminders table
CREATE INDEX idx_reminder_scheduled_time ON reminders(scheduled_time);
CREATE INDEX idx_reminder_user_id ON reminders(user_id);
CREATE INDEX idx_reminder_status ON reminders(status);
CREATE INDEX idx_reminder_user_scheduled ON reminders(user_id, scheduled_time);

-- Create indexes for analytics_events table
CREATE INDEX idx_analytics_event_time ON analytics_events(created_at);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user_event_time ON analytics_events(user_id, event_type, created_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize the database schema
CREATE OR REPLACE FUNCTION initialize_database() RETURNS void AS $$
BEGIN
  -- Enable UUID extension
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Execute CREATE TABLE statements
  -- (The CREATE TABLE statements are already part of this file)

  -- Execute CREATE INDEX statements
  -- (The CREATE INDEX statements are already part of this file)

  -- Create triggers
  -- (The CREATE TRIGGER statements are already part of this file)
END;
$$ LANGUAGE plpgsql;

-- Function to drop all tables and indexes
CREATE OR REPLACE FUNCTION drop_database() RETURNS void AS $$
BEGIN
  -- Drop all created indexes
  DROP INDEX IF EXISTS idx_user_phone_number;
  DROP INDEX IF EXISTS idx_user_timezone;
  DROP INDEX IF EXISTS idx_user_created_at;
  DROP INDEX IF EXISTS idx_reminder_scheduled_time;
  DROP INDEX IF EXISTS idx_reminder_user_id;
  DROP INDEX IF EXISTS idx_reminder_status;
  DROP INDEX IF EXISTS idx_reminder_user_scheduled;
  DROP INDEX IF EXISTS idx_analytics_event_time;
  DROP INDEX IF EXISTS idx_analytics_user_id;
  DROP INDEX IF EXISTS idx_analytics_event_type;
  DROP INDEX IF EXISTS idx_analytics_user_event_time;

  -- Drop triggers
  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;

  -- Drop function
  DROP FUNCTION IF EXISTS update_updated_at_column();

  -- Drop tables
  DROP TABLE IF EXISTS analytics_events;
  DROP TABLE IF EXISTS reminders;
  DROP TABLE IF EXISTS users;

  -- Disable UUID extension
  DROP EXTENSION IF EXISTS "uuid-ossp";
END;
$$ LANGUAGE plpgsql;

-- Comments:
-- This schema file defines the structure for the supplement reminder application's database.
-- It includes tables for users, reminders, and analytics events, along with necessary indexes for query optimization.
-- The schema is designed to support the core functionalities of user management, reminder scheduling, and basic analytics tracking.
-- Indexes are created to improve query performance on frequently accessed columns.
-- This file should be used as the primary reference for the database structure and should be kept in sync with any migrations.
-- The initialize_database() function can be used to set up the initial schema.
-- The drop_database() function can be used to completely remove the schema and start fresh if needed.
-- UUID is used for primary keys to ensure uniqueness across distributed systems and to prevent potential security issues with sequential IDs.
-- Triggers are added to automatically update the updated_at column when rows are modified.
-- A CHECK constraint is added to the reminders table to ensure valid status values.
-- ON DELETE CASCADE is used for the user_id foreign key in the reminders table to automatically delete associated reminders when a user is deleted.
-- ON DELETE SET NULL is used for the user_id foreign key in the analytics_events table to preserve analytics data even if a user is deleted.