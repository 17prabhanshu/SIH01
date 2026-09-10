import logging
from datetime import datetime, timedelta
from typing import Any, Optional
import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

# Mock config
SECRET_KEY = "super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

logger = logging.getLogger(__name__)
router = APIRouter()

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# In-memory mock DB for demonstration purposes since we don't have SQLAlchemy setup
_users_db = {}
_user_id_counter = 1

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate) -> Any:
    global _user_id_counter
    if any(u["email"] == user_in.email for u in _users_db.values()):
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    hashed_password = get_password_hash(user_in.password)
    user = {
        "id": _user_id_counter,
        "email": user_in.email,
        "full_name": user_in.full_name,
        "hashed_password": hashed_password,
        "role": "USER",
    }
    _users_db[_user_id_counter] = user
    _user_id_counter += 1
    return user

@router.post("/login", response_model=Token)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    # Rate limiting should ideally be handled by a middleware like slowapi
    user = next((u for u in _users_db.values() if u["email"] == form_data.username), None)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": create_access_token(
            {"sub": str(user["id"])}, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            {"sub": str(user["id"])}, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=Token)
async def refresh_token(request_data: RefreshTokenRequest) -> Any:
    try:
        payload = jwt.decode(request_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": create_access_token(
            {"sub": user_id}, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            {"sub": user_id}, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(token: str = Depends(OAuth2PasswordRequestForm)) -> Any:
    # In a real scenario, dependencies would resolve the current user
    return {
        "id": 1,
        "email": "admin@example.com",
        "full_name": "Admin User",
        "role": "ADMIN"
    }
