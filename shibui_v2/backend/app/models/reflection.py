from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.mixins import TimestampMixin


class Reflection(TimestampMixin, Base):
    __tablename__ = "reflections"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    scheduled_block_id: Mapped[int] = mapped_column(
        ForeignKey("scheduled_blocks.id"),
        unique=True,
        index=True,
    )
    mood_before: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mood_after: Mapped[int | None] = mapped_column(Integer, nullable=True)
    actual_duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    intensity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reflected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user = relationship("User", back_populates="reflections")
    scheduled_block = relationship("ScheduledBlock", back_populates="reflection")
