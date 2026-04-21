from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskTemplateCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: str = Field(pattern="^(flow|motion)$")
    subcategory: str = Field(min_length=1, max_length=100)
    default_duration_minutes: int = Field(ge=5, le=480)
    default_intensity: int = Field(ge=1, le=10)


class TaskTemplateUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: str = Field(pattern="^(flow|motion)$")
    subcategory: str = Field(min_length=1, max_length=100)
    default_duration_minutes: int = Field(ge=5, le=480)
    default_intensity: int = Field(ge=1, le=10)


class TaskTemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    subcategory: str
    default_duration_minutes: int
    default_intensity: int


class ScheduledBlockCreate(BaseModel):
    task_template_id: int
    starts_at: datetime
    ends_at: datetime
    planned_duration_minutes: int = Field(ge=5, le=480)
    intensity_override: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = Field(default=None, max_length=2000)
    status: str = Field(default="pending", pattern="^(pending|in_progress|completed)$")


class ScheduledBlockUpdate(BaseModel):
    task_template_id: int
    starts_at: datetime
    ends_at: datetime
    planned_duration_minutes: int = Field(ge=5, le=480)
    intensity_override: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = Field(default=None, max_length=2000)
    status: str = Field(pattern="^(pending|in_progress|completed)$")


class ScheduledBlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_template_id: int
    status: str
    starts_at: datetime
    ends_at: datetime
    planned_duration_minutes: int
    actual_duration_minutes: int | None
    intensity_override: int | None
    notes: str | None


class ReflectionCreate(BaseModel):
    scheduled_block_id: int
    mood_before: int | None = Field(default=None, ge=1, le=10)
    mood_after: int | None = Field(default=None, ge=1, le=10)
    actual_duration_minutes: int | None = Field(default=None, ge=1, le=480)
    intensity: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = Field(default=None, max_length=2000)
    reflected_at: datetime


class ReflectionUpdate(BaseModel):
    mood_before: int | None = Field(default=None, ge=1, le=10)
    mood_after: int | None = Field(default=None, ge=1, le=10)
    actual_duration_minutes: int | None = Field(default=None, ge=1, le=480)
    intensity: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = Field(default=None, max_length=2000)
    reflected_at: datetime


class ReflectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scheduled_block_id: int
    mood_before: int | None
    mood_after: int | None
    actual_duration_minutes: int | None
    intensity: int | None
    notes: str | None
    reflected_at: datetime


class WeeklySummaryResponse(BaseModel):
    flow_minutes: int
    motion_minutes: int
    completed_blocks: int
    balance_score: float | None


class HistoryItemResponse(BaseModel):
    scheduled_block_id: int
    task_template_id: int
    task_name: str
    category: str
    subcategory: str
    status: str
    starts_at: datetime
    ends_at: datetime
    planned_duration_minutes: int
    actual_duration_minutes: int | None
    intensity_override: int | None
    block_notes: str | None
    reflection_id: int | None
    mood_before: int | None
    mood_after: int | None
    reflection_intensity: int | None
    reflection_notes: str | None
    reflected_at: datetime | None
