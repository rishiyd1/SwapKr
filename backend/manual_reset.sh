#!/bin/bash

# Configuration
PG_DATA="/Library/PostgreSQL/18/data"
PG_HBA="$PG_DATA/pg_hba.conf"
PG_SERVICE="/Library/LaunchDaemons/postgresql-18.plist"
NEW_PASSWORD="password"

echo "---------------------------------------------------"
echo "MANUAL POSTGRESQL RESET TOOL"
echo "---------------------------------------------------"
echo "The automatic update failed. We will do this step-by-step."
echo ""

# 1. Edit pg_hba.conf manually
echo "STEP 1: ENABLE TRUST AUTHENTICATION"
echo "I will open nano. You MUST manually change 'scram-sha-256' (or md5) to 'trust' for local connections."
echo ""
echo "LOOK FOR THIS:"
echo "host    all             all             127.0.0.1/32            scram-sha-256"
echo ""
echo "CHANGE TO THIS:"
echo "host    all             all             127.0.0.1/32            trust"
echo "---------------------------------------------------"
read -p "Press Enter to open config file..."
nano "$PG_HBA"

# 2. Restart PostgreSQL
echo ""
echo "STEP 2: RESTARTING POSTGRESQL..."
launchctl unload "$PG_SERVICE"
sleep 2
launchctl load "$PG_SERVICE"
echo "Waiting 5 seconds..."
sleep 5

# 3. Reset Password
echo ""
echo "STEP 3: RESETTING PASSWORD..."
/Library/PostgreSQL/18/bin/psql -U postgres -c "ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';"

if [ $? -eq 0 ]; then
    echo "✅ Password reset SUCCESSFUL!"
    
    # 4. Create Database
    echo ""
    echo "STEP 4: CREATING DATABASE 'swapkr'..."
    /Library/PostgreSQL/18/bin/createdb -U postgres swapkr || echo "Database might already exist."
    
    # 5. Restore pg_hba.conf
    echo ""
    echo "STEP 5: RESTORE SECURITY"
    echo "I will open nano again. CHANGE 'trust' BACK to 'scram-sha-256' (or md5)."
    echo "---------------------------------------------------"
    read -p "Press Enter to open config file..."
    nano "$PG_HBA"
    
    # 6. Final Restart
    echo ""
    echo "STEP 6: FINAL RESTART..."
    launchctl unload "$PG_SERVICE"
    sleep 2
    launchctl load "$PG_SERVICE"
    sleep 2
    
    echo "---------------------------------------------------"
    echo "🎉 DONE! Try 'npm run dev' now."
else
    echo "❌ Password reset FAILED."
    echo "It seems 'trust' mode did not work. Did you save the file?"
    echo "Please try again and ensure you modify the line for 127.0.0.1/32"
    exit 1
fi
