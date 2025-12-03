"""
Data models for food and calorie tracking
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FoodResponse(BaseModel):
    """Response model for food image analysis"""
    nama_makanan: str
    kalori: int
    harga: int
    tempat: str
    confidence: Optional[float] = None


class CalorieTracking(BaseModel):
    """Model for daily calorie tracking"""
    user_id: str
    date: str
    consumed_calories: int
    daily_goal: int
    remaining: int


class FoodLog(BaseModel):
    """Model for individual food consumption log"""
    food_name: str
    calories: int
    timestamp: datetime
