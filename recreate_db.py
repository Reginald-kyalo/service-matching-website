#!/usr/bin/env python3
"""
Recreate the database with the correct schema
"""

import os
import sys
from sqlalchemy import create_engine, text
from app.database.database import Base, engine
from app.models.service_provider import ServiceProvider
from app.models.user import User

def recreate_database():
    """Drop and recreate all tables"""
    print("🗄️  Recreating database...")
    
    # Drop all existing tables
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)
    
    # Verify tables were created
    print("Verifying tables...")
    with engine.connect() as conn:
        # Check service_providers table
        result = conn.execute(text("PRAGMA table_info(service_providers)"))
        columns = result.fetchall()
        print(f"service_providers columns: {len(columns)}")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Check users table
        result = conn.execute(text("PRAGMA table_info(users)"))
        columns = result.fetchall()
        print(f"users columns: {len(columns)}")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
    
    print("✅ Database recreated successfully!")

if __name__ == "__main__":
    recreate_database()
