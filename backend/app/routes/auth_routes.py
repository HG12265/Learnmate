import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_database
from app.models.schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory storage fallback if MongoDB is in offline mode
IN_MEMORY_USERS = {}

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    db = get_database()
    email = user_data.email.lower().strip()
    
    # Check if user already exists
    if db is not None:
        existing = await db.users.find_one({"email": email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists. Please login."
            )
    elif email in IN_MEMORY_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please login."
        )
        
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user_data.password)
    new_user = {
        "_id": user_id,
        "name": user_data.name.strip(),
        "email": email,
        "password": hashed_pwd,
        "education": user_data.education,
        "current_skills": user_data.current_skills,
        "target_role": user_data.target_role,
        "created_at": datetime.utcnow()
    }
    
    if db is not None:
        await db.users.insert_one(new_user)
    else:
        IN_MEMORY_USERS[email] = new_user

    token = create_access_token(data={"sub": user_id, "email": email, "name": user_data.name})
    
    user_res = UserResponse(
        id=user_id,
        name=user_data.name,
        email=email,
        education=user_data.education,
        current_skills=user_data.current_skills,
        target_role=user_data.target_role,
        created_at=new_user["created_at"]
    )
    
    return TokenResponse(access_token=token, token_type="bearer", user=user_res)

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    db = get_database()
    email = credentials.email.lower().strip()
    
    user = None
    if db is not None:
        user = await db.users.find_one({"email": email})
    else:
        user = IN_MEMORY_USERS.get(email)
        
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )
        
    token = create_access_token(data={"sub": str(user["_id"]), "email": email, "name": user.get("name", "User")})
    
    user_res = UserResponse(
        id=str(user["_id"]),
        name=user.get("name", "User"),
        email=email,
        education=user.get("education", ""),
        current_skills=user.get("current_skills", []),
        target_role=user.get("target_role", ""),
        created_at=user.get("created_at")
    )
    
    return TokenResponse(access_token=token, token_type="bearer", user=user_res)

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(user.get("_id")),
        name=user.get("name", "User"),
        email=user.get("email", ""),
        education=user.get("education", ""),
        current_skills=user.get("current_skills", []),
        target_role=user.get("target_role", ""),
        created_at=user.get("created_at")
    )
