#!/usr/bin/env python3
"""
Apply database schema directly via Supabase REST API
"""

import os
import sys
import requests

# Get credentials
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://wlzhczcvrjfxcspzasoz.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_KEY:
    print("❌ Error: SUPABASE_KEY not found")
    sys.exit(1)

# Read schema
with open('/home/ubuntu/mnnr-complete2025/deploy-database.sql', 'r') as f:
    schema_sql = f.read()

print("=" * 60)
print("🚀 APPLYING DATABASE SCHEMA VIA API")
print("=" * 60)
print(f"Project URL: {SUPABASE_URL}")
print(f"Schema size: {len(schema_sql)} characters")
print()

# Try to execute via REST API
# Note: Supabase REST API doesn't support direct SQL execution
# We need to use the management API or PostgREST

print("⚠️  Direct SQL execution via REST API is not supported.")
print("The schema must be applied via:")
print("1. Supabase Dashboard SQL Editor")
print("2. Supabase CLI: supabase db push")
print("3. Direct PostgreSQL connection")
print()

# Let's try using psql if available
print("Attempting to apply schema via psql...")
print()

# Extract project ID
project_id = SUPABASE_URL.replace('https://', '').split('.')[0]

# Construct database URL
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
db_password = os.getenv('SUPABASE_DB_PASSWORD', '')

if db_password:
    db_url = f"postgresql://postgres:{db_password}@db.{project_id}.supabase.co:5432/postgres"
    
    # Try to apply schema
    import subprocess
    try:
        result = subprocess.run(
            ['psql', db_url, '-f', '/home/ubuntu/mnnr-complete2025/deploy-database.sql'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("✅ Schema applied successfully!")
            print(result.stdout)
        else:
            print("❌ Error applying schema:")
            print(result.stderr)
    except FileNotFoundError:
        print("❌ psql not installed")
    except Exception as e:
        print(f"❌ Error: {e}")
else:
    print("❌ SUPABASE_DB_PASSWORD not set")
    print()
    print("To apply schema, you need to:")
    print("1. Get your database password from Supabase Dashboard")
    print("2. Go to: https://app.supabase.com/project/wlzhczcvrjfxcspzasoz/settings/database")
    print("3. Copy the password")
    print("4. Apply schema via SQL Editor")

print()
print("=" * 60)
print("RECOMMENDATION: Use Supabase Dashboard")
print("=" * 60)
print()
print("1. Go to: https://app.supabase.com/project/wlzhczcvrjfxcspzasoz/sql/new")
print("2. Copy contents of: deploy-database.sql")
print("3. Paste and click 'Run'")
print()
