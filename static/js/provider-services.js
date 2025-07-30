/**
 * Provider Services Management JavaScript
 * Handles service selection and management for providers
 */

// Import the unified service catalog
import { SERVICE_CATEGORIES, SERVICES, ServiceUtils } from './service-catalog.js';

let allServices = [];
let selectedServices = new Set();
let serviceCategories = {};

/**
 * Initialize the services management page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and provider status
    const userType = currentUser?.user_type || currentUser?.type;
    if (!isAuthenticated() || !currentUser || userType !== 'provider') {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.href)}`;
        return;
    }
    
    initializeProviderInfo();
    loadServices();
    loadProviderServices();
});

/**
 * Initialize provider info in navigation
 */
function initializeProviderInfo() {
    const providerInfo = document.getElementById('providerInfo');
    if (providerInfo && currentUser) {
        providerInfo.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-indigo-600"></i>
                </div>
                <div>
                    <div class="text-sm font-medium text-gray-900">${currentUser.name}</div>
                    <div class="text-xs text-gray-500">Provider</div>
                </div>
            </div>
        `;
    }
}

/**
 * Load all available services from the unified catalog
 */
async function loadServices() {
    try {
        // Use the unified service catalog instead of API call
        allServices = ServiceUtils.getAllServices();
        serviceCategories = Object.keys(SERVICE_CATEGORIES).reduce((acc, key) => {
            acc[key] = SERVICE_CATEGORIES[key].name;
            return acc;
        }, {});
        
        populateCategoryFilter();
        displayServices();
        
    } catch (error) {
        console.error('Error loading services:', error);
        showServicesError();
    }
}

/**
 * Load provider's current services
 */
async function loadProviderServices() {
    try {
        const response = await fetch('/api/providers/services', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const providerServices = await response.json();
            selectedServices = new Set(providerServices.map(s => s.id || s.service_id));
            updateSelectedCount();
            updateServiceCards();
        }
        
    } catch (error) {
        console.error('Error loading provider services:', error);
    }
}

/**
 * Populate category filter dropdown
 */
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    // Add category options
    Object.keys(serviceCategories).forEach(categoryKey => {
        const option = document.createElement('option');
        option.value = categoryKey;
        option.textContent = serviceCategories[categoryKey];
        categoryFilter.appendChild(option);
    });
}

/**
 * Display services in grid
 */
function displayServices(filteredServices = null) {
    const servicesGrid = document.getElementById('servicesGrid');
    const servicesLoading = document.getElementById('servicesLoading');
    
    if (!servicesGrid) return;
    
    // Hide loading
    if (servicesLoading) {
        servicesLoading.style.display = 'none';
    }
    
    const servicesToShow = filteredServices || allServices;
    
    if (servicesToShow.length === 0) {
        servicesGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <i class="fas fa-search text-4xl mb-4"></i>
                <p class="text-lg">No services found</p>
                <p class="text-sm">Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    servicesGrid.innerHTML = servicesToShow.map(service => {
        const categoryInfo = ServiceUtils.getCategoryInfo(service.category);
        const colorClasses = categoryInfo ? categoryInfo.colorClasses : SERVICE_CATEGORIES.general_handyman.colorClasses;
        
        return `
        <div class="service-card ${colorClasses.bg} ${colorClasses.border} border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedServices.has(service.id) ? `selected ${colorClasses.hover} border-${categoryInfo?.color || 'indigo'}-400` : 'hover:shadow-md'}" 
             onclick="toggleService('${service.id}')">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <h3 class="font-medium ${colorClasses.text} text-sm">${service.name}</h3>
                    <p class="text-xs text-gray-500 mt-1">${serviceCategories[service.category] || service.category}</p>
                </div>
                <div class="ml-2">
                    <i class="fas fa-check-circle text-${categoryInfo?.color || 'indigo'}-600 ${selectedServices.has(service.id) ? '' : 'hidden'}" 
                       id="check-${service.id}"></i>
                    <i class="far fa-circle text-gray-400 ${selectedServices.has(service.id) ? 'hidden' : ''}" 
                       id="uncheck-${service.id}"></i>
                </div>
            </div>
            
            ${service.description ? `
                <p class="text-xs text-gray-600 leading-relaxed">${service.description}</p>
            ` : ''}
            
            ${service.typical_rate ? `
                <div class="mt-2 pt-2 border-t border-gray-200">
                    <span class="text-xs ${colorClasses.text}">Typical rate: KES ${service.typical_rate.toLocaleString()}</span>
                </div>
            ` : ''}
        </div>
        `;
    }).join('');
}

/**
 * Filter services based on search and category
 */
function filterServices() {
    const searchTerm = document.getElementById('serviceSearch').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    let filteredServices = allServices;
    
    // Filter by search term
    if (searchTerm) {
        filteredServices = filteredServices.filter(service => 
            service.name.toLowerCase().includes(searchTerm) ||
            (service.description && service.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter by category
    if (selectedCategory) {
        filteredServices = filteredServices.filter(service => 
            service.category === selectedCategory
        );
    }
    
    displayServices(filteredServices);
}

/**
 * Toggle service selection
 */
function toggleService(serviceId) {
    if (selectedServices.has(serviceId)) {
        selectedServices.delete(serviceId);
    } else {
        selectedServices.add(serviceId);
    }
    
    updateServiceCard(serviceId);
    updateSelectedCount();
}

/**
 * Update single service card display
 */
function updateServiceCard(serviceId) {
    const card = document.querySelector(`[onclick="toggleService('${serviceId}')"]`);
    const checkIcon = document.getElementById(`check-${serviceId}`);
    const uncheckIcon = document.getElementById(`uncheck-${serviceId}`);
    
    if (card && checkIcon && uncheckIcon) {
        if (selectedServices.has(serviceId)) {
            card.classList.add('selected');
            checkIcon.classList.remove('hidden');
            uncheckIcon.classList.add('hidden');
        } else {
            card.classList.remove('selected');
            checkIcon.classList.add('hidden');
            uncheckIcon.classList.remove('hidden');
        }
    }
}

/**
 * Update all service cards
 */
function updateServiceCards() {
    // Update all service cards based on current selection state
    allServices.forEach(service => {
        updateServiceCard(service.id);
    });
}

/**
 * Update selected count display
 */
function updateSelectedCount() {
    const selectedCount = document.getElementById('selectedCount');
    if (selectedCount) {
        const count = selectedServices.size;
        selectedCount.textContent = `${count} service${count !== 1 ? 's' : ''} selected`;
    }
}

/**
 * Select all services
 */
function selectAllServices() {
    // Add all services to selection
    allServices.forEach(service => {
        selectedServices.add(service.id);
    });
    
    // Update all service cards
    updateServiceCards();
    updateSelectedCount();
}

/**
 * Clear all services
 */
function clearAllServices() {
    // Store previously selected services to update their visual state
    const previouslySelected = Array.from(selectedServices);
    
    // Clear the selection
    selectedServices.clear();
    
    // Update visual state for all previously selected cards
    previouslySelected.forEach(serviceId => {
        updateServiceCard(serviceId);
    });
    
    updateSelectedCount();
}

/**
 * Save selected services
 */
async function saveServices() {
    try {
        const serviceIds = Array.from(selectedServices);
        
        const response = await fetch('/api/providers/services', {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service_ids: serviceIds
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to save services');
        }
        
        showNotification('Services updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving services:', error);
        showNotification(error.message || 'Failed to save services', 'error');
    }
}

/**
 * Show services loading error
 */
function showServicesError() {
    const servicesGrid = document.getElementById('servicesGrid');
    const servicesLoading = document.getElementById('servicesLoading');
    const servicesError = document.getElementById('servicesError');
    
    if (servicesGrid) servicesGrid.style.display = 'none';
    if (servicesLoading) servicesLoading.style.display = 'none';
    if (servicesError) servicesError.classList.remove('hidden');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationMessage = document.getElementById('notificationMessage');
    
    if (!notification || !notificationIcon || !notificationMessage) return;
    
    // Set icon and color based on type
    const iconClass = type === 'success' ? 'fa-check-circle text-green-500' : 
                     type === 'error' ? 'fa-exclamation-circle text-red-500' : 
                     'fa-info-circle text-blue-500';
    
    notificationIcon.className = `fas ${iconClass}`;
    notificationMessage.textContent = message;
    
    // Show notification
    notification.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

/**
 * Hide notification
 */
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.add('hidden');
    }
}

// Expose functions globally for HTML onclick handlers
window.saveServices = saveServices;
window.clearAllServices = clearAllServices;
window.selectAllServices = selectAllServices;
window.toggleService = toggleService;
