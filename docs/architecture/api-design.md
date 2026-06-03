# ShipLoop AI - API Design Architecture

This document defines the first API design for **ShipLoop AI**.

The goal of this document is to map the product modules and data model into a clear backend API structure before implementation.

ShipLoop AI helps solo developers manage the full software development loop:

```txt
Plan → Build → Test → Fix → Ship → Learn
```

The API should support this main workflow:

```txt
Create Project
→ Create Feature Brief
→ Approve Feature Brief
→ Generate Tasks
→ Create Bug Reports
→ Generate Test Plan
→ Run Test Cases
→ Fix and Verify Bugs
→ Generate Release Notes
```

---

# 1. Purpose

The purpose of this document is to define:

- API design principles
- route naming rules
- authentication rules
- authorization rules
- request format
- response format
- error format
- pagination format
- main MVP API routes
- AI job API flow
- file upload API flow
- activity log API flow
- implementation order

This document is not final backend code.

It is the API architecture guide for the first backend version.

---

# 2. API Design Principles

## 2.1 REST First

The MVP should use REST-style APIs.

REST is easier to understand, test, document, and explain in interviews.

Example:

```txt
GET /api/projects
POST /api/projects
GET /api/projects/:projectId
PATCH /api/projects/:projectId
DELETE /api/projects/:projectId
```

## 2.2 Project-Centered Routes

Most module routes should live under a project.

Example:

```txt
/api/projects/:projectId/feature-briefs
/api/projects/:projectId/tasks
/api/projects/:projectId/bug-reports
/api/projects/:projectId/test-plans
/api/projects/:projectId/release-notes
```

Reason:

A project is the main workspace in ShipLoop AI.

## 2.3 Auth Required by Default

Most routes should require login.

Public routes should be limited.

Public routes in MVP:

```txt
POST /api/auth/register
POST /api/auth/login
GET /api/health
```

Private routes:

```txt
All project, module, AI, upload, and activity routes
```

## 2.4 User Ownership First

The MVP is single-user.

A user can only access their own data.

Main rule:

```txt
record.userId === currentUser.id
```

For project child records:

```txt
record.project.userId === currentUser.id
```

## 2.5 Human Review for AI Output

AI should not directly publish or approve final records.

Main rule:

```txt
AI generates draft output.
User reviews the output.
User accepts, edits, or rejects it.
Only accepted output updates source-of-truth records.
```

## 2.6 Consistent Response Shape

All APIs should return a consistent JSON structure.

Success response:

```json
{
  "success": true,
  "data": {},
  "message": "Request completed successfully"
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {}
  }
}
```

## 2.7 MVP Should Stay Simple

Avoid over-engineering.

Do not add these in MVP:

- team permissions
- billing routes
- public changelog routes
- GitHub sync routes
- advanced analytics routes
- complex webhook system
- mobile offline sync routes

---

# 3. Base API Structure

## 3.1 Base URL

For local development:

```txt
http://localhost:4000/api
```

For production:

```txt
https://api.shiploop.ai/api
```

The production URL is a placeholder.

## 3.2 API Versioning

For MVP, routes can start without versioning:

```txt
/api/projects
```

Future versioning can use:

```txt
/api/v1/projects
```

Recommended MVP choice:

```txt
Use /api without versioning first.
```

Reason:

The project is still early and single-user.

---

# 4. Authentication Design

## 4.1 Auth Strategy

Recommended MVP auth strategy:

```txt
Email + password
JWT access token
HTTP-only refresh token cookie
```

Alternative simpler MVP option:

```txt
Session-based auth with secure cookies
```

Recommended stack direction:

```txt
Next.js frontend
Express or NestJS backend
PostgreSQL database
Prisma ORM
JWT or session auth
```

## 4.2 Auth Routes

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
PATCH /api/auth/me
PATCH /api/auth/password
```

## 4.3 Register User

### Route

```txt
POST /api/auth/register
```

### Request Body

```json
{
  "name": "Ben Nguyen",
  "email": "ben@example.com",
  "password": "StrongPassword123!"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "Ben Nguyen",
      "email": "ben@example.com"
    }
  },
  "message": "Account created successfully"
}
```

### Validation Rules

```txt
name is optional
email is required
email must be unique
password is required
password must meet minimum security rules
```

## 4.4 Login User

### Route

```txt
POST /api/auth/login
```

### Request Body

```json
{
  "email": "ben@example.com",
  "password": "StrongPassword123!"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "Ben Nguyen",
      "email": "ben@example.com"
    },
    "accessToken": "jwt_access_token_here"
  },
  "message": "Logged in successfully"
}
```

## 4.5 Get Current User

### Route

```txt
GET /api/auth/me
```

### Success Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "Ben Nguyen",
      "email": "ben@example.com",
      "avatarUrl": null,
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "Current user loaded"
}
```

---

# 5. Authorization Rules

## 5.1 Main Rule

Every private request should know the current user.

```txt
currentUser.id
```

The backend must check ownership before returning or changing data.

## 5.2 Project Access Rule

For project routes:

```txt
project.userId === currentUser.id
```

## 5.3 Child Record Access Rule

For records under a project:

```txt
record.projectId === project.id
project.userId === currentUser.id
```

## 5.4 AI Job Access Rule

For AI jobs:

```txt
aiJob.userId === currentUser.id
```

## 5.5 Attachment Access Rule

For attachments:

