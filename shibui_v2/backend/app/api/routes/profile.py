from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.user import User
from app.schemas.profile import OnboardingUpdateRequest, ProfileResponse, ProfileUpdateRequest
from app.services.profile import update_onboarding, update_profile


router = APIRouter(tags=["profile"])


def _serialize_profile(user: User) -> ProfileResponse:
    return ProfileResponse.model_validate(
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "timezone": user.timezone,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at,
            "preferences": user.preferences,
        }
    )


@router.get("/profile/me", response_model=ProfileResponse)
def get_profile(current_user: Annotated[User, Depends(get_current_user)]) -> ProfileResponse:
    return _serialize_profile(current_user)


@router.patch("/profile/me", response_model=ProfileResponse)
def patch_profile(
    payload: ProfileUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileResponse:
    user = update_profile(db, current_user, payload)
    return _serialize_profile(user)


@router.put("/profile/onboarding", response_model=ProfileResponse)
def put_onboarding(
    payload: OnboardingUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileResponse:
    user = update_onboarding(db, current_user, payload)
    return _serialize_profile(user)
