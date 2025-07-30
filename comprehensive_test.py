#!/usr/bin/env python3
"""
Comprehensive Test Script
This script tests the user registration flow and investigates any discrepancies
between API responses and database state.
"""

import requests
import sqlite3
import json
import time
from datetime import datetime

def print_header(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def check_database_state(step_name):
    print(f"\n📊 {step_name} - Database State:")
    conn = sqlite3.connect('service_matching.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, email, name, county, sub_county, ward, postal_code FROM users ORDER BY id')
    users = cursor.fetchall()
    
    if users:
        for user in users:
            print(f"  ID: {user[0]} | {user[1]} | {user[2]}")
            print(f"    Location: {user[3]} > {user[4]} > {user[5]} | Postal: {user[6]}")
    else:
        print("  No users found in database")
    
    print(f"  Total users: {len(users)}")
    conn.close()
    return users

def test_user_registration():
    print_header("COMPREHENSIVE USER REGISTRATION TEST")
    
    # Step 1: Check initial database state
    initial_users = check_database_state("STEP 1 - Initial State")
    
    # Step 2: Attempt user registration
    print(f"\n🔄 STEP 2 - Registering New User")
    
    registration_data = {
        "name": "Comprehensive Test User",
        "email": "comprehensive.test@example.com",
        "password": "testpass123",
        "phone": "+254700111222",
        "address": "Kileleshwa Estate",
        "county": "Nairobi",
        "subCounty": "Dagoretti North", 
        "ward": "Kileleshwa",
        "postalCode": "00100",
        "landmark": "Near Westgate Mall",
        "latitude": -1.2634,
        "longitude": 36.8084,
        "fullAddress": "Kileleshwa Estate, Nairobi, Kenya",
        "city": "Nairobi",
        "state": "Dagoretti North",
        "zip_code": "00100"
    }
    
    try:
        print("  Making API request...")
        response = requests.post(
            "http://localhost:8000/api/users/register",
            json=registration_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"  Response status: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print("  ✅ Registration API returned success")
            print(f"  User ID: {response_data['user']['id']}")
            print(f"  Name: {response_data['user']['name']}")
            print(f"  Email: {response_data['user']['email']}")
            print(f"  County: {response_data['user']['county']}")
            print(f"  Sub-County: {response_data['user']['sub_county']}")
            print(f"  Ward: {response_data['user']['ward']}")
            
            # Step 3: Check database immediately after API response
            print(f"\n⏱️  STEP 3 - Database Check (Immediate)")
            time.sleep(1)  # Give database a moment to process
            immediate_users = check_database_state("Immediate Check")
            
            # Step 4: Check database after delay
            print(f"\n⏱️  STEP 4 - Database Check (After 3 seconds)")
            time.sleep(3)
            delayed_users = check_database_state("Delayed Check")
            
            # Step 5: Analysis
            print(f"\n🔍 STEP 5 - Analysis")
            print(f"  Initial users count: {len(initial_users)}")
            print(f"  Immediate check count: {len(immediate_users)}")
            print(f"  Delayed check count: {len(delayed_users)}")
            
            # Look for the specific user
            target_email = "comprehensive.test@example.com"
            
            # Check if user exists in immediate check
            immediate_found = any(user[1] == target_email for user in immediate_users)
            delayed_found = any(user[1] == target_email for user in delayed_users)
            
            print(f"  Target user found immediately: {immediate_found}")
            print(f"  Target user found after delay: {delayed_found}")
            
            if not delayed_found:
                print("  ❌ DISCREPANCY DETECTED: API returned success but user not in database")
                
                # Check server logs
                print(f"\n📋 STEP 6 - Server Log Analysis")
                try:
                    with open('server.log', 'r') as f:
                        logs = f.read()
                    
                    if 'comprehensive.test@example.com' in logs:
                        print("  ✅ User email found in server logs")
                    else:
                        print("  ❌ User email NOT found in server logs")
                        
                    if 'ROLLBACK' in logs:
                        print("  ⚠️  ROLLBACK detected in logs - transaction may have failed")
                    else:
                        print("  ✅ No ROLLBACK detected")
                        
                except Exception as e:
                    print(f"  ❌ Error reading server logs: {e}")
            else:
                print("  ✅ SUCCESS: User correctly stored in database")
        
        else:
            print(f"  ❌ Registration failed with status {response.status_code}")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"  ❌ Registration request failed: {e}")

def test_email_uniqueness():
    print_header("EMAIL UNIQUENESS TEST")
    
    # Try to register with same email again
    duplicate_data = {
        "name": "Duplicate Test User",
        "email": "comprehensive.test@example.com",
        "password": "testpass456",
        "county": "Mombasa",
        "subCounty": "Mvita",
        "ward": "Mji Wa Kale/Makadara"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/users/register",
            json=duplicate_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"  Response status: {response.status_code}")
        if response.status_code == 400:
            print("  ✅ Correctly rejected duplicate email")
        else:
            print("  ❌ Should have rejected duplicate email")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"  ❌ Duplicate test failed: {e}")

if __name__ == "__main__":
    print(f"🚀 Starting comprehensive test at {datetime.now()}")
    
    test_user_registration()
    test_email_uniqueness()
    
    print(f"\n🎯 Final Database State:")
    check_database_state("FINAL")
    
    print(f"\n✅ Comprehensive test completed at {datetime.now()}")