```txt
attachment.userId === currentUser.id
```

If files are private, return signed URLs instead of permanent public URLs.

---

# 6. Standard Response Format

## 6.1 Success Response

Use this format for normal success:

```json
{
  "success": true,
  "data": {},
  "message": "Request completed successfully"
}
```

## 6.2 List Response

Use this format for list routes:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "message": "Items loaded successfully"
}
```

## 6.3 Error Response

Use this format for errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title"
    }
  }
}
```

---

# 7. Standard Error Codes

Recommended MVP error codes:

```txt
VALIDATION_ERROR
AUTH_REQUIRED
INVALID_CREDENTIALS
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
AI_JOB_FAILED
UPLOAD_FAILED
INTERNAL_SERVER_ERROR
```

## 7.1 Error Code Meaning

| Code                  | Meaning                                    |
| --------------------- | ------------------------------------------ |
| VALIDATION_ERROR      | Request body is missing required data      |
| AUTH_REQUIRED         | User is not logged in                      |
| INVALID_CREDENTIALS   | Email or password is wrong                 |
| FORBIDDEN             | User does not own the record               |
| NOT_FOUND             | Record does not exist or is not accessible |
| CONFLICT              | Duplicate or invalid state conflict        |
| RATE_LIMITED          | Too many requests                          |
| AI_JOB_FAILED         | AI generation failed                       |
| UPLOAD_FAILED         | File upload failed                         |
| INTERNAL_SERVER_ERROR | Unknown server error                       |

---

# 8. Pagination, Filtering, and Sorting

## 8.1 Standard Query Params

List routes should support:

```txt
page
limit
status
search
sortBy
sortOrder
```

Example:

```txt
GET /api/projects?page=1&limit=20&status=ACTIVE&search=shiploop&sortBy=createdAt&sortOrder=desc
```

## 8.2 Pagination Defaults

Recommended defaults:

```txt
page = 1
limit = 20
max limit = 100
```

## 8.3 Sorting Defaults

Recommended default:

```txt
sortBy = createdAt
sortOrder = desc
```

---

# 9. Health Check API

## 9.1 Health Route

### Route

```txt
GET /api/health
```

### Success Response

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "shiploop-api",
    "time": "2026-06-03T10:00:00.000Z"
  },
  "message": "API is healthy"
}
```

Purpose:

```txt
Check that the backend is running.
```

---

# 10. Project API

Projects are the main workspace in ShipLoop AI.

## 10.1 Project Routes

```txt
GET /api/projects
POST /api/projects
GET /api/projects/:projectId
PATCH /api/projects/:projectId
DELETE /api/projects/:projectId
PATCH /api/projects/:projectId/archive
PATCH /api/projects/:projectId/restore
```

## 10.2 Create Project

### Route

```txt
POST /api/projects
```

### Request Body

```json
{
  "name": "ShipLoop AI",
  "description": "A software delivery assistant for solo developers.",
  "techStack": ["Next.js", "Node.js", "PostgreSQL", "Prisma"],
  "repositoryUrl": "https://github.com/example/shiploop-ai",
  "demoUrl": "https://shiploop-ai.example.com"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project_123",
      "name": "ShipLoop AI",
      "slug": "shiploop-ai",
      "description": "A software delivery assistant for solo developers.",
      "status": "ACTIVE",
      "techStack": ["Next.js", "Node.js", "PostgreSQL", "Prisma"],
      "repositoryUrl": "https://github.com/example/shiploop-ai",
      "demoUrl": "https://shiploop-ai.example.com",
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "Project created successfully"
}
```

## 10.3 List Projects

### Route

```txt
GET /api/projects
```

### Query Params

```txt
page
limit
status
search
sortBy
sortOrder
```

### Success Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "project_123",
        "name": "ShipLoop AI",
        "slug": "shiploop-ai",
        "status": "ACTIVE",
        "description": "A software delivery assistant for solo developers.",
        "createdAt": "2026-06-03T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  },
  "message": "Projects loaded successfully"
}
```

## 10.4 Get Project Detail

### Route

```txt
GET /api/projects/:projectId
```

### Success Response

```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project_123",
      "name": "ShipLoop AI",
      "slug": "shiploop-ai",
      "description": "A software delivery assistant for solo developers.",
      "status": "ACTIVE",
      "techStack": ["Next.js", "Node.js", "PostgreSQL", "Prisma"],
      "repositoryUrl": "https://github.com/example/shiploop-ai",
      "demoUrl": "https://shiploop-ai.example.com",
      "createdAt": "2026-06-03T10:00:00.000Z",
      "updatedAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "Project loaded successfully"
}
```

## 10.5 Update Project

### Route

```txt
PATCH /api/projects/:projectId
```

### Request Body

```json
{
  "name": "ShipLoop AI",
  "description": "Updated project description.",
  "status": "ACTIVE",
  "techStack": ["Next.js", "Express", "PostgreSQL", "Prisma"]
}
```

## 10.6 Delete Project

### Route

```txt
DELETE /api/projects/:projectId
```

Recommended behavior:

```txt
Soft delete project by setting deletedAt.
Do not hard delete child records in MVP.
```

---

# 11. Feature Brief API

Feature briefs help users plan before building.

## 11.1 Feature Brief Routes

