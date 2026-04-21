# Frontend

Next.js application for the Shibui web product.

## Current Screens

- Landing page
- Signup
- Login
- Onboarding
- Guarded app workspace

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

The frontend expects the backend API at `NEXT_PUBLIC_API_BASE_URL`, which defaults to `http://localhost:8000/api`.

## Current Behavior

- Signup stores the returned bearer token locally and redirects to onboarding
- Login stores the returned bearer token locally and redirects to the app
- Onboarding fetches `/profile/me` and saves to `/profile/onboarding`
- `/app` is guarded and checks whether onboarding is complete

## Next Implementation Steps

1. Add planner block creation and listing.
2. Add reflection submission flows.
3. Replace localStorage-only auth with a more production-safe session strategy.
4. Add form validation and automated frontend tests.
