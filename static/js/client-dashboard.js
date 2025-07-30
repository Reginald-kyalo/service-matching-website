/**
 * Client Dashboard JavaScript
 * Handles client dashboard functionality and conversations
 */

let userRequests = [];
let conversations = [];

/**
 * Initialize client dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and client status
    const userType = currentUser?.user_type || currentUser?.type || 'client';
    if (!isAuthenticated() || !currentUser || userType !== 'client') {
        // If user is a provider, redirect to provider dashboard
        if (userType === 'provider') {
            window.location.href = '/provider-dashboard';
            return;
        }
        // Store current URL for return navigation
        sessionStorage.setItem('returnUrl', window.location.href);
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.href)}`;
        return;
    }
    
    initializeDashboard();
    loadDashboardData();
    setupEventListeners();
    
    // Set up real-time updates
    setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
});

/**
 * Initialize dashboard UI
 */
function initializeDashboard() {
    // Display user info
    const userInfo = document.getElementById('userInfo');
    userInfo.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-indigo-600"></i>
            </div>
            <div>
                <div class="text-sm font-medium text-gray-900">${currentUser.name}</div>
                <div class="text-xs text-gray-500">Client</div>
            </div>
        </div>
    `;
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        const [statsResponse, requestsResponse, conversationsResponse, activityResponse] = await Promise.all([
            fetch('/api/clients/dashboard/stats', { headers: getAuthHeaders() }),
            fetch('/api/clients/requests', { headers: getAuthHeaders() }),
            fetch('/api/clients/conversations', { headers: getAuthHeaders() }),
            fetch('/api/clients/activity', { headers: getAuthHeaders() })
        ]);
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            updateStats(stats);
        }
        
        if (requestsResponse.ok) {
            const requests = await requestsResponse.json();
            userRequests = requests;
            displayRequests(requests);
        }
        
        if (conversationsResponse.ok) {
            const convos = await conversationsResponse.json();
            conversations = convos;
            displayConversations(convos);
        }
        
        if (activityResponse.ok) {
            const activity = await activityResponse.json();
            displayActivity(activity);
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Update dashboard stats
 */
function updateStats(stats) {
    document.getElementById('activeRequestsCount').textContent = stats.activeRequests || 0;
    document.getElementById('activeChatsCount').textContent = stats.activeChats || 0;
    document.getElementById('completedCount').textContent = stats.completed || 0;
    document.getElementById('totalSpent').textContent = `KSH ${(stats.totalSpent || 0).toLocaleString()}`;
}

/**
 * Display user requests
 */
function displayRequests(requests) {
    const requestsList = document.getElementById('requestsList');
    
    if (!requests || requests.length === 0) {
        requestsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-clipboard-list text-4xl mb-4"></i>
                <p>No service requests yet</p>
                <p class="text-sm">Create your first request to get started</p>
                <a href="/" class="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm">
                    Create Request
                </a>
            </div>
        `;
        return;
    }
    
    requestsList.innerHTML = requests.map(request => `
        <div class="border border-gray-200 rounded-lg p-4 mb-4 card-hover cursor-pointer" onclick="viewRequestDetails(${request.id})">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="font-semibold text-gray-900">${request.category}</h4>
                    <p class="text-sm text-gray-600">${request.location}</p>
                </div>
                <div class="text-right">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(request.status)}">
                        ${formatStatus(request.status)}
                    </span>
                    <p class="text-sm text-gray-500 mt-1">${formatTimeAgo(request.created_at)}</p>
                </div>
            </div>
            
            <p class="text-gray-700 text-sm mb-3 line-clamp-2">${request.description}</p>
            
            <div class="flex justify-between items-center">
                <div class="text-sm text-gray-500">
                    ${request.provider_count > 0 ? 
                        `<span class="text-green-600"><i class="fas fa-check mr-1"></i> ${request.provider_count} provider(s) responded</span>` :
                        `<span class="text-yellow-600"><i class="fas fa-clock mr-1"></i> Waiting for responses</span>`
                    }
                </div>
                <div class="flex space-x-2">
                    ${request.status === 'active' && request.provider_count > 0 ? `
                        <button onclick="event.stopPropagation(); viewProviders(${request.id})" 
                                class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            <i class="fas fa-users mr-1"></i> View Providers
                        </button>
                    ` : ''}
                    ${request.status === 'active' ? `
                        <button onclick="event.stopPropagation(); cancelRequest(${request.id})" 
                                class="text-red-600 hover:text-red-700 text-sm">
                            <i class="fas fa-times mr-1"></i> Cancel
                        </button>
                    ` : ''}
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
                <p class="text-sm">No conversations yet</p>
            </div>
        `;
        return;
    }
    
    conversationsList.innerHTML = conversations.map(conversation => `
        <div class="border-b border-gray-100 last:border-0 py-3 cursor-pointer hover:bg-gray-50" 
             onclick="openConversation(${conversation.id})">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <i class="fas fa-user-tie text-gray-600"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center">
                        <h4 class="text-sm font-medium text-gray-900 truncate">${conversation.provider_name}</h4>
                        <span class="text-xs text-gray-500">${formatTimeAgo(conversation.last_message_time)}</span>
                    </div>
                    <p class="text-sm text-gray-600 truncate">${conversation.last_message}</p>
                    <p class="text-xs text-gray-500">${conversation.service_category}</p>
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
 * Display recent activity
 */
function displayActivity(activities) {
    const activityList = document.getElementById('activityList');
    
    if (!activities || activities.length === 0) {
        activityList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-history text-3xl mb-4"></i>
                <p class="text-sm">No recent activity</p>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
            <div class="w-8 h-8 bg-${getActivityColor(activity.type)}-100 rounded-full flex items-center justify-center">
                <i class="fas ${getActivityIcon(activity.type)} text-${getActivityColor(activity.type)}-600 text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">${activity.description}</p>
                <p class="text-xs text-gray-500">${formatTimeAgo(activity.created_at)}</p>
            </div>
        </div>
    `).join('');
}