```txt
GET /api/projects/:projectId/feature-briefs
POST /api/projects/:projectId/feature-briefs
GET /api/projects/:projectId/feature-briefs/:featureBriefId
PATCH /api/projects/:projectId/feature-briefs/:featureBriefId
DELETE /api/projects/:projectId/feature-briefs/:featureBriefId
PATCH /api/projects/:projectId/feature-briefs/:featureBriefId/status
PATCH /api/projects/:projectId/feature-briefs/:featureBriefId/approve
PATCH /api/projects/:projectId/feature-briefs/:featureBriefId/archive
```

## 11.2 Create Feature Brief

### Route

```txt
POST /api/projects/:projectId/feature-briefs
```

### Request Body

```json
{
  "title": "Feature Brief Builder",
  "problemStatement": "Solo developers often start coding without a clear feature plan.",
  "targetUser": "Solo developer or junior engineer",
  "userOutcome": "The user can turn a rough idea into a structured feature brief.",
  "proposedSolution": "Create a guided form with AI draft support.",
  "successCriteria": [
    "User can create a feature brief",
    "User can save it as draft",
    "User can approve it when required fields are complete"
  ],
  "acceptanceCriteria": [
    "Title is required",
    "Problem statement is required before approval",
    "Approved brief can generate tasks"
  ],
  "inScope": ["Create form", "Edit form", "Approve brief"],
  "outOfScope": ["Team review", "GitHub sync"]
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "featureBrief": {
      "id": "feature_123",
      "projectId": "project_123",
      "title": "Feature Brief Builder",
      "status": "DRAFT",
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "Feature brief created successfully"
}
```

## 11.3 Approve Feature Brief

### Route

```txt
PATCH /api/projects/:projectId/feature-briefs/:featureBriefId/approve
```

### Required Fields Before Approval

```txt
title
problemStatement
targetUser
userOutcome
proposedSolution
successCriteria
acceptanceCriteria
inScope
outOfScope
```

### Success Response

```json
{
  "success": true,
  "data": {
    "featureBrief": {
      "id": "feature_123",
      "status": "APPROVED",
      "approvedAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "Feature brief approved successfully"
}
```

## 11.4 Generate Tasks from Feature Brief

This action should be handled through the AI job system.

Recommended route:

```txt
POST /api/ai/jobs
```

Example input:

```json
{
  "type": "GENERATE_TASKS",
  "projectId": "project_123",
  "sourceType": "FEATURE_BRIEF",
  "sourceId": "feature_123"
}
```

---

# 12. Task API

Tasks help users track build work.

## 12.1 Task Routes

```txt
GET /api/projects/:projectId/tasks
POST /api/projects/:projectId/tasks
GET /api/projects/:projectId/tasks/:taskId
PATCH /api/projects/:projectId/tasks/:taskId
DELETE /api/projects/:projectId/tasks/:taskId
PATCH /api/projects/:projectId/tasks/:taskId/status
PATCH /api/projects/:projectId/tasks/:taskId/complete
PATCH /api/projects/:projectId/tasks/:taskId/archive
```

## 12.2 Create Task

### Route

```txt
POST /api/projects/:projectId/tasks
```

### Request Body

```json
{
  "title": "Build feature brief form UI",
  "description": "Create the frontend form for creating and editing feature briefs.",
  "type": "FRONTEND",
  "priority": "HIGH",
  "estimate": "M",
  "sourceType": "FEATURE_BRIEF",
  "sourceId": "feature_123",
  "featureBriefId": "feature_123",
  "doneCriteria": [
    "Form renders all required fields",
    "User can save draft",
    "Validation messages show for missing required fields"
  ]
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task_123",
      "projectId": "project_123",
      "title": "Build feature brief form UI",
      "status": "BACKLOG",
      "type": "FRONTEND",
      "priority": "HIGH",
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "Task created successfully"
}
```

## 12.3 Update Task Status

### Route

```txt
PATCH /api/projects/:projectId/tasks/:taskId/status
```

### Request Body

```json
{
  "status": "IN_PROGRESS"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task_123",
      "status": "IN_PROGRESS",
      "startedAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "Task status updated successfully"
}
```

## 12.4 Complete Task

### Route

```txt
PATCH /api/projects/:projectId/tasks/:taskId/complete
```

### Request Body

```json
{
  "completionNotes": "Finished UI form and tested draft save behavior."
}
```

### Success Behavior

```txt
Set status to DONE.
Set completedAt.
Create activity log.
```

---

# 13. Bug Report API

Bug reports help users capture and fix problems.

## 13.1 Bug Report Routes

```txt
GET /api/projects/:projectId/bug-reports
POST /api/projects/:projectId/bug-reports
GET /api/projects/:projectId/bug-reports/:bugReportId
PATCH /api/projects/:projectId/bug-reports/:bugReportId
DELETE /api/projects/:projectId/bug-reports/:bugReportId
PATCH /api/projects/:projectId/bug-reports/:bugReportId/status
PATCH /api/projects/:projectId/bug-reports/:bugReportId/mark-fixed
PATCH /api/projects/:projectId/bug-reports/:bugReportId/verify
PATCH /api/projects/:projectId/bug-reports/:bugReportId/reopen
PATCH /api/projects/:projectId/bug-reports/:bugReportId/archive
```

## 13.2 Create Bug Report

### Route

```txt
POST /api/projects/:projectId/bug-reports
```

### Request Body

