#!/usr/bin/env python3
"""
Test script to verify plumber providers appear in search results
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_plumber_matching():
    """Test that plumber providers are found in search results"""
    
    print("🔍 Testing plumber provider matching...")
    
    # Step 1: Register/login as a test user
    print("\n1. Registering test user...")
    user_data = {
        "name": "Test User",
        "email": "testuser@example.com", 
        "password": "testpass123",
        "city": "Springfield",
        "state": "IL"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/users/register", json=user_data)
        if response.status_code == 200:
            result = response.json()
            auth_token = result["access_token"]
            user = result["user"]
            print(f"✅ User registered: {user['name']}")
        else:
            # User might already exist, try login
            login_data = {"email": user_data["email"], "password": user_data["password"]}
            response = requests.post(f"{BASE_URL}/api/users/login", json=login_data)
            if response.status_code == 200:
                result = response.json()
                auth_token = result["access_token"]
                user = result["user"]
                print(f"✅ User logged in: {user['name']}")
            else:
                print(f"❌ User registration/login failed: {response.text}")
                return False
    except Exception as e:
        print(f"❌ Error with user auth: {e}")
        return False
    
    # Step 2: Search for plumber providers
    print("\n2. Searching for plumber providers...")
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    search_data = {
        "category": "plumbing",
        "max_distance": 50.0,
        "min_rating": 0.0
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/matching/find-providers", json=search_data, headers=headers)
        if response.status_code == 200:
            providers = response.json()
            print(f"✅ Found {len(providers)} plumber providers")
            
            if providers:
                for i, provider in enumerate(providers, 1):
                    print(f"   {i}. {provider['name']} ({provider['business_name']})")
                    print(f"      Phone: {provider['phone']}")
                    print(f"      Location: {provider['address']}")
                    print(f"      Distance: {provider['distance_miles']} miles")
                    print(f"      Rating: {provider['average_rating']} ({provider['total_reviews']} reviews)")
                    print(f"      Rate: ${provider['hourly_rate_min']}-${provider['hourly_rate_max']}/hr")
                    print()
                return True
            else:
                print("❌ No plumber providers found - this is the issue!")
                return False
        else:
            print(f"❌ Provider search failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error searching providers: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Plumber Provider Matching Test")
    print("=" * 50)
    
    success = test_plumber_matching()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Test PASSED - Plumber providers are showing up!")
    else:
        print("❌ Test FAILED - Plumber providers are NOT showing up!")
        print("\nThis could be due to:")
        print("- No plumber providers registered in the database")
        print("- Database field mismatch (categories vs selected_categories)")
        print("- Missing required fields (city, state, availability)")
        print("- Provider status not set to active")
