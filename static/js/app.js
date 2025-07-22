// Global variables
let currentSessionId = null;
let categoryGroups = {};
let selectedCategory = null;
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let currentProviders = [];
let currentChatProvider = null;

// DOM elements
const problemForm = document.getElementById('problemForm');
const analyzeBtn = document.getElementById('analyzeBtn');
const submitBtn = document.getElementById('submitBtn');
const aiResults = document.getElementById('aiResults');
const aiContent = document.getElementById('aiContent');
const categoryGroupsContainer = document.getElementById('categoryGroups');
const submitHelpText = document.getElementById('submitHelpText');
const authSection = document.getElementById('authSection');
const resultsSection = document.getElementById('resultsSection');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize immediately
    initializeAuth();
    loadCategories();
    problemForm.addEventListener('submit', handleProblemSubmission);
    
    // Add file input change handler
    const fileInput = document.getElementById('problemImages');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
});

// Initialize authentication state
function initializeAuth() {
    if (authToken && currentUser) {
        authSection.innerHTML = `
            <div class="flex items-center space-x-4">
                <span class="text-gray-700 text-sm">Welcome, ${currentUser.name}</span>
                <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Sign Out
                </button>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <button onclick="window.location.href='/login'" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Sign In
            </button>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    initializeAuth();
    // Refresh page to reset state
    window.location.reload();
}

// Load service categories
async function loadCategories() {
    try {
        const response = await fetch('/api/problems/categories');
        if (!response.ok) {
            throw new Error('Failed to load categories');
        }
        categoryGroups = await response.json();
        renderCategories();
        
        // Show content with fade-in effect and hide preloader
        showMainContent();
    } catch (error) {
        console.error('Error loading categories:', error);
        showErrorMessage('Failed to load service categories. Please refresh the page.');
        
        // Still show content even if categories fail to load
        showMainContent();
    }
}

// Show main content and hide preloader
function showMainContent() {
    const mainContent = document.getElementById('mainContent');
    const preloader = document.getElementById('pagePreloader');
    
    if (mainContent) {
        mainContent.classList.remove('content-loading');
        mainContent.classList.add('content-loaded');
    }
    
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 300);
    }
}

// Render category selection interface
function renderCategories() {
    let categoriesHTML = '';
    
    Object.entries(categoryGroups).forEach(([groupName, groupData]) => {
        const colorClasses = {
            blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
            green: 'border-green-200 bg-green-50 hover:bg-green-100', 
            purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
            orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100'
        };
        
        const bgClass = colorClasses[groupData.color] || 'border-gray-200 bg-gray-50 hover:bg-gray-100';
        
        categoriesHTML += `
            <div class="border-2 ${bgClass} rounded-xl p-6 transition-all duration-200">
                <div class="flex items-center mb-6">
                    <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-white shadow-sm mr-4">
                        <i class="${groupData.icon} text-2xl text-${groupData.color}-600"></i>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold text-gray-900">${groupName}</h4>
                        <p class="text-sm text-gray-600">${groupData.description}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${groupData.categories.map(category => `
                        <div class="category-option cursor-pointer p-4 border-2 border-transparent rounded-lg bg-white hover:border-${groupData.color}-400 hover:shadow-md transition-all duration-200 group"
                             onclick="selectCategory('${category.category}', '${category.name}', this)">
                            <div class="flex items-center">
                                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-${groupData.color}-100 mr-3 group-hover:bg-${groupData.color}-200 transition-colors duration-200">
                                    <i class="${category.icon} text-lg text-${groupData.color}-600"></i>
                                </div>
                                <div class="flex-1">
                                    <h5 class="font-semibold text-gray-900 group-hover:text-${groupData.color}-800">${category.name}</h5>
                                    <p class="text-xs text-gray-600 group-hover:text-gray-700">${category.description}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    // Hide loading state and show categories
    const loadingElement = document.getElementById('categoriesLoading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    categoryGroupsContainer.innerHTML = categoriesHTML;
}

// Add the missing showErrorMessage function
function showErrorMessage(message) {
    // Create or update error message display
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
        
        // Insert at the top of the form
        const form = document.getElementById('problemForm');
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            <span>${message}</span>
            <button onclick="hideErrorMessage()" class="ml-auto text-red-700 hover:text-red-900">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(hideErrorMessage, 5000);
}

function hideErrorMessage() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Analyze problem with AI
async function analyzeProblem() {
    const description = document.getElementById('problemDescription').value;
    
    if (!description.trim()) {
        showErrorMessage('Please describe your problem first.');
        return;
    }
    
    // Show loading state
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing...';
    analyzeBtn.disabled = true;
    
    try {
        const response = await fetch('/api/problems/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: description,
                selected_category: null, // Let AI suggest the category
                images: []
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
            throw new Error(errorData.detail || 'Failed to analyze problem');
        }
        
        const result = await response.json();
        currentSessionId = result.session_id;
        
        // Display AI results
        displayAIResults(result);
        
        // Highlight suggested category
        highlightSuggestedCategory(result.ai_suggested_category, result.confidence);
        
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage(error.message || 'Sorry, there was an error analyzing your problem. Please try again.');
    } finally {
        // Reset button
        analyzeBtn.innerHTML = '<i class="fas fa-brain mr-2"></i>Analyze with AI';
        analyzeBtn.disabled = false;
    }
}

// Display AI analysis results
function displayAIResults(result) {
    const confidencePercent = Math.round(result.confidence * 100);
    const confidenceColor = result.confidence > 0.7 ? 'text-green-600' : result.confidence > 0.4 ? 'text-yellow-600' : 'text-red-600';
    const confidenceBg = result.confidence > 0.7 ? 'bg-green-100' : result.confidence > 0.4 ? 'bg-yellow-100' : 'bg-red-100';
    
    const urgencyColors = {
        emergency: 'bg-red-100 text-red-800 border-red-200',
        high: 'bg-orange-100 text-orange-800 border-orange-200', 
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    aiContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="text-center p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                <div class="text-sm text-blue-700 mb-1">Suggested Category</div>
                <div class="text-xl font-bold text-blue-900 capitalize">${result.ai_suggested_category.replace('_', ' ')}</div>
            </div>
            <div class="text-center p-4 rounded-lg border-2 ${confidenceBg.replace('bg-', 'border-').replace('100', '200')} ${confidenceBg}">
                <div class="text-sm mb-1">Confidence Level</div>
                <div class="text-2xl font-bold ${confidenceColor}">${confidencePercent}%</div>
            </div>
        </div>
        
        <div class="flex items-center justify-center mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${urgencyColors[result.urgency_level] || urgencyColors.low}">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                ${result.urgency_level.charAt(0).toUpperCase() + result.urgency_level.slice(1)} Priority
            </span>
        </div>
        
        ${result.keywords_matched.length > 0 ? `
            <div class="mb-4">
                <h5 class="text-sm font-medium text-blue-900 mb-2 text-center">Keywords Detected</h5>
                <div class="flex flex-wrap gap-2 justify-center">
                    ${result.keywords_matched.map(keyword => 
                        `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${keyword.includes('EMERGENCY') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
                            ${keyword.replace('EMERGENCY: ', '')}
                        </span>`
                    ).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center justify-center text-sm text-blue-700">
                <i class="fas fa-lightbulb mr-2"></i>
                <span><strong>Tip:</strong> You can select this AI suggestion below or choose a different category</span>
            </div>
        </div>
    `;
    
    aiResults.classList.remove('hidden');
}

// Highlight the AI suggested category
function highlightSuggestedCategory(suggestedCategory, confidence) {
    // Remove any existing highlights
    document.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('border-blue-500', 'bg-blue-100', 'ai-suggested');
    });
    
    // Find and highlight the suggested category
    const suggestedElement = document.querySelector(`[onclick*="${suggestedCategory}"]`);
    if (suggestedElement) {
        suggestedElement.classList.add('border-blue-500', 'bg-blue-100', 'ai-suggested');
        
        // Add AI suggestion badge
        if (!suggestedElement.querySelector('.ai-badge')) {
            const badge = document.createElement('div');
            badge.className = 'ai-badge absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full';
            badge.innerHTML = `<i class="fas fa-robot mr-1"></i>AI Pick`;
            suggestedElement.style.position = 'relative';
            suggestedElement.appendChild(badge);
        }
        
        // Only scroll to suggested category if it's not already visible
        const rect = suggestedElement.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isVisible) {
            suggestedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Select a category
function selectCategory(categoryValue, categoryName, element) {
    // Remove selection from all options
    document.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('border-indigo-500', 'bg-indigo-50', 'selected', 'shadow-lg');
        option.style.transform = 'scale(1)';
    });
    
    // Add selection to clicked option with animation
    element.classList.add('border-indigo-500', 'bg-indigo-50', 'selected', 'shadow-lg');
    element.style.transform = 'scale(1.02)';
    
    // Store selected category
    selectedCategory = categoryValue;
    document.getElementById('selectedCategory').value = categoryValue;
    
    // Enable submit button with improved styling
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    submitBtn.classList.add('pulse-effect');
    
    // Update help text with success styling
    submitHelpText.innerHTML = `
        <div class="flex items-center justify-center text-green-600">
            <i class="fas fa-check-circle mr-2"></i>
            <strong>${categoryName}</strong> selected - Ready to find professionals!
        </div>
    `;
    submitHelpText.classList.remove('text-gray-500');
    submitHelpText.classList.add('text-green-600');
    
    // Only scroll to submit button if it's not visible
    setTimeout(() => {
        const rect = submitBtn.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isVisible) {
            submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        submitBtn.classList.remove('pulse-effect');
    }, 300);
}

// Handle problem submission
async function handleProblemSubmission(event) {
    event.preventDefault();
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Finding Professionals...';
    submitBtn.disabled = true;
    
    try {
        // Get form data
        const description = document.getElementById('problemDescription').value.trim();
        const category = document.getElementById('selectedCategory').value;
        
        if (!category) {
            throw new Error('Please select a service category');
        }
        
        // Get file input with correct ID
        const fileInput = document.getElementById('problemImages');
        const hasFiles = fileInput && fileInput.files.length > 0;
        
        let requestData;
        let headers = {};
        
        if (hasFiles) {
            requestData = new FormData();
            requestData.append('description', description || '');
            requestData.append('selected_category', category); // Changed from 'category' to 'selected_category'
            
            if (currentSessionId) {
                requestData.append('session_id', currentSessionId);
            }
            
            Array.from(fileInput.files).forEach((file, index) => {
                requestData.append('images', file);
            });
            
        } else {
            headers['Content-Type'] = 'application/json';
            requestData = JSON.stringify({
                description: description || '',
                selected_category: category, // Changed from 'category' to 'selected_category'
                session_id: currentSessionId,
                images: []
            });
        }
        
        console.log('Sending request with files:', hasFiles);
        console.log('Selected category being sent:', category);
        
        const response = await fetch('/api/problems/detect', {
            method: 'POST',
            headers: headers,
            body: requestData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to process request`);
        }
        
        const result = await response.json();
        console.log('Detection result:', result);
        currentSessionId = result.session_id || currentSessionId;
        
        // Find matching service providers
        await findServiceProviders(result);
        
    } catch (error) {
        console.error('Request failed:', error);
        showErrorMessage(error.message || 'Failed to process your request. Please try again.');
    } finally {
        // Reset button
        submitBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Find Professionals';
        submitBtn.disabled = false;
    }
}

// Find service providers
async function findServiceProviders(detectionResult) {
    try {
        const response = await fetch('/api/matching/find-providers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
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

// Display provider results with filtering and chat
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
        
        <!-- Chat Modal -->
        <div id="chatModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="text-lg font-semibold" id="chatProviderName">Chat with Provider</h3>
                        <button onclick="closeChatModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="h-96 flex flex-col">
                        <div id="chatMessages" class="flex-1 p-4 overflow-y-auto border-b">
                            <!-- Chat messages will be inserted here -->
                        </div>
                        <div class="p-4">
                            <div class="flex space-x-2">
                                <input type="text" id="chatInput" placeholder="Type your message..." 
                                       class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <button onclick="sendChatMessage()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Replace the form with results
    document.querySelector('.max-w-4xl').innerHTML = resultsHTML;
    
    // Scroll to the top of the results to prevent automatic bottom scrolling
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render professional cards
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
                    ${provider.distance_miles.toFixed(1)} miles away
                </p>
                <p class="text-sm text-gray-600">
                    <i class="fas fa-clock mr-2"></i>
                    ${provider.availability}
                </p>
                <p class="text-sm text-gray-600">
                    <i class="fas fa-dollar-sign mr-2"></i>
                    $${provider.hourly_rate_min}-$${provider.hourly_rate_max}/hr
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

// Go back to categories
function goBackToCategories() {
    // Restore the original form
    location.reload();
}

// Apply filters
async function applyFilters() {
    if (!currentSessionId || !authToken) return;
    
    const maxDistance = parseFloat(document.getElementById('distanceFilter').value);
    const minRating = parseFloat(document.getElementById('ratingFilter').value);
    const maxRate = document.getElementById('rateFilter').value ? parseFloat(document.getElementById('rateFilter').value) : null;
    
    try {
        const response = await fetch('/api/matching/find-providers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
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

// Apply sorting
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

// Call provider
function callProvider(phone, name) {
    if (confirm(`Call ${name} at ${phone}?`)) {
        window.open(`tel:${phone}`);
    }
}

// Open chat modal
async function openChatModal(providerId, providerName) {
    currentChatProvider = providerId;
    document.getElementById('chatProviderName').textContent = `Chat with ${providerName}`;
    document.getElementById('chatModal').classList.remove('hidden');
    
    // Load existing chat messages
    await loadChatMessages();
}

// Close chat modal
function closeChatModal() {
    document.getElementById('chatModal').classList.add('hidden');
    currentChatProvider = null;
}

// Load chat messages
async function loadChatMessages() {
    if (!currentSessionId || !authToken) return;
    
    try {
        const response = await fetch(`/api/matching/chat/${currentSessionId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const messages = await response.json();
            displayChatMessages(messages);
        }
    } catch (error) {
        console.error('Error loading chat messages:', error);
    }
}

// Display chat messages
function displayChatMessages(messages) {
    const chatMessages = document.getElementById('chatMessages');
    
    if (messages.length === 0) {
        chatMessages.innerHTML = '<p class="text-gray-500 text-center">No messages yet. Start the conversation!</p>';
        return;
    }
    
    chatMessages.innerHTML = messages.map(message => `
        <div class="mb-4 ${message.sender_type === 'user' ? 'text-right' : 'text-left'}">
            <div class="inline-block max-w-xs px-4 py-2 rounded-lg ${
                message.sender_type === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-900'
            }">
                <p class="text-sm">${message.message_text}</p>
                <p class="text-xs mt-1 opacity-75">
                    ${message.sender_name} • ${new Date(message.created_at).toLocaleTimeString()}
                </p>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send chat message
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const messageText = chatInput.value.trim();
    
    if (!messageText || !currentChatProvider || !currentSessionId || !authToken) return;
    
    try {
        const response = await fetch('/api/matching/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                provider_id: currentChatProvider,
                message_text: messageText,
                session_id: currentSessionId
            })
        });
        
        if (response.ok) {
            chatInput.value = '';
            await loadChatMessages(); // Refresh messages
        } else {
            alert('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    }
}

// Rate provider
function rateProvider(providerId, providerName) {
    // Create rating modal
    const ratingModal = document.createElement('div');
    ratingModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50';
    ratingModal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 class="text-lg font-semibold mb-4">Rate ${providerName}</h3>
                
                <div class="mb-4">
                    <p class="text-sm text-gray-600 mb-2">How would you rate this service provider?</p>
                    <div class="flex space-x-1 mb-4">
                        ${[1,2,3,4,5].map(star => `
                            <button class="rating-star text-2xl text-gray-300 hover:text-yellow-400" 
                                    data-rating="${star}" onclick="selectRating(${star})">
                                ★
                            </button>
                        `).join('')}
                    </div>
                    <div id="selectedRating" class="text-sm text-gray-500">Select a rating</div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Comments (optional)
                    </label>
                    <textarea id="reviewComment" rows="3" 
                              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Share your experience with this provider..."></textarea>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="closeRatingModal()" 
                            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md">
                        Cancel
                    </button>
                    <button onclick="submitRating(${providerId})" 
                            class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md" 
                            id="submitRatingBtn" disabled>
                        Submit Rating
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(ratingModal);
    
    // Store current rating modal
    window.currentRatingModal = ratingModal;
    window.selectedRatingValue = 0;
}

// Select rating
function selectRating(rating) {
    window.selectedRatingValue = rating;
    
    // Update star display
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
    
    // Update selected rating text
    document.getElementById('selectedRating').textContent = `${rating} star${rating > 1 ? 's' : ''}`;
    
    // Enable submit button
    document.getElementById('submitRatingBtn').disabled = false;
}

// Submit rating
async function submitRating(providerId) {
    if (!window.selectedRatingValue || !authToken) return;
    
    const comment = document.getElementById('reviewComment').value.trim();
    
    try {
        const response = await fetch('/api/matching/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                provider_id: providerId,
                rating: window.selectedRatingValue,
                comment: comment || null
            })
        });
        
        if (response.ok) {
            alert('Thank you for your rating!');
            closeRatingModal();
            // Refresh provider data if needed
            if (currentSessionId) {
                applyFilters();
            }
        } else {
            const error = await response.json();
            alert(error.detail || 'Failed to submit rating');
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Failed to submit rating');
    }
}

// Close rating modal
function closeRatingModal() {
    if (window.currentRatingModal) {
        document.body.removeChild(window.currentRatingModal);
        window.currentRatingModal = null;
        window.selectedRatingValue = 0;
    }
}

// Handle Enter key in chat input
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.target.id === 'chatInput') {
        event.preventDefault();
        sendChatMessage();
    }
});

// Add file preview functionality
function handleFileSelection(event) {
    const files = event.target.files;
    const filePreview = document.getElementById('filePreview');
    const fileList = document.getElementById('fileList');
    
    if (files.length > 0) {
        filePreview.classList.remove('hidden');
        let fileListHTML = '';
        
        Array.from(files).forEach((file, index) => {
            const fileSize = (file.size / 1024 / 1024).toFixed(2);
            fileListHTML += `
                <div class="flex justify-between items-center py-1">
                    <span>${file.name}</span>
                    <span class="text-gray-400">${fileSize} MB</span>
                </div>
            `;
        });
        
        fileList.innerHTML = fileListHTML;
    } else {
        filePreview.classList.add('hidden');
    }
}
