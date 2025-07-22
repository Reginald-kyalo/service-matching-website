# ServiceMatch - Complete Service Provider Matching Platform

A modern, AI-powered web platform that intelligently connects users with local service providers for household and construction needs.

## ✨ Key Features

### � AI-Powered Problem Detection
- Intelligent analysis of user problem descriptions
- Automatic service category suggestion with confidence scoring
- Keyword matching and urgency level detection
- Support for manual category selection

### 🔐 User Authentication & Profiles  
- Secure user registration and login with JWT tokens
- Complete user profiles with location data
- Password hashing and email validation
- Session management and protected routes

### 📍 Location-Based Provider Matching
- Automatic distance calculation from user location
- Intelligent provider ranking by proximity
- Location-aware search results
- Support for address, city, state, ZIP filtering

### � Advanced Filtering & Sorting
- Filter by distance (5, 10, 25, 50+ miles)
- Filter by minimum rating (3+, 4+, 4.5+ stars)
- Filter by maximum hourly rate
- Sort by distance, rating, cost, or review count

### 💬 Real-Time Chat System
- Direct messaging between users and providers
- Session-based chat with message history
- Real-time communication for quotes and scheduling
- User-friendly chat interface

### ⭐ Review & Rating System
- 5-star rating system for service providers
- Written reviews with user testimonials
- Provider rating aggregation and display
- Review history and provider reputation tracking

### 🎨 Modern UI/UX
- Clean, responsive design with Tailwind CSS
- Interactive category selection with animations
- Professional provider cards with key information
- Modal dialogs for chat and rating workflows

## Technology Stack

- **Backend**: Python with FastAPI
- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **Cache**: Redis
- **Server**: Uvicorn (development) / Nginx + Gunicorn (production)
- **AI/ML**: scikit-learn, NLTK, spaCy (ready for advanced NLP)

## Quick Start

### Prerequisites
- Python 3.8+
- Redis server
- Node.js (for frontend dependencies, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd service-matching-website
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

6. **Run the application**
   ```bash
   python main.py
   ```

7. **Access the application**
   Open http://localhost:8000 in your browser

## How It Works

### 1. Problem Description
Users describe their issue in plain English:
- "My kitchen tap is not working properly"
- "The lights in my living room keep flickering"
- "I need someone to deep clean my house"

### 2. Smart Analysis & Category Selection
The system offers two paths:
- **AI Analysis**: Get instant category suggestions with confidence scores
- **Manual Selection**: Choose from organized category groups
- Beautiful, intuitive interface with clear category organization

### 3. Instant Matching
The platform provides:
- Direct connection to qualified service providers
- No lengthy surveys or questionnaires
- Immediate access to provider contact information
- Cost estimates and availability information

## API Endpoints

### Problem Detection
- `POST /api/problems/detect` - Analyze problem description
- `GET /api/problems/session/{session_id}` - Get session data
- `POST /api/problems/analyze-image` - Analyze uploaded images

### Surveys
- `GET /api/surveys/{session_id}` - Get survey for session
- `POST /api/surveys/submit` - Submit survey responses

### Matching (Coming Soon)
- `GET /api/matching/recommendations/{session_id}` - Get provider recommendations
- `POST /api/matching/contact-provider` - Initiate provider contact

## Project Structure

```
service-matching-website/
├── app/
│   ├── core/
│   │   ├── config.py           # Configuration settings
│   │   └── redis_client.py     # Redis connection
│   ├── database/
│   │   └── database.py         # Database setup
│   ├── routers/
│   │   ├── problems.py         # Problem detection endpoints
│   │   ├── surveys.py          # Survey endpoints
│   │   ├── matching.py         # Matching endpoints
│   │   └── users.py            # User management
│   └── services/
│       ├── problem_detector.py # Core problem detection logic
│       └── survey_generator.py # Dynamic survey generation
├── static/
│   └── js/
│       └── app.js              # Frontend JavaScript
├── templates/
│   └── index.html              # Main HTML template
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Development

### Adding New Service Categories

1. **Update the ProblemDetector**
   ```python
   # In app/services/problem_detector.py
   ServiceCategory.NEW_CATEGORY = "new_category"
   
   # Add keywords and patterns
   self.category_keywords[ServiceCategory.NEW_CATEGORY] = {
       "keywords": ["keyword1", "keyword2"],
       "emergency_keywords": ["urgent_keyword"],
       "urgency_indicators": ["urgent_indicator"]
   }
   ```

2. **Create Survey Template**
   ```python
   # In app/services/survey_generator.py
   ServiceCategory.NEW_CATEGORY: {
       "title": "New Category Assessment",
       "description": "Help us understand your needs",
       "questions": [...]
   }
   ```

### Enhancing Problem Detection

The current system uses rule-based keyword matching. To improve accuracy:

1. **Add Machine Learning**
   - Train classifiers on real user descriptions
   - Use embeddings for semantic similarity
   - Implement confidence scoring improvements

2. **Image Analysis**
   - Computer vision for problem identification
   - Damage assessment from photos
   - Equipment and material recognition

3. **Context Understanding**
   - Location-based context (room, building type)
   - Seasonal patterns and common issues
   - User history and preferences

## Production Deployment

### Using Docker
```bash
# Build image
docker build -t service-matching .

# Run with docker-compose
docker-compose up -d
```

### Using Nginx + Gunicorn
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Future Enhancements

### Short Term
- [ ] User authentication and profiles
- [ ] Service provider registration and verification
- [ ] Real-time messaging between users and providers
- [ ] Payment integration
- [ ] Review and rating system

### Medium Term
- [ ] Mobile app (React Native / Flutter)
- [ ] Advanced ML models for problem detection
- [ ] Computer vision for image analysis
- [ ] Geo-location based matching
- [ ] Scheduling and calendar integration

### Long Term
- [ ] IoT device integration for automatic problem detection
- [ ] Predictive maintenance recommendations
- [ ] Multi-language support
- [ ] Franchise/white-label solutions
- [ ] AI-powered cost estimation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@servicematch.com or create an issue in the repository.
