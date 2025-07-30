/**
 * Global variables and constants
 */

// Application state
let categoryGroups = {};
let selectedCategory = null;
let currentProviders = [];
let currentChatProvider = null;
let currentSessionId = null;

// Getters
export function getCategoryGroups() {
    return categoryGroups;
}
export function getSelectedCategory() {
    return selectedCategory;
}
export function getCurrentProviders() {
    return currentProviders;
}
export function getCurrentChatProvider() {
    return currentChatProvider;
}
export function getCurrentSessionId() {
    return currentSessionId;
}

// Setters
export function setCategoryGroups(val) {
    categoryGroups = val;
}
export function setSelectedCategory(val) {
    selectedCategory = val;
}
export function setCurrentProviders(val) {
    currentProviders = val;
}
export function setCurrentChatProvider(val) {
    currentChatProvider = val;
}
export function setCurrentSessionId(val) {
    currentSessionId = val;
}

// Authentication state
export let authToken = localStorage.getItem('authToken');
export let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

/**
 * Refresh authentication state from localStorage
 * This is useful when user data is updated in other parts of the application
 */
export function refreshAuthState() {
    authToken = localStorage.getItem('authToken');
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Re-initialize auth UI if available
    if (typeof initializeAuth === 'function') {
        initializeAuth();
    }
    
    console.log('Auth state refreshed:', { authToken: !!authToken, currentUser });
}


// Constants
export const COLOR_CLASSES = {
    blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
    green: 'border-green-200 bg-green-50 hover:bg-green-100', 
    purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
    orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
    yellow: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
    amber: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
    teal: 'border-teal-200 bg-teal-50 hover:bg-teal-100',
    emerald: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
    red: 'border-red-200 bg-red-50 hover:bg-red-100',
    slate: 'border-slate-200 bg-slate-50 hover:bg-slate-100',
    stone: 'border-stone-200 bg-stone-50 hover:bg-stone-100',
    gray: 'border-gray-200 bg-gray-50 hover:bg-gray-100',
    indigo: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100',
    cyan: 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100',
    pink: 'border-pink-200 bg-pink-50 hover:bg-pink-100'
};

export const URGENCY_COLORS = {
    emergency: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200', 
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
};

// Export globals for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        currentSessionId,
        categoryGroups,
        selectedCategory,
        currentProviders,
        currentChatProvider,
        authToken,
        currentUser,
        COLOR_CLASSES,
        URGENCY_COLORS
    };
}
