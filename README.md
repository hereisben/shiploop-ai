# ShipLoop AI

**ShipLoop AI** is a single-user SaaS-style web and mobile application that helps solo developers manage the full software delivery loop from feature idea to release.

The goal of this project is to practice real software engineering skills by building a product that supports planning, bug tracking, test planning, and release communication.

ShipLoop AI is built around one simple workflow:

```txt
Plan → Build → Test → Fix → Ship → Learn
```

---

## Overview

Many junior developers build projects by jumping straight into code. This often leads to unclear feature goals, weak task planning, loose bug tracking, skipped test plans, and missing release notes.

ShipLoop AI helps solve that problem by giving solo developers a structured way to manage their software work.

The app helps users:

- Clarify feature ideas before coding
- Break features into smaller tasks
- Write clear bug reports
- Generate AI-assisted test plans
- Track fixed and verified bugs
- Generate user-facing and developer-facing release notes
- Build better software engineering habits over time

This project is intentionally designed as a **single-user SaaS-style product** first. It does not include team workspaces, billing, or complex multi-tenant logic in the first version.

---

## Why I Built This

As a junior software developer, I wanted to build a project that shows more than basic CRUD features.

I wanted to practice how real software teams think about:

- Product requirements
- Feature planning
- Bug reports
- Test coverage
- Release notes
- Backend API design
- Database modeling
- AI-assisted workflows
- Background jobs
- Web and mobile clients
- Maintainable full-stack architecture

ShipLoop AI is my way of building a realistic software engineering workflow from the ground up.

---

## Target User

The first target user is a solo developer or junior software engineer who is building personal projects and wants a better way to manage the development process.

Example users:

- Junior developers building portfolio projects
- Students working on software projects
- Solo developers managing side projects
- Developers who want better planning and testing habits
- Builders who want to document features, bugs, tests, and releases

---

## Core Workflow

The main workflow of ShipLoop AI is:

```txt
Create Project
→ Create Feature Brief
→ Approve Feature Brief
→ Create Tasks
→ Report Bugs
→ Generate Test Plan
→ Run Test Cases
→ Fix and Verify Bugs
→ Generate Release Notes
```

Each step connects to the next one, so the user can move from a rough idea to a documented release.

---

## Core Features

### Project Dashboard

The dashboard gives the user a quick overview of active development work.

It shows:

- Active projects
- Open feature briefs
- Open tasks
- Open bugs
- Completed tasks
- Recent release notes
- Work that needs attention

---

### Feature Brief Builder

The Feature Brief Builder helps users turn rough ideas into clear feature plans.

A feature brief includes:

- Feature title
- Problem statement
- Target user
- User outcome
- Proposed solution
- Success criteria
- Acceptance criteria
- In-scope items
- Out-of-scope items
- Risks
- Assumptions
- Dependencies
- Open questions
- Technical notes

AI can help improve a rough feature idea by asking follow-up questions and generating a structured draft.

The user must review and approve the feature brief before it can be used to generate tasks or test plans.

---

### Task Planning

Each approved feature brief can be broken into smaller tasks.

A task includes:

- Title
- Description
- Status
- Priority
- Related project
- Related feature brief
- Due date
- Notes

Task statuses:

```txt
Backlog
Planned
In Progress
Blocked
Done
```

---

### Bug Tracker

The Bug Tracker helps users write clear and useful bug reports.

A bug report includes:

- Bug title
- Related project
- Related feature
- Steps to reproduce
- Expected result
- Actual result
- Environment
- Severity
- Priority
- Status
- Screenshot or attachment
- Root cause notes
- Fix notes
- Verification notes

Bug statuses:

```txt
New
Triaged
In Progress
Fixed
Ready for Retest
Verified
Closed
Reopened
Deferred
Duplicate
Need More Info
```

AI can help clean up messy bug notes, suggest missing fields, and generate a debugging checklist.

---

### AI Test Plan Generator

ShipLoop AI can generate a test plan from an approved feature brief or a bug fix.

A test plan may include:

- Objective
- In-scope items
- Out-of-scope items
- Test environment
- Test data
- Happy path tests
- Negative tests
- Edge cases
- Boundary tests
- API tests
- Regression checks
- Risks
- Success criteria

Each test case includes:

