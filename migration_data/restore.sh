#!/bin/bash
# Mirunel Database Migration Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Mirunel Database Migration Tool${NC}"
echo "============================="
echo

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL command-line tools not found.${NC}"
    echo "Please install PostgreSQL client tools first."
    exit 1
fi

# Get database connection info
echo -e "${YELLOW}Enter your target database information:${NC}"
read -p "Database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Database name: " DB_NAME
if [ -z "$DB_NAME" ]; then
    echo -e "${RED}Error: Database name is required${NC}"
    exit 1
fi

read -p "Database user: " DB_USER
if [ -z "$DB_USER" ]; then
    echo -e "${RED}Error: Database user is required${NC}"
    exit 1
fi

read -p "Database password: " DB_PASS
if [ -z "$DB_PASS" ]; then
    echo -e "${RED}Error: Database password is required${NC}"
    exit 1
fi

# Construct PostgreSQL connection string
export PGPASSWORD="$DB_PASS"
CONNECTION="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"

echo
echo -e "${YELLOW}Testing database connection...${NC}"

# Test the connection
if ! psql "$CONNECTION" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Error: Could not connect to the database.${NC}"
    echo "Please check your connection details and try again."
    exit 1
fi

echo -e "${GREEN}Connection successful!${NC}"
echo

# Confirm before proceeding
echo -e "${YELLOW}Ready to restore data to:${NC} $DB_HOST:$DB_PORT/$DB_NAME"
read -p "Proceed with restoration? This will overwrite existing tables! (y/n): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Migration canceled."
    exit 0
fi

echo
echo -e "${YELLOW}Restoring database from backup_replit.sql...${NC}"

# Restore the database
if ! psql "$CONNECTION" < backup_replit.sql > /dev/null; then
    echo -e "${RED}Error: Database restoration failed.${NC}"
    echo "Check the error message above for more details."
    exit 1
fi

echo -e "${GREEN}Database restored successfully!${NC}"
echo
echo -e "${YELLOW}Migration completed!${NC}"
echo
echo -e "Don't forget to update your application's ${YELLOW}DATABASE_URL${NC} environment variable to:"
echo -e "${GREEN}$CONNECTION${NC}"
echo
echo "The hours.json and hours.fr.json files should be placed in your application's client/src/data/ directory."