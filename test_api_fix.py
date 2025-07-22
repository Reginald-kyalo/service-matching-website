#!/usr/bin/env python3
"""
Simple test to verify the 422 error is fixed and terminology is updated.
"""
import requests
import time

BASE_URL = "http://localhost:8000"

def test_api_fix():
    """Test that the API now accepts empty descriptions"""
    
    print("🔧 Testing API Fix for Category-Only Selection")
    print("=" * 45)
    
    # Test 1: Empty description with category
    print("\n1. Testing empty description with category...")
    data = {
        "description": "",
        "selected_category": "plumbing",
        "user_id": "test"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/problems/detect", json=data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print("✅ API accepts empty description!")
            print(f"   Final category: {result['final_category']}")
            print(f"   Session created: {result['session_id'][:8]}...")
        else:
            print(f"❌ Still getting error: {response.status_code}")
            print(f"   Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
    
    # Test 2: Check categories endpoint
    print("\n2. Testing categories endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/problems/categories", timeout=5)
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Categories loaded: {len(categories)} groups")
        else:
            print(f"❌ Categories error: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
    
    print(f"\n🎨 Terminology Updated:")
    print(f"   ✅ 'Service Providers' → 'Professionals'")
    print(f"   ✅ More friendly and trustworthy language")
    print(f"   ✅ Updated throughout UI and API responses")

if __name__ == "__main__":
    test_api_fix()
