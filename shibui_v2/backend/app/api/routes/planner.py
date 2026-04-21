from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.user import User
from app.schemas.planner import (
    HistoryItemResponse,
    ReflectionCreate,
    ReflectionResponse,
    ReflectionUpdate,
    ScheduledBlockCreate,
    ScheduledBlockResponse,
    ScheduledBlockUpdate,
    TaskTemplateCreate,
    TaskTemplateResponse,
    TaskTemplateUpdate,
    WeeklySummaryResponse,
)
from app.services import planner as planner_service

router = APIRouter(tags=["planner"])

@router.get("/planner/templates", response_model=list[TaskTemplateResponse])
def list_templates(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[TaskTemplateResponse]:
    templates = planner_service.list_task_templates(db, current_user)
    return [TaskTemplateResponse.model_validate(template) for template in templates]


@router.post(
    "/planner/templates",
    response_model=TaskTemplateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_template(
    payload: TaskTemplateCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> TaskTemplateResponse:
    template = planner_service.create_task_template(db, current_user, payload)
    return TaskTemplateResponse.model_validate(template)


@router.patch("/planner/templates/{template_id}", response_model=TaskTemplateResponse)
def update_template(
    template_id: int,
    payload: TaskTemplateUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> TaskTemplateResponse:
    template = planner_service.update_task_template(db, current_user, template_id, payload)
    return TaskTemplateResponse.model_validate(template)


@router.delete("/planner/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    planner_service.delete_task_template(db, current_user, template_id)


@router.get("/planner/blocks", response_model=list[ScheduledBlockResponse])
def list_blocks(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    starts_after: datetime | None = Query(default=None),
    ends_before: datetime | None = Query(default=None),
) -> list[ScheduledBlockResponse]:
    blocks = planner_service.list_scheduled_blocks(
        db,
        current_user,
        starts_after=starts_after,
        ends_before=ends_before,
    )
    return [ScheduledBlockResponse.model_validate(block) for block in blocks]


@router.post(
    "/planner/blocks",
    response_model=ScheduledBlockResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_block(
    payload: ScheduledBlockCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ScheduledBlockResponse:
    block = planner_service.create_scheduled_block(db, current_user, payload)
    return ScheduledBlockResponse.model_validate(block)


@router.patch("/planner/blocks/{block_id}", response_model=ScheduledBlockResponse)
def update_block(
    block_id: int,
    payload: ScheduledBlockUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ScheduledBlockResponse:
    block = planner_service.update_scheduled_block(db, current_user, block_id, payload)
    return ScheduledBlockResponse.model_validate(block)


@router.delete("/planner/blocks/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_block(
    block_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    planner_service.delete_scheduled_block(db, current_user, block_id)


@router.post(
    "/planner/reflections",
    response_model=ReflectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reflection(
    payload: ReflectionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ReflectionResponse:
    reflection = planner_service.create_reflection(db, current_user, payload)
    return ReflectionResponse.model_validate(reflection)


@router.get("/planner/reflections", response_model=list[ReflectionResponse])
def list_reflections(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[ReflectionResponse]:
    reflections = planner_service.list_reflections(db, current_user)
    return [ReflectionResponse.model_validate(reflection) for reflection in reflections]


@router.patch("/planner/reflections/{reflection_id}", response_model=ReflectionResponse)
def update_reflection(
    reflection_id: int,
    payload: ReflectionUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ReflectionResponse:
    reflection = planner_service.update_reflection(db, current_user, reflection_id, payload)
    return ReflectionResponse.model_validate(reflection)


@router.delete("/planner/reflections/{reflection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reflection(
    reflection_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    planner_service.delete_reflection(db, current_user, reflection_id)


@router.get("/planner/weekly-summary", response_model=WeeklySummaryResponse)
def weekly_summary(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    starts_after: datetime | None = Query(default=None),
    ends_before: datetime | None = Query(default=None),
) -> WeeklySummaryResponse:
    return planner_service.get_weekly_summary(
        db,
        current_user,
        starts_after=starts_after,
        ends_before=ends_before,
    )


@router.get("/planner/history", response_model=list[HistoryItemResponse])
def history(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[HistoryItemResponse]:
    return planner_service.list_history(db, current_user)
