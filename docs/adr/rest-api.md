# ADR 003 — REST API First

## Status

Accepted

## Date

2026-06-04

## Context

ShipLoop AI is a full-stack SaaS-style application.

The MVP includes:

- authentication
- projects
- feature briefs
- tasks
- bug reports
- test plans
- test cases
- release notes
- AI jobs
- attachments
- activity logs
- dashboard data

The frontend needs a clear way to communicate with the backend.

The backend also needs a simple and predictable API style that is easy to build, test, document, and explain.

ShipLoop AI could use several API styles:

- REST API
- GraphQL
- tRPC
- direct database access from the frontend
- server actions only

For the MVP, the project needs a practical API design that supports clear routes, validation, testing, and future mobile support.

## Decision

ShipLoop AI will use a REST API first.

The backend will expose HTTP routes for the main product resources.

The main API shape will be:

```txt
/api/auth
/api/projects
/api/projects/:projectId/feature-briefs
/api/projects/:projectId/tasks
/api/projects/:projectId/bug-reports
/api/projects/:projectId/test-plans
/api/projects/:projectId/release-notes
/api/ai/jobs
```

The frontend will communicate with the backend through these routes.

Main flow:

```txt
Web App
→ REST API
→ Services
→ Prisma
→ PostgreSQL
```

## Main Rule

```txt
Resources should have clear routes.
Actions should have clear intent.
```

## Reason

REST is a good fit for ShipLoop AI because most MVP data is resource-based.

Examples:

- projects
- tasks
- bugs
- test plans
- test cases
- release notes
- attachments
- AI jobs

Each resource can be created, read, updated, deleted, filtered, and sorted through standard HTTP routes.

REST also makes the backend easier to test with tools like Postman, Thunder Client, curl, and automated API tests.

## Benefits

### 1. Clear Resource Design

REST makes the product structure easy to understand.

Example:

```txt
GET /api/projects
POST /api/projects
GET /api/projects/:projectId
PATCH /api/projects/:projectId
DELETE /api/projects/:projectId
```

This matches the way the data model is designed.

### 2. Easy to Test

REST routes are easy to test during development.

The project can use:

- Postman
- curl
- browser DevTools
- integration tests
- backend route tests

Example:

```bash
curl http://localhost:4000/api/projects
```

### 3. Good for Portfolio Review

Interviewers can understand REST routes fast.

A REST API shows that the project has:

- backend design
- routing
- controllers
- services
- validation
- authentication
- authorization
- error handling

### 4. Good Future Mobile Support

A future mobile app can call the same API.

Future shape:

```txt
Web App
→ REST API

Mobile App
→ REST API
```

This avoids tying the backend too tightly to one frontend.

### 5. Easier Backend Ownership

The backend remains the source of truth.

The frontend can request data, but the backend decides what is allowed.

Main rule:

```txt
The frontend can ask.
The backend decides.
```

## Tradeoffs

### 1. More Boilerplate Than tRPC

REST needs more manual route and type setup.

This is acceptable because the project benefits from clear API boundaries.

### 2. Less Flexible Than GraphQL

GraphQL can let the frontend request exact fields.

ShipLoop AI does not need that complexity in the MVP.

Most screens can use simple resource routes.

### 3. Type Sharing Needs Care

REST does not automatically share types between frontend and backend.

To reduce mismatch, shared types and schemas can live in:

```txt
packages/shared
```

Possible shared items:

- enums
- request types
- response types
- Zod schemas
- API error shapes

### 4. Versioning May Be Needed Later

The MVP can start without public API versioning.

A future public API could add:

```txt
/api/v1
```

For now, internal routes are enough.

## API Route Style

Routes should use nouns for resources.

Good:

```txt
/api/projects
/api/projects/:projectId/tasks
/api/projects/:projectId/bug-reports
```

Avoid vague routes:

```txt
/api/getStuff
/api/doTaskThing
/api/makeBug
```

## HTTP Method Rules

Use standard HTTP methods.

```txt
GET     Read data
POST    Create data or start an action
PATCH   Update part of a record
PUT     Replace a full record only when needed
DELETE  Delete or archive a record
```

Examples:

```txt
GET    /api/projects
POST   /api/projects
PATCH  /api/projects/:projectId
DELETE /api/projects/:projectId
```

## Nested Route Rules

Most workflow records belong to a project.

So project-owned records should use nested routes.

Examples:

```txt
GET  /api/projects/:projectId/tasks
POST /api/projects/:projectId/tasks

GET  /api/projects/:projectId/bug-reports
POST /api/projects/:projectId/bug-reports

GET  /api/projects/:projectId/test-plans
POST /api/projects/:projectId/test-plans
```

This makes ownership clear.

## Standard Success Response

API responses should use a consistent shape.

Example:

```json
{
  "success": true,
  "data": {
    "id": "task_123",
    "title": "Build project dashboard"
  }
}
```

For lists:

```json
{
  "success": true,
  "data": [
    {
      "id": "task_123",
      "title": "Build project dashboard"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

## Standard Error Response

Errors should also use a consistent shape.

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required.",
    "details": {
      "field": "title"
    }
  }
}
```

