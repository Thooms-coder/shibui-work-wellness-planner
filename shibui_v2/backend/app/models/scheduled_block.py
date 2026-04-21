from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.mixins import TimestampMixin


class ScheduledBlock(TimestampMixin, Base):
    __tablename__ = "scheduled_blocks"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    task_template_id: Mapped[int] = mapped_column(ForeignKey("task_templates.id"), index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    planned_duration_minutes: Mapped[int] = mapped_column(Integer)
    actual_duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    intensity_override: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="scheduled_blocks")
    task_template = relationship("TaskTemplate", back_populates="scheduled_blocks")
    reflection = relationship(
        "Reflection",
        back_populates="scheduled_block",
        uselist=False,
        cascade="all, delete-orphan",
    )
