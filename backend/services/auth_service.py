"""
Authentication Service
Handles user registration, login, and JWT token management
"""
import os
import uuid
import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import HTTPException, status


class AuthService:
    def __init__(self, db=None):
        """Initialize authentication service"""
        self.db = db
        self.secret_key = os.getenv("JWT_SECRET_KEY", "dnai-secret-key-2024")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 1440  # 24 hours
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    
    def create_access_token(self, user_id: str, username: str) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode = {
            "user_id": user_id, 
            "username": username,
            "exp": expire
        }
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> str:
        """Verify JWT token and return user_id"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id = payload.get("user_id")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            return user_id
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    
    async def create_admin_user(self):
        """Create admin user if not exists"""
        if self.db is None:
            return
        
        admin_email = "admin@dnai.com"
        admin_exists = await self.db.get_user_by_email(admin_email)
        
        if not admin_exists:
            user_id = str(uuid.uuid4())
            hashed_password = self.hash_password("admin")
            await self.db.create_user(
                user_id=user_id,
                username="admin",
                email=admin_email,
                password_hash=hashed_password,
                daily_calorie_goal=2000
            )
            print("✓ Admin user created (admin@dnai.com / admin)")
    
    async def register_user(self, username: str, email: str, password: str):
        """Register new user"""
        if self.db is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # Check if email already exists
        existing = await self.db.get_user_by_email(email)
        if existing:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")
        
        # Check if username already exists
        existing_username = await self.db.get_user_by_username(username)
        if existing_username:
            raise HTTPException(status_code=400, detail="Username sudah digunakan")
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = self.hash_password(password)
        
        await self.db.create_user(
            user_id=user_id,
            username=username,
            email=email,
            password_hash=hashed_password,
            daily_calorie_goal=2000
        )
        
        return {
            "message": "Registrasi berhasil",
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            }
        }
    
    async def login_user(self, email: str, password: str):
        """Login user and return token"""
        if self.db is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        user = await self.db.get_user_by_email(email)
        
        if not user:
            raise HTTPException(status_code=401, detail="Email atau password salah")
        
        if not self.verify_password(password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Email atau password salah")
        
        # Create token
        token = self.create_access_token(user["user_id"], user["username"])
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["user_id"],
                "username": user["username"],
                "email": user["email"]
            }
        }