```json
{
  "title": "Feature brief approval button stays disabled",
  "severity": "HIGH",
  "priority": "HIGH",
  "environment": {
    "browser": "Chrome 126",
    "os": "Windows 11",
    "device": "Desktop",
    "appVersion": "0.1.0",
    "apiEnvironment": "local"
  },
  "stepsToReproduce": [
    "Open an existing feature brief",
    "Fill all required fields",
    "Click save",
    "Look at the approve button"
  ],
  "expectedResult": "The approve button should become enabled.",
  "actualResult": "The approve button stays disabled."
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "bugReport": {
      "id": "bug_123",
      "projectId": "project_123",
      "title": "Feature brief approval button stays disabled",
      "status": "NEW",
      "severity": "HIGH",
      "priority": "HIGH",
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "Bug report created successfully"
}
```

## 13.3 Mark Bug Fixed

### Route

```txt
PATCH /api/projects/:projectId/bug-reports/:bugReportId/mark-fixed
```

### Request Body

```json
{
  "rootCause": "The approval validation was using stale form state.",
  "fixNotes": "Updated validation to run after draft save completes."
}
```

### Success Behavior

```txt
Set status to READY_FOR_RETEST.
Set resolvedAt.
Create activity log.
```

## 13.4 Verify Bug

### Route

```txt
PATCH /api/projects/:projectId/bug-reports/:bugReportId/verify
```

### Request Body

```json
{
  "verificationNotes": "Retested in Chrome. The approve button is now enabled after saving."
}
```

### Success Behavior

```txt
Set status to VERIFIED.
Set verifiedAt.
Create activity log.
```

## 13.5 Reopen Bug

### Route

```txt
PATCH /api/projects/:projectId/bug-reports/:bugReportId/reopen
```

### Request Body

```json
{
  "reason": "Bug still happens when using Safari."
}
```

### Success Behavior

```txt
Set status to REOPENED.
Create activity log.
```

---

# 14. Test Plan API

Test plans help users test features and bug fixes.

## 14.1 Test Plan Routes

```txt
GET /api/projects/:projectId/test-plans
POST /api/projects/:projectId/test-plans
GET /api/projects/:projectId/test-plans/:testPlanId
PATCH /api/projects/:projectId/test-plans/:testPlanId
DELETE /api/projects/:projectId/test-plans/:testPlanId
PATCH /api/projects/:projectId/test-plans/:testPlanId/status
PATCH /api/projects/:projectId/test-plans/:testPlanId/ready
PATCH /api/projects/:projectId/test-plans/:testPlanId/start
PATCH /api/projects/:projectId/test-plans/:testPlanId/complete
PATCH /api/projects/:projectId/test-plans/:testPlanId/archive
```

## 14.2 Create Test Plan

### Route

```txt
POST /api/projects/:projectId/test-plans
```

### Request Body

```json
{
  "title": "Feature Brief Builder Test Plan",
  "featureBriefId": "feature_123",
  "objective": "Verify that users can create, edit, save, and approve feature briefs.",
  "scope": [
    "Create feature brief",
    "Edit feature brief",
    "Validation",
    "Approval flow"
  ],
  "outOfScope": ["Team review", "Mobile UI"],
  "testStrategy": "Run manual UI tests and API smoke tests.",
  "testEnvironment": {
    "browser": "Chrome 126",
    "os": "Windows 11",
    "apiEnvironment": "local"
  },
  "successCriteria": [
    "All required happy path tests pass",
    "No critical bugs remain",
    "Approval validation works"
  ]
}
```

## 14.3 Mark Test Plan Ready

### Route

```txt
PATCH /api/projects/:projectId/test-plans/:testPlanId/ready
```

### Required Fields Before Ready

```txt
title
projectId
objective
scope
outOfScope
testStrategy
testEnvironment
successCriteria
at least one test case
```

---

# 15. Test Case API

Test cases belong to test plans.

## 15.1 Test Case Routes

```txt
GET /api/projects/:projectId/test-plans/:testPlanId/test-cases
POST /api/projects/:projectId/test-plans/:testPlanId/test-cases
GET /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId
PATCH /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId
DELETE /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId
PATCH /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId/result
POST /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId/create-bug
```

## 15.2 Create Test Case

### Route

```txt
POST /api/projects/:projectId/test-plans/:testPlanId/test-cases
```

### Request Body

```json
{
  "title": "User can approve a complete feature brief",
  "type": "HAPPY_PATH",
  "priority": "HIGH",
  "steps": [
    "Create a feature brief",
    "Fill all required fields",
    "Save the feature brief",
    "Click approve"
  ],
  "expectedResult": "The feature brief status changes to APPROVED."
}
```

## 15.3 Update Test Case Result

### Route

```txt
PATCH /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId/result
```

### Request Body for Passed Test

```json
{
  "status": "PASSED",
  "actualResult": "The feature brief status changed to APPROVED.",
  "notes": "Passed in Chrome."
}
```

### Request Body for Failed Test

```json
{
  "status": "FAILED",
  "actualResult": "The approval button stayed disabled.",
  "notes": "This blocks approval."
}
```

## 15.4 Create Bug from Failed Test Case

### Route

```txt
POST /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId/create-bug
```

### Request Body

```json
{
  "title": "Feature brief approval button stays disabled",
  "severity": "HIGH",
  "priority": "HIGH"
}
```

### Success Behavior

```txt
Create BugReport.
Link BugReport to TestCase.
Set testCase.failedBugReportId.
Create activity log.
```

