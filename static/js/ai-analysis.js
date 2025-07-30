/**
 * AI Analysis module
 * Handles AI-powered problem analysis and detection
 */

/**
 * Analyze problem with AI
 */
export async function analyzeProblem() {
    const description = document.getElementById('problemDescription').value;
    
    if (!description.trim()) {
        showErrorMessage('Please describe your problem first.');
        return;
    }
    
    // Show loading state
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Searching...';
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
        
        // Don't display AI results - just highlight the suggested category
        // displayAIResults(result);
        
        // Highlight suggested category
        highlightSuggestedCategory(result.ai_suggested_category, result.confidence);
        
        // Show a brief success message
        showSuccessMessage('Search completed! Check the highlighted category below.');
        
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage(error.message || 'Sorry, there was an error analyzing your problem. Please try again.');
    } finally {
        // Reset button
        analyzeBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Search';
        analyzeBtn.disabled = false;
    }
}

/**
 * Display AI analysis results
 * @param {Object} result - The AI analysis result
 */
function displayAIResults(result) {
    const confidencePercent = Math.round(result.confidence * 100);
    const confidenceColor = result.confidence > 0.7 ? 'text-green-600' : result.confidence > 0.4 ? 'text-yellow-600' : 'text-red-600';
    const confidenceBg = result.confidence > 0.7 ? 'bg-green-100' : result.confidence > 0.4 ? 'bg-yellow-100' : 'bg-red-100';
    
    const urgencyColor = URGENCY_COLORS[result.urgency_level] || URGENCY_COLORS.low;
    
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
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${urgencyColor}">
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
    `;
    
    // Don't show AI results section - we just want the search functionality
    // aiResults.classList.remove('hidden');
}
