/**
 * Provider Signup JavaScript
 * Enhanced multi-step provider application with detailed location mapping and state preservation
 */

// Import the unified service catalog
import { SERVICE_CATEGORIES, SERVICES, ServiceUtils } from './service-catalog.js';

let currentStep = 1;
const totalSteps = 4;

// Form state preservation
const FORM_STATE_KEY = 'providerSignupFormState';
const STEP_STATE_KEY = 'providerSignupCurrentStep';

// Google Maps variables
let map;
let marker;
let geocoder;
let autocomplete;
let placesService;
let currentLocationCircle;

// Location validation state
let locationSelected = false;
let locationValidated = false;

// Kenya locations data is loaded from /static/js/kenya-locations.js
// Use the global kenyaLocations, kenyaAdministrativeData, and kenyanCounties variables

// Use the unified service catalog instead of local definitions
const serviceCategories = transformServiceCatalog();

/**
 * Transform the unified service catalog to the provider signup format
 */
function transformServiceCatalog() {
    const transformed = {};
    
    Object.entries(SERVICE_CATEGORIES).forEach(([categoryKey, categoryData]) => {
        // Get all services for this category group
        const categoryServices = [];
        categoryData.categories.forEach(subCategory => {
            const services = ServiceUtils.getServicesByCategory(subCategory.category);
            categoryServices.push(...services.map(service => service.name));
        });
        
        transformed[categoryKey] = {
            id: categoryKey,
            name: categoryData.name,
            icon: categoryData.icon,
            description: categoryData.description,
            services: categoryServices
        };
    });
    
    return transformed;
}

/**
 * Initialize the provider signup page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth section element (needed by auth.js)
    authSection = document.getElementById('authSection');
    
    // Wait a moment for all scripts to load, then initialize
    setTimeout(() => {
        // Initialize authentication UI
        if (typeof initializeAuth === 'function') {
            initializeAuth();
        }
        
        // Check authentication and handle user autofill
        if (!checkAuthenticationAndAutofill()) {
            return; // If redirecting to login, don't initialize the rest
        }
        
        loadServiceCategories();
        loadCounties();
        setupRatePreview();
        setupFormValidation();
        setupAutoSave(); // Setup auto-save functionality
        restoreFormState(); // Restore previous form state
        updateStepLabels(); // Initialize step label colors
        checkMapsAvailability(); // Check if Google Maps is available
    }, 500); // Increased delay to ensure form elements are rendered
});

/**
 * Check if user is authenticated and handle autofill/redirect logic
 * Returns false if redirecting to login, true if proceeding with form
 */
function checkAuthenticationAndAutofill() {
    // Refresh auth state first to ensure we have the latest data
    if (typeof refreshAuthState === 'function') {
        refreshAuthState();
    }
    
    // Get current authentication state (try global variables first, then localStorage)
    let userAuthToken = null;
    let userCurrentUser = null;
    
    if (typeof authToken !== 'undefined' && authToken) {
        userAuthToken = authToken;
    } else {
        userAuthToken = localStorage.getItem('authToken');
    }
    
    if (typeof currentUser !== 'undefined' && currentUser) {
        userCurrentUser = currentUser;
    } else {
        userCurrentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }
    
    console.log('Authentication check:', { 
        hasToken: !!userAuthToken, 
        hasUser: !!userCurrentUser,
        userType: userCurrentUser?.user_type || userCurrentUser?.type,
        userData: userCurrentUser
    });
    
    if (!userAuthToken || !userCurrentUser) {
        // User is not authenticated, redirect to login
        // Store the current URL as return URL for after login
        const returnUrl = window.location.pathname + window.location.search;
        sessionStorage.setItem('returnUrl', returnUrl);
        
        // Show a message and redirect
        showMessage('Please log in to apply as a service provider', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        
        return false;
    }
    
    // Check if user is already a provider
    const userType = userCurrentUser.user_type || userCurrentUser.type;
    if (userType === 'provider') {
        // User is already a provider, show professional message
        showAlreadyProviderMessage();
        return false;
    }
    
    // User is authenticated but not a provider, autofill their information
    autofillUserInformation(userCurrentUser);
    return true;
}

/**
 * Autofill user information and make fields readonly
 */
function autofillUserInformation(user) {
    console.log('Autofilling user information:', user);
    
    // Wait for form to be available
    const formElement = document.getElementById('providerSignupForm');
    if (!formElement) {
        console.log('Form not yet available, retrying in 100ms...');
        setTimeout(() => autofillUserInformation(user), 100);
        return;
    }
    
    const fields = {
        'fullName': user.name || user.full_name || '',
        'email': user.email || '',
        'phone': user.phone || user.phone_number || ''
    };
    
    console.log('Fields to autofill:', fields);
    
    // Fill and disable the fields
    Object.entries(fields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        console.log(`Processing field ${fieldId}:`, { field: !!field, value });
        
        if (field && value) {
            field.value = value;
            
            // Make field readonly and style it differently
            field.readOnly = true;
            field.classList.add('bg-gray-100', 'cursor-not-allowed');
            field.title = 'This information is taken from your account and cannot be changed here';
            
            // Add a lock icon to indicate the field is locked
            const lockIcon = document.createElement('i');
            lockIcon.className = 'fas fa-lock absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500';
            
            // Make the parent container relative if it's not already
            const parent = field.parentElement;
            if (!parent.classList.contains('relative')) {
                parent.classList.add('relative');
            }
            
            // Only add the lock icon if it doesn't already exist
            if (!parent.querySelector('.fas.fa-lock')) {
                parent.appendChild(lockIcon);
            }
            
            console.log(`Successfully autofilled field ${fieldId} with value: ${value}`);
        } else if (field && !value) {
            console.log(`Field ${fieldId} found but no value to fill`);
        } else if (!field && value) {
            console.log(`Value available for ${fieldId} but field not found in DOM`);
        }
    });
    
    // Add a notice about the locked fields
    addUserInfoNotice();
}

/**
 * Add a notice explaining that user information is taken from their account
 */
