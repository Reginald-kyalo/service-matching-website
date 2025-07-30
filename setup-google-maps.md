# Google Maps API Setup Guide

## Quick Start

### 1. Get Your API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Maps JavaScript API
   - Places API  
   - Geocoding API
4. Create an API key
5. Restrict the key to your domain

### 2. Update Your Code
Replace `YOUR_GOOGLE_MAPS_API_KEY` in the HTML with your actual API key:

```html
<script async defer 
        src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY_HERE&libraries=places&callback=initMap">
</script>
```

### 3. For Development
If testing locally, you can temporarily use an unrestricted key, but ALWAYS restrict it before going live.

### 4. Environment Variables (Recommended)
For production, store the API key as an environment variable:

```python
# In your Python backend
import os
API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

# Pass to template
return render_template('provider-signup.html', google_maps_key=API_KEY)
```

```html
<!-- In template -->
<script async defer 
        src="https://maps.googleapis.com/maps/api/js?key={{ google_maps_key }}&libraries=places&callback=initMap">
</script>
```

## Pricing Breakdown

### Free Tier (Monthly)
- $200 credit = FREE usage up to:
  - 28,500 map loads
  - 1,000 place searches  
  - 40,000 geocoding requests

### Typical Usage for Small Business
- **Provider signups**: ~100/month = $17 in Places API
- **Map views**: ~1,000/month = $7 in Maps API  
- **Address lookups**: ~500/month = $2.50 in Geocoding
- **Total**: ~$26.50/month (well within $200 free credit)

### Cost Optimization Tips
1. **Cache results** - Don't repeat API calls for same data
2. **Restrict API keys** - Prevent unauthorized usage
3. **Monitor usage** - Set up billing alerts
4. **Use fallbacks** - Have backup location entry methods

## Security Best Practices

### API Key Restrictions
```
Application restrictions:
- HTTP referrers: 
  - localhost:* (development)
  - yourdomain.com/* (production)

API restrictions:
- Maps JavaScript API
- Places API
- Geocoding API
```

### Rate Limiting
```javascript
// Implement request throttling
let lastRequest = 0;
const minInterval = 100; // ms between requests

function throttledRequest(callback) {
    const now = Date.now();
    if (now - lastRequest > minInterval) {
        lastRequest = now;
        callback();
    }
}
```

## Alternative Solutions

### If Budget is a Concern
1. **OpenStreetMap** with Leaflet (free but less accurate)
2. **Mapbox** (similar pricing, different features)
3. **Basic location dropdowns** (no map, just admin hierarchy)

### Hybrid Approach
- Use administrative dropdowns as primary method
- Add Google Maps as optional enhancement
- Fall back gracefully if Maps API unavailable

## Testing Your Setup

1. Replace API key in HTML
2. Open the page in browser
3. Check browser console for errors
4. Verify map loads and search works
5. Test address autocomplete

Common issues:
- "RefererNotAllowedMapError" = Wrong domain restriction
- "RequestDeniedMapError" = API not enabled
- Map shows gray area = Invalid API key
