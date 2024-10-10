# Database Module - Supplement Reminder Application

This README provides a comprehensive overview of the database structure, setup instructions, and critical information for developers working with the database module of the supplement reminder application.

## Table of Contents

1. [Database Overview](#database-overview)
2. [Setup Instructions](#setup-instructions)
   - [Local Development Environment](#local-development-environment)
   - [Production Environment](#production-environment)
3. [Schema](#schema)
4. [Migrations](#migrations)
5. [Models](#models)
6. [Queries](#queries)
7. [Security](#security)
8. [Backup and Recovery](#backup-and-recovery)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)
11. [Monitoring and Logging](#monitoring-and-logging)
12. [Compliance and Data Governance](#compliance-and-data-governance)

## Database Overview

The supplement reminder application utilizes a PostgreSQL database to store user information, reminders, and analytics data. PostgreSQL was selected for its reliability, ACID compliance, robust feature set, and excellent performance characteristics, making it ideal for handling the application's data storage and retrieval needs.

## Setup Instructions

### Local Development Environment

1. Install PostgreSQL on your local machine if not already installed.
   ```bash
   # For Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   
   # For macOS using Homebrew
   brew install postgresql
   ```

2. Start the PostgreSQL service:
   ```bash
   # For Ubuntu/Debian
   sudo service postgresql start
   
   # For macOS
   brew services start postgresql
   ```

3. Create a new database for the supplement reminder application:
   ```bash
   createdb -U postgres supplement_reminder
   ```

4. Run the schema creation script:
   ```bash
   psql -U postgres -d supplement_reminder -f src/database/schema.sql
   ```

5. Apply any pending migrations:
   ```bash
   for file in src/database/migrations/*.sql; do
     psql -U postgres -d supplement_reminder -f "$file"
   done
   ```

### Production Environment

1. Provision a PostgreSQL instance on your preferred cloud provider (e.g., AWS RDS, Google Cloud SQL, Azure Database for PostgreSQL).

2. Ensure the database is properly secured with appropriate firewall rules, SSL connections, and encryption at rest.

3. Connect to the production database and run the schema creation script:
   ```bash
   psql -h <production-host> -U <username> -d <dbname> -f src/database/schema.sql
   ```

4. Apply all migrations in order:
   ```bash
   for file in src/database/migrations/*.sql; do
     psql -h <production-host> -U <username> -d <dbname> -f "$file"
   done
   ```

5. Configure the application to use the production database credentials securely (e.g., using environment variables or a secure secret management system).

## Schema

The database schema is defined in the `src/database/schema.sql` file. This file contains the SQL statements to create all necessary tables, indexes, and constraints. Refer to this file for the most up-to-date schema information.

Key tables include:
- `users`: Stores user information (id, username, email, password_hash, created_at, updated_at)
- `reminders`: Contains reminder data linked to users (id, user_id, supplement_name, dosage, frequency, time, created_at, updated_at)
- `analytics_events`: Tracks various events for analytics purposes (id, event_type, user_id, timestamp, metadata)

## Migrations

Database migrations are stored in the `src/database/migrations` directory. Each migration file is named with a timestamp prefix for proper ordering (e.g., `001_add_user_timezone.sql`, `002_create_analytics_table.sql`).

To apply migrations:

1. Navigate to the `src/database/migrations` directory.
2. Run each migration file in chronological order using the `psql` command.

Example:
```bash
psql -U postgres -d supplement_reminder -f 001_add_user_timezone.sql
psql -U postgres -d supplement_reminder -f 002_create_analytics_table.sql
```

**Important:** Always back up your database before running migrations in a production environment.

## Models

The `src/database/models` directory contains the object-relational mapping (ORM) models used to interact with the database tables. These models provide an abstraction layer for database operations.

Key models:
- `User`: Represents a user in the system (src/database/models/user.js)
- `Reminder`: Represents a reminder associated with a user (src/database/models/reminder.js)
- `AnalyticsEvent`: Represents an analytics event (src/database/models/analytics.js)

Refer to the individual model files for detailed information on available methods and properties.

## Queries

The `src/database/queries` directory contains SQL query files for complex or frequently used database operations. These queries are designed to be efficient and optimized for performance.

To use a query:
1. Load the query from the appropriate file in the `queries` directory.
2. Execute the query using your database connection, passing any required parameters.

Example:
```javascript
const fs = require('fs');
const { pool } = require('../connection');

const getUserReminders = async (userId) => {
  const queryFile = path.join(__dirname, 'queries', 'get_user_reminders.sql');
  const query = fs.readFileSync(queryFile, 'utf8');
  const result = await pool.query(query, [userId]);
  return result.rows;
};
```

## Security

The database implements several security measures to protect user data:

1. Encryption: Sensitive data (e.g., phone numbers) are encrypted at rest using AES-256 encryption. The encryption keys are managed securely and rotated regularly.

2. Access Control: Database access is restricted to application service accounts with least privilege principles. Each service account has only the necessary permissions to perform its required operations.

3. Prepared Statements: All queries use prepared statements to prevent SQL injection attacks. This is enforced through the use of parameterized queries in the ORM and query files.

4. Regular Updates: The database server is kept up-to-date with the latest security patches. A process is in place to regularly review and apply security updates.

5. Network Security: The database is placed in a private subnet and is not directly accessible from the public internet. Access is restricted through VPC peering and security groups.

6. Audit Logging: All database actions are logged and monitored for suspicious activities.

## Backup and Recovery

Regular backups of the database are crucial. The following backup strategy is implemented:

1. Daily full backups
2. Hourly incremental backups
3. Transaction log backups every 15 minutes

Backup Process:
```bash
# Example using pg_dump for a full backup
pg_dump -h <host> -U <username> -d supplement_reminder -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# For incremental backups, use WAL archiving
archive_command = 'test ! -f /mnt/server/archivedir/%f && cp %p /mnt/server/archivedir/%f'
```

To restore from a backup:
1. Stop the application to prevent new writes
2. Restore the most recent full backup:
   ```bash
   pg_restore -h <host> -U <username> -d supplement_reminder -c backup_YYYYMMDD_HHMMSS.dump
   ```
3. Apply incremental backups in order
4. Replay transaction logs up to the desired point in time
5. Verify data integrity
6. Restart the application

## Performance Optimization

To maintain optimal database performance:

1. Indexes: Appropriate indexes are created on frequently queried columns. These are defined in the schema.sql file and migration scripts.

2. Query Optimization: Complex queries are analyzed and optimized for performance. Use EXPLAIN ANALYZE to review query execution plans:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'example@email.com';
   ```

3. Connection Pooling: The application uses connection pooling to efficiently manage database connections. This is configured in the `src/database/connection.js` file.

4. Regular VACUUM: Automated VACUUM processes are scheduled to maintain database health:
   ```sql
   ALTER DATABASE supplement_reminder SET autovacuum = on;
   ```

5. Partitioning: Large tables (e.g., analytics_events) are partitioned by date to improve query performance on recent data.

## Troubleshooting

Common issues and solutions:

1. Connection Timeouts:
   - Check network connectivity
   - Verify database credentials
   - Ensure the database server is running and accessible
   - Review connection pool settings

2. Slow Queries:
   - Review query execution plans using EXPLAIN ANALYZE
   - Check for missing indexes
   - Optimize queries or add appropriate indexes
   - Consider query caching for frequently accessed, read-only data

3. Data Inconsistencies:
   - Check application logs for failed transactions
   - Verify data integrity using consistency checks
   - Restore from a backup if necessary
   - Implement and review database constraints

For further assistance, consult the database logs or contact the database administrator.

## Monitoring and Logging

1. Set up monitoring for key database metrics (connections, query performance, disk usage) using tools like Prometheus and Grafana.

2. Configure alerting for critical issues such as high CPU usage, low disk space, or unusual query patterns.

3. Implement comprehensive logging for all database operations, ensuring compliance with data protection regulations.

## Compliance and Data Governance

1. Ensure all data handling processes comply with relevant regulations (e.g., GDPR, CCPA).

2. Implement data retention and deletion policies as per legal requirements.

3. Regularly conduct security audits and penetration testing on the database infrastructure.

4. Maintain documentation of all data flows and access patterns for audit purposes.

---

This README addresses the requirements for database documentation as specified in the Technical Specifications under section 2.4 Data Storage and Management. For any questions or additional information, please contact the development team.