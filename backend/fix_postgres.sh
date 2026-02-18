#!/bin/bash

# Configuration
PG_DATA="/Library/PostgreSQL/18/data"
PG_HBA="$PG_DATA/pg_hba.conf"
PG_SERVICE="/Library/LaunchDaemons/postgresql-18.plist"
NEW_PASSWORD="password"

echo "Starting PostgreSQL Password Reset Automation..."

# 1. Backup pg_hba.conf
echo "Step 1: Backing up pg_hba.conf..."
cp "$PG_HBA" "$PG_HBA.bak"

# 2. Modify pg_hba.conf to TRUST (allow passwordless local login)
echo "Step 2: Temporarily enabling trust authentication..."
# Replace md5 or scram-sha-256 with trust for 127.0.0.1
sed -i '' -E 's/(host[[:space:]]+all[[:space:]]+all[[:space:]]+127\.0\.0\.1\/32[[:space:]]+)(md5|scram-sha-256)/\1trust/' "$PG_HBA"
# Also do IPv6 if it exists
sed -i '' -E 's/(host[[:space:]]+all[[:space:]]+all[[:space:]]+::1\/128[[:space:]]+)(md5|scram-sha-256)/\1trust/' "$PG_HBA"

# 3. Restart PostgreSQL
echo "Step 3: Restarting PostgreSQL to apply changes..."
launchctl unload "$PG_SERVICE"
sleep 2
launchctl load "$PG_SERVICE"
echo "Waiting 5 seconds for service to start..."
sleep 5

# 4. Reset Password
echo "Step 4: Resetting 'postgres' user password to '$NEW_PASSWORD'..."
/Library/PostgreSQL/18/bin/psql -U postgres -c "ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';"

if [ $? -eq 0 ]; then
    echo "✅ Password reset successful!"
else
    echo "❌ Failed to reset password. Check logs."
    # Restore and exit
    cp "$PG_HBA.bak" "$PG_HBA"
    exit 1
fi

# 5. Create Database
echo "Step 5: Creating database 'swapkr'..."
/Library/PostgreSQL/18/bin/createdb -U postgres swapkr || echo "Database 'swapkr' might already exist."

# 6. Restore Security
echo "Step 6: Restoring original authentication security..."
cp "$PG_HBA.bak" "$PG_HBA"

# 7. Restart PostgreSQL again
echo "Step 7: Restarting PostgreSQL to re-enable security..."
launchctl unload "$PG_SERVICE"
sleep 2
launchctl load "$PG_SERVICE"
sleep 2

echo "---------------------------------------------------"
echo "🎉 DONE! PostgreSQL is configured."
echo "Username: postgres"
echo "Password: $NEW_PASSWORD"
echo "Database: swapkr"
echo "---------------------------------------------------"
