"""
Database Service
Handles all database operations for users, food tracking, and daily resets
"""
from datetime import datetime, timedelta
import sqlite3
import os
from typing import Dict, List, Optional


class Database:
    def __init__(self, db_path: str = None):
        """Initialize database connection"""
        if db_path is None:
            # Get the directory where this file is located
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_path = os.path.join(base_dir, "dnai.db")
        self.db_path = db_path
        self._create_tables()
    
    def _get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def _create_tables(self):
        """Create necessary database tables"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Users table with email
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                daily_calorie_goal INTEGER DEFAULT 2000,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Daily calorie tracking table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date DATE NOT NULL,
                consumed_calories INTEGER DEFAULT 0,
                last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                UNIQUE(user_id, date)
            )
        """)
        
        # Food consumption log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS food_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                food_name TEXT NOT NULL,
                calories INTEGER NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    async def create_user(self, user_id: str, username: str, email: str, 
                          password_hash: str, daily_calorie_goal: int = 2000):
        """Create new user"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                INSERT INTO users (user_id, username, email, password_hash, daily_calorie_goal)
                VALUES (?, ?, ?, ?, ?)
            """, (user_id, username, email, password_hash, daily_calorie_goal))
            conn.commit()
        finally:
            conn.close()
    
    async def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    async def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    async def reset_daily_calories_if_needed(self, user_id: str):
        """Reset daily calories if it's a new day"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        # Check if entry exists for today
        cursor.execute("""
            SELECT id FROM daily_tracking 
            WHERE user_id = ? AND date = ?
        """, (user_id, today))
        
        if not cursor.fetchone():
            # Create entry for today
            cursor.execute("""
                INSERT INTO daily_tracking (user_id, date, consumed_calories, last_reset)
                VALUES (?, ?, 0, ?)
            """, (user_id, today, datetime.now().isoformat()))
            conn.commit()
        
        conn.close()
    
    async def add_food_consumption(self, user_id: str, food_name: str, calories: int):
        """Add food consumption and update daily tracking"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        # Add to food log
        cursor.execute("""
            INSERT INTO food_log (user_id, food_name, calories)
            VALUES (?, ?, ?)
        """, (user_id, food_name, calories))
        
        # Update daily tracking
        cursor.execute("""
            UPDATE daily_tracking 
            SET consumed_calories = consumed_calories + ?
            WHERE user_id = ? AND date = ?
        """, (calories, user_id, today))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": f"Added {food_name} with {calories} calories"}
    
    async def get_daily_calorie_summary(self, user_id: str) -> Dict:
        """Get user's daily calorie summary"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        cursor.execute("""
            SELECT u.daily_calorie_goal, dt.consumed_calories
            FROM users u
            LEFT JOIN daily_tracking dt ON u.user_id = dt.user_id AND dt.date = ?
            WHERE u.user_id = ?
        """, (today, user_id))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            goal = result["daily_calorie_goal"] or 2000
            consumed = result["consumed_calories"] or 0
            remaining = goal - consumed
            return {
                "daily_goal": goal,
                "consumed": consumed,
                "remaining": remaining,
                "percentage": round(consumed / goal * 100, 2) if goal > 0 else 0
            }
        return {"daily_goal": 2000, "consumed": 0, "remaining": 2000, "percentage": 0}
    
    async def get_user_context(self, user_id: str) -> Dict:
        """Get user context for AI chatbot"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        # Get recent foods
        cursor.execute("""
            SELECT food_name, calories FROM food_log
            WHERE user_id = ? AND DATE(timestamp) = ?
            ORDER BY timestamp DESC LIMIT 5
        """, (user_id, today))
        
        recent_foods = [f"{row['food_name']} ({row['calories']} kal)" for row in cursor.fetchall()]
        
        conn.close()
        
        # Get daily summary
        summary = await self.get_daily_calorie_summary(user_id)
        
        return {
            "daily_calorie_goal": summary.get("daily_goal"),
            "consumed_calories": summary.get("consumed"),
            "recent_foods": recent_foods
        }
