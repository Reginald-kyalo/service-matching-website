#!/usr/bin/env python3
"""
Script to initialize the database with the correct schema matching our models.
"""

import sqlite3
import os

def initialize_database():
    """Initialize the database with the correct schema."""
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
            full_name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create service_providers table with all required fields
    cursor.execute('''
        CREATE TABLE service_providers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            business_name TEXT NOT NULL,
            contact_person TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            zip_code TEXT NOT NULL,
            categories TEXT NOT NULL,
            services TEXT,
            description TEXT,
            experience_years INTEGER,
            license_number TEXT,
            insurance_verified BOOLEAN DEFAULT FALSE,
            rating REAL DEFAULT 0.0,
            total_reviews INTEGER DEFAULT 0,
            availability TEXT DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    
    cursor.execute('''
        CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            sender_type TEXT NOT NULL,
            sender_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id)
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
        print(f"  {col[1]} {col[2]} (nullable: {not col[3]})")
    
    conn.close()
    print(f"\nDatabase initialized successfully: {db_path}")

if __name__ == "__main__":
    initialize_database()
