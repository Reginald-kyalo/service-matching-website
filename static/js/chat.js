/**
 * Chat module
 * Handles chat functionality and provider rating
 */

/**
 * Open chat modal
 * @param {number} providerId - The provider ID
 * @param {string} providerName - The provider name
 */
async function openChatModal(providerId, providerName) {
    currentChatProvider = providerId;
    document.getElementById('chatProviderName').textContent = `Chat with ${providerName}`;
    document.getElementById('chatModal').classList.remove('hidden');
    
    // Load existing chat messages
    await loadChatMessages();
}

/**
 * Close chat modal
 */
function closeChatModal() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.classList.add('hidden');
    }
    currentChatProvider = null;
}

/**
 * Load chat messages for current session
 */
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

/**
 * Display chat messages in the chat interface
 * @param {Array} messages - Array of message objects
 */
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

/**
 * Send chat message
 */
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const messageText = chatInput.value.trim();
    
    if (!messageText || !currentChatProvider || !currentSessionId || !authToken) return;
    
    try {
        const response = await fetch('/api/matching/chat/send', {
            method: 'POST',
            headers: getAuthHeaders(),
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

/**
 * Rate provider
 * @param {number} providerId - The provider ID
 * @param {string} providerName - The provider name
 */
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

/**
 * Select rating
 * @param {number} rating - The selected rating (1-5)
 */
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

/**
 * Submit rating
 * @param {number} providerId - The provider ID
 */
async function submitRating(providerId) {
    if (!window.selectedRatingValue || !authToken) return;
    
    const comment = document.getElementById('reviewComment').value.trim();
    
    try {
        const response = await fetch('/api/matching/review', {
            method: 'POST',
            headers: getAuthHeaders(),
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

/**
 * Close rating modal
 */
function closeRatingModal() {
    if (window.currentRatingModal) {
        document.body.removeChild(window.currentRatingModal);
        window.currentRatingModal = null;
        window.selectedRatingValue = 0;
    }
}
