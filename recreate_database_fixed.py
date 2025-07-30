#!/usr/bin/env python3
"""
Script to recreate the database with the correct schema matching the ServiceProvider model.
"""

import sqlite3
import os
from datetime import datetime

def recreate_database():
    """Recreate the database with the correct schema."""
    db_path = 'service_matching.db'
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        print(f"Removing existing database: {db_path}")
        os.remove(db_path)
    
    # Create new database with correct schema
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            user_type TEXT DEFAULT 'client',
            
            -- Location details (Kenyan administrative hierarchy)
            address TEXT,
            county TEXT,
            sub_county TEXT,
            ward TEXT,
            postal_code TEXT,
            landmark TEXT,
            full_address TEXT,
            latitude REAL,
            longitude REAL,
            
            -- Legacy location fields (for backward compatibility)
            city TEXT,
            state TEXT,
            zip_code TEXT,
            
            -- Profile
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create service_providers table with ALL required fields from the model
    cursor.execute('''
        CREATE TABLE service_providers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            business_name TEXT,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            
            -- Location details (Kenya-specific)
            location TEXT,
            county TEXT NOT NULL,
            sub_county TEXT NOT NULL,
            ward TEXT NOT NULL,
            specific_location TEXT,
            service_radius TEXT DEFAULT '20',
            travel_fee REAL,
            landmark TEXT,
            postal_code TEXT,
            service_areas_description TEXT,
            
            -- Map coordinates
            latitude REAL,
            longitude REAL,
            full_address TEXT,
            manual_address TEXT,
            
            -- Legacy location fields
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            primary_location TEXT,
            
            -- Service details
            services TEXT,
            categories TEXT,
            specialties TEXT,
            description TEXT,
            response_time TEXT DEFAULT 'within_week',
            availability TEXT DEFAULT 'same_day',
            
            -- Business details
            hourly_rate_min REAL,
            hourly_rate_max REAL,
            pricing_notes TEXT,
            
            -- Ratings and reviews
            average_rating REAL DEFAULT 0.0,
            total_reviews INTEGER DEFAULT 0,
            
            -- Status and verification
            is_active BOOLEAN DEFAULT TRUE,
            is_verified BOOLEAN DEFAULT FALSE,
            availability_status TEXT DEFAULT 'pending',
            application_status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create reviews table
    cursor.execute('''
        CREATE TABLE reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider_id INTEGER,
            user_id INTEGER,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES service_providers (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create chat_messages table
    cursor.execute('''
        CREATE TABLE chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            sender_type TEXT NOT NULL,
            sender_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create other necessary tables
    cursor.execute('''
        CREATE TABLE user_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            category TEXT NOT NULL,
            description TEXT,
            location TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            budget_min REAL,
            budget_max REAL,
            urgency TEXT DEFAULT 'normal',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            provider_id INTEGER,
            request_id INTEGER,
            match_score REAL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (provider_id) REFERENCES service_providers (id),
            FOREIGN KEY (request_id) REFERENCES user_requests (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            provider_id INTEGER,
            match_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (provider_id) REFERENCES service_providers (id),
            FOREIGN KEY (match_id) REFERENCES matches (id)
        )
    ''')
    
    conn.commit()
    
    # Verify tables were created
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print("Created tables:")
    for table in tables:
        print(f"  {table[0]}")
    
    # Show service_providers schema
    cursor.execute("PRAGMA table_info(service_providers)")
    columns = cursor.fetchall()
    print("\nservice_providers table schema:")
    for col in columns:
        print(f"  {col[1]} {col[2]}")
    
    conn.close()
    print(f"\nDatabase recreated successfully: {db_path}")

if __name__ == "__main__":
    recreate_database()
