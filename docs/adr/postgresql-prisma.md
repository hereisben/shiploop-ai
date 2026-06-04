# ADR 004 — PostgreSQL and Prisma

## Status

Accepted

## Date

2026-06-04

## Context

ShipLoop AI is a full-stack SaaS-style application.

The MVP needs to store structured workflow data for:

- users
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

Most records have clear relationships.

Example:

```txt
User
→ Project
→ Task
→ Activity Log
```

Another example:

```txt
Project
→ Test Plan
→ Test Case
```

The backend needs a database and ORM setup that is reliable, easy to query, easy to migrate, and realistic for a software engineering portfolio project.

## Decision

ShipLoop AI will use:

```txt
PostgreSQL as the main database
Prisma as the ORM
```

The backend will access the database through Prisma.

Main flow:

```txt
Node.js API
→ Prisma ORM
→ PostgreSQL
```

## Main Rule

```txt
PostgreSQL stores the source of truth.
Prisma manages database access and schema changes.
```

## Reason

PostgreSQL is a strong fit because ShipLoop AI has relational data.

The project needs relationships between users, projects, tasks, bugs, test plans, test cases, release notes, and AI jobs.

Prisma is a good fit because it gives the project a clean TypeScript-friendly way to define models, run migrations, and query data.

## Benefits

### 1. Strong Relational Data Model

ShipLoop AI is project-centered.

Most workflow records belong to a project.

Example:

```txt
Project
→ FeatureBrief
Project
→ Task
Project
→ BugReport
Project
→ TestPlan
Project
→ ReleaseNote
```

PostgreSQL handles these relationships well.

### 2. Good Data Integrity

PostgreSQL supports:

- foreign keys
- unique constraints
- indexes
- transactions
- relational joins
- data consistency rules

This helps protect important workflow data.

### 3. Type-Friendly Backend Development

Prisma works well with TypeScript.

It generates types from the database schema.

This helps reduce mistakes when writing backend services.

### 4. Easier Migrations

Prisma migrations make database changes easier to track.

Each schema change can be versioned with the codebase.

Example:

```bash
npx prisma migrate dev
```

### 5. Good Portfolio Value

PostgreSQL and Prisma are common in real full-stack projects.

Using them shows practical backend skills:

- schema design
- relational modeling
- migrations
- queries
- indexes
- data validation
- ownership checks

## Tradeoffs

### 1. More Setup Than MongoDB

PostgreSQL needs schema design before storing data.

This is acceptable because ShipLoop AI already has a planned data model.

### 2. Migrations Need Care

Bad migrations can break data.

The project should use small migrations and review schema changes before applying them.

### 3. Prisma Adds an Abstraction Layer

Prisma makes database work easier, but it can hide some raw SQL details.

This is acceptable for MVP.

Raw SQL can still be used later if needed.

### 4. Relational Design Requires Planning

Tables and relationships must be designed carefully.

This is acceptable because ShipLoop AI has clear workflow entities.

## Why Not MongoDB

MongoDB is flexible, but ShipLoop AI has many structured relationships.

Examples:

```txt
User owns Projects
Project owns Tasks
Test Plan owns Test Cases
Release Note owns Release Note Items
```

PostgreSQL is a better fit for this relational structure.

MongoDB may be useful for flexible logs or analytics later, but it is not the main MVP database choice.

## Why Not MySQL

MySQL could work for this project.

However, PostgreSQL is selected because it has strong support for:

- relational data
- advanced indexes
- JSON fields when needed
- hosted database options
- modern full-stack development workflows

PostgreSQL also pairs well with Prisma.

## Why Not Supabase Directly

Supabase uses PostgreSQL and could be useful later.

However, ShipLoop AI will keep its own backend API as the main business logic layer.

The frontend should not directly control database rules.

Correct flow:

```txt
Web App
→ API
→ Prisma
→ PostgreSQL
```

Incorrect flow:

```txt
Web App
→ Database
```

This keeps validation, authorization, AI rules, and activity logging on the backend.

## Prisma Schema Location

The Prisma schema will live at:

```txt
prisma/schema.prisma
```

The database supports the full product, so the schema should stay near the root of the monorepo.

## Main Models

The MVP database should include these models:

```txt
User
Project
FeatureBrief
Task
BugReport
TestPlan
TestCase
ReleaseNote
ReleaseNoteItem
AIJob
Attachment
ActivityLog
```

## Ownership Model

The main ownership rule is:

```txt
User owns Projects.
Projects own workflow records.
```

Example:

```txt
User
→ Project
→ Task
```

The backend must check ownership before reading or changing records.

## Relationship Rules

