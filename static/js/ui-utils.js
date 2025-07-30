/**
 * UI Utilities module
 * Contains utility functions for UI interactions and helpers
 */

/**
 * Show main content and hide preloader
 */
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

/**
 * Show error message to user
 * @param {string} message - The error message to display
 */
export function showErrorMessage(message) {
    // Create or update error message display
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
        
        // Insert at the top of the form
        const form = document.getElementById('problemForm');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
        }
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

/**
 * Hide error message
 */
function hideErrorMessage() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Show success message to user
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
    // Create success message display
    const successDiv = document.createElement('div');
    successDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
    successDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-green-700 hover:text-green-900">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Insert at the top of the form
    const form = document.getElementById('problemForm');
    if (form) {
        form.insertBefore(successDiv, form.firstChild);
    }
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 3000);
}

/**
 * Show loading state for a button
 * @param {HTMLElement} button - The button element
 * @param {string} loadingText - Text to show during loading
 * @param {string} loadingIcon - Icon class for loading state
 */
export function setButtonLoading(button, loadingText = 'Loading...', loadingIcon = 'fas fa-spinner fa-spin') {
    if (!button) return;
    
    // Store original content
    button.dataset.originalContent = button.innerHTML;
    button.dataset.originalDisabled = button.disabled;
    
    // Set loading state
    button.innerHTML = `<i class="${loadingIcon} mr-2"></i>${loadingText}`;
    button.disabled = true;
}

/**
 * Reset button from loading state
 * @param {HTMLElement} button - The button element
 */
export function resetButtonLoading(button) {
    if (!button) return;
    
    // Restore original content
    if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        button.disabled = button.dataset.originalDisabled === 'true';
        
        // Clean up
        delete button.dataset.originalContent;
        delete button.dataset.originalDisabled;
    }
}

/**
 * Handle file selection and show preview
 * @param {Event} event - The file input change event
 */
export function handleFileSelection(event) {
    const files = event.target.files;
    const filePreview = document.getElementById('filePreview');
    const fileList = document.getElementById('fileList');
    
    if (files.length > 0) {
        if (filePreview) {
            filePreview.classList.remove('hidden');
        }
        
        if (fileList) {
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
        }
    } else {
        if (filePreview) {
            filePreview.classList.add('hidden');
        }
    }
}

/**
 * Scroll element into view if not visible
 * @param {HTMLElement} element - Element to scroll to
 * @param {string} behavior - Scroll behavior ('smooth' or 'auto')
 * @param {string} block - Scroll alignment ('start', 'center', 'end', 'nearest')
 */
function scrollIntoViewIfNeeded(element, behavior = 'smooth', block = 'center') {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    
    if (!isVisible) {
        element.scrollIntoView({ behavior, block });
    }
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format distance
 * @param {number} miles - Distance in miles
 * @returns {string} Formatted distance string
 */
function formatDistance(miles) {
    if (miles < 1) {
        return `${(miles * 5280).toFixed(0)} ft`;
    }
    return `${miles.toFixed(1)} mi`;
}

/**
 * Format relative time
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(date) {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return targetDate.toLocaleDateString();
}