function addUserInfoNotice() {
    const basicInfoSection = document.getElementById('section1');
    const existingNotice = basicInfoSection.querySelector('.user-info-notice');
    
    if (!existingNotice) {
        const notice = document.createElement('div');
        notice.className = 'user-info-notice bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6';
        notice.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                <div>
                    <h4 class="text-blue-800 font-medium mb-1">Account Information</h4>
                    <p class="text-blue-700 text-sm">
                        Your name, email, and phone number are automatically filled from your account. 
                        To change this information, please update your account settings first.
                    </p>
                </div>
            </div>
        `;
        
        // Insert the notice at the beginning of the basic info section
        const firstChild = basicInfoSection.querySelector('h3').nextElementSibling;
        basicInfoSection.insertBefore(notice, firstChild);
    }
}

/**
 * Initialize Google Maps with enhanced features
 */
function initMap() {
    // Default location (Nairobi city center)
    const defaultLocation = { lat: -1.286389, lng: 36.817223 };
    
    // Initialize map with enhanced settings
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
            }
        ]
    });
    
    // Initialize services
    geocoder = new google.maps.Geocoder();
    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize autocomplete with enhanced settings
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('addressSearch'),
        {
            componentRestrictions: { country: 'ke' },
            fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components'],
            types: ['establishment', 'geocode']
        }
    );
    
    // Set up autocomplete listener with enhanced data extraction
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            setLocationOnMap(place.geometry.location, place.formatted_address);
            extractLocationDetails(place);
        }
    });
    
    // Set up map click listener
    map.addListener('click', function(event) {
        setLocationOnMap(event.latLng);
        reverseGeocode(event.latLng);
    });
    
    // Initialize marker with enhanced styling
    marker = new google.maps.Marker({
        map: map,
        draggable: true,
        title: 'Your Service Location',
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                '<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">' +
                '<circle cx="20" cy="20" r="18" fill="#4F46E5" stroke="#ffffff" stroke-width="2"/>' +
                '<circle cx="20" cy="20" r="8" fill="#ffffff"/>' +
                '</svg>'
            ),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
        }
    });
    
    // Set up marker drag listener
    marker.addListener('dragend', function() {
        const position = marker.getPosition();
        reverseGeocode(position);
        updateLocationDisplay(position);
    });
    
    // Initialize service radius circle
    currentLocationCircle = new google.maps.Circle({
        map: map,
        fillColor: '#4F46E5',
        fillOpacity: 0.1,
        strokeColor: '#4F46E5',
        strokeOpacity: 0.3,
        strokeWeight: 2
    });
}

/**
 * Set location on map
 */
function setLocationOnMap(location, address = null) {
    map.setCenter(location);
    marker.setPosition(location);
    marker.setVisible(true);
    
    // Update hidden fields
    document.getElementById('latitude').value = location.lat();
    document.getElementById('longitude').value = location.lng();
    
    if (address) {
        document.getElementById('fullAddress').value = address;
        updateLocationDisplay(location, address);
    } else {
        updateLocationDisplay(location);
    }
    
    // Update location selection state
    locationSelected = true;
    
    // Update service radius circle
    updateServiceRadiusCircle();
    
    // Validate the selected location
    validateSelectedLocation(location);
}

/**
 * Update location display
 */
function updateLocationDisplay(location, address = null) {
    const coordsElement = document.getElementById('selectedCoordinates');
    const addressElement = document.getElementById('selectedAddress');
    const displayDiv = document.getElementById('coordinatesDisplay');
    
    coordsElement.textContent = `${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`;
    
    if (address) {
        addressElement.textContent = address;
    }
    
    displayDiv.classList.remove('hidden');
}

/**
 * Reverse geocode coordinates to get address
 */
function reverseGeocode(location) {
    geocoder.geocode({ location: location }, function(results, status) {
        if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            document.getElementById('fullAddress').value = address;
            document.getElementById('selectedAddress').textContent = address;
        }
    });
}

/**
 * Extract detailed location information from Google Places API
 */
function extractLocationDetails(place) {
    const addressComponents = place.address_components || [];
    let locationData = {
        county: '',
        subCounty: '',
        ward: '',
        area: '',
        street: '',
        building: ''
    };
    
    // Parse address components
    addressComponents.forEach(component => {
        const types = component.types;
        
        if (types.includes('administrative_area_level_1')) {
            // This is typically the county in Kenya
            locationData.county = component.long_name.replace(' County', '');
        } else if (types.includes('administrative_area_level_2')) {
            // This could be sub-county
            locationData.subCounty = component.long_name;
        } else if (types.includes('locality') || types.includes('sublocality')) {
            // This could be ward or area
            locationData.area = component.long_name;
        } else if (types.includes('route')) {
            // Street name
            locationData.street = component.long_name;
        } else if (types.includes('street_number')) {
            // Building number
            locationData.building = component.long_name;
        }
    });
    
    // Auto-populate form fields if we have the data
    autoPopulateLocationFields(locationData);
    
    // Validate location is in Kenya
    validateKenyaLocation(place);
}

/**
 * Auto-populate location form fields based on extracted data
 */
function autoPopulateLocationFields(locationData) {
    const countySelect = document.getElementById('county');
    const subCountySelect = document.getElementById('subCounty');
    const wardSelect = document.getElementById('ward');
    const specificLocationSelect = document.getElementById('specificLocation');
    
    // Set county if found
    if (locationData.county) {
        // Find matching county in our data
        const matchingCounty = findBestMatch(locationData.county, Array.from(countySelect.options).map(o => o.value));
        if (matchingCounty) {
            countySelect.value = matchingCounty;
            loadSubCounties();
            
            // Set sub-county if found
            setTimeout(() => {
                if (locationData.subCounty) {
                    const matchingSubCounty = findBestMatch(locationData.subCounty, Array.from(subCountySelect.options).map(o => o.value));
                    if (matchingSubCounty) {
                        subCountySelect.value = matchingSubCounty;
                        loadWards();
                        
                        // Set ward/area if found
                        setTimeout(() => {
                            if (locationData.area) {
                                const matchingWard = findBestMatch(locationData.area, Array.from(wardSelect.options).map(o => o.value));
                                if (matchingWard) {
                                    wardSelect.value = matchingWard;
                                    loadLocations();
                                }
                            }
                        }, 300);
                    }
                }
            }, 300);
        }
    }
    
    // Set detailed address
    if (locationData.street || locationData.building) {
        const detailAddress = [locationData.building, locationData.street].filter(Boolean).join(' ');
        document.getElementById('detailedAddress').value = detailAddress;
    }
}

/**
 * Find best matching string from options
 */
function findBestMatch(searchTerm, options) {
    if (!searchTerm || !options.length) return null;
    
    const lowerSearch = searchTerm.toLowerCase();
    
    // Exact match
    const exactMatch = options.find(option => option.toLowerCase() === lowerSearch);
    if (exactMatch) return exactMatch;
    
    // Partial match
    const partialMatch = options.find(option => 
        option.toLowerCase().includes(lowerSearch) || 
        lowerSearch.includes(option.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    return null;
}

/**
 * Validate that location is within Kenya
 */
function validateKenyaLocation(place) {
    const addressComponents = place.address_components || [];
    const isInKenya = addressComponents.some(component => 
        component.types.includes('country') && 
        (component.short_name === 'KE' || component.long_name === 'Kenya')
    );
    
    if (!isInKenya) {
        showLocationWarning('Please select a location within Kenya');
        locationValidated = false;
    } else {
        hideLocationWarning();
        locationValidated = true;
    }
}

/**
 * Show location warning
 */
function showLocationWarning(message) {
    const warningDiv = document.getElementById('locationWarning') || createLocationWarning();
    warningDiv.textContent = message;
    warningDiv.classList.remove('hidden');
}

/**
 * Hide location warning
 */
function hideLocationWarning() {
    const warningDiv = document.getElementById('locationWarning');
    if (warningDiv) {
        warningDiv.classList.add('hidden');
    }
}

/**
 * Create location warning element
 */
function createLocationWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'locationWarning';
    warningDiv.className = 'mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm hidden';
    
    const mapContainer = document.getElementById('map').parentElement;
    mapContainer.appendChild(warningDiv);
    
    return warningDiv;
}

/**
 * Update service radius circle on map
 */
function updateServiceRadiusCircle() {
    if (!marker.getPosition() || !currentLocationCircle) return;
    
    const radiusSelect = document.getElementById('serviceRadius');
    const radiusValue = radiusSelect.value;
    
    currentLocationCircle.setCenter(marker.getPosition());
    
    if (radiusValue === 'county' || radiusValue === 'region') {
        currentLocationCircle.setVisible(false);
    } else {
        const radiusKm = parseInt(radiusValue);
        currentLocationCircle.setRadius(radiusKm * 1000); // Convert to meters
        currentLocationCircle.setVisible(true);
    }
}

/**
 * Load counties into select dropdown
 */
function loadCounties() {
    const countySelect = document.getElementById('county');
    
    // Use the detailed administrative data
    const counties = kenyaAdministrativeData ? kenyaAdministrativeData.counties : kenyaLocations.counties;
    
    counties.forEach(county => {
        const option = document.createElement('option');
        option.value = county.name;
        option.textContent = `${county.name} County`;
        countySelect.appendChild(option);
    });
}

/**
 * Load sub-counties based on selected county
 */
function loadSubCounties() {
    const countySelect = document.getElementById('county');
    const subCountySelect = document.getElementById('subCounty');
    const wardSelect = document.getElementById('ward');
    const locationSelect = document.getElementById('specificLocation');
    
    // Reset dependent dropdowns
    subCountySelect.innerHTML = '<option value="">Select Sub-County</option>';
    wardSelect.innerHTML = '<option value="">Select Ward</option>';
    locationSelect.innerHTML = '<option value="">Select Specific Area (Optional)</option>';
    wardSelect.disabled = true;
    locationSelect.disabled = true;
    
    const selectedCounty = countySelect.value;
    if (!selectedCounty) {
        subCountySelect.disabled = true;
        return;
    }
    
    // Use the detailed administrative data
    const counties = kenyaAdministrativeData ? kenyaAdministrativeData.counties : kenyaLocations.counties;
    const county = counties.find(c => c.name === selectedCounty);
    
    if (county && county.subCounties) {
        county.subCounties.forEach(subCounty => {
            const option = document.createElement('option');
            option.value = subCounty.name;
            option.textContent = subCounty.name;
            subCountySelect.appendChild(option);
        });
        subCountySelect.disabled = false;
    }
}

/**
 * Load wards based on selected sub-county
 */
function loadWards() {
    const countySelect = document.getElementById('county');
    const subCountySelect = document.getElementById('subCounty');
    const wardSelect = document.getElementById('ward');
    const locationSelect = document.getElementById('specificLocation');
    
    // Reset dependent dropdowns
    wardSelect.innerHTML = '<option value="">Select Ward</option>';
    locationSelect.innerHTML = '<option value="">Select Specific Area (Optional)</option>';
    locationSelect.disabled = true;
    
    const selectedCounty = countySelect.value;
    const selectedSubCounty = subCountySelect.value;
    
    if (!selectedCounty || !selectedSubCounty) {
        wardSelect.disabled = true;
        return;
    }
    
    // Use the detailed administrative data
    const counties = kenyaAdministrativeData ? kenyaAdministrativeData.counties : kenyaLocations.counties;
    const county = counties.find(c => c.name === selectedCounty);
    const subCounty = county?.subCounties.find(sc => sc.name === selectedSubCounty);
    
    if (subCounty && subCounty.wards) {
        subCounty.wards.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward.name;
            option.textContent = ward.name;
            wardSelect.appendChild(option);
        });
        wardSelect.disabled = false;
    }
}

/**
 * Load specific locations/estates based on selected ward
 */
function loadLocations() {
    const countySelect = document.getElementById('county');
    const subCountySelect = document.getElementById('subCounty');
    const wardSelect = document.getElementById('ward');
    const locationSelect = document.getElementById('specificLocation');
    
    const selectedCounty = countySelect.value;
    const selectedSubCounty = subCountySelect.value;
    const selectedWard = wardSelect.value;
    
    if (!selectedWard) {
        locationSelect.disabled = true;
        return;
    }
    
    locationSelect.innerHTML = '<option value="">Select Specific Area (Optional)</option>';
    
    // Use the detailed administrative data
    const counties = kenyaAdministrativeData ? kenyaAdministrativeData.counties : kenyaLocations.counties;
    const county = counties.find(c => c.name === selectedCounty);
    const subCounty = county?.subCounties.find(sc => sc.name === selectedSubCounty);
    const ward = subCounty?.wards.find(w => w.name === selectedWard);
    
    if (ward && ward.areas) {
        // Load specific areas for this ward
        ward.areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            locationSelect.appendChild(option);
        });
    } else {
        // Add generic options if no specific areas are defined
        const commonAreas = [
            'City Center', 'Shopping Mall Area', 'Residential Estate', 
            'Industrial Area', 'Commercial District', 'Hospital Area',
            'School Zone', 'Market Area', 'Government Offices', 'Estate'
        ];
        
        commonAreas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            locationSelect.appendChild(option);
        });
    }
    
    locationSelect.disabled = false;
}

/**
 * Update radius display text
 */
function updateRadiusDisplay() {
    const radiusSelect = document.getElementById('serviceRadius');
    const coverageText = document.getElementById('coverageText');
    const selectedValue = radiusSelect.value;
    
    let text;
    if (selectedValue === 'county') {
        text = 'You will serve customers throughout the entire county';
    } else if (selectedValue === 'region') {
        text = 'You will serve customers throughout the entire region';
    } else {
        text = `You will serve customers within ${selectedValue} km of your selected location`;
    }
    
    coverageText.textContent = text;
}

/**
 * Load service categories into the grid
 */
function loadServiceCategories() {
    const grid = document.getElementById('serviceCategoriesGrid');
    grid.innerHTML = '';
    
    Object.values(serviceCategories).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'service-category-group border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors';
        categoryDiv.innerHTML = `
            <div class="category-header mb-3">
                <label class="flex items-start cursor-pointer">
                    <input type="checkbox" 
                           id="category_${category.id}" 
                           name="categoryGroups" 
                           value="${category.id}" 
                           class="category-checkbox text-indigo-600 mt-1 mr-3"
                           onchange="toggleCategoryServices('${category.id}')">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <i class="${category.icon} text-indigo-600 mr-2"></i>
                            <span class="font-semibold text-gray-900">${category.name}</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-3">${category.description}</p>
                        <button type="button" 
                                class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                                onclick="toggleServicesList('${category.id}')">
                            <span class="toggle-text">Show specific services</span>
                            <i class="fas fa-chevron-down ml-1 toggle-icon transition-transform"></i>
                        </button>
                    </div>
                </label>
            </div>
            
            <div class="services-list hidden" id="services_${category.id}">
                <div class="ml-6 mt-3 border-l-2 border-gray-200 pl-4">
                    <p class="text-sm font-medium text-gray-700 mb-2">Specific services:</p>
                    <div class="grid grid-cols-1 gap-2">
                        ${category.services.map(service => `
                            <label class="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input type="checkbox" 
                                       name="specificServices" 
                                       value="${category.id}:${service}" 
                                       class="service-checkbox text-indigo-600 mr-2"
                                       onchange="updateCategoryState('${category.id}')">
                                <span class="text-gray-700">${service}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        grid.appendChild(categoryDiv);
    });
}

/**
 * Toggle services list visibility for a category
 */
function toggleServicesList(categoryId) {
    const servicesList = document.getElementById(`services_${categoryId}`);
    const toggleIcon = servicesList.previousElementSibling.querySelector('.toggle-icon');
    const toggleText = servicesList.previousElementSibling.querySelector('.toggle-text');
    
    if (servicesList.classList.contains('hidden')) {
        servicesList.classList.remove('hidden');
        toggleIcon.style.transform = 'rotate(180deg)';
        toggleText.textContent = 'Hide specific services';
    } else {
        servicesList.classList.add('hidden');
        toggleIcon.style.transform = 'rotate(0deg)';
        toggleText.textContent = 'Show specific services';
    }
}

/**
 * Toggle all services in a category when the main checkbox is clicked
 */
function toggleCategoryServices(categoryId) {
    const categoryCheckbox = document.getElementById(`category_${categoryId}`);
    const serviceCheckboxes = document.querySelectorAll(`input[value^="${categoryId}:"]`);
    
    serviceCheckboxes.forEach(checkbox => {
        checkbox.checked = categoryCheckbox.checked;
    });
    
    // If category is checked, expand the services list
    if (categoryCheckbox.checked) {
        const servicesList = document.getElementById(`services_${categoryId}`);
        if (servicesList.classList.contains('hidden')) {
            toggleServicesList(categoryId);
        }
    }
    
    updateServiceValidation();
}

/**
 * Update category checkbox state based on selected services
 */
function updateCategoryState(categoryId) {
    const categoryCheckbox = document.getElementById(`category_${categoryId}`);
    const serviceCheckboxes = document.querySelectorAll(`input[value^="${categoryId}:"]`);
    const checkedServices = document.querySelectorAll(`input[value^="${categoryId}:"]:checked`);
    
    if (checkedServices.length === 0) {
        // No services selected
        categoryCheckbox.checked = false;
        categoryCheckbox.indeterminate = false;
    } else if (checkedServices.length === serviceCheckboxes.length) {
        // All services selected
        categoryCheckbox.checked = true;
        categoryCheckbox.indeterminate = false;
    } else {
        // Some services selected
        categoryCheckbox.checked = false;
        categoryCheckbox.indeterminate = true;
    }
    
    updateServiceValidation();
}

/**
 * Update service selection validation state
 */
function updateServiceValidation() {
    const selectedCategories = document.querySelectorAll('input[name="categoryGroups"]:checked');
    const selectedServices = document.querySelectorAll('input[name="specificServices"]:checked');
    const hasSelection = selectedCategories.length > 0 || selectedServices.length > 0;
    
    // Update visual feedback
    const serviceSection = document.getElementById('section2');
    const serviceGrid = document.getElementById('serviceCategoriesGrid');
    
    if (hasSelection) {
        serviceGrid.classList.remove('border-red-300', 'bg-red-50');
        serviceGrid.classList.add('border-green-300', 'bg-green-50');
    } else {
        serviceGrid.classList.remove('border-green-300', 'bg-green-50');
    }
    
    // Update selection summary
    const summaryDiv = document.getElementById('selectionSummary');
    const summaryContent = document.getElementById('summaryContent');
    
    if (hasSelection) {
        let summaryText = '';
        
        if (selectedCategories.length > 0) {
            summaryText += '<div class="mb-1"><strong>Full Categories:</strong> ';
            const categoryNames = [];
            selectedCategories.forEach(checkbox => {
                if (!checkbox.indeterminate) {
                    const category = serviceCategories[checkbox.value];
                    if (category) categoryNames.push(category.name);
                }
            });
            summaryText += categoryNames.join(', ') + '</div>';
        }
        
        if (selectedServices.length > 0) {
            summaryText += '<div><strong>Specific Services:</strong> ';
            const serviceNames = [];
            selectedServices.forEach(checkbox => {
                const serviceName = checkbox.value.split(':')[1];
                serviceNames.push(serviceName);
            });
            summaryText += serviceNames.join(', ') + '</div>';
        }
        
        summaryContent.innerHTML = summaryText;
        summaryDiv.classList.remove('hidden');
    } else {
        summaryDiv.classList.add('hidden');
    }
}

/**
 * Get selected services for form submission
 */
function getSelectedServices() {
    const selectedData = {
        categories: [],
        specificServices: []
    };
    
    // Get selected category groups
    document.querySelectorAll('input[name="categoryGroups"]:checked').forEach(checkbox => {
        if (!checkbox.indeterminate) { // Only full category selections
            selectedData.categories.push(checkbox.value);
        }
    });
    
    // Get specific services
    document.querySelectorAll('input[name="specificServices"]:checked').forEach(checkbox => {
        selectedData.specificServices.push(checkbox.value);
    });
    
    return selectedData;
}

/**
 * Setup rate preview functionality
 */
function setupRatePreview() {
    const minRateInput = document.getElementById('minRate');
    const maxRateInput = document.getElementById('maxRate');
    const preview = document.getElementById('ratePreview');
    
    function updatePreview() {
        const min = minRateInput.value || 'XXX';
        const max = maxRateInput.value || 'XXX';
        preview.textContent = `${min} - ${max}`;
    }
    
    minRateInput.addEventListener('input', updatePreview);
    maxRateInput.addEventListener('input', updatePreview);
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const form = document.getElementById('providerSignupForm');
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Navigate to next step
 */
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            // Hide current step
            document.getElementById(`section${currentStep}`).classList.remove('active');
            document.getElementById(`step${currentStep}`).classList.remove('active');
            document.getElementById(`step${currentStep}`).classList.add('completed');
            
            // Show next step
            currentStep++;
            document.getElementById(`section${currentStep}`).classList.add('active');
            document.getElementById(`step${currentStep}`).classList.add('active');
            
            // Update progress bar
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progressBar').style.width = `${progress}%`;
            
            // Update step labels
            updateStepLabels();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

/**
 * Navigate to previous step
 */
function prevStep() {
    if (currentStep > 1) {
        // Hide current step
        document.getElementById(`section${currentStep}`).classList.remove('active');
        document.getElementById(`step${currentStep}`).classList.remove('active');
        
        // Show previous step
        currentStep--;
        document.getElementById(`section${currentStep}`).classList.add('active');
        document.getElementById(`step${currentStep}`).classList.add('active');
        document.getElementById(`step${currentStep}`).classList.remove('completed');
        
        // Update progress bar
        const progress = (currentStep / totalSteps) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        
        // Update step labels
        updateStepLabels();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Update step label colors based on current state
 */
function updateStepLabels() {
    for (let i = 1; i <= totalSteps; i++) {
        const stepElement = document.getElementById(`step${i}`);
        const stepLabel = stepElement.nextElementSibling;
        
        if (i < currentStep) {
            // Completed step
            stepLabel.classList.remove('text-gray-600');
            stepLabel.classList.add('text-green-700', 'font-medium');
        } else if (i === currentStep) {
            // Current step
            stepLabel.classList.remove('text-gray-600');
            stepLabel.classList.add('text-gray-900', 'font-medium');
        } else {
            // Future step
            stepLabel.classList.remove('text-green-700', 'text-gray-900', 'font-medium');
            stepLabel.classList.add('text-gray-600');
        }
    }
}

/**
 * Validate current step
 */
function validateCurrentStep() {
    const currentSection = document.getElementById(`section${currentStep}`);
    const requiredInputs = currentSection.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    // Reset previous error states
    currentSection.querySelectorAll('.border-red-500').forEach(el => {
        el.classList.remove('border-red-500');
        el.classList.add('border-gray-300');
    });
    
    // Validate required fields
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.remove('border-gray-300');
            input.classList.add('border-red-500');
            isValid = false;
        }
    });
    
    // Step-specific validations
    if (currentStep === 1) {
        // Validate email format
        const email = document.getElementById('email');
        if (email.value && !isValidEmail(email.value)) {
            email.classList.remove('border-gray-300');
            email.classList.add('border-red-500');
            showError('Please enter a valid email address');
            isValid = false;
        }
        
        // Validate phone format
        const phone = document.getElementById('phone');
        if (phone.value && !isValidKenyanPhone(phone.value)) {
            phone.classList.remove('border-gray-300');
            phone.classList.add('border-red-500');
            showError('Please enter a valid Kenyan phone number');
            isValid = false;
        }
    } else if (currentStep === 2) {
        // Validate at least one service category or specific service is selected
        const selectedCategories = currentSection.querySelectorAll('input[name="categoryGroups"]:checked');
        const selectedServices = currentSection.querySelectorAll('input[name="specificServices"]:checked');
        
        if (selectedCategories.length === 0 && selectedServices.length === 0) {
            showError('Please select at least one service category or specific service');
            isValid = false;
            
            // Highlight the services grid
            const serviceGrid = document.getElementById('serviceCategoriesGrid');
            serviceGrid.classList.add('border-red-300', 'bg-red-50');
        } else {
            // Remove error styling
            const serviceGrid = document.getElementById('serviceCategoriesGrid');
            serviceGrid.classList.remove('border-red-300', 'bg-red-50');
        }
        
        // Validate response time is selected
        const responseTime = currentSection.querySelector('input[name="responseTime"]:checked');
        if (!responseTime) {
            showError('Please select your typical response time');
            isValid = false;
        }
    } else if (currentStep === 3) {
        // Enhanced location validation
        isValid = validateLocationStep();
    } else if (currentStep === 4) {
        // Validate rate range
        const minRate = parseInt(document.getElementById('minRate').value);
        const maxRate = parseInt(document.getElementById('maxRate').value);
        
        if (minRate && maxRate && minRate >= maxRate) {
            showError('Maximum rate must be higher than minimum rate');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Final validation
    if (!validateCurrentStep()) {
        return;
    }
    
    // Collect form data
    const formData = new FormData(document.getElementById('providerSignupForm'));
    
    // Add location data
    formData.append('latitude', document.getElementById('latitude').value);
    formData.append('longitude', document.getElementById('longitude').value);
    formData.append('fullAddress', document.getElementById('fullAddress').value);
    
    // Get selected service categories and specific services
    const serviceSelections = getSelectedServices();
    formData.append('selectedCategories', JSON.stringify(serviceSelections.categories));
    formData.append('selectedServices', JSON.stringify(serviceSelections.specificServices));
    
    // Debug: Log form data
    console.log('Form data being submitted:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    
    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...';
    submitButton.disabled = true;
    
    // Submit form
    submitProviderApplication(formData)
        .then(response => {
            // Clear saved form state on successful submission
            clearFormState();
            
            // Clear auto-save timer
            if (autoSaveTimer) {
                clearInterval(autoSaveTimer);
            }
            
            // Handle user account transition
            if (response.user_transition && response.user_data) {
                // Update local session/auth data
                updateUserSession(response.user_data);
                
                // Show transition success message
                showTransitionSuccess(response.redirect_to);
            } else {
                // Show regular success modal
                document.getElementById('successModal').classList.remove('hidden');
            }
        })
        .catch(error => {
            // Reset button and show specific error
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show specific error message from backend or generic error
            const errorMessage = error.message || 'Failed to submit application. Please try again.';
            showError(`Submission failed: ${errorMessage}`);
            console.error('Submission error:', error);
        });
}

/**
 * Submit provider application to backend
 */
async function submitProviderApplication(formData) {
    try {
        const response = await fetch('/api/provider/apply', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            // Get detailed error information for 422 validation errors
            let errorMessage = 'An error occurred while submitting your application.';
            
            try {
                const errorData = await response.json();
                console.error('Server error response:', errorData);
                
                if (response.status === 422 && errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        // FastAPI validation errors
                        const validationErrors = errorData.detail.map(err => {
                            const field = err.loc ? err.loc.join('.') : 'unknown field';
                            return `${field}: ${err.msg}`;
                        }).join('\n');
                        errorMessage = `Validation errors:\n${validationErrors}`;
                    } else {
                        errorMessage = errorData.detail;
                    }
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (parseError) {
                console.error('Could not parse error response:', parseError);
                errorMessage = `HTTP error! status: ${response.status}`;
            }
            
            throw new Error(errorMessage);
        }
        
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Submission error:', error);
        throw error;
    }
}

/**
 * Update user session data after account transition
 */
function updateUserSession(userData) {
    try {
        console.log('Updating user session with data:', userData);
        
        // Update localStorage if it exists
        const existingAuth = localStorage.getItem('authToken');
        if (existingAuth) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        // Update sessionStorage if it exists
        const existingSession = sessionStorage.getItem('currentUser');
        if (existingSession) {
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        // Update global variables from globals.js
        if (typeof currentUser !== 'undefined') {
            currentUser = userData;
        }
        
        // Refresh global auth state if the function exists
        if (typeof refreshAuthState === 'function') {
            refreshAuthState();
        }
        
        // Refresh the authentication UI if the function exists
        if (typeof initializeAuth === 'function') {
            initializeAuth();
        }
        
        console.log('User session updated for provider transition');
    } catch (error) {
        console.error('Error updating user session:', error);
    }
}

/**
 * Show transition success message and redirect
 */
function showTransitionSuccess(redirectTo) {
    // Create custom success modal for account transition
    const transitionModal = document.createElement('div');
    transitionModal.id = 'transitionModal';
    transitionModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50';
    transitionModal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
                <div class="mb-6">
                    <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-check text-green-600 text-2xl"></i>
                    </div>
                </div>
                <h3 class="text-2xl font-semibold text-gray-900 mb-4">Account Upgraded to Provider!</h3>
                <div class="text-left bg-gray-50 p-4 rounded-lg mb-6">
                    <p class="text-sm text-gray-700 mb-2"><strong>What just happened:</strong></p>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>• Your provider application was submitted successfully</li>
                        <li>• Your account type has been upgraded to "Provider"</li>
                        <li>• Your login credentials remain the same</li>
                        <li>• You now have access to the provider dashboard</li>
                    </ul>
                </div>
                <p class="text-gray-600 mb-6">
                    You can now manage your services, view client requests, and grow your business through our platform.
                </p>
                <div class="space-y-3">
                    <button onclick="window.location.href='${redirectTo}'" 
                            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        <i class="fas fa-tachometer-alt mr-2"></i>
                        Go to Provider Dashboard
                    </button>
                    <button onclick="window.location.href='/'" 
                            class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
                        <i class="fas fa-home mr-2"></i>
                        Return to Home
                    </button>
                </div>
                <p class="text-xs text-gray-500 mt-4">
                    Redirecting automatically in <span id="countdown">10</span> seconds...
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(transitionModal);
    
    // Countdown timer
    let countdown = 10;
    const countdownElement = document.getElementById('countdown');
    const countdownTimer = setInterval(() => {
        countdown--;
        if (countdownElement) {
            countdownElement.textContent = countdown;
        }
        if (countdown <= 0) {
            clearInterval(countdownTimer);
            if (document.getElementById('transitionModal')) {
                window.location.href = redirectTo;
            }
        }
    }, 1000);
}

/**
 * Enhanced location step validation
 */
function validateLocationStep() {
    let isValid = true;
    const errors = [];
    
    // Validate administrative hierarchy
    const county = document.getElementById('county');
    const subCounty = document.getElementById('subCounty');
    const ward = document.getElementById('ward');
    
    if (!county.value) {
        county.classList.add('location-validation-error');
        errors.push('Please select a county');
        isValid = false;
    } else {
        county.classList.remove('location-validation-error');
        county.classList.add('location-validation-success');
    }
    
    if (!subCounty.value) {
        subCounty.classList.add('location-validation-error');
        errors.push('Please select a sub-county');
        isValid = false;
    } else {
        subCounty.classList.remove('location-validation-error');
        subCounty.classList.add('location-validation-success');
    }
    
    if (!ward.value) {
        ward.classList.add('location-validation-error');
        errors.push('Please select a ward');
        isValid = false;
    } else {
        ward.classList.remove('location-validation-error');
        ward.classList.add('location-validation-success');
    }
    
    // Validate map location selection - only if Google Maps is available
    const mapsAvailable = document.getElementById('mapsAvailable');
    const isMapsEnabled = !mapsAvailable.classList.contains('hidden');
    
    if (isMapsEnabled) {
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        
        if (!latitude || !longitude) {
            errors.push('Please select your exact location on the map by clicking or searching, or use the manual address entry');
            // Note: Not marking as invalid since manual address is also acceptable
            
            // Highlight map container
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer) {
                mapContainer.style.borderColor = '#F59E0B';
                mapContainer.style.backgroundColor = '#FFFBEB';
            }
        } else {
            // Validate coordinates are within Kenya bounds
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            
            if (lat < -4.7 || lat > 5.5 || lng < 33.9 || lng > 41.9) {
                errors.push('Selected location appears to be outside Kenya. Please select a location within Kenya.');
                isValid = false;
            } else {
                // Location is valid
                const mapContainer = document.querySelector('.map-container');
                if (mapContainer) {
                    mapContainer.style.borderColor = '#10B981';
                    mapContainer.style.backgroundColor = '#F0FDF4';
                }
            }
        }
    } else {
        // Maps not available - check if manual address is provided
        const manualAddress = document.getElementById('manualAddress');
        if (manualAddress && manualAddress.value.trim()) {
            // Manual address provided, that's sufficient
            console.log('Using manual address:', manualAddress.value);
        }
    }
    
    // Validate service radius
    const serviceRadius = document.getElementById('serviceRadius').value;
    if (!serviceRadius) {
        errors.push('Please select your service coverage radius');
        isValid = false;
    }
    
    // Show consolidated error message if validation fails
    if (!isValid) {
        const errorMessage = errors.join('\n• ');
        showError('Please complete the location information:\n• ' + errorMessage);
    } else {
        hideError();
        // Show success message
        showSuccess('Location information validated successfully!');
    }
    
    return isValid;
}

/**
 * Validate the selected location
 */
function validateSelectedLocation(location) {
    const lat = location.lat();
    const lng = location.lng();
    
    // Check if location is within Kenya bounds
    if (lat < -4.7 || lat > 5.5 || lng < 33.9 || lng > 41.9) {
        showLocationWarning('The selected location appears to be outside Kenya. Please select a location within Kenya.');
        locationValidated = false;
        
        // Style map container with warning
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.borderColor = '#F59E0B';
            mapContainer.style.backgroundColor = '#FFFBEB';
        }
    } else {
        hideLocationWarning();
        locationValidated = true;
    }
}

/**
 * Show error message to user
 */
function showError(message) {
    // Remove any existing error messages
    hideError();
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.id = 'errorMessage';
    errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 max-w-md';
    errorDiv.innerHTML = `
        <div class="flex items-start">
            <i class="fas fa-exclamation-triangle text-red-600 mr-2 mt-0.5"></i>
            <div class="flex-1">
                <p class="font-medium">Error</p>
                <p class="text-sm">${message}</p>
            </div>
            <button onclick="hideError()" class="ml-2 text-red-700 hover:text-red-900">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(hideError, 5000);
}

/**
 * Hide error message
 */
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Show success message to user
 */
function showSuccess(message) {
    // Remove any existing success messages
    hideSuccess();
    
    // Create success element
    const successDiv = document.createElement('div');
    successDiv.id = 'successMessage';
    successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 max-w-md';
    successDiv.innerHTML = `
        <div class="flex items-start">
            <i class="fas fa-check-circle text-green-600 mr-2 mt-0.5"></i>
            <div class="flex-1">
                <p class="font-medium">Success</p>
                <p class="text-sm">${message}</p>
            </div>
            <button onclick="hideSuccess()" class="ml-2 text-green-700 hover:text-green-900">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto-hide after 3 seconds
    setTimeout(hideSuccess, 3000);
}

/**
 * Hide success message
 */
function hideSuccess() {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.remove();
    }
}

/**
 * Show save indicator
 */
function showSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'saveIndicator';
    indicator.className = 'fixed bottom-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded shadow-lg z-40';
    indicator.innerHTML = '<i class="fas fa-save mr-2"></i>Progress saved';
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        const elem = document.getElementById('saveIndicator');
        if (elem) elem.remove();
    }, 2000);
}

/**
 * Reset form confirmation dialog
 */
function resetForm() {
    if (confirm('Are you sure you want to reset the form? This will clear all your progress.')) {
        // Clear all saved form state
        clearFormState();
        
        // Also clear any sessionStorage that might be related
        try {
            sessionStorage.removeItem(FORM_STATE_KEY);
            sessionStorage.removeItem(STEP_STATE_KEY);
            // Clear any other related storage keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('provider') || key.includes('signup')) {
                    localStorage.removeItem(key);
                }
            }
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.includes('provider') || key.includes('signup')) {
                    sessionStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error('Error clearing additional storage:', error);
        }
        
        // Clear auto-save timer if running
        if (window.autoSaveTimer) {
            clearInterval(window.autoSaveTimer);
        }
        
        // Reset all form fields to defaults
        resetAllFormFields();
        
        // Reset to step 1
        currentStep = 1;
        
        // Reload the page to ensure clean state
        location.reload();
    }
}

/**
 * Email validation function
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Kenyan phone validation function
 */
function isValidKenyanPhone(phone) {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check for valid Kenyan phone patterns
    const kenyaPatterns = [
        /^254[17]\d{8}$/, // +254 7XX XXX XXX or +254 1XX XXX XXX
        /^07\d{8}$/,      // 07XX XXX XXX
        /^01\d{8}$/       // 01XX XXX XXX (landlines)
    ];
    
    return kenyaPatterns.some(pattern => pattern.test(cleanPhone));
}

/**
 * Setup auto-save functionality
 */
function setupAutoSave() {
    const form = document.getElementById('providerSignupForm');
    
    // Save form state on input changes
    form.addEventListener('input', debounce(saveFormState, 1000));
    form.addEventListener('change', saveFormState);
    
    // Save form state when navigating between steps
    window.addEventListener('beforeunload', saveFormState);
    
    // Start auto-save timer
    autoSaveTimer = setInterval(saveFormState, 30000); // Save every 30 seconds
}

/**
 * Debounce function to limit how often saveFormState is called
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Save current form state to localStorage
 */
function saveFormState() {
    try {
        const formData = {};
        const form = document.getElementById('providerSignupForm');
        
        // Save all input fields
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.checked) {
                    // For checkboxes, we handle them separately in service selections
                    // Only save non-service checkboxes here
                    if (!input.name.includes('service') && !input.name.includes('category')) {
                        formData[input.name] = input.checked;
                    }
                }
            } else if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else if (input.value) {
                formData[input.name] = input.value;
            }
        });
        
        // Save selected service categories and specific services
        const serviceSelections = getSelectedServices();
        formData.selectedCategories = serviceSelections.categories;
        formData.selectedServices = serviceSelections.specificServices;
        
        // Save current step
        localStorage.setItem(STEP_STATE_KEY, currentStep.toString());
        localStorage.setItem(FORM_STATE_KEY, JSON.stringify(formData));
        
        // Show save indicator
        showSaveIndicator();
        
        console.log('Form state saved successfully');
    } catch (error) {
        console.error('Error saving form state:', error);
    }
}

/**
 * Restore form state from localStorage
 */
function restoreFormState() {
    try {
        const savedState = localStorage.getItem(FORM_STATE_KEY);
        const savedStep = localStorage.getItem(STEP_STATE_KEY);
        
        if (!savedState) {
            return; // No saved state
        }
        
        const formData = JSON.parse(savedState);
        
        // Restore input values
        Object.keys(formData).forEach(key => {
            if (key === 'selectedCategories') {
                // Handle selected category groups
                setTimeout(() => {
                    formData[key].forEach(categoryValue => {
                        const checkbox = document.querySelector(`input[name="categoryGroups"][value="${categoryValue}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                            toggleCategoryServices(categoryValue);
                        }
                    });
                }, 500); // Wait for categories to load
                return;
            }
            
            if (key === 'selectedServices') {
                // Handle specific services
                setTimeout(() => {
                    formData[key].forEach(serviceValue => {
                        const checkbox = document.querySelector(`input[name="specificServices"][value="${serviceValue}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                            // Update category state based on selected services
                            const categoryId = serviceValue.split(':')[0];
                            updateCategoryState(categoryId);
                        }
                    });
                }, 500); // Wait for services to load
                return;
            }
            
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                // Skip readonly fields (user info that's autofilled)
                if (field.readOnly) {
                    return;
                }
                
                if (field.type === 'checkbox') {
                    field.checked = formData[key];
                } else if (field.type === 'radio') {
                    // For radio buttons, find the one with the matching value
                    const radioButton = document.querySelector(`input[name="${key}"][value="${formData[key]}"]`);
                    if (radioButton) {
                        radioButton.checked = true;
                    }
                } else {
                    field.value = formData[key];
                    
                    // Trigger change events for dependent fields
                    if (field.onchange) {
                        field.onchange();
                    }
                }
            }
        });
        
        // Restore current step
        if (savedStep && parseInt(savedStep) > 1) {
            const stepToRestore = parseInt(savedStep);
            
            // Hide current step
            document.getElementById('section1').classList.remove('active');
            
            // Update step indicators
            for (let i = 1; i < stepToRestore; i++) {
                document.getElementById(`step${i}`).classList.remove('active');
                document.getElementById(`step${i}`).classList.add('completed');
            }
            
            // Show restored step
            currentStep = stepToRestore;
            document.getElementById(`section${currentStep}`).classList.add('active');
            document.getElementById(`step${currentStep}`).classList.add('active');
            
            // Update progress bar
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progressBar').style.width = `${progress}%`;
            
            updateStepLabels();
            
            // Show restoration message
            showRestorationMessage();
        }
        
        // Restore map location if available
        setTimeout(() => {
            const latitude = formData.latitude;
            const longitude = formData.longitude;
            if (latitude && longitude && window.google && map) {
                const location = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));
                setLocationOnMap(location, formData.fullAddress);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error restoring form state:', error);
        // Clear corrupted data
        clearFormState();
    }
}

/**
 * Clear saved form state
 */
function clearFormState() {
    try {
        localStorage.removeItem(FORM_STATE_KEY);
        localStorage.removeItem(STEP_STATE_KEY);
        console.log('Form state cleared');
    } catch (error) {
        console.error('Error clearing form state:', error);
    }
}

/**
 * Reset all form fields to their default values
 */
function resetAllFormFields() {
    try {
        // Clear all text inputs, emails, textareas (except readonly ones)
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
        inputs.forEach(input => {
            // Don't reset readonly fields (user info)
            if (!input.readOnly) {
                input.value = '';
                input.classList.remove('border-green-500', 'border-red-500');
            }
        });
        
        // Clear all number inputs
        const numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.value = '';
            input.classList.remove('border-green-500', 'border-red-500');
        });
        
        // Reset all select dropdowns
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0;
            select.classList.remove('border-green-500', 'border-red-500');
        });
        
        // Clear all checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear service selection
        const serviceCategories = document.querySelectorAll('.service-category-item');
        serviceCategories.forEach(item => {
            item.classList.remove('selected');
        });
        
        // Clear location validation states
        locationSelected = false;
        locationValidated = false;
        
        // Clear map marker if it exists
        if (window.marker && window.map) {
            marker.setMap(null);
            marker = null;
        }
        
        // Clear any error/success messages
        const messages = document.querySelectorAll('.error-message, .success-message, .text-red-500, .text-green-500');
        messages.forEach(msg => msg.remove());
        
        // Reset step indicators
        for (let i = 1; i <= totalSteps; i++) {
            const stepIndicator = document.getElementById(`step${i}`);
            if (stepIndicator) {
                stepIndicator.classList.remove('active', 'completed');
                if (i === 1) {
                    stepIndicator.classList.add('active');
                }
            }
            
            const section = document.getElementById(`section${i}`);
            if (section) {
                section.classList.remove('active');
                if (i === 1) {
                    section.classList.add('active');
                }
            }
        }
        
        // Reset progress bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = '25%'; // Step 1 of 4
        }
        
        // Clear summary sections
        const summaryContent = document.querySelector('.summary-content');
        if (summaryContent) {
            summaryContent.innerHTML = '';
        }
        
        console.log('All form fields reset (except readonly user info)');
    } catch (error) {
        console.error('Error resetting form fields:', error);
    }
}

/**
 * Show restoration message
 */
function showRestorationMessage() {
    const message = document.createElement('div');
    message.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    message.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-info-circle mr-3"></i>
            <div>
                <div class="font-medium">Form Progress Restored</div>
                <div class="text-sm opacity-90">Your previous progress has been restored</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    document.body.appendChild(message);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 5000);
}

/**
 * Show a message to the user
 * @param {string} text - The message text
 * @param {string} type - Message type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
function showMessage(text, type = 'info', duration = 5000) {
    const typeConfig = {
        success: { bg: 'bg-green-500', icon: 'fas fa-check-circle' },
        error: { bg: 'bg-red-500', icon: 'fas fa-exclamation-circle' },
        warning: { bg: 'bg-orange-500', icon: 'fas fa-exclamation-triangle' },
        info: { bg: 'bg-blue-500', icon: 'fas fa-info-circle' }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    const message = document.createElement('div');
    message.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${config.bg} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    message.innerHTML = `
        <div class="flex items-center">
            <i class="${config.icon} mr-3"></i>
            <div>
                <div class="font-medium">${text}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    document.body.appendChild(message);
    
    // Auto-remove after specified duration
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, duration);
}

/**
 * Show professional message when user is already a provider
 */
function showAlreadyProviderMessage() {
    document.body.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div class="sm:mx-auto sm:w-full sm:max-w-md">
                <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div class="text-center">
                        <i class="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Already a Provider!</h2>
                        <p class="text-gray-600 mb-6">
                            You're already registered as a service provider on our platform.
                        </p>
                        
                        <div class="space-y-3">
                            <button onclick="window.location.href='/provider-dashboard'" 
                                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <i class="fas fa-tachometer-alt mr-2"></i>
                                Go to Your Dashboard
                            </button>
                            
                            <button onclick="window.location.href='/'" 
                                    class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <i class="fas fa-home mr-2"></i>
                                Back to Home
                            </button>
                        </div>
                        
                        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p class="text-xs text-gray-600">
                                <strong>Need multiple service profiles?</strong><br>
                                We're working on allowing providers to create multiple business profiles under one account. 
                                For now, you can add different service categories in your dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
