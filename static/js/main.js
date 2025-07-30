/**
 * Main application entry point
 * Handles initialization, event listeners, and form submission
 */
import { isAuthenticated, initializeAuth } from './auth.js';
import { executePendingServiceSearch, findServiceProviders } from './providers.js';
import { showErrorMessage, handleFileSelection, setButtonLoading, resetButtonLoading } from './ui-utils.js';
import { analyzeProblem } from './ai-analysis.js';
import { getCurrentSessionId, setCurrentSessionId } from './globals.js';
/**
 * Initialize DOM elements
 */

let problemForm;
let analyzeBtn;
let submitBtn;
let aiResults;
let aiContent;
let submitHelpText;
let authSection;
let resultsSection;
let currentSessionId = getCurrentSessionId();

function initializeDOMElements() {
    // Get DOM elements and assign to globals
    problemForm = document.getElementById('problemForm');
    analyzeBtn = document.getElementById('analyzeBtn');
    submitBtn = document.getElementById('submitBtn');
    aiResults = document.getElementById('aiResults');
    aiContent = document.getElementById('aiContent');
    submitHelpText = document.getElementById('submitHelpText');
    authSection = document.getElementById('authSection');
    resultsSection = document.getElementById('resultsSection');
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Form submission handler
    if (problemForm) {
        problemForm.addEventListener('submit', handleProblemSubmission);
    }
    
    // File input change handler
    const fileInput = document.getElementById('problemImages');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
    
    // Chat input enter key handler
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && event.target.id === 'chatInput') {
            event.preventDefault();
            sendChatMessage();
        }
    });
    
    // Analyze button handler
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeProblem);
    }
    
    // Close examples dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('exampleSuggestions');
        const textarea = document.getElementById('problemDescription');
        
        if (dropdown && textarea && 
            !dropdown.contains(event.target) && 
            !textarea.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Close info card on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const infoCard = document.getElementById('serviceInfoCard');
            if (infoCard) {
                closeServiceInfo();
            }
        }
    });
}

/**
 * Handle problem submission
 * @param {Event} event - Form submission event
 */
async function handleProblemSubmission(event) {
    event.preventDefault();
    
    // Show loading state
    setButtonLoading(submitBtn, 'Finding Professionals...', 'fas fa-spinner fa-spin');
    
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
            requestData.append('selected_category', category);
            
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
                selected_category: category,
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
        currentSessionId = setCurrentSessionId(result.session_id || currentSessionId);
        
        // Find matching service providers
        await findServiceProviders(result);
        
    } catch (error) {
        console.error('Request failed:', error);
        showErrorMessage(error.message || 'Failed to process your request. Please try again.');
    } finally {
        // Reset button
        resetButtonLoading(submitBtn);
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Find Professionals';
        }
    }
}

/**
 * Show example suggestions dropdown intelligently
 */
function showExamples() {
    const dropdown = document.getElementById('exampleSuggestions');
    const textarea = document.getElementById('problemDescription');
    
    // Only show if textarea is empty
    if (textarea && textarea.value.trim() === '' && dropdown) {
        dropdown.classList.remove('hidden');
    }
}

/**
 * Hide example suggestions dropdown with delay to allow clicking
 */
function hideExamples() {
    setTimeout(() => {
        const dropdown = document.getElementById('exampleSuggestions');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }, 150);
}

/**
 * Setup textarea suggestion dropdown behavior
 */
