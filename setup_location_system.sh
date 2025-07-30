#!/bin/bash

# Enhanced Location System Setup Script
# This script helps configure the Google Maps API integration

echo "🗺️  Enhanced Location System Setup"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file for configuration..."
    touch .env
fi

echo "📋 Required Google Maps APIs:"
echo "  ✓ Maps JavaScript API"
echo "  ✓ Places API"
echo "  ✓ Geocoding API"
echo ""

echo "🔑 Google Maps API Key Configuration:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create or select a project"
echo "3. Enable the required APIs listed above"
echo "4. Create an API key with appropriate restrictions"
echo "5. Add your API key below"
echo ""

# Check if API key is already configured
if grep -q "GOOGLE_MAPS_API_KEY" .env; then
    echo "Google Maps API key is already configured in .env"
    echo "Current value: $(grep GOOGLE_MAPS_API_KEY .env | cut -d'=' -f2 | sed 's/^.\{10\}/[HIDDEN].../')"
    echo ""
    read -p "Would you like to update it? (y/N): " update_key
    if [[ $update_key =~ ^[Yy]$ ]]; then
        read -p "Enter your Google Maps API key: " api_key
        sed -i "s/GOOGLE_MAPS_API_KEY=.*/GOOGLE_MAPS_API_KEY=$api_key/" .env
        echo "✅ API key updated!"
    fi
else
    read -p "Enter your Google Maps API key: " api_key
    echo "GOOGLE_MAPS_API_KEY=$api_key" >> .env
    echo "✅ API key saved to .env file!"
fi

echo ""
echo "🔧 Manual Configuration Required:"
echo ""
echo "1. Update the HTML file:"
echo "   Replace 'YOUR_GOOGLE_MAPS_API_KEY' in templates/provider-signup.html"
echo "   with your actual API key or use server-side templating"
echo ""
echo "2. Configure API restrictions (recommended):"
echo "   - HTTP referrers: your-domain.com/*"
echo "   - APIs: Maps JavaScript API, Places API, Geocoding API"
echo ""
echo "3. Test the integration:"
echo "   - Open the provider signup page"
echo "   - Verify the map loads correctly"
echo "   - Test address search functionality"
echo "   - Test location selection on map"
echo ""

echo "📊 Location Data Status:"
echo "  ✅ Nairobi County - Complete with estates and areas"
echo "  ✅ Mombasa County - Basic structure with key areas"
echo "  ✅ Kisumu County - Basic structure with key areas"
echo "  ⚠️  Other Counties - Basic structure (can be expanded)"
echo ""

echo "🚀 Next Steps:"
echo "1. Configure your Google Maps API key"
echo "2. Test the enhanced location system"
echo "3. Expand location data for additional counties as needed"
echo "4. Configure backend to handle the new location fields"
echo ""

echo "📖 For detailed documentation, see ENHANCED_LOCATION_SYSTEM.md"
echo ""
echo "✅ Setup script completed!"

# Create a simple test HTML file
cat > test_location_system.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Location System Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        #map { height: 300px; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>🗺️ Enhanced Location System Test</h1>
    
    <div class="test-section">
        <h3>Google Maps API Test</h3>
        <div id="map"></div>
        <p>If you see a map above, the Google Maps API is working correctly.</p>
    </div>
    
    <div class="test-section">
        <h3>Administrative Data Test</h3>
        <select id="countyTest">
            <option value="">Select County</option>
        </select>
        <p>Counties loaded: <span id="countyCount">0</span></p>
    </div>
    
    <script src="static/js/kenya-locations.js"></script>
    <script>
        // Test administrative data loading
        document.addEventListener('DOMContentLoaded', function() {
            const countySelect = document.getElementById('countyTest');
            const countSpan = document.getElementById('countyCount');
            
            if (typeof kenyaAdministrativeData !== 'undefined') {
                kenyaAdministrativeData.counties.forEach(county => {
                    const option = document.createElement('option');
                    option.value = county.name;
                    option.textContent = county.name;
                    countySelect.appendChild(option);
                });
                countSpan.textContent = kenyaAdministrativeData.counties.length;
                countySelect.parentElement.classList.add('success');
            } else {
                countySelect.parentElement.classList.add('error');
                countySelect.parentElement.innerHTML += '<p style="color: red;">❌ Kenya administrative data not loaded</p>';
            }
        });
        
        // Test Google Maps
        function initMap() {
            try {
                const map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 7,
                    center: { lat: -0.0236, lng: 37.9062 }
                });
                document.querySelector('#map').parentElement.classList.add('success');
                document.querySelector('#map').parentElement.innerHTML += '<p style="color: green;">✅ Google Maps loaded successfully</p>';
            } catch (error) {
                document.querySelector('#map').parentElement.classList.add('error');
                document.querySelector('#map').parentElement.innerHTML += '<p style="color: red;">❌ Google Maps failed to load: ' + error.message + '</p>';
            }
        }
        
        // Fallback if Google Maps doesn't load
        setTimeout(() => {
            if (!window.google) {
                document.querySelector('#map').parentElement.classList.add('error');
                document.querySelector('#map').parentElement.innerHTML += '<p style="color: red;">❌ Google Maps API not loaded. Check your API key.</p>';
            }
        }, 5000);
    </script>
    
    <!-- Replace YOUR_API_KEY with your actual Google Maps API key -->
    <script async defer 
            src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap">
    </script>
</body>
</html>
EOF

echo "📝 Created test_location_system.html for testing the integration"
echo "   Open this file in a browser to test your API key configuration"
