from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.reflection import Reflection
from app.models.scheduled_block import ScheduledBlock
from app.models.task_template import TaskTemplate
from app.models.user import User
from app.schemas.planner import (
    HistoryItemResponse,
    ReflectionCreate,
    ReflectionUpdate,
    ScheduledBlockCreate,
    ScheduledBlockUpdate,
    TaskTemplateCreate,
    TaskTemplateUpdate,
    WeeklySummaryResponse,
)


def create_task_template(db: Session, user: User, payload: TaskTemplateCreate) -> TaskTemplate:
    template = TaskTemplate(user_id=user.id, **payload.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def update_task_template(
    db: Session,
    user: User,
    template_id: int,
    payload: TaskTemplateUpdate,
) -> TaskTemplate:
    template = db.get(TaskTemplate, template_id)
    if not template or template.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task template not found.",
        )

    for field, value in payload.model_dump().items():
        setattr(template, field, value)

    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def delete_task_template(db: Session, user: User, template_id: int) -> None:
    template = db.get(TaskTemplate, template_id)
    if not template or template.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task template not found.",
        )

    for block in list(template.scheduled_blocks):
        if block.reflection is not None:
            db.delete(block.reflection)
        db.delete(block)

    db.delete(template)
    db.commit()


def list_task_templates(db: Session, user: User) -> list[TaskTemplate]:
    stmt = (
        select(TaskTemplate)
        .where(TaskTemplate.user_id == user.id)
        .order_by(TaskTemplate.category.asc(), TaskTemplate.name.asc())
    )
    return list(db.scalars(stmt))


def create_scheduled_block(db: Session, user: User, payload: ScheduledBlockCreate) -> ScheduledBlock:
    template = db.get(TaskTemplate, payload.task_template_id)
    if not template or template.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task template not found.",
        )

    if payload.ends_at <= payload.starts_at:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Block end time must be after start time.",
        )

    block = ScheduledBlock(
        user_id=user.id,
        task_template_id=template.id,
        status=payload.status,
        planned_duration_minutes=payload.planned_duration_minutes,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        intensity_override=payload.intensity_override,
        notes=payload.notes,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


def list_scheduled_blocks(
    db: Session,
    user: User,
    starts_after: datetime | None = None,
    ends_before: datetime | None = None,
) -> list[ScheduledBlock]:
    stmt = (
        select(ScheduledBlock)
        .options(selectinload(ScheduledBlock.task_template), selectinload(ScheduledBlock.reflection))
        .where(ScheduledBlock.user_id == user.id)
        .order_by(ScheduledBlock.starts_at.asc())
    )

    if starts_after is not None:
        stmt = stmt.where(ScheduledBlock.starts_at >= starts_after)
    if ends_before is not None:
        stmt = stmt.where(ScheduledBlock.ends_at <= ends_before)

    return list(db.scalars(stmt))


def update_scheduled_block(
    db: Session,
    user: User,
    block_id: int,
    payload: ScheduledBlockUpdate,
) -> ScheduledBlock:
    block = db.get(ScheduledBlock, block_id)
    if not block or block.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled block not found.",
        )

    if block.reflection is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Blocks with reflections cannot be edited.",
        )

    template = db.get(TaskTemplate, payload.task_template_id)
    if not template or template.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task template not found.",
        )

    if payload.ends_at <= payload.starts_at:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Block end time must be after start time.",
        )

    block.task_template_id = payload.task_template_id
    block.starts_at = payload.starts_at
    block.ends_at = payload.ends_at
    block.planned_duration_minutes = payload.planned_duration_minutes
    block.intensity_override = payload.intensity_override
    block.notes = payload.notes
    block.status = payload.status

    db.add(block)
    db.commit()
    db.refresh(block)
    return block


def delete_scheduled_block(db: Session, user: User, block_id: int) -> None:
    block = db.get(ScheduledBlock, block_id)
    if not block or block.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled block not found.",
        )

    if block.reflection is not None:
        db.delete(block.reflection)
    db.delete(block)
    db.commit()


def list_reflections(db: Session, user: User) -> list[Reflection]:
    stmt = (
        select(Reflection)
        .where(Reflection.user_id == user.id)
        .order_by(Reflection.reflected_at.desc())
    )
    return list(db.scalars(stmt))


