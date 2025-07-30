/**
 * Provider Dashboard JavaScript
 * Handles provider dashboard functionality, requests, and profile management
 */

// Import the unified service catalog
import { SERVICE_CATEGORIES, SERVICES, ServiceUtils } from './service-catalog.js';

let currentProvider = null;
let activeRequests = [];
let conversations = [];

/**
 * Initialize provider dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and provider status
    const userType = currentUser?.user_type || currentUser?.type;
    if (!isAuthenticated() || !currentUser || userType !== 'provider') {
        // Store current URL for return navigation
        sessionStorage.setItem('returnUrl', window.location.href);
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.href)}`;
        return;
    }
    
    currentProvider = currentUser;
    initializeDashboard();
    loadDashboardData();
    loadProviderProfile(); // Load and display profile information
    setupEventListeners();
    
    // Set up real-time updates
    setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
});

/**
 * Initialize dashboard UI
 */
function initializeDashboard() {
    // Display provider info
    const providerInfo = document.getElementById('providerInfo');
    providerInfo.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-indigo-600"></i>
            </div>
            <div>
                <div class="text-sm font-medium text-gray-900">${currentProvider.name}</div>
                <div class="text-xs text-gray-500">Provider</div>
            </div>
        </div>
    `;
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        const [statsResponse, requestsResponse, conversationsResponse] = await Promise.all([
            fetch('/api/providers/dashboard/stats', { headers: getAuthHeaders() }),
            fetch('/api/providers/requests', { headers: getAuthHeaders() }),
            fetch('/api/providers/conversations', { headers: getAuthHeaders() })
        ]);
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            updateStats(stats);
        }
        
        if (requestsResponse.ok) {
            const requests = await requestsResponse.json();
            activeRequests = requests;
            displayRequests(requests);
        }
        
        if (conversationsResponse.ok) {
            const convos = await conversationsResponse.json();
            conversations = convos;
            displayConversations(convos);
        }
        
        // Load and display provider profile
        loadProviderProfile();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Update dashboard stats
 */
function updateStats(stats) {
    document.getElementById('newRequestsCount').textContent = stats.newRequests || 0;
    document.getElementById('activeChatsCount').textContent = stats.activeChats || 0;
    document.getElementById('averageRating').textContent = (stats.averageRating || 0).toFixed(1);
    document.getElementById('completedJobs').textContent = stats.completedJobs || 0;
    
    // Update notification indicator
    const notificationDot = document.getElementById('notificationDot');
    if (stats.newRequests > 0) {
        notificationDot.classList.remove('hidden');
    } else {
        notificationDot.classList.add('hidden');
    }
}

/**
 * Display service requests
 */
function displayRequests(requests) {
    const requestsList = document.getElementById('requestsList');
    
    if (!requests || requests.length === 0) {
        requestsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-inbox text-4xl mb-4"></i>
                <p>No new requests at the moment</p>
                <p class="text-sm">New requests will appear here when customers need your services</p>
            </div>
        `;
        return;
    }
    
    requestsList.innerHTML = requests.map(request => `
        <div class="border border-gray-200 rounded-lg p-4 mb-4 card-hover cursor-pointer" onclick="viewRequestDetails(${request.id})">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="font-semibold text-gray-900">${request.category}</h4>
                    <p class="text-sm text-gray-600">${request.location} • ${formatDistance(request.distance)}</p>
                </div>
                <div class="text-right">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(request.status)}">
                        ${request.status}
                    </span>
                    <p class="text-sm text-gray-500 mt-1">${formatTimeAgo(request.created_at)}</p>
                </div>
            </div>
            
            <p class="text-gray-700 text-sm mb-3 line-clamp-2">${request.description}</p>
            
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span><i class="fas fa-user mr-1"></i> ${request.customer_name}</span>
                    <span><i class="fas fa-clock mr-1"></i> ${request.urgency}</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="event.stopPropagation(); declineRequest(${request.id})" 
                            class="text-red-600 hover:text-red-700 text-sm">
                        <i class="fas fa-times mr-1"></i> Decline
                    </button>
                    <button onclick="event.stopPropagation(); acceptRequest(${request.id})" 
                            class="text-green-600 hover:text-green-700 text-sm font-medium">
                        <i class="fas fa-check mr-1"></i> Accept
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Display conversations
 */
function displayConversations(conversations) {
    const conversationsList = document.getElementById('conversationsList');
    
    if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-comments text-3xl mb-4"></i>
                <p class="text-sm">No active conversations</p>
            </div>
        `;
        return;
    }
    
    conversationsList.innerHTML = conversations.map(conversation => `
        <div class="border-b border-gray-100 last:border-0 py-3 cursor-pointer hover:bg-gray-50" 
             onclick="openConversation(${conversation.id})">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-gray-600"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center">
                        <h4 class="text-sm font-medium text-gray-900 truncate">${conversation.customer_name}</h4>
                        <span class="text-xs text-gray-500">${formatTimeAgo(conversation.last_message_time)}</span>
                    </div>
                    <p class="text-sm text-gray-600 truncate">${conversation.last_message}</p>
                    ${conversation.unread_count > 0 ? `
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                            ${conversation.unread_count} new
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * View request details
 */
function viewRequestDetails(requestId) {
    const request = activeRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const requestDetails = document.getElementById('requestDetails');
    requestDetails.innerHTML = `
        <div class="space-y-4">
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">Service Category</h4>
                <p class="text-gray-700">${request.category}</p>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">Problem Description</h4>
                <p class="text-gray-700">${request.description}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">Location</h4>
                    <p class="text-gray-700">${request.location}</p>
                    <p class="text-sm text-gray-500">${formatDistance(request.distance)} away</p>
                </div>
                
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">Urgency</h4>
                    <p class="text-gray-700">${request.urgency}</p>
                </div>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">Customer</h4>
                <p class="text-gray-700">${request.customer_name}</p>
                <p class="text-sm text-gray-500">Member since ${formatDate(request.customer_join_date)}</p>
            </div>
            
            ${request.images && request.images.length > 0 ? `
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">Photos</h4>
                    <div class="grid grid-cols-3 gap-2">
                        ${request.images.map(image => `
                            <img src="${image}" alt="Problem photo" class="w-full h-20 object-cover rounded cursor-pointer" 
                                 onclick="openImageModal('${image}')">
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Store current request ID for actions
    window.currentRequestId = requestId;
    document.getElementById('requestModal').classList.remove('hidden');
}

/**
 * Accept a service request
 */
async function acceptRequest(requestId = null) {
    const id = requestId || window.currentRequestId;
    if (!id) return;
    
    try {
        const response = await fetch(`/api/providers/requests/${id}/accept`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showNotification('Request accepted! You can now chat with the customer.', 'success');
            closeRequestModal();
            loadDashboardData(); // Refresh data
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Failed to accept request', 'error');
        }
    } catch (error) {
        console.error('Error accepting request:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

/**
 * Decline a service request
 */
async function declineRequest(requestId = null) {
    const id = requestId || window.currentRequestId;
    if (!id) return;
    
    if (!confirm('Are you sure you want to decline this request?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/providers/requests/${id}/decline`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showNotification('Request declined', 'info');
            closeRequestModal();
            loadDashboardData(); // Refresh data
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Failed to decline request', 'error');
        }
    } catch (error) {
        console.error('Error declining request:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

/**
 * Open conversation
 */
function openConversation(conversationId) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    // Set up chat modal
    document.getElementById('chatCustomerName').textContent = `Chat with ${conversation.customer_name}`;
    window.currentConversationId = conversationId;
    
    // Load chat messages and open modal
    loadChatMessages(conversationId);
    document.getElementById('chatModal').classList.remove('hidden');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Notifications toggle
    document.getElementById('notificationsBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.classList.toggle('hidden');
    });
    
    // Close notifications when clicking outside
    document.addEventListener('click', function() {
        document.getElementById('notificationsDropdown').classList.add('hidden');
    });
    
    // Chat input enter key
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Close edit profile modal when clicking outside
    document.addEventListener('click', function(e) {
        const editModal = document.getElementById('editProfileModal');
        const editModalContent = editModal?.querySelector('.bg-white');
        
        if (editModal && !editModal.classList.contains('hidden')) {
            if (e.target === editModal || (editModalContent && !editModalContent.contains(e.target))) {
                closeEditProfileModal();
            }
        }
    });
    
    // Prevent modal from closing when clicking inside the modal content
    const editModal = document.getElementById('editProfileModal');
    if (editModal) {
        const modalContent = editModal.querySelector('.bg-white');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    // Close edit profile modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const editModal = document.getElementById('editProfileModal');
            if (editModal && !editModal.classList.contains('hidden')) {
                closeEditProfileModal();
            }
        }
    });
}

