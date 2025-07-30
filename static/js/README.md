# JavaScript Modules Documentation

This document describes the modularized JavaScript architecture for the Service Matching Website.

## File Structure

```
static/js/
├── globals.js          # Global variables and constants
├── auth.js            # Authentication functionality
├── categories.js      # Category loading and selection
├── ai-analysis.js     # AI problem analysis
├── providers.js       # Provider search and display
├── chat.js           # Chat and rating functionality
├── ui-utils.js       # UI utilities and helpers
└── main.js           # Main entry point and initialization
```

## Module Dependencies

The modules must be loaded in this specific order due to dependencies:

1. **globals.js** - Defines global variables used by other modules
2. **ui-utils.js** - Utility functions used across modules
3. **auth.js** - Authentication functions
4. **categories.js** - Category management (depends on globals, ui-utils)
5. **ai-analysis.js** - AI analysis (depends on globals, ui-utils, categories)
6. **providers.js** - Provider management (depends on globals, ui-utils, auth)
7. **chat.js** - Chat functionality (depends on globals, ui-utils, auth, providers)
8. **main.js** - Main initialization (depends on all other modules)

## Module Descriptions

### globals.js
- Contains all global variables and constants
- Defines application state variables
- Exports color schemes and UI constants
- No dependencies

### auth.js
- Handles user authentication
- Manages login/logout functionality
- Provides authentication utilities
- Dependencies: globals.js

### categories.js
- Loads service categories from API
- Renders category selection interface
- Handles category selection logic
- Manages AI category suggestions
- Dependencies: globals.js, ui-utils.js

### ai-analysis.js
- Handles AI-powered problem analysis
- Displays AI results and confidence levels
- Manages urgency level indicators
- Dependencies: globals.js, ui-utils.js, categories.js

### providers.js
- Searches for service providers
- Displays provider results with filtering
- Handles provider sorting and filtering
- Manages provider interaction buttons
- Dependencies: globals.js, ui-utils.js, auth.js

### chat.js
- Manages chat functionality with providers
- Handles provider rating system
- Loads and displays chat messages
- Dependencies: globals.js, ui-utils.js, auth.js, providers.js

### ui-utils.js
- Contains utility functions for UI interactions
- Error/success message handling
- Loading state management
- File handling utilities
- Formatting functions
- No dependencies

### main.js
- Main application entry point
- Initializes all modules
- Sets up event listeners
- Handles form submission
- Dependencies: All other modules

## Key Functions by Module

### Global State (globals.js)
- `currentSessionId` - Current analysis session
- `categoryGroups` - Available service categories
- `selectedCategory` - Currently selected category
- `authToken` - User authentication token
- `currentUser` - Current user information

### Authentication (auth.js)
- `initializeAuth()` - Initialize auth UI
- `logout()` - Handle user logout
- `isAuthenticated()` - Check auth status
- `getAuthHeaders()` - Get API headers

### Categories (categories.js)
- `loadCategories()` - Load categories from API
- `renderCategories()` - Render category UI
- `selectCategory()` - Handle category selection
- `highlightSuggestedCategory()` - Highlight AI suggestions

### AI Analysis (ai-analysis.js)
- `analyzeProblem()` - Analyze problem with AI
- `displayAIResults()` - Show AI analysis results

### Providers (providers.js)
- `findServiceProviders()` - Search for providers
- `displayProviderResults()` - Show provider results
- `applyFilters()` - Apply search filters
- `applySorting()` - Sort provider results

### Chat (chat.js)
- `openChatModal()` - Open chat interface
- `sendChatMessage()` - Send chat message
- `rateProvider()` - Rate a provider
- `loadChatMessages()` - Load chat history

### UI Utils (ui-utils.js)
- `showErrorMessage()` - Display error messages
- `showMainContent()` - Show main content area
- `setButtonLoading()` - Set button loading state
- `handleFileSelection()` - Handle file uploads

### Main (main.js)
- `initializeApp()` - Main app initialization
- `handleProblemSubmission()` - Handle form submission
- `initializeEventListeners()` - Setup event handlers

## Debugging

The main application object is available globally for debugging:

```javascript
// Access the main app functions for debugging
window.ServiceMatchingApp.initializeApp()
window.ServiceMatchingApp.loadCategories()
// etc.
```

## Error Handling

Each module implements its own error handling:
- Network errors are caught and displayed to users
- Console logging for debugging
- Graceful degradation when features fail

## Event Handling

Events are centrally managed in main.js:
- Form submissions
- File input changes
- Keyboard events (Enter key in chat)
- Button clicks

## API Integration

API calls are distributed across modules:
- Categories: `/api/problems/categories`
- AI Analysis: `/api/problems/detect`
- Providers: `/api/matching/find-providers`
- Chat: `/api/matching/chat/*`
- Reviews: `/api/matching/review`

## Benefits of Modularization

1. **Easier Debugging** - Issues can be isolated to specific modules
2. **Better Maintainability** - Related functionality is grouped together
3. **Improved Readability** - Smaller, focused files are easier to understand
4. **Easier Testing** - Individual modules can be tested independently
5. **Better Collaboration** - Multiple developers can work on different modules
6. **Code Reusability** - Utility functions can be shared across modules
