from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.mixins import TimestampMixin


class TaskTemplate(TimestampMixin, Base):
    __tablename__ = "task_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(20), index=True)
    subcategory: Mapped[str] = mapped_column(String(100))
    default_duration_minutes: Mapped[int] = mapped_column(Integer)
    default_intensity: Mapped[int] = mapped_column(Integer)

    user = relationship("User", back_populates="task_templates")
    scheduled_blocks = relationship("ScheduledBlock", back_populates="task_template")
