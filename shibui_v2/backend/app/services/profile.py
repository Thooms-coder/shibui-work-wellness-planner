from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.schemas.profile import OnboardingUpdateRequest, ProfileUpdateRequest


def update_profile(db: Session, user: User, payload: ProfileUpdateRequest) -> User:
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_onboarding(db: Session, user: User, payload: OnboardingUpdateRequest) -> User:
    preferences = user.preferences
    if preferences is None:
        preferences = UserPreferences(user_id=user.id)
        db.add(preferences)
        db.flush()

    updates = payload.model_dump(exclude_unset=True)

    if "timezone" in updates:
        user.timezone = updates.pop("timezone")

    start_hour = updates.get("workday_start_hour", preferences.workday_start_hour)
    end_hour = updates.get("workday_end_hour", preferences.workday_end_hour)
    if (
        start_hour is not None
        and end_hour is not None
        and end_hour <= start_hour
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Workday end hour must be after workday start hour.",
        )

    for field, value in updates.items():
        setattr(preferences, field, value)

    preferences.onboarding_completed = True

    db.add(user)
    db.add(preferences)
    db.commit()
    db.refresh(user)
    return user
