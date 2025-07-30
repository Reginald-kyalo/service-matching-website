#!/usr/bin/env python3
"""
Test database connection and user creation with Kenyan location fields
"""

import sqlite3
import sys
from datetime import datetime

def test_database_connection():
    """Test direct database connection and query"""
    
    try:
        # Test direct SQLite connection
        conn = sqlite3.connect('service_matching.db')
        cursor = conn.cursor()
        
        # Check if we can query the users table with county column
        cursor.execute("SELECT COUNT(*) FROM users WHERE county IS NOT NULL OR county IS NULL")
        count = cursor.fetchone()[0]
        print(f"✓ Direct SQLite query successful. Found {count} users in database.")
        
        # Test inserting a user with Kenyan location fields
        test_user_data = {
            'email': 'test_kenyan_user@example.com',
            'password_hash': 'test_hash',
            'name': 'Test Kenyan User',
            'phone': '+254700000000',
            'user_type': 'client',
            'address': 'Test Address',
            'county': 'Nairobi',
            'sub_county': 'Westlands',
            'ward': 'Parklands/Highridge',
            'postal_code': '00100',
            'landmark': 'Near Sarit Centre',
            'full_address': 'Parklands Road, Nairobi',
            'latitude': -1.2921,
            'longitude': 36.8219,
            'city': 'Nairobi',  # Legacy field
            'state': 'Westlands',  # Legacy field
            'zip_code': '00100',  # Legacy field
            'is_active': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (test_user_data['email'],))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"✓ Test user already exists with ID: {existing_user[0]}")
            # Update the user
            update_sql = """
            UPDATE users SET 
                county = ?, sub_county = ?, ward = ?, 
                postal_code = ?, landmark = ?, full_address = ?,
                latitude = ?, longitude = ?, city = ?, state = ?, zip_code = ?,
                updated_at = ?
            WHERE email = ?
            """
            cursor.execute(update_sql, (
                test_user_data['county'], test_user_data['sub_county'], test_user_data['ward'],
                test_user_data['postal_code'], test_user_data['landmark'], test_user_data['full_address'],
                test_user_data['latitude'], test_user_data['longitude'], 
                test_user_data['city'], test_user_data['state'], test_user_data['zip_code'],
                test_user_data['updated_at'], test_user_data['email']
            ))
            print("✓ Updated test user with Kenyan location fields")
        else:
            # Insert new user
            insert_sql = """
            INSERT INTO users (
                email, password_hash, name, phone, user_type, address,
                county, sub_county, ward, postal_code, landmark, full_address,
                latitude, longitude, city, state, zip_code, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(insert_sql, (
                test_user_data['email'], test_user_data['password_hash'], test_user_data['name'],
                test_user_data['phone'], test_user_data['user_type'], test_user_data['address'],
                test_user_data['county'], test_user_data['sub_county'], test_user_data['ward'],
                test_user_data['postal_code'], test_user_data['landmark'], test_user_data['full_address'],
                test_user_data['latitude'], test_user_data['longitude'],
                test_user_data['city'], test_user_data['state'], test_user_data['zip_code'],
                test_user_data['is_active'], test_user_data['created_at'], test_user_data['updated_at']
            ))
            print("✓ Inserted new test user with Kenyan location fields")
        
        # Commit changes
        conn.commit()
        
        # Query the user back to verify
        cursor.execute("""
            SELECT id, email, name, county, sub_county, ward, postal_code, landmark, 
                   latitude, longitude, city, state, zip_code
            FROM users WHERE email = ?
        """, (test_user_data['email'],))
        
        user = cursor.fetchone()
        if user:
            print(f"✓ Successfully retrieved test user:")
            print(f"   ID: {user[0]}")
            print(f"   Email: {user[1]}")
            print(f"   Name: {user[2]}")
            print(f"   County: {user[3]}")
            print(f"   Sub-County: {user[4]}")
            print(f"   Ward: {user[5]}")
            print(f"   Postal Code: {user[6]}")
            print(f"   Landmark: {user[7]}")
            print(f"   Coordinates: {user[8]}, {user[9]}")
            print(f"   Legacy - City: {user[10]}, State: {user[11]}, Zip: {user[12]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"✗ Database test failed: {e}")
        return False

def test_sqlalchemy_connection():
    """Test SQLAlchemy connection"""
    
    try:
        # Import SQLAlchemy components
        sys.path.append('/home/reginaldkyalo/codes/service-matching-website')
        from app.database.database import get_db
        from app.models.user import User
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy import create_engine
        
        # Create engine and session
        engine = create_engine("sqlite:///service_matching.db")
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Test session
        db = SessionLocal()
        
        # Try to query users table through SQLAlchemy
        users = db.query(User).limit(5).all()
        print(f"✓ SQLAlchemy query successful. Found {len(users)} users.")
        
        for user in users:
            if hasattr(user, 'county'):
                print(f"   User {user.email}: county={getattr(user, 'county', 'N/A')}")
            else:
                print(f"   User {user.email}: No county attribute found")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"✗ SQLAlchemy test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing database connection and Kenyan location fields...")
    print("=" * 60)
    
    print("\n1. Testing direct SQLite connection:")
    sqlite_success = test_database_connection()
    
    print("\n2. Testing SQLAlchemy connection:")
    sqlalchemy_success = test_sqlalchemy_connection()
    
    print("\n" + "=" * 60)
    if sqlite_success and sqlalchemy_success:
        print("✓ All database tests passed!")
    else:
        print("✗ Some database tests failed!")
        if not sqlite_success:
            print("  - Direct SQLite connection failed")
        if not sqlalchemy_success:
            print("  - SQLAlchemy connection failed")
