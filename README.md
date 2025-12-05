# DNAI - Food Recognition & Calorie Tracking System

![DNAI Food Recognition](DNAI%20-%20Food%20Recognition.jpeg)

AI-powered food recognition system using CLIP and FAISS for image-based food identification, calorie tracking, and nutrition consultation with Gemini AI integration.

## Features

- **Image-Based Food Recognition**: Utilizes CLIP + FAISS for identifying food name, calories, price, and location from photos
- **Vector Database Search**: FAISS-powered similarity search across thousands of food images
- **Daily Calorie Tracking**: Automated calorie logging with 24-hour auto-reset functionality
- **AI Nutrition Chatbot**: Gemini + LangChain integration for food, calorie, and nutrition queries
- **User Authentication**: JWT-based secure login/register system
- **Production Ready**: Full Docker containerization for seamless deployment

## Architecture

```
DNAI/
├── backend/                    # Python FastAPI Backend
│   ├── app.py                 # Main API endpoints
│   ├── services/
│   │   ├── clip_service.py    # CLIP + FAISS integration
│   │   ├── faiss_service.py   # FAISS vector database
│   │   ├── gemini_service.py  # Gemini + LangChain chatbot
│   │   └── auth_service.py    # JWT authentication
│   ├── data/
│   │   ├── food_images/       # Food image storage
│   │   ├── food_metadata.json # Food metadata (calories, price, location)
│   │   └── food_index.faiss   # FAISS index (auto-generated)
│   ├── database/
│   │   └── db.py             # SQLite database operations
│   ├── models/
│   │   └── food.py           # Pydantic data models
│   └── scripts/
│       ├── build_index.py    # Build FAISS vector index
│       └── add_food.py       # CLI tool for adding food items
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── components/        # React components
│   │   └── services/          # API service layer
│   └── nginx.conf            # Production web server config
├── docker-compose.yml          # Multi-container orchestration
├── deploy.sh                   # Deployment automation script
└── .env                        # Environment configuration
```

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone & setup
git clone https://github.com/zzeiidann/DNAI.git
cd DNAI

# 2. Setup environment
cp .env.example .env
# Edit .env: Set GEMINI_API_KEY and JWT_SECRET_KEY

# 3. Add food images to backend/data/food_images/
# Format: food_id.jpg (e.g., nasi_goreng.jpg)

# 4. Build & run
chmod +x deploy.sh
./deploy.sh build
./deploy.sh up

# 5. Access
# Frontend: http://localhost
# Backend API: http://localhost:8000/docs
```

### Option 2: Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Set GEMINI_API_KEY
python scripts/build_index.py  # Build FAISS index
python app.py

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## Adding New Food Items

### 1. Prepare Images
Place `.jpg` images in `backend/data/food_images/`:
```
backend/data/food_images/
├── nasi_goreng.jpg
├── mie_goreng.jpg
├── sate_ayam.jpg
└── your_new_food.jpg
```

### 2. Update Metadata
Edit `backend/data/food_metadata.json`:
```json
{
  "id": "your_food_id",
  "nama_makanan": "Food Name",
  "image_file": "your_new_food.jpg",
  "kalori": 250,
  "harga": 15000,
  "tempat": "Location/Vendor",
  "description": "English description for CLIP matching"
}
```

### 3. Rebuild FAISS Index
```bash
# Local Development
python scripts/build_index.py

# Docker Production
./deploy.sh rebuild-index
```

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check status |
| POST | `/food/analyze` | Analyze food image (no auth required) |
| GET | `/food/list` | List all foods in database |
| GET | `/food/database-stats` | FAISS database statistics |

### Authenticated Endpoints (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| POST | `/food/track` | Track food consumption |
| GET | `/food/daily-summary` | Daily calorie summary |
| POST | `/chat` | AI nutrition chatbot |

## Docker Commands

```bash
./deploy.sh build         # Build Docker images
./deploy.sh up            # Start all services
./deploy.sh down          # Stop all services
./deploy.sh logs          # View container logs
./deploy.sh rebuild-index # Rebuild FAISS index
./deploy.sh status        # Check service status
```

## Environment Variables

```bash
# .env
GEMINI_API_KEY=your_key          # Required: Get from Google AI Studio
JWT_SECRET_KEY=your_secret       # Required: Generate with openssl rand -hex 32
ACCESS_TOKEN_EXPIRE_MINUTES=1440 # Optional: JWT token expiry (default: 24 hours)
```

## Testing

```bash
# Test API endpoints (requires running server)
curl http://localhost:8000/health
curl http://localhost:8000/food/database-stats

# Access interactive API documentation
open http://localhost:8000/docs
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| Backend Framework | FastAPI, Python 3.11 |
| AI/ML Models | CLIP (HuggingFace Transformers) |
| Vector Database | FAISS (Facebook AI Similarity Search) |
| LLM Integration | Gemini Pro + LangChain |
| Database | SQLite |
| Frontend Framework | React 18, React Router v6 |
| Authentication | JWT (PyJWT, python-jose) |
| Containerization | Docker, Docker Compose |
| Web Server | Nginx |

## API Documentation

Access interactive Swagger documentation at `http://localhost:8000/docs` after starting the server.

## Development Notes

### Backend Server Issues (macOS)
When running the backend locally on macOS, you may encounter OpenMP library conflicts. Use this command to start the server:

```bash
cd backend
unset DYLD_LIBRARY_PATH
export KMP_DUPLICATE_LIB_OK=TRUE
source venv/bin/activate
python app.py
```

### Port Configuration
- **Backend**: Port 8000 (FastAPI + Uvicorn)
- **Frontend**: Port 3000 (React development server)
- **Production**: Port 80 (Nginx in Docker)
