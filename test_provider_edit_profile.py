#!/usr/bin/env python3
"""
Test script for provider edit profile functionality
Tests the complete flow: login -> become provider -> edit profile
"""

import requests
import json
import time

BASE_URL = "http://localhost:8001"

def test_provider_edit_profile():
    """Test the complete provider edit profile workflow"""
    session = requests.Session()
    
    print("🧪 Starting Provider Edit Profile Test...")
    
    # Step 1: Create a test user
    print("\n1. Creating test user...")
    user_data = {
        "name": "Test Provider User",
        "email": "testprovider@example.com",
        "password": "testpass123"
    }
    
    signup_response = session.post(f"{BASE_URL}/api/users/signup", json=user_data)
    print(f"Signup response: {signup_response.status_code}")
    if signup_response.status_code == 409:
        print("User already exists, continuing with login...")
    
    # Step 2: Login
    print("\n2. Logging in...")
    login_data = {
        "email": "testprovider@example.com",
        "password": "testpass123"
    }
    
    login_response = session.post(f"{BASE_URL}/api/users/login", json=login_data)
    print(f"Login response: {login_response.status_code}")
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.text}")
        return False
    
    user_info = login_response.json()
    print(f"Logged in as: {user_info.get('name', 'Unknown')}")
    
    # Step 3: Check if user is already a provider
    print("\n3. Checking provider status...")
    provider_check = session.get(f"{BASE_URL}/api/providers/profile")
    
    if provider_check.status_code == 404:
        print("User is not a provider yet, creating provider profile...")
        
        # Step 4: Create provider profile
        provider_data = {
            "full_name": "Test Provider User",
            "business_name": "Test Business",
            "service_category": "home-improvement",
            "description": "Test description",
            "experience_years": 5,
            "hourly_rate_min": 50,
            "hourly_rate_max": 100,
            "phone": "+254700000000",
            "location": "Nairobi, Kenya",
            "coordinates": {"latitude": -1.2921, "longitude": 36.8219}
        }
        
        provider_response = session.post(f"{BASE_URL}/api/providers/signup", json=provider_data)
        print(f"Provider signup response: {provider_response.status_code}")
        
        if provider_response.status_code != 200:
            print(f"Provider signup failed: {provider_response.text}")
            return False
    else:
        print("User is already a provider")
    
    # Step 5: Get current provider profile
    print("\n5. Getting current provider profile...")
    profile_response = session.get(f"{BASE_URL}/api/providers/profile")
    print(f"Get profile response: {profile_response.status_code}")
    
    if profile_response.status_code != 200:
        print(f"Failed to get profile: {profile_response.text}")
        return False
    
    current_profile = profile_response.json()
    print(f"Current profile: {json.dumps(current_profile, indent=2)}")
    
    # Step 6: Test profile update
    print("\n6. Testing profile update...")
    updated_data = {
        "name": "Updated Provider Name",
        "business_name": "Updated Business Name",
        "description": "Updated description with new information",
        "experience_years": 8,
        "minRate": 60,
        "maxRate": 120,
        "phone": "+254700000001",
        "location": "Mombasa, Kenya"
    }
    
    update_response = session.put(f"{BASE_URL}/api/providers/profile", json=updated_data)
    print(f"Update response: {update_response.status_code}")
    
    if update_response.status_code != 200:
        print(f"Update failed: {update_response.text}")
        return False
    
    updated_profile = update_response.json()
    print(f"Updated profile: {json.dumps(updated_profile, indent=2)}")
    
    # Step 7: Verify the update
    print("\n7. Verifying the update...")
    verify_response = session.get(f"{BASE_URL}/api/providers/profile")
    
    if verify_response.status_code != 200:
        print(f"Failed to verify update: {verify_response.text}")
        return False
    
    verified_profile = verify_response.json()
    print(f"Verified profile: {json.dumps(verified_profile, indent=2)}")
    
    # Check if updates were applied
    success = True
    if verified_profile.get('full_name') != 'Updated Provider Name':
        print("❌ Name update failed")
        success = False
    else:
        print("✅ Name updated successfully")
    
    if verified_profile.get('business_name') != 'Updated Business Name':
        print("❌ Business name update failed")
        success = False
    else:
        print("✅ Business name updated successfully")
    
    if verified_profile.get('description') != 'Updated description with new information':
        print("❌ Description update failed")
        success = False
    else:
        print("✅ Description updated successfully")
    
    if verified_profile.get('experience_years') != 8:
        print("❌ Experience years update failed")
        success = False
    else:
        print("✅ Experience years updated successfully")
    
    if verified_profile.get('hourly_rate_min') != 60:
        print("❌ Min rate update failed")
        success = False
    else:
        print("✅ Min rate updated successfully")
    
    if verified_profile.get('hourly_rate_max') != 120:
        print("❌ Max rate update failed")
        success = False
    else:
        print("✅ Max rate updated successfully")
    
    if verified_profile.get('phone') != '+254700000001':
        print("❌ Phone update failed")
        success = False
    else:
        print("✅ Phone updated successfully")
    
    if verified_profile.get('location') != 'Mombasa, Kenya':
        print("❌ Location update failed")
        success = False
    else:
        print("✅ Location updated successfully")
    
    print(f"\n🎯 Test Result: {'✅ PASSED' if success else '❌ FAILED'}")
    return success

if __name__ == "__main__":
    test_provider_edit_profile()