/**
 * Edit profile function
 */
async function editProfile() {
    try {
        // Get current provider data
        const response = await fetch('/api/providers/profile', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        
        const providerData = await response.json();
        
        // Populate the edit form with current data
        populateEditForm(providerData);
        
        // Show the modal
        document.getElementById('editProfileModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading profile for editing:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

/**
 * Populate edit form with provider data
 */
function populateEditForm(data) {
    document.getElementById('editFullName').value = data.full_name || '';
    document.getElementById('editBusinessName').value = data.business_name || '';
    document.getElementById('editEmail').value = data.email || '';
    document.getElementById('editPhone').value = data.phone || '';
    document.getElementById('editDescription').value = data.description || '';
    document.getElementById('editMinRate').value = data.min_rate || '';
    document.getElementById('editMaxRate').value = data.max_rate || '';
    document.getElementById('editPricingNotes').value = data.pricing_notes || '';
    document.getElementById('editResponseTime').value = data.response_time || 'same-day';
    document.getElementById('editServiceRadius').value = data.service_radius || '10km';
    document.getElementById('editTravelFee').value = data.travel_fee || '';
}

/**
 * Close edit profile modal
 */
function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.add('hidden');
}

/**
 * Handle edit profile form submission
 */
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editProfileForm');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(e.target);
                const updateData = {};
                
                // Convert FormData to regular object
                for (let [key, value] of formData.entries()) {
                    // Skip readonly fields that aren't in the update schema
                    if (key === 'email' || key === 'fullName' || key === 'phone') continue;
                    updateData[key] = value;
                }
                
                // Convert numeric fields and remove empty values
                if (updateData.minRate !== undefined) {
                    if (updateData.minRate === '' || updateData.minRate === null) {
                        delete updateData.minRate;
                    } else {
                        updateData.minRate = parseFloat(updateData.minRate);
                    }
                }
                if (updateData.maxRate !== undefined) {
                    if (updateData.maxRate === '' || updateData.maxRate === null) {
                        delete updateData.maxRate;
                    } else {
                        updateData.maxRate = parseFloat(updateData.maxRate);
                    }
                }
                if (updateData.travelFee !== undefined) {
                    if (updateData.travelFee === '' || updateData.travelFee === null) {
                        delete updateData.travelFee;
                    } else {
                        updateData.travelFee = parseFloat(updateData.travelFee);
                    }
                }
                
                console.log('Sending profile update data:', updateData);
                
                const response = await fetch('/api/providers/profile', {
                    method: 'PUT',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    console.error('Server error response:', error);
                    throw new Error(error.detail || `HTTP ${response.status}: Failed to update profile`);
                }
                
                showNotification('Profile updated successfully!', 'success');
                closeEditProfileModal();
                
                // Refresh the dashboard data and profile display
                loadDashboardData();
                loadProviderProfile();
                
            } catch (error) {
                console.error('Error updating profile:', error);
                showNotification(error.message || 'Failed to update profile', 'error');
            }
        });
    }
});