---

# 16. Release Notes API

Release notes summarize completed work.

## 16.1 Release Note Routes

```txt
GET /api/projects/:projectId/release-notes
POST /api/projects/:projectId/release-notes
GET /api/projects/:projectId/release-notes/:releaseNoteId
PATCH /api/projects/:projectId/release-notes/:releaseNoteId
DELETE /api/projects/:projectId/release-notes/:releaseNoteId
PATCH /api/projects/:projectId/release-notes/:releaseNoteId/status
PATCH /api/projects/:projectId/release-notes/:releaseNoteId/approve
PATCH /api/projects/:projectId/release-notes/:releaseNoteId/publish
PATCH /api/projects/:projectId/release-notes/:releaseNoteId/archive
```

## 16.2 Create Release Note

### Route

```txt
POST /api/projects/:projectId/release-notes
```

### Request Body

```json
{
  "title": "ShipLoop AI v0.1.0 Release Notes",
  "releaseVersion": "v0.1.0",
  "releaseDate": "2026-06-03T10:00:00.000Z",
  "summary": "This release adds the first planning workflow for solo developers.",
  "audience": "BOTH",
  "format": "MARKDOWN",
  "knownIssues": ["File upload preview is not supported yet"],
  "breakingChanges": [],
  "migrationNotes": null,
  "testingSummary": "Core project and feature brief flows were tested manually."
}
```

## 16.3 Approve Release Note

### Route

```txt
PATCH /api/projects/:projectId/release-notes/:releaseNoteId/approve
```

### Required Fields Before Approval

```txt
title
projectId
releaseVersion
releaseDate
summary
at least one change item
```

## 16.4 Publish Release Note

### Route

```txt
PATCH /api/projects/:projectId/release-notes/:releaseNoteId/publish
```

### Success Behavior

```txt
Set status to PUBLISHED.
Set publishedAt.
Create activity log.
```

MVP note:

```txt
Published does not mean public on the internet yet.
It only means finalized inside the app.
```

---

# 17. Release Note Item API

Release note items are individual changes inside a release note.

## 17.1 Release Note Item Routes

```txt
GET /api/projects/:projectId/release-notes/:releaseNoteId/items
POST /api/projects/:projectId/release-notes/:releaseNoteId/items
PATCH /api/projects/:projectId/release-notes/:releaseNoteId/items/:itemId
DELETE /api/projects/:projectId/release-notes/:releaseNoteId/items/:itemId
PATCH /api/projects/:projectId/release-notes/:releaseNoteId/items/reorder
```

## 17.2 Create Release Note Item

### Route

```txt
POST /api/projects/:projectId/release-notes/:releaseNoteId/items
```

### Request Body

```json
{
  "type": "NEW_FEATURE",
  "title": "Added Feature Brief Builder",
  "description": "Users can now create structured feature briefs before building.",
  "sourceType": "FEATURE_BRIEF",
  "sourceId": "feature_123",
  "userImpact": "Users can plan features with more clarity.",
  "developerNotes": "This connects to the task planning workflow."
}
```

## 17.3 Reorder Release Note Items

### Route

```txt
PATCH /api/projects/:projectId/release-notes/:releaseNoteId/items/reorder
```

### Request Body

```json
{
  "items": [
    {
      "id": "item_123",
      "orderIndex": 1
    },
    {
      "id": "item_456",
      "orderIndex": 2
    }
  ]
}
```

---

# 18. AI Job API

AI jobs support feature brief generation, task planning, bug cleanup, test plan generation, and release note generation.

## 18.1 AI Job Routes

```txt
GET /api/ai/jobs
POST /api/ai/jobs
GET /api/ai/jobs/:aiJobId
PATCH /api/ai/jobs/:aiJobId/cancel
POST /api/ai/jobs/:aiJobId/apply
POST /api/ai/jobs/:aiJobId/reject
```

## 18.2 Create AI Job

### Route

```txt
POST /api/ai/jobs
```

### Request Body Example

```json
{
  "type": "GENERATE_TEST_PLAN",
  "projectId": "project_123",
  "sourceType": "FEATURE_BRIEF",
  "sourceId": "feature_123",
  "input": {
    "extraInstructions": "Include happy path, negative tests, edge cases, and API smoke tests."
  }
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "aiJob": {
      "id": "ai_job_123",
      "type": "GENERATE_TEST_PLAN",
      "status": "QUEUED",
      "projectId": "project_123",
      "sourceType": "FEATURE_BRIEF",
      "sourceId": "feature_123",
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "AI job created successfully"
}
```

## 18.3 Get AI Job

### Route

```txt
GET /api/ai/jobs/:aiJobId
```

### Success Response

```json
{
  "success": true,
  "data": {
    "aiJob": {
      "id": "ai_job_123",
      "type": "GENERATE_TEST_PLAN",
      "status": "SUCCEEDED",
      "input": {},
      "output": {
        "title": "Feature Brief Builder Test Plan",
        "testCases": []
      },
      "sourceType": "FEATURE_BRIEF",
      "sourceId": "feature_123",
      "targetType": "TEST_PLAN",
      "targetId": null,
      "createdAt": "2026-06-03T10:00:00.000Z",
      "completedAt": "2026-06-03T10:01:00.000Z"
    }
  },
  "message": "AI job loaded successfully"
}
```

## 18.4 Apply AI Job Output

### Route

