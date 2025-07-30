#!/usr/bin/env python3
"""
Simple test to check provider matching without auth
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_provider_endpoints():
    """Test provider-related endpoints"""
    
    print("🔍 Testing provider endpoints...")
    
    # First, let's see if we can register a simple user without auth conflicts
    print("\n1. Testing user registration with unique email...")
    import random
    user_email = f"testuser{random.randint(1000,9999)}@example.com"
    
    user_data = {
        "name": "Test User",
        "email": user_email,
        "password": "testpass123",
        "city": "Springfield",
        "state": "IL"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/users/register", json=user_data)
        print(f"Registration response: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            auth_token = result["access_token"]
            print("✅ User registered successfully")
            
            # Test provider search
            print("\n2. Testing provider search...")
            headers = {
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
            
            search_data = {
                "category": "plumbing",
                "max_distance": 50.0,
                "min_rating": 0.0
            }
            
            response = requests.post(f"{BASE_URL}/api/matching/find-providers", json=search_data, headers=headers)
            print(f"Provider search response: {response.status_code}")
            if response.status_code == 200:
                providers = response.json()
                print(f"✅ Found {len(providers)} providers")
                if providers:
                    print("Sample provider:")
                    print(json.dumps(providers[0], indent=2))
                return True
            else:
                print(f"❌ Provider search failed: {response.text}")
                
        else:
            print(f"❌ User registration failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        
    return False

if __name__ == "__main__":
    test_provider_endpoints()
