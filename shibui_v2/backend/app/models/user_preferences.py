from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.mixins import TimestampMixin


class UserPreferences(TimestampMixin, Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    workday_start_hour: Mapped[int | None] = mapped_column(Integer, nullable=True)
    workday_end_hour: Mapped[int | None] = mapped_column(Integer, nullable=True)
    movement_days_per_week: Mapped[int | None] = mapped_column(Integer, nullable=True)
    planning_style: Mapped[str | None] = mapped_column(String(100), nullable=True)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    user = relationship("User", back_populates="preferences")