```txt
POST /api/ai/jobs/:aiJobId/apply
```

### Request Body

```json
{
  "targetType": "TEST_PLAN",
  "editedOutput": {
    "title": "Feature Brief Builder Test Plan",
    "objective": "Verify that users can create and approve feature briefs.",
    "testCases": []
  }
}
```

### Success Behavior

```txt
Validate AI output.
Create or update target record.
Set AI job status to NEEDS_REVIEW or SUCCEEDED depending on flow.
Create activity log.
```

Recommended MVP behavior:

```txt
AI job creates draft records only.
User must still approve the final record if approval is required.
```

## 18.5 Reject AI Job Output

### Route

```txt
POST /api/ai/jobs/:aiJobId/reject
```

### Request Body

```json
{
  "reason": "The output was too vague."
}
```

### Success Behavior

```txt
Mark output as rejected.
Keep AIJob for history.
Do not update main records.
```

---

# 19. Attachment API

Attachments store evidence files and related documents.

For MVP, attachments are mainly for bug reports and test evidence.

## 19.1 Attachment Routes

```txt
GET /api/projects/:projectId/attachments
POST /api/projects/:projectId/attachments
GET /api/projects/:projectId/attachments/:attachmentId
DELETE /api/projects/:projectId/attachments/:attachmentId
```

## 19.2 Upload Attachment

### Route

```txt
POST /api/projects/:projectId/attachments
```

### Request Type

```txt
multipart/form-data
```

### Form Fields

```txt
file
sourceType
sourceId
description
```

### Example Metadata

```json
{
  "sourceType": "BUG_REPORT",
  "sourceId": "bug_123",
  "description": "Screenshot of disabled approval button."
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "attachment": {
      "id": "attachment_123",
      "projectId": "project_123",
      "fileName": "approval-button-bug.png",
      "fileKey": "projects/project_123/bugs/bug_123/approval-button-bug.png",
      "mimeType": "image/png",
      "fileSize": 245000,
      "sourceType": "BUG_REPORT",
      "sourceId": "bug_123",
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  },
  "message": "Attachment uploaded successfully"
}
```

## 19.3 Allowed File Types

Recommended MVP allowed types:

```txt
image/png
image/jpeg
image/webp
application/pdf
text/plain
```

## 19.4 File Size Limit

Recommended MVP limit:

```txt
10 MB per file
```

---

# 20. Activity Log API

Activity logs show project history.

## 20.1 Activity Log Routes

```txt
GET /api/projects/:projectId/activity
GET /api/activity
```

## 20.2 Project Activity

### Route

```txt
GET /api/projects/:projectId/activity
```

### Query Params

```txt
page
limit
entityType
action
sortBy
sortOrder
```

### Success Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "activity_123",
        "action": "APPROVED",
        "entityType": "FEATURE_BRIEF",
        "entityId": "feature_123",
        "metadata": {
          "title": "Feature Brief Builder"
        },
        "createdAt": "2026-06-03T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  },
  "message": "Activity loaded successfully"
}
```

## 20.3 Activity Creation Rule

Activity logs should be created by backend services.

The frontend should not create activity logs directly.

Recommended activity events:

```txt
Project created
Feature brief approved
Tasks generated
Bug report created
Bug status changed
Test plan generated
Test case failed
Bug verified
Release note approved
Release note published
AI job completed
Attachment uploaded
```

---

# 21. Dashboard API

The dashboard should show project-level progress.

## 21.1 Dashboard Routes

```txt
GET /api/projects/:projectId/dashboard
GET /api/dashboard
```

## 21.2 Project Dashboard

### Route

```txt
GET /api/projects/:projectId/dashboard
```

### Success Response

```json
{
  "success": true,
  "data": {
    "summary": {
      "featureBriefs": {
        "total": 5,
        "approved": 2,
        "draft": 3
      },
      "tasks": {
        "total": 20,
        "done": 8,
        "inProgress": 3,
        "blocked": 1
      },
      "bugs": {
        "total": 6,
        "open": 3,
        "verified": 2,
        "critical": 1
      },
      "testPlans": {
        "total": 3,
        "completed": 1
      },
      "releaseNotes": {
        "total": 2,
        "published": 1
      }
    },
    "recentActivity": []
  },
  "message": "Dashboard loaded successfully"
}
```

---

# 22. Search API

Search is optional for MVP, but useful.

## 22.1 Search Routes

```txt
GET /api/search
GET /api/projects/:projectId/search
```

## 22.2 Project Search

### Route

```txt
GET /api/projects/:projectId/search
```

### Query Params

```txt
q
types
limit
```

Example:

```txt
GET /api/projects/:projectId/search?q=approval&types=tasks,bugs,features&limit=10
```

### MVP Search Scope

Search should include:

```txt
Feature briefs
Tasks
Bug reports
Test plans
Release notes
```

MVP search can use simple database search first.

Do not add RAG search in MVP.

---

# 23. Route Summary by Module

## 23.1 Auth

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PATCH  /api/auth/me
PATCH  /api/auth/password
```

## 23.2 Projects

```txt
GET    /api/projects
POST   /api/projects
GET    /api/projects/:projectId
PATCH  /api/projects/:projectId
DELETE /api/projects/:projectId
PATCH  /api/projects/:projectId/archive
PATCH  /api/projects/:projectId/restore
GET    /api/projects/:projectId/dashboard
GET    /api/projects/:projectId/activity
GET    /api/projects/:projectId/search
```

