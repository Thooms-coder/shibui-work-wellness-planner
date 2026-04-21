# Shibui 2.0 Rebuild Checklist

## 1. Prototype Freeze

- [ ] Treat the current Flask app as a reference implementation, not the production base
- [ ] Inventory existing entities, routes, templates, and workflows
- [ ] Capture screenshots of the current product flows for reference
- [ ] Export any seed data worth preserving

## 2. Security Cleanup

- [ ] Remove `flask_template/config.yml` from tracked production usage
- [ ] Rotate any exposed database credentials immediately
- [ ] Replace hard-coded secrets with environment variables
- [ ] Replace MD5 password hashing with `argon2` or `bcrypt`
- [ ] Add email verification and password reset flows
- [ ] Add auth endpoint rate limiting

## 3. Product Decisions

- [ ] Lock the initial audience to individual users
- [ ] Define free vs paid value proposition
- [ ] Decide what the onboarding flow asks
- [ ] Define the exact weekly insights shown in MVP
- [ ] Define beta pricing and launch criteria

## 4. Architecture Setup

- [ ] Create a separate `shibui_v2` codebase next to the prototype
- [ ] Split frontend and backend concerns
- [ ] Use PostgreSQL as the default production database
- [ ] Use Alembic for schema migrations
- [ ] Add a shared environment configuration strategy
- [ ] Add local development instructions from day one

## 5. Backend Foundations

- [ ] Scaffold FastAPI app structure
- [ ] Add health check endpoint
- [ ] Add auth router
- [ ] Add planner router
- [ ] Add SQLAlchemy models
- [ ] Add Pydantic request and response schemas
- [ ] Add service layer for planner logic
- [ ] Add test harness for API routes

## 6. Frontend Foundations

- [ ] Scaffold Next.js app structure
- [ ] Add app shell and route groups
- [ ] Add authentication screens
- [ ] Add onboarding flow
- [ ] Add planner UI
- [ ] Add weekly insights dashboard
- [ ] Add pricing and marketing pages

## 7. Core MVP Features

- [ ] User signup, login, logout
- [ ] Email verification
- [ ] Password reset
- [ ] User profile and timezone settings
- [ ] Task template CRUD
- [ ] Scheduled block CRUD
- [ ] Reflection submission and editing
- [ ] Weekly balance metrics
- [ ] Task history view

## 8. Product Analytics

- [ ] Track signup
- [ ] Track onboarding completion
- [ ] Track first scheduled block
- [ ] Track first reflection
- [ ] Track weekly planner engagement
- [ ] Track conversion to paid plan

## 9. Quality And Operations

- [ ] Add unit tests for planner logic
- [ ] Add integration tests for auth and core scheduling flows
- [ ] Add logging configuration
- [ ] Add error monitoring
- [ ] Add staging environment
- [ ] Add production environment
- [ ] Add database backup strategy

## 10. Launch Readiness

- [ ] Write privacy policy
- [ ] Write terms of service
- [ ] Add support contact flow
- [ ] Add billing provider integration
- [ ] Add feature flags for premium capabilities
- [ ] Run private beta with real users
- [ ] Review retention before broad launch

## 11. Immediate Priorities

These are the next build steps in order:

1. Create the `shibui_v2` backend and frontend scaffolds.
2. Replace prototype auth with production auth design.
3. Implement the planner domain with a clean schema.
4. Build the onboarding, planner, and reflection loop.
5. Add weekly insights and launch instrumentation.

## 12. Explicitly Deferred

- [ ] Team collaboration
- [ ] Enterprise roles and permissions
- [ ] AI coaching
- [ ] Mobile apps
- [ ] Third-party calendar sync
- [ ] Advanced admin tooling
