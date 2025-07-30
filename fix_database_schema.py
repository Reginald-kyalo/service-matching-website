#!/usr/bin/env python3
"""
Fix database schema to ensure all Kenyan location fields are present
"""

import sqlite3
import os

def fix_database_schema():
    """
    Add missing Kenyan location columns to the users table if they don't exist
    """
    
    # Database file path
    db_path = 'service_matching.db'
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} does not exist!")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get current table schema
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        existing_columns = [col[1] for col in columns]
        
        print("Current users table columns:")
        for col in existing_columns:
            print(f"  - {col}")
        
        # Define required Kenyan location columns
        required_columns = {
            'county': 'TEXT',
            'sub_county': 'TEXT', 
            'ward': 'TEXT',
            'postal_code': 'TEXT',
            'landmark': 'TEXT',
            'full_address': 'TEXT',
            'latitude': 'REAL',
            'longitude': 'REAL',
            'city': 'TEXT',  # Legacy compatibility
            'state': 'TEXT',  # Legacy compatibility  
            'zip_code': 'TEXT'  # Legacy compatibility
        }
        
        # Add missing columns
        added_columns = []
        for column_name, column_type in required_columns.items():
            if column_name not in existing_columns:
                try:
                    alter_sql = f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"
                    cursor.execute(alter_sql)
                    added_columns.append(column_name)
                    print(f"✓ Added column: {column_name} ({column_type})")
                except sqlite3.Error as e:
                    print(f"✗ Failed to add column {column_name}: {e}")
            else:
                print(f"✓ Column {column_name} already exists")
        
        # Commit changes
        conn.commit()
        
        if added_columns:
            print(f"\nSuccessfully added {len(added_columns)} new columns to users table")
        else:
            print("\nAll required columns already exist in users table")
        
        # Verify final schema
        cursor.execute("PRAGMA table_info(users)")
        final_columns = cursor.fetchall()
        print(f"\nFinal users table schema ({len(final_columns)} columns):")
        for col in final_columns:
            print(f"  {col[1]} {col[2]}")
            
        # Also check service_providers table
        print("\n" + "="*50)
        print("Checking service_providers table...")
        
        cursor.execute("PRAGMA table_info(service_providers)")
        sp_columns = cursor.fetchall()
        sp_existing_columns = [col[1] for col in sp_columns]
        
        print("Current service_providers table columns:")
        for col in sp_existing_columns:
            print(f"  - {col}")
        
        # Add missing columns to service_providers table
        sp_added_columns = []
        for column_name, column_type in required_columns.items():
            if column_name not in sp_existing_columns:
                try:
                    alter_sql = f"ALTER TABLE service_providers ADD COLUMN {column_name} {column_type}"
                    cursor.execute(alter_sql)
                    sp_added_columns.append(column_name)
                    print(f"✓ Added column to service_providers: {column_name} ({column_type})")
                except sqlite3.Error as e:
                    print(f"✗ Failed to add column {column_name} to service_providers: {e}")
            else:
                print(f"✓ Column {column_name} already exists in service_providers")
        
        # Commit changes
        conn.commit()
        
        if sp_added_columns:
            print(f"\nSuccessfully added {len(sp_added_columns)} new columns to service_providers table")
        else:
            print("\nAll required columns already exist in service_providers table")
            
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_database_schema()