def update_reflection(
    db: Session,
    user: User,
    reflection_id: int,
    payload: ReflectionUpdate,
) -> Reflection:
    reflection = db.get(Reflection, reflection_id)
    if not reflection or reflection.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reflection not found.",
        )

    block = reflection.scheduled_block
    if block is None or block.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled block not found.",
        )

    for field, value in payload.model_dump().items():
        setattr(reflection, field, value)

    block.actual_duration_minutes = payload.actual_duration_minutes
    if payload.notes is not None:
        block.notes = payload.notes
    block.status = "completed"

    db.add(reflection)
    db.add(block)
    db.commit()
    db.refresh(reflection)
    return reflection


def delete_reflection(db: Session, user: User, reflection_id: int) -> None:
    reflection = db.get(Reflection, reflection_id)
    if not reflection or reflection.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reflection not found.",
        )

    block = reflection.scheduled_block
    db.delete(reflection)
    if block is not None:
        block.actual_duration_minutes = None
        block.status = "pending"
    db.commit()


def create_reflection(db: Session, user: User, payload: ReflectionCreate) -> Reflection:
    block = db.get(ScheduledBlock, payload.scheduled_block_id)
    if not block or block.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled block not found.",
        )

    if block.reflection is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This block already has a reflection.",
        )

    reflection = Reflection(user_id=user.id, **payload.model_dump())
    db.add(reflection)

    block.actual_duration_minutes = payload.actual_duration_minutes
    if payload.notes:
        block.notes = payload.notes
    block.status = "completed"

    db.commit()
    db.refresh(reflection)
    return reflection


def get_weekly_summary(
    db: Session,
    user: User,
    starts_after: datetime | None = None,
    ends_before: datetime | None = None,
) -> WeeklySummaryResponse:
    blocks = list_scheduled_blocks(db, user, starts_after=starts_after, ends_before=ends_before)

    flow_minutes = 0
    motion_minutes = 0
    completed_blocks = 0
    total_balance = 0.0
    scored_blocks = 0

    for block in blocks:
        duration = block.actual_duration_minutes or block.planned_duration_minutes
        category = block.task_template.category if block.task_template else None

        if category == "flow":
            flow_minutes += duration
        elif category == "motion":
            motion_minutes += duration

        if block.status == "completed":
            completed_blocks += 1

        reflection = block.reflection
        if reflection and reflection.mood_before is not None and reflection.mood_after is not None:
            intensity = reflection.intensity or block.intensity_override or block.task_template.default_intensity
            mood_delta = reflection.mood_after - reflection.mood_before
            total_balance += mood_delta * intensity * (duration / 30)
            scored_blocks += 1

    balance_score = round(total_balance / scored_blocks, 2) if scored_blocks else None
    return WeeklySummaryResponse(
        flow_minutes=flow_minutes,
        motion_minutes=motion_minutes,
        completed_blocks=completed_blocks,
        balance_score=balance_score,
    )


def list_history(db: Session, user: User) -> list[HistoryItemResponse]:
    blocks = list_scheduled_blocks(db, user)
    history: list[HistoryItemResponse] = []

    for block in sorted(blocks, key=lambda item: item.starts_at, reverse=True):
        template = block.task_template
        reflection = block.reflection
        if template is None:
            continue

        history.append(
            HistoryItemResponse(
                scheduled_block_id=block.id,
                task_template_id=template.id,
                task_name=template.name,
                category=template.category,
                subcategory=template.subcategory,
                status=block.status,
                starts_at=block.starts_at,
                ends_at=block.ends_at,
                planned_duration_minutes=block.planned_duration_minutes,
                actual_duration_minutes=block.actual_duration_minutes,
                intensity_override=block.intensity_override,
                block_notes=block.notes,
                reflection_id=reflection.id if reflection else None,
                mood_before=reflection.mood_before if reflection else None,
                mood_after=reflection.mood_after if reflection else None,
                reflection_intensity=reflection.intensity if reflection else None,
                reflection_notes=reflection.notes if reflection else None,
                reflected_at=reflection.reflected_at if reflection else None,
            )
        )

    return history
