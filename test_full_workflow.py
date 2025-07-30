#!/usr/bin/env python3
"""
Test provider registration and matching functionality
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_provider_registration():
    """Test provider registration"""
    print("Testing provider registration...")
    
    provider_data = {
        "fullName": "John Smith",
        "businessName": "Smith Plumbing Services",
        "email": "john.smith.plumber@test.com",
        "phone": "0700123456",
        "description": "Professional plumbing services with 10+ years experience",
        "selectedCategories": json.dumps(["Plumbing"]),
        "selectedServices": json.dumps(["Pipe Repair", "Drain Cleaning", "Fixture Installation"]),
        "responseTime": "within_24h",
        "county": "Nairobi",
        "subCounty": "Westlands",
        "ward": "Parklands",
        "serviceRadius": "20",  # This was missing!
        "specificLocation": "Parklands Area",
        "travelFee": "500",
        "landmark": "Near Sarit Center",
        "postalCode": "00100",
        "serviceAreasDescription": "Westlands and surrounding areas",
        "latitude": "-1.2644",
        "longitude": "36.8156",
        "fullAddress": "Parklands, Westlands, Nairobi",
        "manualAddress": "Parklands Area, Near Sarit Center",
        "minRate": "1500",
        "maxRate": "3000",
        "pricingNotes": "Competitive rates, quality service"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/provider/apply", data=provider_data)
        print(f"Registration response status: {response.status_code}")
        print(f"Registration response: {response.text}")
        
        if response.status_code in [200, 201]:
            result = response.json()
            print("✓ Provider registered successfully")
            return result.get('provider_id')
        else:
            print("✗ Provider registration failed")
            return None
            
    except Exception as e:
        print(f"✗ Error during registration: {e}")
        return None

def test_user_registration():
    """Test user registration"""
    print("\nTesting user registration...")
    
    user_data = {
        "email": "test.user.new@example.com",  # Use different email
        "password": "testpassword",
        "name": "Test User New",  # Changed from fullName to name
        "phone": "0700987655",  # Different phone
        "address": "123 Test Street",
        "city": "Nairobi",
        "state": "Nairobi",
        "zip_code": "00100"  # Changed from zipCode to zip_code
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/users/register", json=user_data)
        print(f"User registration status: {response.status_code}")
        print(f"User registration response: {response.text}")
        
        if response.status_code == 200:
            print("✓ User registered successfully")
            return True
        else:
            print("✗ User registration failed")
            return False
            
    except Exception as e:
        print(f"✗ Error during user registration: {e}")
        return False

def test_user_login():
    """Test user login and get token"""
    print("\nTesting user login...")
    
    login_data = {
        "email": "test.user.new@example.com",  # Use the new email
        "password": "testpassword"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/users/login", json=login_data)
        print(f"Login status: {response.status_code}")
        print(f"Login response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✓ User logged in successfully")
            return result.get('access_token')
        else:
            print("✗ User login failed")
            return None
            
    except Exception as e:
        print(f"✗ Error during login: {e}")
        return None

def test_provider_search(token):
    """Test provider search functionality"""
    print("\nTesting provider search...")
    
    search_data = {
        "category": "Plumbing",
        "location": "Nairobi",
        "description": "Need help with a leaky pipe"
    }
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    try:
        response = requests.post(f"{BASE_URL}/api/matching/find-providers", 
                               json=search_data, headers=headers)
        print(f"Search status: {response.status_code}")
        print(f"Search response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            providers = result.get('providers', [])
            print(f"✓ Found {len(providers)} providers")
            
            for provider in providers:
                print(f"  - {provider.get('business_name', 'Unknown')} (Score: {provider.get('match_score', 0)})")
            
            return len(providers) > 0
        else:
            print("✗ Provider search failed")
            return False
            
    except Exception as e:
        print(f"✗ Error during search: {e}")
        return False

def main():
    """Run all tests"""
    print("=== Provider Registration and Matching Test ===\n")
    
    # Test provider registration
    provider_id = test_provider_registration()
    
    # Test user registration
    user_registered = test_user_registration()
    
    # Test user login
    token = test_user_login()
    
    # Test provider search
    if token:
        providers_found = test_provider_search(token)
        
        if providers_found:
            print("\n✓ All tests passed! Providers are appearing in search results.")
        else:
            print("\n✗ Issue: No providers found in search results.")
    else:
        print("\n✗ Cannot test provider search without user token.")

if __name__ == "__main__":
    main()