## 23.3 Feature Briefs

```txt
GET    /api/projects/:projectId/feature-briefs
POST   /api/projects/:projectId/feature-briefs
GET    /api/projects/:projectId/feature-briefs/:featureBriefId
PATCH  /api/projects/:projectId/feature-briefs/:featureBriefId
DELETE /api/projects/:projectId/feature-briefs/:featureBriefId
PATCH  /api/projects/:projectId/feature-briefs/:featureBriefId/status
PATCH  /api/projects/:projectId/feature-briefs/:featureBriefId/approve
PATCH  /api/projects/:projectId/feature-briefs/:featureBriefId/archive
```

## 23.4 Tasks

```txt
GET    /api/projects/:projectId/tasks
POST   /api/projects/:projectId/tasks
GET    /api/projects/:projectId/tasks/:taskId
PATCH  /api/projects/:projectId/tasks/:taskId
DELETE /api/projects/:projectId/tasks/:taskId
PATCH  /api/projects/:projectId/tasks/:taskId/status
PATCH  /api/projects/:projectId/tasks/:taskId/complete
PATCH  /api/projects/:projectId/tasks/:taskId/archive
```

## 23.5 Bug Reports

```txt
GET    /api/projects/:projectId/bug-reports
POST   /api/projects/:projectId/bug-reports
GET    /api/projects/:projectId/bug-reports/:bugReportId
PATCH  /api/projects/:projectId/bug-reports/:bugReportId
DELETE /api/projects/:projectId/bug-reports/:bugReportId
PATCH  /api/projects/:projectId/bug-reports/:bugReportId/status
PATCH  /api/projects/:projectId/bug-reports/:bugReportId/mark-fixed
PATCH  /api/projects/:projectId/bug-reports/:bugReportId/verify
PATCH  /api/projects/:projectId/bug-reports/:bugReportId/reopen
PATCH  /api/projects/:projectId/bug-reports/:bugReportId/archive
```

## 23.6 Test Plans

```txt
GET    /api/projects/:projectId/test-plans
POST   /api/projects/:projectId/test-plans
GET    /api/projects/:projectId/test-plans/:testPlanId
PATCH  /api/projects/:projectId/test-plans/:testPlanId
DELETE /api/projects/:projectId/test-plans/:testPlanId
PATCH  /api/projects/:projectId/test-plans/:testPlanId/status
PATCH  /api/projects/:projectId/test-plans/:testPlanId/ready
PATCH  /api/projects/:projectId/test-plans/:testPlanId/start
PATCH  /api/projects/:projectId/test-plans/:testPlanId/complete
PATCH  /api/projects/:projectId/test-plans/:testPlanId/archive
```

## 23.7 Test Cases

```txt
GET    /api/projects/:projectId/test-plans/:testPlanId/test-cases
POST   /api/projects/:projectId/test-plans/:testPlanId/test-cases
GET    /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId
PATCH  /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId
DELETE /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId
PATCH  /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId/result
POST   /api/projects/:projectId/test-plans/:testPlanId/test-cases/:testCaseId/create-bug
```

## 23.8 Release Notes

```txt
GET    /api/projects/:projectId/release-notes
POST   /api/projects/:projectId/release-notes
GET    /api/projects/:projectId/release-notes/:releaseNoteId
PATCH  /api/projects/:projectId/release-notes/:releaseNoteId
DELETE /api/projects/:projectId/release-notes/:releaseNoteId
PATCH  /api/projects/:projectId/release-notes/:releaseNoteId/status
PATCH  /api/projects/:projectId/release-notes/:releaseNoteId/approve
PATCH  /api/projects/:projectId/release-notes/:releaseNoteId/publish
PATCH  /api/projects/:projectId/release-notes/:releaseNoteId/archive
```

## 23.9 Release Note Items

```txt
GET    /api/projects/:projectId/release-notes/:releaseNoteId/items
POST   /api/projects/:projectId/release-notes/:releaseNoteId/items
PATCH  /api/projects/:projectId/release-notes/:releaseNoteId/items/:itemId
DELETE /api/projects/:projectId/release-notes/:releaseNoteId/items/:itemId
PATCH  /api/projects/:projectId/release-notes/:releaseNoteId/items/reorder
```

## 23.10 AI Jobs

```txt
GET    /api/ai/jobs
POST   /api/ai/jobs
GET    /api/ai/jobs/:aiJobId
PATCH  /api/ai/jobs/:aiJobId/cancel
POST   /api/ai/jobs/:aiJobId/apply
POST   /api/ai/jobs/:aiJobId/reject
```

## 23.11 Attachments

```txt
GET    /api/projects/:projectId/attachments
POST   /api/projects/:projectId/attachments
GET    /api/projects/:projectId/attachments/:attachmentId
DELETE /api/projects/:projectId/attachments/:attachmentId
```

## 23.12 Activity

```txt
GET    /api/activity
GET    /api/projects/:projectId/activity
```

---

# 24. Validation Strategy

## 24.1 Recommended Validation Library

Recommended TypeScript validation library:

```txt
Zod
```

Reason:

- good TypeScript support
- clear schemas
- useful error messages
- can share schemas between frontend and backend later

## 24.2 Validation Layers

Use validation in these places:

```txt
frontend form validation
backend request validation
database constraints
business rule validation
```

## 24.3 Business Rule Examples