### User to Project

A user can have many projects.

```txt
User 1 → many Projects
```

### Project to Workflow Records

A project can have many workflow records.

```txt
Project 1 → many FeatureBriefs
Project 1 → many Tasks
Project 1 → many BugReports
Project 1 → many TestPlans
Project 1 → many ReleaseNotes
```

### TestPlan to TestCase

A test plan can have many test cases.

```txt
TestPlan 1 → many TestCases
```

### ReleaseNote to ReleaseNoteItem

A release note can have many change items.

```txt
ReleaseNote 1 → many ReleaseNoteItems
```

### AIJob to Source Records

An AI job can connect to a project and sometimes to a source record.

Examples:

```txt
AIJob → FeatureBrief
AIJob → BugReport
AIJob → TestPlan
AIJob → ReleaseNote
```

For MVP, this can be stored with flexible fields:

```txt
sourceType
sourceId
```

## Enum Rules

Status values should be stored as enums where possible.

Examples:

```txt
TaskStatus
BugStatus
FeatureBriefStatus
TestPlanStatus
ReleaseNoteStatus
AIJobStatus
```

This keeps data consistent.

## Timestamp Rules

Most records should include:

```txt
createdAt
updatedAt
```

Records that can be completed or published may also include:

```txt
completedAt
publishedAt
approvedAt
closedAt
verifiedAt
```

## Soft Delete Rule

For MVP, records can use soft delete only where it helps.

Possible field:

```txt
archivedAt
```

This is useful for projects, release notes, or old workflow records.

Hard delete can still be used for simple records during early development.

## Index Rules

Indexes should support common queries.

Suggested indexes:

```txt
Project.userId
Task.projectId
Task.status
BugReport.projectId
BugReport.status
BugReport.severity
TestPlan.projectId
TestPlan.status
ReleaseNote.projectId
ReleaseNote.status
AIJob.userId
AIJob.status
ActivityLog.projectId
Attachment.projectId
```

## Transaction Rules

Use transactions when a workflow changes multiple records at once.

Examples:

```txt
Create release note
→ create release note items
→ create activity log
```

Another example:

```txt
Update bug to Verified
→ update bug status
→ create activity log
```

## Activity Log Rule

Important database changes should create activity logs.

Examples:

- project created
- feature brief approved
- task completed
- bug verified
- test plan completed
- release note published
- AI draft generated

## AI Data Rule

AI output should be stored as draft data.

Main rule:

```txt
AI output is draft data.
Approved user content is source-of-truth data.
```

Possible AI job fields:

```txt
id
userId
projectId
jobType
status
input
output
errorMessage
createdAt
updatedAt
completedAt
```

## Attachment Rule

Attachments should store metadata in PostgreSQL.

The file itself may be stored locally first.

Metadata examples:

```txt
id
userId
projectId
linkedType
linkedId
fileName
fileType
fileSize
storagePath
createdAt
```

For future production storage, files can move to object storage.

Possible options:

```txt
AWS S3
Cloudflare R2
Supabase Storage
UploadThing
```

## Migration Rules

Schema changes should be small and clear.

Good migration habit:

```txt
Change one group of models at a time.
Run migration.
Test affected API routes.
Commit schema and migration together.
```

## Seeding Rule

The project should include seed data for local development.

Seed data may include:

- one demo user
- one demo project
- one feature brief
- several tasks
- one bug report
- one test plan
- several test cases
- one release note

This helps with frontend development and demo flow.

## Environment Variables

The backend should read the database connection from:

```txt
DATABASE_URL
```

Example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/shiploop_ai"
```

## Testing Impact

Database-related tests should cover:

- model creation
- required fields
- relationships
- ownership checks
- status transitions
- activity log creation
- AI job creation
- attachment metadata
- pagination and filtering queries

## MVP Boundary

For MVP, the database does not need:

- multi-tenant organizations
- team membership tables
- billing tables
- subscription tables
- audit log compliance system
- analytics warehouse
- event sourcing
- full text search engine

These can be added later if needed.

## Future Direction

Future database improvements may include:

```txt
Organization
Membership
Workspace
ProjectMember
Invitation
BillingAccount
Subscription
WebhookEvent
GitHubIntegration
SearchIndex
```

These are not part of the first MVP.

## Consequences

ShipLoop AI will use a relational database model.

The backend will have clear database access through Prisma.

The project will support strong ownership checks, structured workflows, and clean migrations.

The MVP will stay realistic without adding team or billing complexity too early.

## Final Decision

ShipLoop AI will use PostgreSQL as the main database and Prisma as the ORM.

This decision is accepted for the MVP.
