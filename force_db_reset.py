#!/usr/bin/env python3
"""
Force Database Reset Script
This script completely resets the database and forces SQLAlchemy to refresh its metadata.
"""

import os
import sqlite3
from sqlalchemy import create_engine, text
from app.database.database import engine, Base
from app.models.user import User
from app.models.service_provider import ServiceProvider

def force_reset_database():
    print("🔄 Starting FORCE database reset...")
    
    # Step 1: Close all SQLAlchemy connections
    print("1. Closing all SQLAlchemy connections...")
    engine.dispose()
    
    # Step 2: Delete the database file completely
    db_file = 'service_matching.db'
    if os.path.exists(db_file):
        print(f"2. Deleting existing database file: {db_file}")
        os.remove(db_file)
    else:
        print("2. No existing database file found")
    
    # Step 3: Create new engine with fresh connection
    print("3. Creating new SQLAlchemy engine...")
    new_engine = create_engine("sqlite:///./service_matching.db", echo=True)
    
    # Step 4: Create all tables with new schema
    print("4. Creating all tables with new schema...")
    Base.metadata.create_all(bind=new_engine)
    
    # Step 5: Verify the schema with direct SQLite connection
    print("5. Verifying schema with direct SQLite...")
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    cursor.execute('PRAGMA table_info(users)')
    columns = cursor.fetchall()
    print('\n📊 Users table schema:')
    for col in columns:
        print(f'   {col[1]} {col[2]}')
    
    # Step 6: Insert a test user with Kenyan location fields
    print("\n6. Inserting test user with Kenyan fields...")
    test_user_sql = """
    INSERT INTO users (
        email, password_hash, name, phone, user_type, address, 
        county, sub_county, ward, postal_code, landmark, 
        full_address, latitude, longitude, 
        city, state, zip_code, is_active, 
        created_at, updated_at
    ) VALUES (
        'test.reset@example.com', 
        'hashed_password_123', 
        'Test Reset User', 
        '+254700000000', 
        'client', 
        'Test Estate', 
        'Nairobi', 
        'Westlands', 
        'Parklands/Highridge', 
        '00100', 
        'Near ABC Place', 
        'Test Estate, Nairobi, Kenya', 
        -1.2921, 
        36.8219, 
        'Nairobi', 
        'Westlands', 
        '00100', 
        1, 
        datetime('now'), 
        datetime('now')
    )
    """
    
    cursor.execute(test_user_sql)
    conn.commit()
    
    # Step 7: Verify the test user
    cursor.execute('SELECT id, email, county, sub_county, ward FROM users WHERE email = ?', 
                   ('test.reset@example.com',))
    test_user = cursor.fetchone()
    if test_user:
        print(f"✅ Test user created successfully:")
        print(f"   ID: {test_user[0]}, Email: {test_user[1]}")
        print(f"   County: {test_user[2]}, Sub-County: {test_user[3]}, Ward: {test_user[4]}")
    else:
        print("❌ Failed to create test user")
    
    conn.close()
    new_engine.dispose()
    
    print("\n🎉 Database reset completed successfully!")
    print("🔥 Please restart the FastAPI server to pick up the new database!")
    
    return True

if __name__ == "__main__":
    force_reset_database()
