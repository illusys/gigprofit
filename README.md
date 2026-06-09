# GigProfit

GigProfit is a multi-user SaaS-ready mobile/web platform for gig economy drivers to track real profitability across Uber, Lyft, DoorDash, Amazon Flex, Instacart, and other platforms. It now includes an Express/Prisma backend, JWT authentication, role-based administration, user-specific cloud data, reports, audit logs, and subscription-ready database tables.

## Architecture

```text
Expo / React Native client
  ├─ Auth, user dashboard, trip logging, analytics, settings, admin tab
  └─ src/services/api.js talks to the API with JWT bearer tokens

Node.js API server
  ├─ server/api           Express route modules
  ├─ server/controllers   HTTP request handlers
  ├─ server/services      Auth, reporting, notification, settings, profit logic
  ├─ server/middleware    Auth, RBAC, security, validation, errors
  └─ server/prisma        Prisma schema and super-admin bootstrap seed

PostgreSQL
  ├─ Users, profiles, trips, reports, audit logs
  ├─ Refresh/reset/verification tokens
  ├─ System settings
  └─ Subscription plans and user subscriptions
```

## Features

### User Platform

- Register with first name, last name, email, phone, password, and password confirmation.
- Login with email/password using access and refresh tokens.
- Forgot/reset password and change password backend workflows.
- User-specific trips, profiles, vehicle settings, tax settings, and reports.
- Dashboard KPIs: net profit, gross earnings, expenses, trips, hours, and active platforms.
- Trip CRUD with search/filter/pagination API support.
- Trip edit UI from history rows.
- Validated ISO dates with day stepping instead of unvalidated free text.
- Reports API for daily, weekly, monthly, and yearly report snapshots.
- CSV export endpoint plus PDF/XLSX-ready response scaffolding.
- Profile/settings support for vehicle and tax configuration.

### Admin Platform

- Admin tab for `ADMIN` and `SUPER_ADMIN` users.
- Dashboard metrics: users, active users, suspended users, trips, revenue tracked, platform activity.
- User management: list, create via API, edit, suspend, activate, soft delete, reset password.
- Role enforcement: only `SUPER_ADMIN` can create or manage admins.
- Reports management API for all user reports.
- Audit log API and admin audit viewer.
- System settings API for tax defaults, mileage defaults, AI coaching settings, feature flags, and notification settings.

### Security

- Password hashing with bcryptjs.
- JWT access tokens and refresh tokens.
- Refresh token hashing at rest.
- Logout and logout-all-devices workflows.
- Helmet, CORS, rate limiting, request logging, JSON body limits.
- RBAC middleware for user/admin/super-admin access.
- Audit logging for login, user changes, trips, reports, password workflows, and AI coaching.
- Server-side Anthropic proxy so API keys are never exposed to the client.

### Subscription Readiness

The schema includes `SubscriptionPlan` and `UserSubscription` models with prices, feature JSON, and subscription status. No payment gateway is wired yet.

## Requirements

- Node.js compatible with Expo SDK and Prisma.
- PostgreSQL database.
- Expo CLI workflow for the client.

> Repository note: the existing app uses Expo SDK 51. The repository instructions require checking Expo SDK v54 docs before future Expo code changes; SDK upgrades should be planned deliberately because SDK 54 targets newer React Native/React versions.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:

```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
ANTHROPIC_API_KEY=
```

Additional supported variables are documented in `.env.example`.

## Database Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

The seed/bootstrap process creates the first `SUPER_ADMIN` only if none exists and reads credentials from:

- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

Credentials are never hardcoded.

## Running Locally

Start the API:

```bash
npm run server
```

Start the Expo app:

```bash
npm start
```

For web:

```bash
npm run web
```

Set `EXPO_PUBLIC_API_URL` if your API is not available at the default local URL.

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/logout-all`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`

### Trips

- `GET /api/trips?page=&pageSize=&search=&platform=&startDate=&endDate=`
- `POST /api/trips`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`

### Reports

- `GET /api/reports`
- `POST /api/reports/generate`
- `GET /api/reports/:id/export?format=json|csv|pdf|xlsx`

### Profile

- `PUT /api/profile`
- `PUT /api/profile/settings`

### Admin

- `GET /api/admin/metrics`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/users/:id/reset-password`
- `GET /api/admin/reports`
- `GET /api/admin/audit-logs`
- `GET /api/admin/settings`
- `PUT /api/admin/settings/:key`

### AI Coaching

- `POST /api/ai/coach`

The AI endpoint calls Anthropic server-side using `ANTHROPIC_API_KEY` and logs usage metadata.

## Testing and Checks

```bash
npm test
npm run lint
```

The current tests cover profit calculations including tolls/parking, auth validation, role validation, and date validation.

## Deployment Guide

1. Provision PostgreSQL.
2. Configure environment variables in the hosting provider.
3. Run Prisma migrations against production.
4. Run the seed/bootstrap command once for the super admin.
5. Deploy the Node API behind HTTPS.
6. Configure `CORS_ORIGINS` to include your app domains.
7. Build/deploy the Expo app with `EXPO_PUBLIC_API_URL` pointing to the API.
8. Configure a real email provider in `server/services/notificationService.js`.
9. Add a payment provider when enabling subscription billing.

## Notes and Limitations

- Email delivery is abstracted and currently logs queued messages; replace with SES/Postmark/SendGrid for production.
- PDF/XLSX exports are architecturally prepared; the endpoint currently returns report JSON for those formats until a document generation provider is added.
- Location permissions remain configured, but mileage tracking is still manual.
