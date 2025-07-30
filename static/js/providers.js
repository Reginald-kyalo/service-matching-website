/**
 * Providers module
 * Handles provider search, filtering, display, and interaction
 */
import { isAuthenticated, storePendingServiceSearch } from "./auth.js";
import { getCurrentSessionId, setCurrentSessionId } from "./globals.js"; 

/**
 * Find service providers based on detection result
 * @param {Object} detectionResult - The problem detection result
 */
export async function findServiceProviders(detectionResult) {
    // Check if user is authenticated first
    if (!isAuthenticated()) {
        // Store the search data for after authentication
        const searchData = {
            detectionResult: detectionResult,
            description: document.getElementById('problemDescription').value.trim(),
            category: document.getElementById('selectedCategory').value,
            sessionId: getCurrentSessionId() || null
        };
        storePendingServiceSearch(searchData);
        showLoginModal();
        return;
    }
    
    try {
        const response = await fetch('/api/matching/find-providers', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                category: detectionResult.final_category,
                max_distance: 50.0,
                min_rating: 0.0
            })
        });
        
        if (!response.ok) {
            if (response.status === 400) {
                const error = await response.json();
                alert(error.detail);
                return;
            }
            if (response.status === 401 || response.status === 403) {
                showLoginModal();
                return;
            }
            throw new Error('Failed to find providers');
        }
        
        const providers = await response.json();
        currentProviders = providers;
        displayProviderResults(detectionResult, providers);
        
    } catch (error) {
        console.error('Error finding providers:', error);
        alert('Sorry, there was an error finding service providers. Please try again.');
    }
}

/**
 * Display provider results with filtering and chat
 * @param {Object} detectionResult - The detection result
 * @param {Array} providers - Array of provider objects
 */
