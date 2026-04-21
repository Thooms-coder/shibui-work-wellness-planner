# Migrations

Use Alembic for schema changes.

Typical commands after dependencies are installed:

```bash
alembic revision --autogenerate -m "create initial tables"
alembic upgrade head
```

The backend currently creates tables on startup for local convenience. Remove that behavior once migrations are the main workflow.
