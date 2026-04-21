# Shibui 2.0 MVP Spec

## Product Summary

Shibui is a planning product for people who want sustained performance without burning out. The core idea is that daily planning should balance focused work (`Flow`) with physical and restorative activity (`Motion`), then close the loop with reflection data that improves future planning.

This document converts the current Flask prototype into a production MVP scope.

## Target User

Primary user:
- Individual knowledge workers
- Graduate students
- Remote professionals
- High-agency users who already care about planning, energy, and consistency

Initial market assumption:
- Sell to individual users first
- Defer team and enterprise features until retention is proven

## Core Value Proposition

Shibui helps users:
- Plan work and movement in one system
- Build a realistic daily rhythm instead of overcommitting
- Measure how tasks affect energy, mood, and consistency
- Improve weekly balance through reflection-backed insights

## MVP Positioning

Shibui is not a generic to-do list.

It is:
- A daily planning system for balancing deep work and movement
- A reflection-driven planner that learns from execution
- A sustainable productivity product rather than a pure task tracker

## MVP User Stories

### Authentication

As a new user, I can:
- Create an account
- Verify my email
- Log in securely
- Reset my password

As an authenticated user, I can:
- Manage my profile
- Set my timezone
- Choose planning preferences during onboarding

### Planning

As a user, I can:
- Create task templates for recurring Flow and Motion activities
- Schedule blocks on a planner
- Edit or delete scheduled blocks
- View my upcoming and completed blocks
- Switch between daily and weekly planning views

### Reflection

As a user, I can:
- Log mood before and after a block
- Log actual duration and perceived intensity
- Add optional notes after completing a block

### Insights

As a user, I can:
- See a weekly balance score
- See time spent in Flow vs Motion
- See completion streaks
- Review task history and reflection trends

### System

As a product owner, I can:
- Track activation, retention, and engagement events
- Diagnose failures through logs and error monitoring
- Manage users through an internal admin panel later

## Non-Goals For MVP

Do not build these in version 1:
- Team workspaces
- Shared team planning
- Complex role-based enterprise administration
- AI coaching
- Native mobile apps
- Calendar sync across external providers
- Highly customizable analytics dashboards

## MVP Feature Set

### 1. Secure Account System

Required:
- Signup
- Login
- Logout
- Password reset
- Email verification
- Session or token-based authentication
- Proper password hashing with `argon2` or `bcrypt`

### 2. User Onboarding

Required:
- Preferred planning timezone
- Typical work hours
- Preferred movement frequency
- Daily planning goal or focus style

### 3. Task Templates

Required fields:
- Name
- Category: `flow` or `motion`
- Subcategory
- Default duration
- Default intensity

### 4. Scheduled Planner Blocks

Required fields:
- User
- Task template
- Start time
- End time
- Status: `pending`, `in_progress`, `completed`, `skipped`

Behavior:
- Users can create blocks from a template
- Users can override duration and intensity
- Block status can transition automatically or manually

### 5. Reflection Entries

Required fields:
- Linked scheduled block
- Mood before
- Mood after
- Actual duration
- Intensity
- Optional notes
- Reflection timestamp

### 6. Weekly Insights

Required widgets:
- Flow vs Motion minutes
- Completion streak
- Weekly balance score
- Recent reflection history

### 7. Billing Readiness

MVP-ready but optional at first launch:
- Pricing page
- Subscription model definition
- Stripe integration placeholder
- Feature gating hooks for free vs paid plans

## Proposed Product Metrics

Activation:
- Account created
- Onboarding completed
- First task template created
- First scheduled block created
- First reflection submitted

Engagement:
- Daily active users
- Weekly active users
- Blocks scheduled per week
- Reflections submitted per week

Retention:
- Week 1 retention
- Week 4 retention
- Percentage of users with 3+ planner sessions per week

Commercial:
- Trial to paid conversion
- Monthly recurring revenue
- Churn rate

## Data Model Summary

Core entities:
- `users`
- `task_templates`
- `scheduled_blocks`
- `reflections`
- `user_preferences`
- `subscriptions`

Support entities:
- `email_verification_tokens`
- `password_reset_tokens`
- `analytics_events`

## Recommended Technical Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS

Backend:
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic settings

Database:
- PostgreSQL

Infrastructure:
- Render, Railway, or Fly.io for early deployment
- Managed Postgres
- Sentry for error reporting
- PostHog or Plausible for product analytics

## Security Requirements

Required before accepting real users:
- Remove committed secrets from the repository
- Rotate exposed credentials
- Environment-based secrets management
- Secure password hashing
- CSRF protection where applicable
- Rate limiting on auth endpoints
- Email verification
- Input validation on all write endpoints
- Audit-friendly logs for security-sensitive actions

## Launch Readiness Criteria

Before beta:
- Core auth works
- Core planner flow works
- Reflection flow works
- Weekly insights work
- Error monitoring is enabled
- Database backups are configured
- Privacy policy and terms exist

Before paid launch:
- Billing is wired
- Analytics are wired
- Password reset works reliably
- Basic support workflow exists
- At least 5 to 10 beta users have completed a weekly usage cycle

## Migration Strategy From Current Prototype

Preserve:
- Flow/Motion domain model
- Existing task/reflection concepts
- Core planner workflows
- Analytics ideas

Replace:
- Current auth implementation
- Current DB access pattern
- Current session handling
- Current route organization
- Current secrets management

## Success Definition

Shibui 2.0 MVP is successful when:
- A new user can sign up and complete onboarding in under 5 minutes
- They can plan a full day in under 3 minutes
- They can complete and reflect on blocks without friction
- They get a clear weekly signal about balance and consistency
- The system is stable enough to support early paying users