/**
 * Load and display provider profile
 */
async function loadProviderProfile() {
    try {
        const response = await fetch('/api/providers/profile', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        
        const profileData = await response.json();
        displayProviderProfile(profileData);
        
        // Load provider services after profile is displayed
        loadProviderServices();
        
    } catch (error) {
        console.error('Error loading provider profile:', error);
        const profileDisplay = document.getElementById('profileDisplay');
        if (profileDisplay) {
            profileDisplay.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    <i class="fas fa-exclamation-triangle text-3xl mb-4"></i>
                    <p>Failed to load profile information</p>
                    <button onclick="loadProviderProfile()" class="mt-2 text-indigo-600 hover:text-indigo-700 text-sm">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

/**
 * Load and display provider's current services
 */
async function loadProviderServices() {
    try {
        const response = await fetch('/api/providers/services', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const services = await response.json();
            displayCurrentServices(services);
        } else {
            displayCurrentServices([]);
        }
        
    } catch (error) {
        console.error('Error loading provider services:', error);
        displayCurrentServices([]);
    }
}

/**
 * Display provider profile information
 */
function displayProviderProfile(profile) {
    const profileDisplay = document.getElementById('profileDisplay');
    if (!profileDisplay) return;
    
    profileDisplay.innerHTML = `
        <!-- Basic Information -->
        <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-900 border-b pb-2">Basic Information</h4>
            <div class="space-y-2">
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Full Name</span>
                    <p class="text-sm font-medium text-gray-900">${profile.full_name || 'Not provided'}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Business Name</span>
                    <p class="text-sm font-medium text-gray-900">${profile.business_name || 'Not provided'}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Email</span>
                    <p class="text-sm font-medium text-gray-900">${profile.email || 'Not provided'}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Phone</span>
                    <p class="text-sm font-medium text-gray-900">${profile.phone || 'Not provided'}</p>
                </div>
            </div>
        </div>
        
        <!-- Service Information -->
        <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-900 border-b pb-2">Service Information</h4>
            <div class="space-y-2">
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Services Offered</span>
                    <div id="currentServices" class="mt-1">
                        <span class="text-sm text-gray-500">Loading services...</span>
                    </div>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Response Time</span>
                    <p class="text-sm font-medium text-gray-900">${formatResponseTime(profile.response_time)}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Service Radius</span>
                    <p class="text-sm font-medium text-gray-900">${formatServiceRadius(profile.service_radius)}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Travel Fee</span>
                    <p class="text-sm font-medium text-gray-900">${formatTravelFee(profile.travel_fee)}</p>
                </div>
            </div>
        </div>
        
        <!-- Pricing Information -->
        <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-900 border-b pb-2">Pricing</h4>
            <div class="space-y-2">
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Rate Range</span>
                    <p class="text-sm font-medium text-gray-900">${formatRateRange(profile.min_rate, profile.max_rate)}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">Pricing Notes</span>
                    <p class="text-sm text-gray-700">${profile.pricing_notes || 'No additional pricing information'}</p>
                </div>
            </div>
        </div>
        
        <!-- Business Description -->
        ${profile.description ? `
        <div class="space-y-3 md:col-span-2 lg:col-span-3">
            <h4 class="text-sm font-medium text-gray-900 border-b pb-2">Business Description</h4>
            <p class="text-sm text-gray-700 leading-relaxed">${profile.description}</p>
        </div>
        ` : ''}
    `;
    
    // Load and display provider's current services
    loadProviderServices();
}

/**
 * Display current services in profile
 */
function displayCurrentServices(services) {
    const currentServicesElement = document.getElementById('currentServices');
    if (!currentServicesElement) return;
    
    if (!services || services.length === 0) {
        currentServicesElement.innerHTML = `
            <p class="text-sm text-gray-500 italic">No services selected</p>
            <button onclick="window.location.href='/provider-services'" 
                    class="mt-1 text-xs text-indigo-600 hover:text-indigo-700">
                Add services →
            </button>
        `;
        return;
    }
    
    // Group services by category using the unified catalog
    const servicesByCategory = {};
    services.forEach(service => {
        const categoryId = service.category || 'other';
        const categoryInfo = ServiceUtils.getCategoryInfo(categoryId);
        const categoryName = categoryInfo ? categoryInfo.name : (categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('_', ' '));
        
        if (!servicesByCategory[categoryName]) {
            servicesByCategory[categoryName] = {
                services: [],
                color: categoryInfo?.group?.color || 'gray'
            };
        }
        servicesByCategory[categoryName].services.push(service);
    });
    
    const categoriesHtml = Object.keys(servicesByCategory).map(categoryName => {
        const categoryData = servicesByCategory[categoryName];
        const serviceNames = categoryData.services.map(s => s.name || s.service_name).join(', ');
        const colorClasses = `text-${categoryData.color}-700 bg-${categoryData.color}-50 border-${categoryData.color}-200`;
        
        return `
            <div class="mb-2 p-2 rounded-md border ${colorClasses}">
                <span class="text-xs font-medium">${categoryName}:</span>
                <span class="text-xs ml-1">${serviceNames}</span>
            </div>
        `;
    }).join('');
    
    currentServicesElement.innerHTML = `
        <div class="space-y-1">
            ${categoriesHtml}
            <button onclick="window.location.href='/provider-services'" 
                    class="mt-2 text-xs text-indigo-600 hover:text-indigo-700 flex items-center">
                <i class="fas fa-cog mr-1"></i>
                Manage services →
            </button>
        </div>
    `;
}

/**
 * Format helper functions for profile display
 */
function formatResponseTime(responseTime) {
    if (!responseTime) return 'Not specified';
    
    const timeMap = {
        'immediate': 'Within 1 hour',
        'same-day': 'Same day',
        'next-day': 'Next day',
        '2-3-days': '2-3 days',
        'weekly': 'Within a week'
    };
    
    return timeMap[responseTime] || responseTime;
}

function formatServiceRadius(serviceRadius) {
    if (!serviceRadius) return 'Not specified';
    
    const radiusMap = {
        '5km': 'Within 5km',
        '10km': 'Within 10km',
        '20km': 'Within 20km',
        'county': 'County-wide',
        'nationwide': 'Nationwide'
    };
    
    return radiusMap[serviceRadius] || serviceRadius;
}

function formatTravelFee(travelFee) {
    if (travelFee === null || travelFee === undefined) return 'Not specified';
    if (travelFee === 0) return 'No travel fee';
    return `KES ${travelFee.toLocaleString()}`;
}

function formatRateRange(minRate, maxRate) {
    if (!minRate && !maxRate) return 'Not specified';
    if (minRate && maxRate) return `KES ${minRate.toLocaleString()} - ${maxRate.toLocaleString()}`;
    if (minRate) return `From KES ${minRate.toLocaleString()}`;
    if (maxRate) return `Up to KES ${maxRate.toLocaleString()}`;
    return 'Not specified';
}

/**
 * Close modals
 */
function closeRequestModal() {
    document.getElementById('requestModal').classList.add('hidden');
    window.currentRequestId = null;
}

function closeChatModal() {
    document.getElementById('chatModal').classList.add('hidden');
    window.currentConversationId = null;
}

/**
 * Utility functions
 */
function getStatusBadgeClass(status) {
    switch (status) {
        case 'new':
            return 'bg-blue-100 text-blue-800';
        case 'accepted':
            return 'bg-green-100 text-green-800';
        case 'declined':
            return 'bg-red-100 text-red-800';
        case 'completed':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatDistance(distance) {
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(timestamp);
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${getNotificationClass(type)}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${getNotificationIcon(type)} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationClass(type) {
    switch (type) {
        case 'success':
            return 'bg-green-100 text-green-800 border border-green-200';
        case 'error':
            return 'bg-red-100 text-red-800 border border-red-200';
        case 'warning':
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        default:
            return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
}

// Expose functions globally for HTML onclick handlers
window.editProfile = editProfile;
