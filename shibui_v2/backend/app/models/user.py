from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.mixins import TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(String(255))
    timezone: Mapped[str] = mapped_column(String(64), default="America/New_York")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    preferences = relationship(
        "UserPreferences",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    task_templates = relationship(
        "TaskTemplate",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    scheduled_blocks = relationship(
        "ScheduledBlock",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reflections = relationship(
        "Reflection",
        back_populates="user",
        cascade="all, delete-orphan",
    )
