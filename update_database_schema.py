#!/usr/bin/env python3
"""
Database schema update script - recreate tables with new fields
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import engine, Base
from app.models.service_provider import ServiceProvider, Review, ChatMessage
from app.models.user import User

def recreate_database():
    """Recreate database tables with updated schema"""
    print("🔄 Recreating database with updated schema...")
    
    # Drop all tables
    print("🗑️ Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables with new schema
    print("🏗️ Creating tables with updated schema...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database recreated successfully!")
    
    # Verify table structure
    print("\n📋 Verifying ServiceProvider table columns...")
    from sqlalchemy import inspect
    inspector = inspect(engine)
    columns = inspector.get_columns('service_providers')
    
    expected_fields = ['id', 'name', 'business_name', 'email', 'phone', 'categories', 
                      'city', 'state', 'zip_code', 'availability', 'hourly_rate_min', 
                      'hourly_rate_max', 'is_active', 'latitude', 'longitude']
    
    found_fields = [col['name'] for col in columns]
    print(f"Found {len(found_fields)} columns: {', '.join(found_fields)}")
    
    missing_fields = [field for field in expected_fields if field not in found_fields]
    if missing_fields:
        print(f"❌ Missing fields: {', '.join(missing_fields)}")
    else:
        print("✅ All expected fields present!")

if __name__ == "__main__":
    recreate_database()