## Common Error Codes

Use clear error codes.

```txt
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
AI_JOB_FAILED
FILE_UPLOAD_FAILED
INTERNAL_SERVER_ERROR
```

## Authentication Rule

Most routes require authentication.

Public routes should be limited.

Possible public routes:

```txt
GET /api/health
POST /api/auth/register
POST /api/auth/login
```

Protected routes:

```txt
/api/projects
/api/projects/:projectId/tasks
/api/projects/:projectId/bug-reports
/api/projects/:projectId/test-plans
/api/projects/:projectId/release-notes
/api/ai/jobs
```

## Authorization Rule

Authentication is not enough.

The backend must also check ownership.

Example:

```txt
User requests a task.
Backend finds the task.
Backend checks the task's project.
Backend checks the project owner.
Backend returns the task only if the project belongs to the current user.
```

Main rule:

```txt
Never trust projectId from the frontend without ownership checks.
```

## Validation Rule

All request bodies must be validated on the backend.

Recommended validation tool:

```txt
Zod
```

Example validation targets:

- required fields
- enum values
- string length
- date format
- status transitions
- file metadata
- AI job input type

The frontend can validate too, but backend validation is required.

## Pagination Rule

List endpoints should support pagination.

Example:

```txt
GET /api/projects/:projectId/tasks?page=1&limit=20
```

Response meta:

```json
{
  "page": 1,
  "limit": 20,
  "total": 100
}
```

## Filtering Rule

List endpoints should support basic filters.

Example:

```txt
GET /api/projects/:projectId/tasks?status=IN_PROGRESS
GET /api/projects/:projectId/bug-reports?severity=HIGH
GET /api/projects/:projectId/test-plans?status=READY
```

## Sorting Rule

List endpoints should support simple sorting.

Example:

```txt
GET /api/projects/:projectId/tasks?sort=createdAt&order=desc
```

Default sort:

```txt
createdAt desc
```

## AI Route Rule

AI routes should be action-based because AI generation is not normal CRUD.

Example:

```txt
POST /api/ai/jobs
GET  /api/ai/jobs/:jobId
```

The request should define:

- project id
- source type
- source id
- requested AI action
- user prompt or rough notes

Example actions:

```txt
GENERATE_FEATURE_BRIEF
GENERATE_TASKS
CLEAN_BUG_REPORT
GENERATE_TEST_PLAN
GENERATE_RELEASE_NOTES
```

Main AI rule:

```txt
AI creates drafts.
The user owns the final decision.
```

## File Upload Rule

File uploads should go through the backend.

MVP route examples:

```txt
POST   /api/projects/:projectId/attachments
GET    /api/projects/:projectId/attachments
DELETE /api/projects/:projectId/attachments/:attachmentId
```

The backend must check:

- file type
- file size
- project ownership
- attachment metadata

## Activity Log Rule

Important actions should create activity logs.

Examples:

- project created
- feature brief approved
- task marked done
- bug verified
- test plan completed
- release note published
- AI draft generated

Possible route:

```txt
GET /api/projects/:projectId/activity
```

## Why Not GraphQL

GraphQL is powerful, but it adds more complexity than the MVP needs.

ShipLoop AI does not need:

- complex nested client-selected queries
- GraphQL schema management
- resolver setup
- GraphQL-specific caching
- GraphQL permission complexity

REST is enough for the first version.

## Why Not tRPC

tRPC is strong for full-stack TypeScript apps.

But ShipLoop AI should keep a clear HTTP API boundary because:

- it supports future mobile clients
- it is easier to test outside the frontend
- it is easier to explain as a backend project
- it avoids coupling the frontend too tightly to backend functions

tRPC may be considered later, but it is not the MVP choice.

## Why Not Direct Database Access From Frontend

The frontend should not query the database directly.

Wrong flow:

```txt
Web App
→ Prisma
→ PostgreSQL
```

Correct flow:

```txt
Web App
→ API
→ Prisma
→ PostgreSQL
```

Reason:

The backend must control:

- authentication
- authorization
- validation
- business rules
- AI rules
- file upload rules
- activity logs

## Testing Impact

REST routes should be tested with API-level tests.

Test areas:

- auth required routes
- ownership checks
- validation errors
- create/read/update/delete flows
- status transition rules
- pagination
- filtering
- AI job creation
- file upload limits

## MVP Boundary

The MVP API will focus on internal product use.

The API does not need:

- public developer API
- API keys
- webhooks
- OAuth app integrations
- API versioning
- GraphQL schema
- external SDK

These can be added later if needed.

## Future Direction

Future API improvements may include:

```txt
/api/v1 versioning
public API keys
webhooks
GitHub integration routes
mobile-specific endpoints
background worker routes
OpenAPI documentation
```

These are not part of the first MVP.

## Consequences

ShipLoop AI will have a clear backend API boundary.

The frontend will not directly control business logic.

The API will be easier to test, debug, and explain.

The project will be ready for a future mobile app because mobile can use the same backend routes.

## Final Decision

ShipLoop AI will use a REST API first.

The MVP will expose clear resource-based routes, use backend validation, enforce ownership checks, and keep AI generation behind server-side API routes.
