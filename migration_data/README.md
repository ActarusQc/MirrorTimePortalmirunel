# Mirunel Database Migration

This folder contains all the data needed to migrate the Mirunel application to your own hosted database.

## Files Included

1. `backup_replit.sql` - Full PostgreSQL database dump containing:
   - `users` table with user accounts
   - `history_items` table with saved interpretations and AI analyses

2. `hours.json` - English time interpretations data
3. `hours.fr.json` - French time interpretations data  

## Database Schema

### users
- `id` - Integer, auto-incrementing primary key
- `username` - Text, not null
- `password` - Text, not null
- `email` - Text, not null

### history_items
- `id` - Integer, auto-incrementing primary key
- `user_id` - Integer, not null, references users(id)
- `time` - Text, not null (the time in format "HH:MM")
- `type` - Text, not null ("Mirror Hour" or "Reversed Hour")
- `thoughts` - Text, nullable (user's personal thoughts)
- `saved_at` - Timestamp, not null, defaults to now()
- `details` - Text, nullable (JSON string containing all interpretation data)

## Restoring to Your Database

### Using PostgreSQL

1. Create a new PostgreSQL database:
   ```
   createdb your_new_database_name
   ```

2. Restore the database dump:
   ```
   psql your_new_database_name < backup_replit.sql
   ```

### Using Another Database System

If you're using a different database system (MySQL, MongoDB, etc.):

1. For SQL databases (e.g., MySQL):
   - Use a PostgreSQL-to-MySQL conversion tool
   - Or manually create tables with the schema above and import data

2. For NoSQL databases (e.g., MongoDB):
   - Convert the SQL data to JSON documents
   - Import into your collections

## Application Integration

1. Update the `DATABASE_URL` in your application environment to point to your new database
2. If you've changed database types, update the database connection logic in the application:
   - Modify `server/db.ts` to use your new database driver
   - Update `server/storage.ts` to match your new database's access patterns

## Static Data Files

The hour interpretation files (`hours.json` and `hours.fr.json`) should be placed in the `client/src/data/` directory of your application.

## Backup Frequency

Consider implementing regular backups of your database to prevent data loss.