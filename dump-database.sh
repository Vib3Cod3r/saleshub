#!/bin/bash

# Database dump script for Sales CRM
# This script creates a complete database dump and zips it

# Database configuration
DB_NAME="sales_crm"
DB_USER="postgres"
DB_PASSWORD="Miyako2020"
DB_HOST="localhost"
DB_PORT="5432"

# Output files
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="sales_crm_dump_${TIMESTAMP}.sql"
ZIP_FILE="sales_crm_database_${TIMESTAMP}.zip"

echo "Starting database dump..."

# Set password for pg_dump
export PGPASSWORD=$DB_PASSWORD

# Create database dump
echo "Creating database dump..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --verbose --clean --if-exists --create > $DUMP_FILE

if [ $? -eq 0 ]; then
    echo "Database dump created successfully: $DUMP_FILE"
    
    # Create zip file
    echo "Creating zip file..."
    zip $ZIP_FILE $DUMP_FILE
    
    if [ $? -eq 0 ]; then
        echo "Zip file created successfully: $ZIP_FILE"
        echo "File size: $(du -h $ZIP_FILE | cut -f1)"
        
        # Clean up the SQL dump file
        rm $DUMP_FILE
        echo "Cleaned up temporary SQL file"
        
        echo ""
        echo "✅ Database dump completed successfully!"
        echo "📁 Download file: $ZIP_FILE"
        echo "📊 Database: $DB_NAME"
        echo "🕒 Timestamp: $(date)"
    else
        echo "❌ Error creating zip file"
        exit 1
    fi
else
    echo "❌ Error creating database dump"
    exit 1
fi

# Clear password from environment
unset PGPASSWORD
