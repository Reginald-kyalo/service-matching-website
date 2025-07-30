#!/usr/bin/env python3
"""
Quick script to login as a test user for testing the provider signup UI
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def login_test_user():
    """Login with existing test user"""
    print("Logging in with test user...")
    
    login_data = {
        "email": "testuser@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"Login response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            user_data = result.get("user")
            token = result.get("access_token")
            
            print(f"✅ Login successful!")
            print(f"User: {user_data.get('name')} ({user_data.get('email')})")
            print(f"User Type: {user_data.get('user_type', 'client')}")
            print(f"Token: {token[:20]}...")
            
            print(f"\n📝 To test in browser:")
            print(f"1. Open browser developer console")
            print(f"2. Run these commands:")
            print(f"   localStorage.setItem('authToken', '{token}');")
            print(f"   localStorage.setItem('currentUser', '{json.dumps(user_data)}');")
            print(f"3. Refresh the provider-signup page")
            
            return True
        else:
            print(f"❌ Login failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return False

if __name__ == "__main__":
    login_test_user()