- Title
- Type
- Priority
- Preconditions
- Steps
- Expected result
- Actual result
- Status
- Linked acceptance criteria

AI-generated test plans are drafts. The user must review and approve them before use.

---

### Release Notes Generator

ShipLoop AI can generate release notes from completed features, done tasks, verified bugs, and completed test plans.

Release notes may include:

- Version number
- Release date
- Summary
- New features
- Improvements
- Bug fixes
- Known issues
- Breaking changes
- Upgrade steps
- Security notes
- Related work

The app can generate different styles of release notes:

- User-facing release notes
- Developer-facing release notes
- Internal release summary
- Markdown changelog format

AI-generated release notes must be reviewed and approved before publishing or exporting.

---

### Mobile Companion App

The mobile app is a lightweight companion app for quick capture.

The mobile app supports:

- View today’s tasks
- Add a quick feature idea
- Add a quick bug report
- Upload a screenshot
- Mark a task as done
- View recent release notes

The mobile app does not replace the web dashboard. It supports quick actions when the user is away from the computer.

---

## Tech Stack

### Web App

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Zustand

### Mobile App

- React Native
- Expo
- TypeScript
- Expo Router
- NativeWind
- Expo SecureStore
- Expo Image Picker

### Backend API

- NestJS
- TypeScript
- REST API
- Prisma
- PostgreSQL

### AI Service

- Python
- FastAPI
- LLM API
- Prompt templates
- Structured JSON responses

### Background Jobs

- Redis
- BullMQ

### File Storage

- AWS S3

### Testing and Quality

- Vitest
- React Testing Library
- Playwright
- Postman
- ESLint
- Prettier
- GitHub Actions

---

## System Architecture

