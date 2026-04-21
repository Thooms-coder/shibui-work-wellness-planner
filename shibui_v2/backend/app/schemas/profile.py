from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserPreferencesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    workday_start_hour: int | None
    workday_end_hour: int | None
    movement_days_per_week: int | None
    planning_style: str | None
    onboarding_completed: bool


class ProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    timezone: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    preferences: UserPreferencesResponse | None


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    timezone: str | None = Field(default=None, max_length=64)


class OnboardingUpdateRequest(BaseModel):
    timezone: str | None = Field(default=None, max_length=64)
    workday_start_hour: int | None = Field(default=None, ge=0, le=23)
    workday_end_hour: int | None = Field(default=None, ge=0, le=23)
    movement_days_per_week: int | None = Field(default=None, ge=0, le=7)
    planning_style: str | None = Field(default=None, max_length=100)

