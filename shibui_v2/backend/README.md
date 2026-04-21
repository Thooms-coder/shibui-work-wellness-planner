# Backend

FastAPI service for authentication, planner blocks, reflections, and analytics.

## Current Scope

- JWT-based signup and login
- Profile and onboarding endpoints
- Task template, scheduled block, and reflection endpoints
- Weekly summary endpoint
- SQLAlchemy models and Alembic migration scaffold

## Local Setup

1. Create a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -e .
```

3. Create a local environment file:

```bash
cp .env.example .env
```

4. Ensure PostgreSQL is running and create the local database:

```bash
createdb shibui
```

5. Apply migrations:

```bash
alembic upgrade head
```

6. Run the API:

```bash
uvicorn app.main:app --reload
```

## Notes

- The app currently calls `Base.metadata.create_all()` on startup as a local development convenience.
- Use Alembic as the source of truth for production schema changes.
- `BACKEND_CORS_ORIGINS` expects JSON array syntax in `.env`.