/**
 * View request details
 */
function viewRequestDetails(requestId) {
    const request = userRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const requestDetails = document.getElementById('requestDetails');
    requestDetails.innerHTML = `
        <div class="space-y-4">
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">Service Category</h4>
                <p class="text-gray-700">${request.category}</p>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">Description</h4>
                <p class="text-gray-700">${request.description}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">Status</h4>
                    <span class="inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(request.status)}">
                        ${formatStatus(request.status)}
                    </span>
                </div>
                
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">Created</h4>
                    <p class="text-gray-700">${formatDate(request.created_at)}</p>
                </div>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">Location</h4>
                <p class="text-gray-700">${request.location}</p>
            </div>
            
            ${request.provider_responses && request.provider_responses.length > 0 ? `
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">Provider Responses (${request.provider_responses.length})</h4>
                    <div class="space-y-2">
                        ${request.provider_responses.map(provider => `
                            <div class="p-3 border border-gray-200 rounded-lg">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h5 class="font-medium text-gray-900">${provider.name}</h5>
                                        <p class="text-sm text-gray-600">${provider.business_name || ''}</p>
                                        <div class="flex items-center mt-1">
                                            <div class="flex text-yellow-400 text-sm">
                                                ${Array(5).fill().map((_, i) => `
                                                    <i class="fas fa-star ${i < provider.rating ? '' : 'text-gray-300'}"></i>
                                                `).join('')}
                                            </div>
                                            <span class="text-sm text-gray-500 ml-2">(${provider.rating}/5)</span>
                                        </div>
                                    </div>
                                    <button onclick="startConversation(${provider.id}, ${request.id})" 
                                            class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                        <i class="fas fa-comment mr-1"></i> Chat
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('requestModal').classList.remove('hidden');
}

/**
 * Open conversation
 */
function openConversation(conversationId) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    // Set up chat modal
    document.getElementById('chatProviderName').textContent = `Chat with ${conversation.provider_name}`;
    window.currentConversationId = conversationId;
    
    // Load chat messages and open modal
    loadChatMessages(conversationId);
    document.getElementById('chatModal').classList.remove('hidden');
}

/**
 * Start conversation with provider
 */
async function startConversation(providerId, requestId) {
    try {
        const response = await fetch('/api/conversations/start', {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider_id: providerId,
                request_id: requestId
            })
        });
        
        if (response.ok) {
            const conversation = await response.json();
            closeRequestModal();
            openConversation(conversation.id);
            loadDashboardData(); // Refresh data
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Failed to start conversation', 'error');
        }
    } catch (error) {
        console.error('Error starting conversation:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

/**
 * Cancel request
 */
async function cancelRequest(requestId) {
    if (!confirm('Are you sure you want to cancel this request?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/clients/requests/${requestId}/cancel`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showNotification('Request cancelled successfully', 'success');
            loadDashboardData(); // Refresh data
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Failed to cancel request', 'error');
        }
    } catch (error) {
        console.error('Error cancelling request:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Chat input enter key
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

/**
 * Close modals
 */
function closeRequestModal() {
    document.getElementById('requestModal').classList.add('hidden');
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
        case 'active':
            return 'bg-blue-100 text-blue-800';
        case 'in_progress':
            return 'bg-yellow-100 text-yellow-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatStatus(status) {
    switch (status) {
        case 'active':
            return 'Active';
        case 'in_progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status;
    }
}

function getActivityColor(type) {
    switch (type) {
        case 'request_created':
            return 'blue';
        case 'provider_responded':
            return 'green';
        case 'message_received':
            return 'purple';
        case 'request_completed':
            return 'green';
        case 'request_cancelled':
            return 'red';
        default:
            return 'gray';
    }
}

function getActivityIcon(type) {
    switch (type) {
        case 'request_created':
            return 'fa-plus';
        case 'provider_responded':
            return 'fa-user-check';
        case 'message_received':
            return 'fa-comment';
        case 'request_completed':
            return 'fa-check';
        case 'request_cancelled':
            return 'fa-times';
        default:
            return 'fa-info';
    }
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
