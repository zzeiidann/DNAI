"""
DNAI Backend - Food Recognition & Tracking System
Main application entry point with FastAPI endpoints
"""
import os
# Fix OpenMP duplicate library issue on macOS
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import uvicorn

from models.food import FoodResponse, CalorieTracking
from services.clip_service import CLIPService
from services.gemini_service import GeminiChatbot
from services.auth_service import AuthService
from database.db import Database

app = FastAPI(title="DNAI Food Tracking API", version="1.0.0")
security = HTTPBearer(auto_error=False)

# Pydantic models for request bodies
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    message: str

class TrackFoodRequest(BaseModel):
    food_name: str
    calories: int
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db = Database()
auth_service = AuthService(db)
clip_service = None
gemini_chatbot = None


def get_clip_service():
    """Lazy load CLIP service to avoid slow startup"""
    global clip_service
    if clip_service is None:
        clip_service = CLIPService(data_dir="data")
    return clip_service


def get_gemini_service():
    """Lazy load Gemini service"""
    global gemini_chatbot
    if gemini_chatbot is None:
        gemini_chatbot = GeminiChatbot()
    return gemini_chatbot


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return auth_service.verify_token(credentials.credentials)


@app.on_event("startup")
async def startup_event():
    """Create admin user on startup"""
    await auth_service.create_admin_user()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ==================== AUTH ROUTES ====================

@app.post("/auth/register")
async def register(request: RegisterRequest):
    """Register new user"""
    return await auth_service.register_user(
        username=request.username,
        email=request.email,
        password=request.password
    )


@app.post("/auth/login")
async def login(request: LoginRequest):
    """Login user and return JWT token"""
    return await auth_service.login_user(
        email=request.email,
        password=request.password
    )


# ==================== FOOD ROUTES ====================

@app.get("/food/database-stats")
async def get_database_stats():
    """Get FAISS database statistics"""
    service = get_clip_service()
    return service.get_database_stats()


@app.get("/food/list")
async def list_all_foods():
    """Get all foods in the database"""
    service = get_clip_service()
    return await service.get_all_foods()


@app.post("/food/analyze-test")
async def analyze_food_image_test(
    file: UploadFile = File(...)
):
    """Test endpoint - Analyze food image without auth"""
    service = get_clip_service()
    image_data = await file.read()
    food_data = await service.analyze_food_image(image_data)
    return food_data


@app.post("/food/analyze")
async def analyze_food_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    """Analyze food image using CLIP + FAISS"""
    service = get_clip_service()
    image_data = await file.read()
    food_data = await service.analyze_food_image(image_data)
    return food_data


@app.post("/food/track")
async def track_food_consumption(
    request: TrackFoodRequest,
    user_id: str = Depends(get_current_user)
):
    """Add consumed food to daily calorie tracking"""
    await db.reset_daily_calories_if_needed(user_id)
    result = await db.add_food_consumption(
        user_id, 
        request.food_name, 
        request.calories
    )
    return result


@app.get("/food/daily-summary")
async def get_daily_summary(user_id: str = Depends(get_current_user)):
    """Get user's daily calorie summary"""
    await db.reset_daily_calories_if_needed(user_id)
    summary = await db.get_daily_calorie_summary(user_id)
    return summary


@app.post("/food/rebuild-index")
async def rebuild_faiss_index(user_id: str = Depends(get_current_user)):
    """Rebuild FAISS index"""
    service = get_clip_service()
    service.rebuild_index()
    return {"status": "success", "message": "FAISS index rebuilt"}


# ==================== CHAT ROUTES ====================

@app.post("/chat")
async def chat_with_ai(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    """Chat with Gemini AI about food and nutrition"""
    user_context = await db.get_user_context(user_id)
    service = get_gemini_service()
    response = await service.get_response(request.message, user_context)
    return {"response": response}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