function setupTextareaDropdown() {
    const textarea = document.getElementById('problemDescription');
    const dropdown = document.getElementById('exampleSuggestions');
    
    if (!textarea || !dropdown) return;
    
    // Show dropdown on click if empty
    textarea.addEventListener('click', function() {
        if (this.value.trim() === '') {
            showExamples();
        }
    });
    
    // Show dropdown on focus if empty
    textarea.addEventListener('focus', function() {
        if (this.value.trim() === '') {
            showExamples();
        }
    });
    
    // Hide dropdown when user starts typing
    textarea.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            dropdown.classList.add('hidden');
        } else {
            // Show dropdown again if text is deleted and field becomes empty
            showExamples();
        }
    });
    
    // Hide dropdown on blur with delay to allow clicking suggestions
    textarea.addEventListener('blur', function() {
        hideExamples();
    });
    
    // Prevent dropdown from hiding when clicking inside it
    dropdown.addEventListener('mousedown', function(e) {
        e.preventDefault(); // Prevent blur from triggering
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!textarea.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}

/**
 * Select an example and insert it into the textarea
 * @param {HTMLElement} element - The clicked example element
 */
function selectExample(element) {
    const textarea = document.getElementById('problemDescription');
    const dropdown = document.getElementById('exampleSuggestions');
    
    if (textarea && element) {
        textarea.value = element.textContent.trim();
        textarea.focus();
        
        // Hide dropdown
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        
        // Trigger any change events
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

/**
 * Handle Join as Provider button click
 * Checks if user is authenticated and their current provider status
 * This function is immediately available in global scope
 */
window.handleJoinAsProvider = function() {
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
        // User is logged in, check if they're already a provider
        const userType = currentUser?.user_type || currentUser?.type;
        
        if (userType === 'provider') {
            // User is already a provider, show options dialog
            showProviderAccountDialog();
        } else {
            // User is logged in but not a provider, proceed to provider signup
            window.location.href = '/provider-signup';
        }
    } else {
        // User is not logged in, store the intent and redirect to login
        // Don't pass provider-signup as redirect URL to keep back button pointing to home
        sessionStorage.setItem('postLoginAction', 'provider-signup');
        window.location.href = '/login';
    }
};

/**
 * Show dialog for existing providers who try to join again
 */
function showProviderAccountDialog() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div class="flex items-center mb-4">
                <i class="fas fa-info-circle text-blue-500 text-xl mr-3"></i>
                <h3 class="text-lg font-semibold text-gray-900">Already a Provider</h3>
            </div>
            <p class="text-gray-700 mb-6">
                You're already registered as a service provider. You can:
            </p>
            <div class="space-y-3 mb-6">
                <button onclick="window.location.href='/provider-dashboard'" 
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    <i class="fas fa-tachometer-alt mr-2"></i>Go to Your Dashboard
                </button>
                <button onclick="showCreateAdditionalProfileInfo()" 
                        class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                    <i class="fas fa-plus mr-2"></i>Add Different Services (Coming Soon)
                </button>
            </div>
            <div class="text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded">
                <p><strong>Multiple Accounts Policy:</strong> To maintain platform integrity and prevent spam, we allow one account per person. However, you can offer multiple service categories under your existing account.</p>
            </div>
            <button onclick="closeProviderDialog()" 
                    class="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.currentProviderModal = modal;
}

/**
 * Show information about future multiple service profiles feature
 */
window.showCreateAdditionalProfileInfo = function() {
    const modal = window.currentProviderModal;
    modal.querySelector('.bg-white').innerHTML = `
        <div class="text-center">
            <i class="fas fa-tools text-indigo-500 text-3xl mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Multiple Service Profiles</h3>
            <p class="text-gray-700 mb-4">
                We're working on allowing providers to create multiple service profiles under one account. 
                This will let you separate different types of services (e.g., "John's Plumbing" and "John's Electrical") 
                while maintaining account integrity.
            </p>
            <p class="text-sm text-gray-600 mb-6">
                For now, you can add multiple service categories to your existing profile in your dashboard.
            </p>
            <div class="space-y-2">
                <button onclick="window.location.href='/provider-dashboard'" 
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Go to Dashboard
                </button>
                <button onclick="closeProviderDialog()" 
                        class="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </div>
    `;
};

/**
 * Close provider dialog modal
 */
window.closeProviderDialog = function() {
    if (window.currentProviderModal) {
        window.currentProviderModal.remove();
        window.currentProviderModal = null;
    }
};

/**
 * Application initialization
 */
function initializeApp() {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Initialize authentication
    initializeAuth();
    
    // Load categories - check if function exists (defined in categories.js module)
    if (typeof window.loadCategories === 'function') {
        window.loadCategories();
    } else {
        // If loadCategories is not available yet, wait a bit and try again
        setTimeout(() => {
            if (typeof window.loadCategories === 'function') {
                window.loadCategories();
            }
        }, 100);
    }
    
    // Setup event listeners
    initializeEventListeners();
    
    // Setup textarea dropdown behavior
    setupTextareaDropdown();
    
    // Check for pending service search after authentication
    setTimeout(() => {
        if (isAuthenticated()) {
            executePendingServiceSearch();
        }
    }, 1000);
    
    // Focus on text input to show cursor
    setTimeout(() => {
        const textArea = document.getElementById('problemDescription');
        if (textArea) {
            textArea.focus();
        }
    }, 500);
    
    console.log('Service Matching App initialized successfully');
    
    // Mark content as ready for skeleton loading system
    window.appInitialized = true;
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export main functions for debugging
if (typeof window !== 'undefined') {
    window.ServiceMatchingApp = {
        initializeApp,
        initializeDOMElements,
        initializeEventListeners,
        handleProblemSubmission,
        // Add other key functions for debugging
        analyzeProblem,
        findServiceProviders
    };
}
