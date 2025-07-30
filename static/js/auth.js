/**
 * Authentication module
 * Handles user authentication, login/logout functionality
 */
import { authToken } from "./globals.js";
/**
 * Initialize authentication state and render auth UI
 */
export function initializeAuth() {
    // Check if we have an authSection element (for main pages like index)
    const authSection = document.getElementById('authSection');
    
    // Check if we have a providerInfo element (for provider dashboard)
    const providerInfo = document.getElementById('providerInfo');
    
    if (authToken && currentUser) {
        // Handle both 'type' and 'user_type' properties for backward compatibility
        const userType = currentUser.user_type || currentUser.type || 'client';
        const dashboardUrl = userType === 'provider' ? '/provider-dashboard' : '/client-dashboard';
        const dashboardText = userType === 'provider' ? 'Provider Dashboard' : 'My Dashboard';
        
        if (authSection) {
            // For main pages - show dashboard link and logout
            authSection.innerHTML = `
                <div class="flex items-center space-x-4">
                    <a href="${dashboardUrl}" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                        <i class="fas fa-tachometer-alt mr-1"></i>${dashboardText}
                    </a>
                    <span class="text-gray-700 text-sm">Welcome, ${currentUser.name}</span>
                    <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Sign Out
                    </button>
                </div>
            `;
        }
        
        if (providerInfo) {
            // For provider dashboard - show provider info
            providerInfo.innerHTML = `
                <span class="text-gray-700 text-sm">Welcome, ${currentUser.name}</span>
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-indigo-600"></i>
                </div>
            `;
        }
    } else {
        if (authSection) {
            authSection.innerHTML = `
                <button onclick="window.location.href='/login'" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Sign In
                </button>
            `;
        }
        
        if (providerInfo) {
            // For provider dashboard when not logged in - redirect to login
            window.location.href = '/login';
        }
    }
}

/**
 * Logout function - clears authentication data and redirects to home page
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('returnUrl');
    sessionStorage.removeItem('postLoginAction');
    sessionStorage.removeItem('returnUrl');
    authToken = null;
    currentUser = null;
    
    // Always redirect to home page after logout
    window.location.href = '/';
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated() {
    return authToken && currentUser;
}

/**
 * Get authorization headers for API requests
 * @returns {Object} Headers object with Authorization if authenticated
 */
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
}

/**
 * Show login modal when authentication is required
 */
function showLoginModal() {
    // Remove any existing modal
    const existingModal = document.getElementById('authModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create redirect URL to come back to current page after login
    const currentUrl = window.location.href;
    const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
    
    // Create modal HTML
    const modalHTML = `
        <div id="authModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Sign In Required</h3>
                        <button onclick="closeLoginModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="mb-6">
                        <p class="text-gray-600">You need to sign in to find and connect with service providers.</p>
                    </div>
                    
                    <div class="flex flex-col space-y-3">
                        <button onclick="window.location.href='${loginUrl}'" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
                            Sign In
                        </button>
                        <button onclick="closeLoginModal()" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listener for clicking outside modal
    const modal = document.getElementById('authModal');
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeLoginModal();
        }
    });
    
    // Add escape key handler
    document.addEventListener('keydown', handleEscapeKey);
}

/**
 * Close login modal
 */
function closeLoginModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handleEscapeKey);
}

/**
 * Handle escape key press for modal
 */
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeLoginModal();
    }
}

/**
 * Refresh authentication state from localStorage
 * This ensures we have the latest authentication data
 */
function refreshAuthState() {
    authToken = localStorage.getItem('authToken');
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Global variable to store pending service search data
let pendingServiceSearch = null;

/**
 * Store service search data for after authentication
 * @param {Object} searchData - The service search data to store
 */
export function storePendingServiceSearch(searchData) {
    pendingServiceSearch = searchData;
    localStorage.setItem('pendingServiceSearch', JSON.stringify(searchData));
}

/**
 * Get and clear pending service search data
 * @returns {Object|null} The stored search data or null
 */
function getPendingServiceSearch() {
    const stored = localStorage.getItem('pendingServiceSearch');
    if (stored) {
        localStorage.removeItem('pendingServiceSearch');
        return JSON.parse(stored);
    }
    return pendingServiceSearch;
}

/**
 * Clear pending service search data
 */
function clearPendingServiceSearch() {
    pendingServiceSearch = null;
    localStorage.removeItem('pendingServiceSearch');
}