function displayProviderResults(detectionResult, providers) {
    const resultsHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8">
            <!-- Header with back button -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <button onclick="goBackToCategories()" class="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Back to Categories
                    </button>
                    <h2 class="text-3xl font-extrabold text-gray-900">Professionals Found</h2>
                    <p class="mt-2 text-lg text-gray-600">Category: <span class="font-semibold capitalize">${detectionResult.final_category.replace('_', ' ')}</span></p>
                    <p class="text-sm text-gray-500">${providers.length} professionals in your area</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500">Session: ${detectionResult.session_id.slice(0, 8)}</p>
                    <p class="text-sm text-gray-500">Priority: ${detectionResult.urgency_level}</p>
                </div>
            </div>
            
            <!-- Filters -->
            ${renderFiltersSection()}
            
            <!-- Providers Grid -->
            <div id="providersGrid" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                ${renderProfessionalCards(providers)}
            </div>
            
            <!-- Next Steps -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-blue-900 mb-3">Next Steps</h4>
                <ul class="space-y-2">
                    ${detectionResult.next_steps.map(step => 
                        `<li class="flex items-start">
                            <i class="fas fa-chevron-right text-blue-600 mr-2 mt-1"></i>
                            <span class="text-blue-800">${step}</span>
                        </li>`
                    ).join('')}
                </ul>
            </div>
        </div>
    `;
    
    // Show results in the dedicated results section
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.innerHTML = resultsHTML;
        resultsSection.classList.remove('hidden');
        
        // Hide the form section
        const formContainer = document.querySelector('#pageContent .max-w-4xl');
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        
        // Scroll to the results section
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        console.error('Results section not found');
    }
}

/**
 * Render the filters section
 * @returns {string} HTML for filters section
 */
function renderFiltersSection() {
    return `
        <div class="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Filter Results</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max Distance</label>
                    <select id="distanceFilter" onchange="applyFilters()" class="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="50">Any distance</option>
                        <option value="5">Within 5 miles</option>
                        <option value="10">Within 10 miles</option>
                        <option value="25">Within 25 miles</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                    <select id="ratingFilter" onchange="applyFilters()" class="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="0">Any rating</option>
                        <option value="3">3+ stars</option>
                        <option value="4">4+ stars</option>
                        <option value="4.5">4.5+ stars</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max Rate</label>
                    <select id="rateFilter" onchange="applyFilters()" class="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="">Any rate</option>
                        <option value="50">Under $50/hr</option>
                        <option value="100">Under $100/hr</option>
                        <option value="150">Under $150/hr</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select id="sortFilter" onchange="applySorting()" class="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="distance">Distance</option>
                        <option value="rating">Rating</option>
                        <option value="rate">Rate (Low to High)</option>
                        <option value="reviews">Most Reviewed</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render professional cards
 * @param {Array} providers - Array of provider objects
 * @returns {string} HTML for provider cards
 */
function renderProfessionalCards(providers) {
    return providers.map(provider => `
        <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h4 class="text-lg font-semibold text-gray-900">${provider.name}</h4>
                    <p class="text-sm text-gray-600">${provider.business_name}</p>
                </div>
                <div class="flex items-center">
                    <span class="text-yellow-400 mr-1">★</span>
                    <span class="text-sm font-medium text-gray-700">${provider.average_rating}</span>
                    <span class="text-xs text-gray-500 ml-1">(${provider.total_reviews})</span>
                </div>
            </div>
            
            <div class="space-y-2 mb-4">
                <p class="text-sm text-gray-600">
                    <i class="fas fa-map-marker-alt mr-2"></i>
                    ${formatDistance(provider.distance_km)} • ${provider.primary_location}
                </p>
                <p class="text-sm text-gray-600">
                    <i class="fas fa-clock mr-2"></i>
                    ${formatResponseTime(provider.response_time)}
                </p>
                <p class="text-sm text-gray-600">
                    <i class="fas fa-dollar-sign mr-2"></i>
                    KSH ${provider.hourly_rate_min}-${provider.hourly_rate_max}/hr
                </p>
            </div>
            
            <div class="mb-4">
                <p class="text-xs text-gray-500 mb-2">Specialties:</p>
                <div class="flex flex-wrap gap-1">
                    ${provider.specialties.slice(0, 3).map(specialty => 
                        `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            ${specialty}
                        </span>`
                    ).join('')}
                </div>
            </div>
            
            <div class="mb-4">
                <p class="text-sm text-gray-600 line-clamp-2">${provider.description}</p>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="callProvider('${provider.phone}', '${provider.name}')" 
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-phone mr-1"></i>
                    Call
                </button>
                <button onclick="openChatModal(${provider.id}, '${provider.name}')" 
                        class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-comment mr-1"></i>
                    Chat
                </button>
                <button onclick="rateProvider(${provider.id}, '${provider.name}')" 
                        class="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-star"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Go back to categories
 */
function goBackToCategories() {
    // Hide the results section
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
    
    // Show the form section again
    const formContainer = document.querySelector('#pageContent .max-w-4xl');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
    
    // Scroll back to the form
    const problemForm = document.getElementById('problemForm');
    if (problemForm) {
        problemForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Apply filters to provider list
 */
async function applyFilters() {
    if (!getCurrentSessionId() || !authToken) return;

    const maxDistance = parseFloat(document.getElementById('distanceFilter').value);
    const minRating = parseFloat(document.getElementById('ratingFilter').value);
    const maxRate = document.getElementById('rateFilter').value ? parseFloat(document.getElementById('rateFilter').value) : null;
    
    try {
        const response = await fetch('/api/matching/find-providers', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                category: selectedCategory,
                max_distance: maxDistance,
                min_rating: minRating,
                max_rate: maxRate
            })
        });
        
        if (response.ok) {
            const providers = await response.json();
            currentProviders = providers;
            applySorting();
        }
    } catch (error) {
        console.error('Error applying filters:', error);
    }
}

/**
 * Apply sorting to provider list
 */
function applySorting() {
    const sortBy = document.getElementById('sortFilter').value;
    
    let sortedProviders = [...currentProviders];
    
    switch (sortBy) {
        case 'distance':
            sortedProviders.sort((a, b) => a.distance_miles - b.distance_miles);
            break;
        case 'rating':
            sortedProviders.sort((a, b) => b.average_rating - a.average_rating);
            break;
        case 'rate':
            sortedProviders.sort((a, b) => a.hourly_rate_min - b.hourly_rate_min);
            break;
        case 'reviews':
            sortedProviders.sort((a, b) => b.total_reviews - a.total_reviews);
            break;
    }
    
    document.getElementById('providersGrid').innerHTML = renderProfessionalCards(sortedProviders);
}

/**
 * Call provider
 * @param {string} phone - Provider's phone number
 * @param {string} name - Provider's name
 */
function callProvider(phone, name) {
    if (confirm(`Call ${name} at ${phone}?`)) {
        window.open(`tel:${phone}`);
    }
}

/**
 * Execute pending service search after authentication
 */
export async function executePendingServiceSearch() {
    const searchData = getPendingServiceSearch();
    if (searchData && isAuthenticated()) {
        console.log('Executing pending service search:', searchData);
        
        // Restore form state
        if (searchData.description) {
            const textarea = document.getElementById('problemDescription');
            if (textarea) textarea.value = searchData.description;
        }
        
        if (searchData.category) {
            const categoryInput = document.getElementById('selectedCategory');
            if (categoryInput) categoryInput.value = searchData.category;
        }
        
        if (searchData.sessionId) {
            currentSessionId = setCurrentSessionId(searchData.sessionId);
        }
        
        // Execute the search
        await findServiceProviders(searchData.detectionResult);
        
        // Clear the pending search
        clearPendingServiceSearch();
    }
}

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
function formatDistance(distanceKm) {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)}m away`;
    }
    return `${distanceKm.toFixed(1)}km away`;
}

/**
 * Format response time for display
 * @param {string} responseTime - Response time code
 * @returns {string} Formatted response time string
 */
function formatResponseTime(responseTime) {
    switch (responseTime) {
        case 'same_day':
            return 'Same Day Response';
        case 'within_48h':
            return 'Within 2 Days';
        case 'within_week':
            return 'Within a Week';
        default:
            return 'Contact for Availability';
    }
}
