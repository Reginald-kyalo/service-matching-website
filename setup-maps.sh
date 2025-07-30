#!/bin/bash

# Google Maps API Setup Script for ServiceMatch

echo "🗺️  Google Maps API Setup for ServiceMatch"
echo "=========================================="
echo "⚠️  Note: Google Maps is currently DISABLED for security"
echo "   The provider signup form works without Maps using fallback mode"
echo

# Check if API key is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your Google Maps API key as an argument"
    echo "Usage: ./setup-maps.sh YOUR_API_KEY_HERE"
    echo
    echo "📋 To get an API key:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Create a new project"
    echo "3. Enable Maps JavaScript API, Places API, and Geocoding API"
    echo "4. Create an API key and restrict it to your domain"
    echo
    exit 1
fi

API_KEY="$1"
HTML_FILE="templates/provider-signup.html"

echo "🔑 Setting up API key: ${API_KEY:0:10}..."
echo "📁 Updating file: $HTML_FILE"

# Check if HTML file exists
if [ ! -f "$HTML_FILE" ]; then
    echo "❌ File not found: $HTML_FILE"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Create backup
cp "$HTML_FILE" "${HTML_FILE}.backup"
echo "💾 Backup created: ${HTML_FILE}.backup"

# Replace the API key in HTML file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/YOUR_GOOGLE_MAPS_API_KEY/$API_KEY/g" "$HTML_FILE"
    # Uncomment the script tag
    sed -i '' 's/<!-- <script async defer src="https:\/\/maps\.googleapis\.com\/maps\/api\/js?key=/\<script async defer src="https:\/\/maps\.googleapis\.com\/maps\/api\/js?key=/g' "$HTML_FILE"
    sed -i '' 's/callback=initMap"><\/script> -->/callback=initMap"><\/script>/g' "$HTML_FILE"
else
    # Linux
    sed -i "s/YOUR_GOOGLE_MAPS_API_KEY/$API_KEY/g" "$HTML_FILE"
    # Uncomment the script tag
    sed -i 's/<!-- <script async defer src="https:\/\/maps\.googleapis\.com\/maps\/api\/js?key=/\<script async defer src="https:\/\/maps\.googleapis\.com\/maps\/api\/js?key=/g' "$HTML_FILE"
    sed -i 's/callback=initMap"><\/script> -->/callback=initMap"><\/script>/g' "$HTML_FILE"
fi

# Verify replacement
if grep -q "$API_KEY" "$HTML_FILE"; then
    echo "✅ API key successfully updated in $HTML_FILE"
else
    echo "❌ Failed to update API key"
    exit 1
fi

# Create environment file for future use
cat > .env.maps << EOF
# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=$API_KEY

# Usage tracking
MAPS_API_DAILY_LIMIT=1000
PLACES_API_DAILY_LIMIT=100
GEOCODING_API_DAILY_LIMIT=500
EOF

echo "📝 Environment file created: .env.maps"

# Create monitoring script
cat > monitor-maps-usage.py << 'EOF'
#!/usr/bin/env python3
"""
Google Maps API Usage Monitor
Helps track your API usage to stay within free tier
"""

import requests
import json
from datetime import datetime, timedelta

def check_quota_usage(api_key):
    """Check current API usage (requires Google Cloud Monitoring API)"""
    print("🔍 Checking Google Maps API usage...")
    print("📊 To monitor usage in detail:")
    print("   1. Go to https://console.cloud.google.com/")
    print("   2. Navigate to APIs & Services > Quotas")
    print("   3. Filter by Maps JavaScript API, Places API, Geocoding API")
    print("   4. Set up billing alerts at $100, $150, $180")
    
def estimate_monthly_cost():
    """Estimate monthly costs based on expected usage"""
    print("\n💰 Cost Estimation:")
    print("Free tier: $200/month credit")
    print()
    
    # Example calculations
    providers_per_month = 100
    map_views_per_provider = 5
    searches_per_provider = 3
    
    map_requests = providers_per_month * map_views_per_provider
    place_requests = providers_per_month * searches_per_provider
    geocoding_requests = providers_per_month * 2
    
    map_cost = max(0, (map_requests - 28500) / 1000 * 7)
    places_cost = max(0, (place_requests - 1000) / 1000 * 17)
    geocoding_cost = max(0, (geocoding_requests - 40000) / 1000 * 5)
    
    total_cost = map_cost + places_cost + geocoding_cost
    
    print(f"📍 Estimated {providers_per_month} providers/month:")
    print(f"   Map loads: {map_requests:,} (${map_cost:.2f})")
    print(f"   Place searches: {place_requests:,} (${places_cost:.2f})")
    print(f"   Geocoding: {geocoding_requests:,} (${geocoding_cost:.2f})")
    print(f"   Total: ${total_cost:.2f}/month")
    
    if total_cost == 0:
        print("✅ All usage covered by free tier!")
    else:
        print(f"💳 Estimated monthly charge: ${total_cost:.2f}")

if __name__ == "__main__":
    print("🗺️  Google Maps API Usage Monitor")
    print("================================")
    estimate_monthly_cost()
    print()
    check_quota_usage(None)
EOF

chmod +x monitor-maps-usage.py
echo "📊 Usage monitor created: monitor-maps-usage.py"

echo
echo "🎉 Setup Complete!"
echo "=================="
echo "✅ API key configured in HTML"
echo "✅ Environment file created"
echo "✅ Usage monitor script created"
echo "✅ Backup file saved"
echo "✅ Google Maps script uncommented and enabled"
echo
echo "🔬 Next Steps:"
echo "1. Test the maps functionality in your browser"
echo "2. Set up billing alerts in Google Cloud Console"
echo "3. Restrict your API key to your domain"
echo "4. Monitor usage with: python3 monitor-maps-usage.py"
echo
echo "📚 Documentation: ENHANCED_LOCATION_SYSTEM.md"
echo
echo "⚠️  Important: Never commit your API key to version control!"
echo "   Add .env.maps to your .gitignore file"
echo
echo "💡 Current Status:"
echo "   - Provider signup works WITHOUT Google Maps (fallback mode)"
echo "   - Users can still enter detailed location using manual address"
echo "   - Google Maps is now ENABLED with your API key"
