# Shibui 2.0

This directory contains the production-oriented rebuild scaffold for Shibui.

The existing Flask application in `flask_template/` remains the prototype reference. New work should go here.

## Structure

- `backend/` FastAPI API and domain logic
- `frontend/` Next.js web application
- `.env.example` shared environment variables for local development

## Build Order

1. Finalize the domain schema and auth model.
2. Implement backend models, migrations, and API routes.
3. Build the frontend onboarding and planner flows.
4. Add analytics, billing, and operational tooling.

## Notes

- Do not copy the current prototype auth code into this app.
- Do not commit real secrets.
- Treat this directory as the commercial codebase going forward.