```txt
                 ┌──────────────────────┐
                 │       Web App        │
                 │  Next.js + React     │
                 └──────────┬───────────┘
                            │
                            │ REST API
                            │
┌──────────────────────┐    │    ┌──────────────────────┐
│     Mobile App       │────┼────│      API Server      │
│ React Native + Expo  │         │ NestJS + TypeScript  │
└──────────────────────┘         └──────────┬───────────┘
                                            │
                                            │ Prisma
                                            │
                                  ┌─────────▼───────────┐
                                  │     PostgreSQL      │
                                  └─────────┬───────────┘
                                            │
                                            │
                      ┌─────────────────────┼─────────────────────┐
                      │                     │                     │
              ┌───────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
              │ Python AI      │   │ Redis + BullMQ  │   │ AWS S3          │
              │ FastAPI Service│   │ Background Jobs │   │ File Storage    │
              └────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## Planned Monorepo Structure

```txt
shiploop-ai/
├─ apps/
│  ├─ web/                 # Next.js web app
│  ├─ mobile/              # Expo React Native app
│  └─ api/                 # NestJS API server
│
├─ services/
│  └─ ai/                  # Python FastAPI AI service
│
├─ packages/
│  ├─ database/            # Prisma schema and database client
│  ├─ shared/              # Shared types and utilities
│  └─ config/              # Shared ESLint and TypeScript config
│
├─ docs/
│  ├─ product/
│  ├─ modules/
│  ├─ architecture/
│  └─ decisions/
│
├─ README.md
└─ package.json
```

---

## Main Data Models

The main planned models are:

- User
- Project
- FeatureBrief
- Task
- BugReport
- TestPlan
- TestCase
- ReleaseNote
- ReleaseItem
- FileAsset
- AIJob

These models are designed to connect planning, testing, bug fixing, and release communication into one workflow.

---

## MVP Scope

The first MVP focuses on the web app and backend.

### Included in MVP

- Authentication
- Project dashboard
- Project CRUD
- Feature brief builder
- Task planning
- Bug tracker
- AI test plan generation
- Release notes generation
- Basic markdown export
- PostgreSQL database
- REST API
- Basic testing setup

### Not Included in MVP

- Team workspaces
- Billing
- Public project pages
- GitHub sync
- Calendar integration
- RAG knowledge search
- Push notifications
- Advanced analytics
- Full mobile app release

These features may be added later after the core workflow is stable.

---

## Development Roadmap

### Phase 1: Foundation

- Set up monorepo
- Set up Next.js web app
- Set up NestJS API
- Set up PostgreSQL and Prisma
- Add authentication
- Add project CRUD
- Add dashboard layout

### Phase 2: Feature Planning

- Add Feature Brief Builder
- Add feature brief status workflow
- Add feature brief approval flow
- Add task board
- Connect tasks to feature briefs

### Phase 3: Bug Tracking

- Add bug report form
- Add severity and priority fields
- Add bug status workflow
- Add screenshot upload
- Add fix and verification notes

### Phase 4: AI Workflows

- Set up Python FastAPI AI service
- Add AI feature brief improvement
- Add AI bug report cleanup
- Add AI test plan generation
- Add AI release notes generation
- Use structured JSON responses

### Phase 5: Background Jobs

- Add Redis
- Add BullMQ
- Queue AI jobs
- Track job status
- Add retry logic for failed jobs

### Phase 6: Testing and Release

- Add unit tests
- Add API tests
- Add Playwright E2E tests
- Add GitHub Actions
- Deploy web app
- Deploy backend API
- Deploy AI service
- Record demo video

### Phase 7: Mobile Companion App

- Set up Expo app
- Add mobile authentication
- Add project list
- Add today’s tasks
- Add quick bug capture
- Add screenshot upload

---

## AI Usage

ShipLoop AI uses AI as an engineering assistant.

AI helps with:

- Improving feature briefs
- Asking missing requirement questions
- Cleaning up bug reports
- Suggesting debugging checklists
- Generating test plan drafts
- Generating release note drafts

AI does not replace user judgment.

Every AI-generated output must be reviewed, edited, and approved by the user before it becomes final.

---

## Example AI Workflow

```txt
User writes a rough feature idea
→ App sends the idea to the AI service
→ AI returns structured JSON
→ API saves the AI draft
→ Web app displays the draft
→ User edits the result
→ User approves the final version
```

Example AI output:

```json
{
  "improvedTitle": "AI Bug Report Cleaner",
  "problemStatement": "Solo developers often write vague bug notes that are hard to reproduce later.",
  "targetUser": "Solo developers and junior developers",
  "successCriteria": [
    "The user can paste rough bug notes",
    "The system returns a structured bug report",
    "The user can edit the AI output before saving"
  ],
  "missingQuestions": [
    "What environment did the bug happen in?",
    "Can the bug be reproduced every time?",
    "Is there a screenshot or console log?"
  ]
}
```

---

## Testing Strategy

ShipLoop AI includes multiple layers of testing.

### Unit Tests

Used for:

- Utility functions
- Validation schemas
- Data transformations
- AI response parsing

### API Tests

Used for:

- Auth-protected routes
- Project CRUD
- Feature brief creation
- Bug report creation
- Test plan generation
- Release note generation

### E2E Tests

Used for main user flows:

```txt
Login
Create project
Create feature brief
Approve feature brief
Create bug report
Generate test plan
Generate release notes
```

### Manual Testing

Used for:

- File uploads
- Mobile responsiveness
- AI output review
- Mobile quick capture
- Release note export

---

## Demo Flow

A strong demo flow for this project:

```txt
1. Log in
2. Create a project
3. Create a feature brief
4. Use AI to improve the brief
5. Approve the feature brief
6. Generate tasks
7. Add a bug report
8. Generate a test plan
9. Run test cases
10. Mark a bug as fixed and verified
11. Generate release notes
12. Export release notes as Markdown
```

---

## What I Want to Learn

Through this project, I want to improve in:

- TypeScript
- Next.js App Router
- React Native with Expo
- NestJS backend architecture
- PostgreSQL database design
- Prisma ORM
- Python FastAPI services
- AI workflow integration
- Background jobs with Redis and BullMQ
- AWS S3 file uploads
- Testing and CI/CD
- System design thinking
- Product ownership

---

## Current Status

```txt
Planning and documentation phase
```

Next step:

```txt
Finalize MVP scope and module specs before starting the monorepo setup.
```

---

## License

This project is for learning and portfolio purposes.

---

## Author

**Ben Nguyen**

- Portfolio: https://hereisben.dev
- LinkedIn: https://linkedin.com/in/here-is-ben
- Email: [hi.imben.nguyen@gmail.com](mailto:hi.imben.nguyen@gmail.com)
