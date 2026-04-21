"""create initial Shibui 2.0 schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-04-15 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "user_preferences",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("workday_start_hour", sa.Integer(), nullable=True),
        sa.Column("workday_end_hour", sa.Integer(), nullable=True),
        sa.Column("movement_days_per_week", sa.Integer(), nullable=True),
        sa.Column("planning_style", sa.String(length=100), nullable=True),
        sa.Column("onboarding_completed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_user_preferences_user_id", "user_preferences", ["user_id"], unique=True)

    op.create_table(
        "task_templates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=20), nullable=False),
        sa.Column("subcategory", sa.String(length=100), nullable=False),
        sa.Column("default_duration_minutes", sa.Integer(), nullable=False),
        sa.Column("default_intensity", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_task_templates_user_id", "task_templates", ["user_id"], unique=False)
    op.create_index("ix_task_templates_category", "task_templates", ["category"], unique=False)

    op.create_table(
        "scheduled_blocks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("task_template_id", sa.Integer(), sa.ForeignKey("task_templates.id"), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("planned_duration_minutes", sa.Integer(), nullable=False),
        sa.Column("actual_duration_minutes", sa.Integer(), nullable=True),
        sa.Column("intensity_override", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_scheduled_blocks_user_id", "scheduled_blocks", ["user_id"], unique=False)
    op.create_index("ix_scheduled_blocks_task_template_id", "scheduled_blocks", ["task_template_id"], unique=False)
    op.create_index("ix_scheduled_blocks_status", "scheduled_blocks", ["status"], unique=False)

    op.create_table(
        "reflections",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("scheduled_block_id", sa.Integer(), sa.ForeignKey("scheduled_blocks.id"), nullable=False),
        sa.Column("mood_before", sa.Integer(), nullable=True),
        sa.Column("mood_after", sa.Integer(), nullable=True),
        sa.Column("actual_duration_minutes", sa.Integer(), nullable=True),
        sa.Column("intensity", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("reflected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_reflections_user_id", "reflections", ["user_id"], unique=False)
    op.create_index("ix_reflections_scheduled_block_id", "reflections", ["scheduled_block_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_reflections_scheduled_block_id", table_name="reflections")
    op.drop_index("ix_reflections_user_id", table_name="reflections")
    op.drop_table("reflections")

    op.drop_index("ix_scheduled_blocks_status", table_name="scheduled_blocks")
    op.drop_index("ix_scheduled_blocks_task_template_id", table_name="scheduled_blocks")
    op.drop_index("ix_scheduled_blocks_user_id", table_name="scheduled_blocks")
    op.drop_table("scheduled_blocks")

    op.drop_index("ix_task_templates_category", table_name="task_templates")
    op.drop_index("ix_task_templates_user_id", table_name="task_templates")
    op.drop_table("task_templates")

    op.drop_index("ix_user_preferences_user_id", table_name="user_preferences")
    op.drop_table("user_preferences")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
