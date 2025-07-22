#!/usr/bin/env python3
"""
Test the category selection without description workflow.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_category_only_selection():
    """Test selecting a category without description"""
    
    print("🧪 Testing Category-Only Selection Workflow")
    print("=" * 45)
    
    # Step 1: Register a test user
    print("\n1. Creating test user...")
    user_data = {
        "name": "Test User",
        "email": f"test.category@example.com",
        "password": "testpass123",
        "city": "San Francisco",
        "state": "CA"
    }
    
    response = requests.post(f"{BASE_URL}/api/users/register", json=user_data)
    if response.status_code == 200:
        auth_data = response.json()
        token = auth_data["access_token"]
        user = auth_data["user"]
        print(f"✅ User registered: {user['name']}")
    else:
        print(f"❌ Registration failed: {response.text}")
        return False
    
    # Step 2: Test category-only submission (no description)
    print("\n2. Testing category selection without description...")
    problem_data = {
        "description": "",  # Empty description
        "selected_category": "plumbing",
        "user_id": str(user["id"])
    }
    
    response = requests.post(f"{BASE_URL}/api/problems/detect", json=problem_data)
    if response.status_code == 200:
        detection_result = response.json()
        print(f"✅ Category-only selection successful!")
        print(f"   - Final Category: {detection_result['final_category']}")
        print(f"   - Session ID: {detection_result['session_id']}")
        session_id = detection_result["session_id"]
    else:
        print(f"❌ Category selection failed: {response.text}")
        return False
    
    # Step 3: Test provider matching with category-only selection
    print("\n3. Testing provider matching...")
    headers = {"Authorization": f"Bearer {token}"}
    match_request = {
        "category": detection_result["final_category"],
        "max_distance": 50.0,
        "min_rating": 0.0
    }
    
    response = requests.post(f"{BASE_URL}/api/matching/find-providers", json=match_request, headers=headers)
    if response.status_code == 200:
        providers = response.json()
        print(f"✅ Found {len(providers)} providers for category-only selection")
        if providers:
            provider = providers[0]
            print(f"   - {provider['name']}: {provider['distance_miles']:.1f} miles")
    else:
        print(f"❌ Provider matching failed: {response.text}")
        return False
    
    # Step 4: Test with description AND category
    print("\n4. Testing description + category selection...")
    problem_data = {
        "description": "My kitchen faucet is leaking",
        "selected_category": "plumbing", 
        "user_id": str(user["id"])
    }
    
    response = requests.post(f"{BASE_URL}/api/problems/detect", json=problem_data)
    if response.status_code == 200:
        detection_result = response.json()
        print(f"✅ Description + category selection successful!")
        print(f"   - Final Category: {detection_result['final_category']}")
        print(f"   - AI Confidence: {detection_result['confidence']:.2f}")
    else:
        print(f"❌ Description + category failed: {response.text}")
        return False
    
    print("\n🎉 All tests passed!")
    print("✅ Users can now select categories without filling description")
    print("✅ Description is optional when category is selected")
    print("✅ Both workflows work correctly")
    
    return True

if __name__ == "__main__":
    try:
        test_category_only_selection()
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