Feature brief approval:

```txt
Cannot approve if required fields are missing.
```

Task ready status:

```txt
Cannot move to READY if doneCriteria is empty.
```

Bug closed status:

```txt
Bug should be verified before closed.
```

Test plan ready status:

```txt
Cannot mark READY without at least one test case.
```

Release note approval:

```txt
Cannot approve without at least one change item.
```

---

# 25. API Security Rules

## 25.1 Password Security

```txt
Never store plain text passwords.
Hash passwords before saving.
Use a strong password hashing library.
```

Recommended library:

```txt
bcrypt or argon2
```

## 25.2 Token Security

```txt
Keep access tokens short-lived.
Store refresh token in HTTP-only cookie if using refresh tokens.
Do not store sensitive tokens in localStorage if avoidable.
```

## 25.3 Input Security

```txt
Validate all request bodies.
Sanitize user text where needed.
Limit request body size.
Limit upload file size.
```

## 25.4 Authorization Security

```txt
Never trust projectId from the frontend alone.
Always check database ownership.
```

## 25.5 AI Security

```txt
Do not send secrets to AI prompts.
Do not include API keys, passwords, private tokens, or environment variables in AI input.
Store AI output as draft data.
Require user review before applying AI output.
```

---

# 26. Rate Limiting

Rate limiting should be simple in MVP.

Recommended rate limits:

```txt
Auth routes: stricter
AI routes: stricter
Upload routes: medium
Normal CRUD routes: basic
```

Example:

```txt
POST /api/auth/login
Limit: 5 attempts per minute per IP
```

```txt
POST /api/ai/jobs
Limit: 10 jobs per hour per user
```

```txt
POST /api/projects/:projectId/attachments
Limit: 20 uploads per hour per user
```

---

# 27. API Testing Strategy

## 27.1 Test Types

The backend should include:

```txt
unit tests
integration tests
API route tests
authorization tests
validation tests
AI job flow tests
upload tests
```

## 27.2 Important Test Cases

Auth:

```txt
User can register
User can login
Invalid password returns error
Unauthenticated request is rejected
```

Project:

```txt
User can create project
User can list own projects
User cannot access another user's project
Deleted project is hidden
```

Feature Brief:

```txt
User can create draft
User cannot approve incomplete brief
User can approve complete brief
```

Task:

```txt
User can create task
User can update task status
User can complete task
```

Bug Report:

```txt
User can create bug report
User can mark bug fixed
User can verify bug
User can reopen bug
```

Test Plan:

```txt
User can create test plan
User cannot mark ready without test cases
User can run test cases
Failed test case can create bug report
```

Release Notes:

```txt
User can create release note
User cannot approve release note without change items
User can publish approved release note
```

AI Jobs:

```txt
User can create AI job
AI job saves output
User can apply AI output
User can reject AI output
```

Attachments:

```txt
User can upload allowed file type
Large file is rejected
Unsupported file type is rejected
User cannot access another user's file
```

---

# 28. MVP Implementation Order

The API should be implemented in phases.

## 28.1 Phase 1 - Foundation

```txt
GET /api/health
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

## 28.2 Phase 2 - Project Core

```txt
GET /api/projects
POST /api/projects
GET /api/projects/:projectId
PATCH /api/projects/:projectId
DELETE /api/projects/:projectId
GET /api/projects/:projectId/dashboard
```

## 28.3 Phase 3 - Feature Brief and Tasks

```txt
Feature Brief CRUD
Feature Brief approval
Task CRUD
Task status update
Task complete
```

## 28.4 Phase 4 - Bug Reports

```txt
Bug Report CRUD
Bug status update
Mark fixed
Verify bug
Reopen bug
Attachment upload for bugs
```

## 28.5 Phase 5 - Test Plans and Test Cases

```txt
Test Plan CRUD
Test Plan ready/start/complete
Test Case CRUD
Test Case result update
Create bug from failed test case
```

## 28.6 Phase 6 - Release Notes

```txt
Release Note CRUD
Release Note Item CRUD
Approve release note
Publish release note
```

## 28.7 Phase 7 - AI Jobs

```txt
Create AI job
Get AI job
Apply AI output
Reject AI output
Generate feature brief draft
Generate tasks
Clean bug report
Generate test plan
Generate release notes
```

## 28.8 Phase 8 - Polish

```txt
Activity logs
Search
Dashboard summary
Rate limiting
API tests
Error handling polish
```

---

# 29. MVP Boundary

The MVP API should support:

- user registration and login
- project CRUD
- feature brief CRUD and approval
- task CRUD and status tracking
- bug report CRUD and verification
- test plan CRUD
- test case execution
- release note creation and publishing
- release note items
- AI job tracking
- AI draft apply/reject flow
- basic file uploads
- activity logs
- project dashboard summary

The MVP API should not support yet:

- teams
- billing
- GitHub sync
- public changelog publishing
- comments
- mobile offline sync
- advanced analytics
- complex role permissions
- webhooks
- RAG search

---

# 30. Final API Design Summary

The ShipLoop AI API should be simple, project-centered, and easy to test.

The main API shape is:

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

The backend should protect every private route with:

```txt
Authentication
Authorization
Validation
Business rules
```

The most important product rule is:

```txt
AI creates drafts.
The user owns the final decision.
```

The next architecture document should define the system architecture.

Next file:

```txt
docs/architecture/system-architecture.md
```
