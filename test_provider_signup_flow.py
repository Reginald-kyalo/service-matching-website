#!/usr/bin/env python3
"""
Test script to verify the provider signup flow works correctly
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_provider_signup_flow():
    """Test the complete provider signup flow"""
    
    # Step 1: Register a new user (or use existing)
    print("1. Testing with user account...")
    test_email = "testuser@example.com"
    register_data = {
        "name": "Test User", 
        "email": test_email,
        "password": "password123",
        "address": "Test Address",
        "city": "Nairobi",
        "state": "Kenya",
        "zip_code": "00100"
    }
    
    # Try to login first (user might already exist)
    print("2. Logging in the test user...")
    login_data = {
        "email": test_email,
        "password": "password123"
    }
    
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print(f"Login response: {login_response.status_code}")
    
    if login_response.status_code == 200:
        print("User exists, logged in successfully")
        login_result = login_response.json()
        auth_token = login_result.get("access_token")
        user_data = login_result.get("user")
    else:
        # User doesn't exist, try to register
        print("User doesn't exist, registering...")
        register_response = requests.post(f"{BASE_URL}/api/users/register", json=register_data)
        print(f"Registration response: {register_response.status_code}")
        
        if register_response.status_code == 201:
            print("New user registered successfully")
            # Now login
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
            if login_response.status_code != 200:
                print(f"Login after registration failed: {login_response.text}")
                return False
            login_result = login_response.json()
            auth_token = login_result.get("access_token")
            user_data = login_result.get("user")
        else:
            print(f"Registration failed: {register_response.text}")
            return False
    
    print(f"Login successful. User type: {user_data.get('user_type', user_data.get('type'))}")
    
    # Step 3: Submit provider application
    print("3. Submitting provider application...")
    
    # Prepare form data (simulating the frontend form submission)
    provider_data = {
        "fullName": user_data["name"],
        "email": user_data["email"], 
        "phone": "+254701234567",
        "businessName": "Test Service Business",
        "description": "Professional test service provider",
        "selectedCategories": '["home_services"]',
        "selectedServices": '["home_services:house_cleaning"]',
        "responseTime": "same_day",
        "county": "Nairobi",
        "subCounty": "Westlands", 
        "ward": "Kitisuru",
        "specificLocation": "Test Location",
        "serviceRadius": "10",
        "minRate": "1000",
        "maxRate": "5000",
        "pricingNotes": "Flexible pricing based on service complexity"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    provider_response = requests.post(f"{BASE_URL}/api/provider/apply", data=provider_data, headers=headers)
    print(f"Provider application response: {provider_response.status_code}")
    
    if provider_response.status_code == 201:
        result = provider_response.json()
        print(f"Application submitted successfully!")
        print(f"User transition: {result.get('user_transition', False)}")
        print(f"Provider ID: {result.get('provider_id')}")
        
        if result.get('user_transition') and result.get('user_data'):
            user_data_updated = result.get('user_data')
            print(f"Updated user type: {user_data_updated.get('user_type')}")
            return True
        else:
            print("ERROR: User transition did not occur properly")
            return False
    else:
        print(f"Provider application failed: {provider_response.text}")
        return False

if __name__ == "__main__":
    success = test_provider_signup_flow()
    if success:
        print("\n✅ Provider signup flow test PASSED!")
    else:
        print("\n❌ Provider signup flow test FAILED!")
