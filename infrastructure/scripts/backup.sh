#!/bin/bash

# Supplement Reminder Application - Database Backup Script
# This script automates the process of creating database backups and managing backup retention.

# Exit immediately if a command exits with a non-zero status
set -e

# Enable error tracing
set -o errtrace

# Load environment variables
if [ -f "../../src/backend/.env" ]; then
    source ../../src/backend/.env
else
    echo "Error: .env file not found in ../../src/backend/.env"
    exit 1
fi

# Global variables
readonly PROJECT_NAME="supplement-reminder"
readonly ENVIRONMENT="production"
readonly AWS_REGION="us-west-2"
readonly RDS_INSTANCE_IDENTIFIER="supplement-reminder-db"
readonly S3_BACKUP_BUCKET="supplement-reminder-backups"
readonly BACKUP_RETENTION_DAYS=30
readonly LOG_FILE="/var/log/${PROJECT_NAME}_backup.log"

# Function to log messages
log_message() {
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[${timestamp}] $1" | tee -a "$LOG_FILE"
}

# Function to handle errors
handle_error() {
    local error_message="Error on line $1: Command exited with status $2"
    log_message "ERROR: $error_message"
    exit 1
}

# Set up error handling
trap 'handle_error $LINENO $?' ERR

# Function to load environment variables
load_env_vars() {
    log_message "Loading environment variables"
    # Check if required environment variables are set
    local required_vars=("DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_message "Error: Missing required environment variable: $var"
            exit 1
        fi
    done

    # Export variables for use in the script
    export PGHOST="$DB_HOST"
    export PGPORT="$DB_PORT"
    export PGDATABASE="$DB_NAME"
    export PGUSER="$DB_USER"
    export PGPASSWORD="$DB_PASSWORD"
}

# Function to create a database backup
create_database_backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="${PROJECT_NAME}_${ENVIRONMENT}_${timestamp}.sql.gz"

    log_message "Creating database backup: $backup_file"
    if ! pg_dump | gzip > "$backup_file"; then
        log_message "Error: Failed to create database backup."
        return 1
    fi

    log_message "Backup created successfully: $backup_file"
    echo "$backup_file"
}

# Function to upload backup to S3
upload_backup_to_s3() {
    local local_backup_path="$1"
    local s3_path="s3://${S3_BACKUP_BUCKET}/${PROJECT_NAME}/${ENVIRONMENT}/"

    log_message "Uploading backup to S3: ${s3_path}${local_backup_path}"
    if ! aws s3 cp "$local_backup_path" "${s3_path}${local_backup_path}"; then
        log_message "Error: Failed to upload backup to S3."
        return 1
    fi

    log_message "Backup uploaded successfully to S3."
    return 0
}

# Function to clean up old backups
cleanup_old_backups() {
    local s3_path="s3://${S3_BACKUP_BUCKET}/${PROJECT_NAME}/${ENVIRONMENT}/"
    local cutoff_date=$(date -d "${BACKUP_RETENTION_DAYS} days ago" +"%Y-%m-%d")

    log_message "Cleaning up backups older than ${BACKUP_RETENTION_DAYS} days (before ${cutoff_date})"
    aws s3 ls "${s3_path}" | while read -r line; do
        local backup_date=$(echo "$line" | awk '{print $1}')
        local backup_file=$(echo "$line" | awk '{print $4}')
        if [[ "$backup_date" < "$cutoff_date" ]]; then
            log_message "Deleting old backup: ${backup_file}"
            aws s3 rm "${s3_path}${backup_file}"
        fi
    done

    log_message "Cleanup of old backups completed."
}

# Function to verify backup integrity
verify_backup_integrity() {
    local backup_file="$1"
    local temp_db="verify_${PROJECT_NAME}_${RANDOM}"

    log_message "Verifying backup integrity: $backup_file"

    # Create a temporary database
    if ! createdb "$temp_db"; then
        log_message "Error: Failed to create temporary database for verification."
        return 1
    fi

    # Restore the backup to the temporary database
    if ! gunzip -c "$backup_file" | psql -d "$temp_db" > /dev/null; then
        log_message "Error: Failed to restore backup to temporary database."
        dropdb "$temp_db"
        return 1
    fi

    # Perform some basic checks (e.g., count number of tables)
    local table_count=$(psql -d "$temp_db" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    if [ "$table_count" -eq 0 ]; then
        log_message "Error: Backup appears to be empty or corrupt."
        dropdb "$temp_db"
        return 1
    fi

    # Clean up
    dropdb "$temp_db"

    log_message "Backup integrity verified successfully."
    return 0
}

# Main function to orchestrate the backup process
main() {
    log_message "Starting database backup process for ${PROJECT_NAME} (${ENVIRONMENT})"

    # Load environment variables
    load_env_vars

    # Create database backup
    local backup_file=$(create_database_backup)

    # Verify backup integrity
    if ! verify_backup_integrity "$backup_file"; then
        log_message "Error: Backup integrity check failed."
        exit 1
    fi

    # Upload backup to S3
    if upload_backup_to_s3 "$backup_file"; then
        log_message "Backup process completed successfully."
        # Remove local backup file after successful upload
        rm "$backup_file"
    else
        log_message "Error: Backup process failed."
        exit 1
    fi

    # Clean up old backups
    cleanup_old_backups

    log_message "Backup process completed."
    return 0
}

# Run the main function
main

# Exit with the status of the main function
exit $?