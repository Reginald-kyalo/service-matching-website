/**
 * Categories module
 * Handles loading, rendering, and selection of service categories
 */

// Import the unified service catalog
import { SERVICE_CATEGORIES, SERVICES, ServiceUtils } from './service-catalog.js';

// Import color classes from globals.js (since it's not a module, we'll need to access from window)
// These should be available globally
let COLOR_CLASSES = {};

// Module variables
let categoryGroups = {};
let selectedCategory = null;
let submitBtn = null;
let submitHelpText = null;
let categoryGroupsContainer = null;

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    submitBtn = document.getElementById('findProvidersBtn') || document.getElementById('submitBtn');
    submitHelpText = document.getElementById('submitHelpText');
    categoryGroupsContainer = document.getElementById('categoryGroups');
    
    // Get color classes from global scope (set by globals.js)
    COLOR_CLASSES = window.COLOR_CLASSES || {};
});

/**
 * Load service categories from the unified catalog
 */
async function loadCategories() {
    try {
        // Transform the unified catalog to match the expected format
        categoryGroups = transformCatalogToGroups();
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

/**
 * Show main content with fade-in effect
 */
function showMainContent() {
    const pageContent = document.getElementById('pageContent');
    if (pageContent) {
        pageContent.classList.add('loaded');
    }
    
    // Hide skeleton overlay if it exists
    const skeletonOverlay = document.getElementById('skeletonOverlay');
    if (skeletonOverlay) {
        skeletonOverlay.style.display = 'none';
    }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    const errorContainer = document.getElementById('errorContainer') || createErrorContainer();
    errorContainer.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>${message}</span>
            </div>
        </div>
    `;
    errorContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Create error container if it doesn't exist
 */
function createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'errorContainer';
    container.className = 'max-w-4xl mx-auto px-4 py-2';
    
    // Insert at top of main content
    const mainContent = document.querySelector('main') || document.body;
    mainContent.insertBefore(container, mainContent.firstChild);
    
    return container;
}

/**
 * Transform the service catalog to the expected format for rendering
 */
function transformCatalogToGroups() {
    // Since SERVICE_CATEGORIES is flat, we'll create logical groups
    const repairsMaintenanceCategories = [
        'plumbing', 'electrical', 'hvac', 'carpentry', 'painting', 
        'appliance_repair', 'roofing', 'flooring', 'general_handyman'
    ];
    
    const homeServicesCategories = [
        'cleaning', 'gardening', 'security', 'pest_control', 'moving'
    ];
    
    const professionalServicesCategories = [
        'business_services', 'tutoring', 'technology', 'automotive'
    ];
    
    const personalServicesCategories = [
        'wellness', 'catering'
    ];
    
    const groups = {};
    
    // Repairs & Maintenance Group
    const repairsCategories = repairsMaintenanceCategories
        .filter(key => SERVICE_CATEGORIES[key])
        .map(key => ({
            category: key,
            name: SERVICE_CATEGORIES[key].name,
            icon: SERVICE_CATEGORIES[key].icon,
            description: SERVICE_CATEGORIES[key].description
        }));
    
    if (repairsCategories.length > 0) {
        groups["Repairs & Maintenance"] = {
            icon: "fas fa-tools",
            description: "Professional repair and maintenance services",
            color: "blue",
            categories: repairsCategories
        };
    }
    
    // Home Improvement & Services Group
    const homeServicesCats = homeServicesCategories
        .filter(key => SERVICE_CATEGORIES[key])
        .map(key => ({
            category: key,
            name: SERVICE_CATEGORIES[key].name,
            icon: SERVICE_CATEGORIES[key].icon,
            description: SERVICE_CATEGORIES[key].description
        }));
    
    if (homeServicesCats.length > 0) {
        groups["Home Services"] = {
            icon: "fas fa-home",
            description: "Home improvement and specialty services",
            color: "green",
            categories: homeServicesCats
        };
    }
    
    // Professional Services Group
    const professionalServicesCats = professionalServicesCategories
        .filter(key => SERVICE_CATEGORIES[key])
        .map(key => ({
            category: key,
            name: SERVICE_CATEGORIES[key].name,
            icon: SERVICE_CATEGORIES[key].icon,
            description: SERVICE_CATEGORIES[key].description
        }));
    
    if (professionalServicesCats.length > 0) {
        groups["Professional Services"] = {
            icon: "fas fa-briefcase",
            description: "Business and professional support services",
            color: "indigo",
            categories: professionalServicesCats
        };
    }
    
    // Personal Services Group
    const personalServicesCats = personalServicesCategories
        .filter(key => SERVICE_CATEGORIES[key])
        .map(key => ({
            category: key,
            name: SERVICE_CATEGORIES[key].name,
            icon: SERVICE_CATEGORIES[key].icon,
            description: SERVICE_CATEGORIES[key].description
        }));
    
    if (personalServicesCats.length > 0) {
        groups["Personal Services"] = {
            icon: "fas fa-user",
            description: "Personal care and lifestyle services",
            color: "pink",
            categories: personalServicesCats
        };
    }
    
    // Add any remaining categories to a general group
    const allUsedKeys = [...repairsMaintenanceCategories, ...homeServicesCategories, ...professionalServicesCategories, ...personalServicesCategories];
    const remainingCategories = Object.keys(SERVICE_CATEGORIES)
        .filter(key => !allUsedKeys.includes(key))
        .map(key => ({
            category: key,
            name: SERVICE_CATEGORIES[key].name,
            icon: SERVICE_CATEGORIES[key].icon,
            description: SERVICE_CATEGORIES[key].description
        }));
    
    if (remainingCategories.length > 0) {
        groups["Other Services"] = {
            icon: "fas fa-cogs",
            description: "Additional professional services",
            color: "gray",
            categories: remainingCategories
        };
    }
    
    return groups;
}

/**
 * Render category selection interface
 */
function renderCategories() {
    let categoriesHTML = '';
    
    Object.entries(categoryGroups).forEach(([groupName, groupData]) => {
        const bgClass = COLOR_CLASSES[groupData.color] || 'border-gray-200 bg-gray-50';
        const isRepairsMaintenance = groupName === "Repairs & Maintenance";
        const groupClass = isRepairsMaintenance ? 'category-group' : '';
        
        categoriesHTML += `
            <div class="border-2 ${bgClass} rounded-xl p-6 transition-all duration-200 ${groupClass}">
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
                    ${groupData.categories.map(category => {
                        const cardClass = isRepairsMaintenance ? 'service-card' : 'hover:shadow-md';
                        const borderClass = isRepairsMaintenance ? '' : `hover:border-${groupData.color}-300`;
                        return `
                        <div class="category-option ${cardClass} cursor-pointer p-4 rounded-lg bg-white ${borderClass} transition-all duration-200 group relative"
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
                            <div class="service-details" onclick="event.stopPropagation(); showServiceInfo('${category.category}', '${category.name}', '${category.description}', this)">
                                <i class="fas fa-info"></i>
                            </div>
                        </div>
                    `;}).join('')}
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

/**
 * Show service information card
 * @param {string} categoryId - The category ID
 * @param {string} categoryName - The category name
 * @param {string} categoryDescription - The category description
 * @param {HTMLElement} infoButton - The info button element
 */
function showServiceInfo(categoryId, categoryName, categoryDescription, infoButton) {
    // Remove any existing info cards
    const existingCard = document.getElementById('serviceInfoCard');
    if (existingCard) {
        existingCard.remove();
    }
    
    // Get detailed information based on category
    const detailedInfo = getDetailedServiceInfo(categoryId);
    
    // Create info card
    const infoCard = document.createElement('div');
    infoCard.id = 'serviceInfoCard';
    infoCard.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    infoCard.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">${categoryName}</h3>
                    <button onclick="closeServiceInfo()" class="text-gray-400 hover:text-gray-600 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="text-sm text-gray-600 mb-4">${categoryDescription}</p>
                <div class="space-y-3">
                    <h4 class="font-semibold text-gray-900">Common services include:</h4>
                    <ul class="text-sm text-gray-600 space-y-1">
                        ${detailedInfo.map(item => `<li class="flex items-start"><i class="fas fa-check text-green-500 mr-2 mt-1 text-xs"></i>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button onclick="closeServiceInfo()" class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
                        Close
                    </button>
                    <button onclick="closeServiceInfo(); selectCategoryFromInfo('${categoryId}', '${categoryName}')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm">
                        Select This Service
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(infoCard);
    
    // Close on backdrop click
    infoCard.addEventListener('click', function(e) {
        if (e.target === infoCard) {
            closeServiceInfo();
        }
    });
}

/**
 * Close service info card
 */
function closeServiceInfo() {
    const infoCard = document.getElementById('serviceInfoCard');
    if (infoCard) {
        infoCard.remove();
    }
}

/**
 * Select category from info card
 * @param {string} categoryId - The category ID
 * @param {string} categoryName - The category name
 */
function selectCategoryFromInfo(categoryId, categoryName) {
    // Find the category element and trigger selection
    const categoryElement = document.querySelector(`[onclick*="${categoryId}"]`);
    if (categoryElement) {
        selectCategory(categoryId, categoryName, categoryElement);
    }
}

/**
 * Get detailed service information
 * @param {string} categoryId - The category ID
 * @returns {Array} Array of detailed service descriptions
 */
function getDetailedServiceInfo(categoryId) {
    const serviceDetails = {
        'house_cleaning': [
            'Regular weekly or monthly house cleaning',
            'Deep cleaning for move-in/move-out',
            'Kitchen and bathroom sanitization',
            'Floor mopping and vacuuming',
            'Dusting furniture and surfaces',
            'Window cleaning (interior)',
            'Organizing and tidying rooms'
        ],
        'carpet_couch_cleaning': [
            'Steam cleaning for carpets and rugs',
            'Upholstery cleaning for sofas and chairs',
            'Stain removal and spot treatment',
            'Fabric protection application',
            'Pet odor elimination',
            'Mattress cleaning and sanitization'
        ],
        'pest_control': [
            'Cockroach and ant extermination',
            'Termite inspection and treatment',
            'Rodent control (rats and mice)',
            'Bee and wasp nest removal',
            'Fumigation services',
            'Preventive pest control measures'
        ],
        'lawn_trimming': [
            'Grass cutting and lawn mowing',
            'Hedge trimming and shaping',
            'Tree pruning and branch removal',
            'Garden weeding and maintenance',
            'Flower bed preparation',
            'Compound cleaning and landscaping'
        ],
        'sitters': [
            'Professional babysitting services',
            'Pet sitting and dog walking',
            'House sitting while you\'re away',
            'Elderly companion care',
            'Overnight care services',
            'Emergency childcare support'
        ],
        'fridge_repair': [
            'Temperature regulation problems',
            'Ice maker and water dispenser issues',
            'Door seal replacement',
            'Compressor and motor repairs',
            'Thermostat calibration',
            'Cleaning and maintenance'
        ],
        'microwave_repair': [
            'Heating element replacement',
            'Turntable motor repair',
            'Door latch and safety switch issues',
            'Control panel malfunctions',
            'Interior light replacement',
            'General maintenance and cleaning'
        ],
        'tv_display_repair': [
            'Screen replacement and repair',
            'Audio and video troubleshooting',
            'Smart TV software updates',
            'HDMI and connection port repair',
            'Remote control programming',
            'Wall mounting and setup'
        ],
        'sound_systems_repair': [
            'Speaker repair and replacement',
            'Amplifier troubleshooting',
            'Radio tuning and antenna issues',
            'Bluetooth connectivity problems',
            'Audio cable and connection repair',
            'Sound system installation'
        ],
        'washing_machine_repair': [
            'Spin cycle and drainage issues',
            'Water inlet and outlet problems',
            'Door lock and latch repair',
            'Drum and bearing replacement',
            'Control panel and timer issues',
            'Installation and setup services'
        ],
        'construction': [
            'New house construction',
            'Room additions and extensions',
            'Foundation work and repairs',
            'Structural modifications',
            'Concrete work and driveways',
            'Building permits and planning'
        ],
        'carpentry': [
            'Custom furniture making',
            'Kitchen cabinet installation',
            'Door and window frame repair',
            'Wooden flooring installation',
            'Deck and fence construction',
            'Furniture repair and restoration'
        ],
        'painting': [
            'Interior wall and ceiling painting',
            'Exterior house painting',
            'Primer and surface preparation',
            'Color consultation and matching',
            'Texture and decorative finishes',
            'Paint removal and restoration'
        ],
        'flooring': [
            'Tile installation and repair',
            'Hardwood floor installation',
            'Carpet installation and replacement',
            'Laminate and vinyl flooring',
            'Floor sanding and refinishing',
            'Subfloor repair and preparation'
        ],
        'roofing': [
            'Roof leak detection and repair',
            'Shingle replacement and installation',
            'Gutter cleaning and repair',
            'Roof inspection and maintenance',
            'Skylight installation',
            'Waterproofing and sealing'
        ],
        'plumbing': [
            'Pipe leak detection and repair',
            'Toilet and sink installation',
            'Water heater repair and replacement',
            'Drain cleaning and unclogging',
            'Faucet and fixture repair',
            'Water pressure issues'
        ],
        'electrical': [
            'Outlet and switch installation',
            'Electrical wiring and rewiring',
            'Circuit breaker repair',
            'Light fixture installation',
            'Electrical safety inspections',
            'Power surge protection'
        ],
        'hvac': [
            'Air conditioning repair and service',
            'Heating system maintenance',
            'Thermostat installation and repair',
            'Air duct cleaning',
            'Ventilation system installation',
            'Energy efficiency consultations'
        ]
    };
    
    return serviceDetails[categoryId] || ['Professional service available', 'Contact for detailed information'];
}

/**
 * Select a category
 * @param {string} categoryValue - The category value
 * @param {string} categoryName - The display name of the category
 * @param {HTMLElement} element - The clicked category element
 */
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
    const selectedCategoryInput = document.getElementById('selectedCategory');
    if (selectedCategoryInput) {
        selectedCategoryInput.value = categoryValue;
    }
    
    // Enable submit button with improved styling
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    submitBtn.classList.add('pulse-effect');
    
    // Update help text with success styling
    const displayName = categoryName.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add spaces between words
    submitHelpText.innerHTML = `
        <div class="flex items-center justify-center text-green-600">
            <i class="fas fa-check-circle mr-2"></i>
            <span><strong>${displayName}</strong> selected - Ready to find professionals!</span>
        </div>
    `;
    submitHelpText.classList.remove('text-gray-500');
    submitHelpText.classList.add('text-green-600');
    
    // Disable automatic scrolling - commented out for now
    // setTimeout(() => {
    //     const rect = submitBtn.getBoundingClientRect();
    //     const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    //     
    //     if (!isVisible) {
    //         submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //     }
    //     submitBtn.classList.remove('pulse-effect');
    // }, 300);
}

/**
 * Highlight the AI suggested category
 * @param {string} suggestedCategory - The AI suggested category
 * @param {number} confidence - The confidence level
 */
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

// Export functions to global scope for use by other scripts
if (typeof window !== 'undefined') {
    window.loadCategories = loadCategories;
    window.selectCategory = selectCategory;
    window.showServiceInfo = showServiceInfo;
    window.closeServiceInfo = closeServiceInfo;
    window.selectCategoryFromInfo = selectCategoryFromInfo;
    window.highlightSuggestedCategory = highlightSuggestedCategory;
}
