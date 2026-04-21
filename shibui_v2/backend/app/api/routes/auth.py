from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, TokenResponse, UserResponse
from app.services.auth import authenticate_user, create_access_token, create_user

router = APIRouter(tags=["auth"])

@router.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignupRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AuthResponse:
    user = create_user(db, payload)
    token = create_access_token(str(user.id))
    return AuthResponse(user=UserResponse.model_validate(user), token=TokenResponse(access_token=token))


@router.post("/auth/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AuthResponse:
    user = authenticate_user(db, payload.email, payload.password)
    token = create_access_token(str(user.id))
    return AuthResponse(user=UserResponse.model_validate(user), token=TokenResponse(access_token=token))


@router.get("/auth/me", response_model=UserResponse)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    return UserResponse.model_validate(current_user)
