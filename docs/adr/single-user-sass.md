# ADR 001 — Single-User SaaS First

## Status

Accepted

## Date

2026-06-04

## Context

ShipLoop AI is a SaaS-style application that helps solo developers manage the full software development loop:

```txt
Plan → Build → Test → Fix → Ship → Learn
```

The MVP is focused on one main user:

```txt
A solo developer or junior engineer building and shipping personal software projects.
```

The app includes workflows for:

- projects
- feature briefs
- task planning
- bug reports
- test plans
- release notes
- AI draft generation
- activity logs
- file attachments

At this stage, the project does not need team workspaces, team roles, billing, or organization-level permissions.

The main goal is to build a strong MVP that proves the software delivery workflow first.

## Decision

ShipLoop AI MVP will be built as a single-user SaaS-style product first.

This means each user owns their own data.

The main ownership rule is:

```txt
User owns Projects.
Projects own workflow records.
```

Most core records will belong to a project, and each project will belong to one user.

Examples:

```txt
User
→ Project
→ Feature Brief
→ Task
→ Bug Report
→ Test Plan
→ Release Note
```

The MVP will not include:

- team workspaces
- organization accounts
- role-based access control
- shared projects
- project invitations
- billing
- subscriptions
- admin dashboards for teams

## Reason

This decision keeps the MVP focused and realistic.

The goal is not to build a large team platform first.

The goal is to help one developer move from a rough idea to a documented release.

This also makes the first version easier to build, test, and explain in a portfolio.

## Benefits

### 1. Smaller MVP Scope

Single-user ownership keeps the product simple.

The app does not need complex permission checks, team roles, or organization settings.

### 2. Faster Development

The backend can use a simple ownership model.

Most queries only need to check:

```txt
Does this record belong to the current user?
```

### 3. Clearer Product Story

The portfolio story is easier to explain:

```txt
ShipLoop AI helps solo developers plan, build, test, fix, and ship software.
```

### 4. Safer AI Workflow

AI-generated content belongs to one user.

There is no risk of mixing team data or showing AI drafts to the wrong user.

### 5. Easier Database Design

The data model can stay project-centered.

The first version does not need organization tables, membership tables, invitation tables, or role tables.

## Tradeoffs

### 1. No Team Collaboration in MVP

Users cannot invite teammates or share projects.

This is acceptable because the MVP target user is a solo developer.

### 2. No Role-Based Permissions

The MVP does not support roles like owner, admin, editor, or viewer.

This is acceptable because each account owns its own records.

### 3. Future Migration May Be Needed

If team workspaces are added later, the data model may need new tables.

Possible future tables:

```txt
Organization
Membership
Workspace
ProjectMember
Invitation
Role
```

### 4. Less Enterprise-Ready

The MVP is not designed for companies or engineering teams yet.

This is acceptable because the first goal is portfolio value and real solo workflow practice.

## Data Model Impact

Each user owns many projects.

```txt
User
→ Project
```

Each project owns most workflow records.

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
Project
→ ActivityLog
Project
→ Attachment
```

AI jobs also belong to the user and may connect to a project or module record.

```txt
User
→ AIJob
Project
→ AIJob
```

## API Impact

Most API routes require authentication.

The backend must check ownership before returning or changing data.

Example route shape:

```txt
GET /api/projects
POST /api/projects
GET /api/projects/:projectId/feature-briefs
POST /api/projects/:projectId/tasks
POST /api/projects/:projectId/bug-reports
POST /api/projects/:projectId/test-plans
POST /api/projects/:projectId/release-notes
```

The backend should not trust the frontend.

Main rule:

```txt
The frontend can ask.
The backend decides.
```

## Authorization Rule

Every protected request must confirm that the current user owns the parent project.

Example:

```txt
User requests a task.
Backend checks the task's project.
Backend checks the project owner.
Backend returns the task only if the project belongs to the user.
```

## UI Impact

The MVP UI should be built around one personal workspace.

Main pages:

```txt
Dashboard
Projects
Project Detail
Feature Briefs
Tasks
Bug Reports
Test Plans
Release Notes
AI Jobs
Settings
```

The UI should not include:

- team member pages
- invite buttons
- role selectors
- organization switcher
- billing screens

## AI Workflow Impact

AI can help generate drafts for:

- feature briefs
- tasks
- bug reports
- test plans
- release notes

But AI output is never automatically final.

Main rule:

```txt
AI output is draft data.
Approved user content is source-of-truth data.
```

The user must review, edit, and approve AI-generated content.

## Security Impact

The MVP must still protect user data.

Security rules:

- require authentication for private routes
- check user ownership on every protected record
- validate all input on the backend
- avoid exposing records across users
- avoid storing sensitive AI prompts unless needed
- keep uploaded files linked to the correct user and project

## Future Direction

Team support may be added later.

Possible future flow:

```txt
User
→ Organization
→ Workspace
→ Project
→ Project Members
```

However, this is not part of the MVP.

The MVP should first prove that the solo developer workflow works well.

## Consequences

ShipLoop AI will move faster during MVP development.

The app will be easier to test and explain.

The first version will focus on workflow quality instead of team management.

Future team support is possible, but it should be treated as a later product phase.

## Final Decision

ShipLoop AI MVP will use a single-user SaaS model.

The MVP will focus on helping one developer manage the full software delivery loop from idea to release notes.

This decision is accepted for the first version of the product.
