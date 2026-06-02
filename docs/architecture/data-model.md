# ShipLoop AI - Data Model Architecture

This document defines the first shared data model for **ShipLoop AI**.

The goal of this document is to connect all product modules into one clear backend data structure before writing the API design and implementation.

ShipLoop AI helps solo developers manage the full software development loop:

```txt
Plan → Build → Test → Fix → Ship → Learn
```

The data model should support this full workflow:

```txt
Project
→ Feature Brief
→ Tasks
→ Bugs
→ Test Plans
→ Test Cases
→ Release Notes
→ AI Jobs
→ Activity Logs
```

---

# 1. Purpose

The purpose of this document is to define:

- main data entities
- entity relationships
- important fields
- status enums
- lifecycle rules
- ownership rules
- soft delete rules
- AI job tracking rules
- file attachment rules
- future database direction

This document is not the final database schema yet.

It is the architecture guide for the first Prisma and PostgreSQL schema.

---

# 2. Data Model Principles

ShipLoop AI should keep the data model clear, practical, and easy to build.

## 2.1 Single-User First

The MVP is designed for one user account.

There are no team workspaces in MVP.

Each major record belongs to one user.

```txt
User owns Projects.
Projects own most workflow records.
```

Future team support should be possible, but it should not make the MVP complex.

## 2.2 Project-Centered Workflow

Most records should connect to a project.

A project is the main container for work.

```txt
Project
├─ Feature Briefs
├─ Tasks
├─ Bug Reports
├─ Test Plans
├─ Release Notes
├─ Attachments
├─ AI Jobs
└─ Activity Logs
```

## 2.3 Human Review Rule

AI can generate drafts, but AI should not become the final source of truth.

The user must review and approve important records.

This applies to:

- feature briefs
- task plans
- test plans
- release notes
- bug cleanup suggestions

Main rule:

```txt
AI suggests.
User reviews.
User approves.
The approved record becomes the source of truth.
```

## 2.4 Traceability

Records should link together when possible.

Example:

```txt
Feature Brief → Tasks → Test Plan → Release Notes
Bug Report → Fix Task → Retest Case → Release Notes
```

This helps the user understand why a task exists and what release it belongs to.

## 2.5 Soft Delete Where Useful

Most user-created records should support soft delete.

This avoids accidental data loss.

Recommended soft delete fields:

```txt
deletedAt
archivedAt
```

For MVP, hard delete can be allowed only for simple records if needed.

---

# 3. Main Entities

The main MVP entities are:

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

Future entities may include:

```txt
Workspace
TeamMember
Comment
GitHubIntegration
Notification
MobileSession
PublicChangelog
```

These are not part of MVP.

---

# 4. Entity Relationship Overview

## 4.1 High-Level Relationship Diagram

```txt
User
└─ Project
   ├─ FeatureBrief
   │  └─ Task
   │
   ├─ BugReport
   │  ├─ Task
   │  └─ Attachment
   │
   ├─ TestPlan
   │  └─ TestCase
   │
   ├─ ReleaseNote
   │  └─ ReleaseNoteItem
   │
   ├─ AIJob
   ├─ Attachment
   └─ ActivityLog
```

## 4.2 Source Linking Diagram

```txt
FeatureBrief
   ↓ creates
Task

BugReport
   ↓ creates
Task

FeatureBrief or BugReport
   ↓ creates
TestPlan

TestPlan
   ↓ contains
TestCase

FeatureBrief + Task + BugReport + TestPlan
   ↓ summarize into
ReleaseNote
```

---

# 5. User Model

## 5.1 Purpose

The `User` model stores account-level data.

In MVP, each user manages their own solo development workflow.

## 5.2 Fields

```txt
id
name
email
passwordHash
avatarUrl
createdAt
updatedAt
deletedAt
```

## 5.3 Field Notes

| Field        | Type     | Required | Notes                  |
| ------------ | -------- | -------: | ---------------------- |
| id           | UUID     |      Yes | Primary key            |
| name         | String   |       No | Display name           |
| email        | String   |      Yes | Unique login email     |
| passwordHash | String   |      Yes | Hashed password only   |
| avatarUrl    | String   |       No | Optional profile image |
| createdAt    | DateTime |      Yes | Created timestamp      |
| updatedAt    | DateTime |      Yes | Updated timestamp      |
| deletedAt    | DateTime |       No | Soft delete support    |

## 5.4 Relationships

```txt
User has many Projects.
User has many AIJobs.
User has many ActivityLogs.
```

---

# 6. Project Model

## 6.1 Purpose

The `Project` model is the main workspace for a software product or app.

Example projects:

```txt
ShipLoop AI
Portfolio Website
Notes App
Soccer Team Manager
```

## 6.2 Fields

```txt
id
userId
name
slug
description
status
techStack
repositoryUrl
demoUrl
createdAt
updatedAt
archivedAt
deletedAt
```

## 6.3 Field Notes

| Field         | Type             | Required | Notes                               |
| ------------- | ---------------- | -------: | ----------------------------------- |
| id            | UUID             |      Yes | Primary key                         |
| userId        | UUID             |      Yes | Owner user                          |
| name          | String           |      Yes | Project name                        |
| slug          | String           |      Yes | URL-friendly project name           |
| description   | Text             |       No | Short project summary               |
| status        | ProjectStatus    |      Yes | Current project status              |
| techStack     | String[] or JSON |       No | Example: React, Node.js, PostgreSQL |
| repositoryUrl | String           |       No | GitHub repo URL                     |
| demoUrl       | String           |       No | Live demo URL                       |
| createdAt     | DateTime         |      Yes | Created timestamp                   |
| updatedAt     | DateTime         |      Yes | Updated timestamp                   |
| archivedAt    | DateTime         |       No | Archive timestamp                   |
| deletedAt     | DateTime         |       No | Soft delete timestamp               |

## 6.4 Project Status Enum

```txt
ACTIVE
PAUSED
ARCHIVED
DELETED
```

## 6.5 Relationships

```txt
Project belongs to User.
Project has many FeatureBriefs.
Project has many Tasks.
Project has many BugReports.
Project has many TestPlans.
Project has many ReleaseNotes.
Project has many AIJobs.
Project has many Attachments.
Project has many ActivityLogs.
```

---

# 7. FeatureBrief Model

## 7.1 Purpose

The `FeatureBrief` model stores structured feature planning content.

A feature brief explains:

```txt
What problem are we solving?
Who is this for?
What outcome should the user get?
What is in scope?
What is out of scope?
How do we know it works?
```

## 7.2 Fields

```txt
id
projectId
userId
title
status
problemStatement
targetUser
userOutcome
proposedSolution
successCriteria
acceptanceCriteria
inScope
outOfScope
risks
assumptions
dependencies
openQuestions
aiGenerated
aiSummary
approvedAt
createdAt
updatedAt
archivedAt
deletedAt
```

## 7.3 Field Notes

| Field              | Type               | Required Before Approval | Notes                            |
| ------------------ | ------------------ | -----------------------: | -------------------------------- |
| id                 | UUID               |                      Yes | Primary key                      |
| projectId          | UUID               |                      Yes | Related project                  |
| userId             | UUID               |                      Yes | Owner user                       |
| title              | String             |                      Yes | Feature title                    |
| status             | FeatureBriefStatus |                      Yes | Lifecycle status                 |
| problemStatement   | Text               |                      Yes | Problem being solved             |
| targetUser         | Text               |                      Yes | User affected by the feature     |
| userOutcome        | Text               |                      Yes | Result the user should get       |
| proposedSolution   | Text               |                      Yes | Planned solution                 |
| successCriteria    | String[] or JSON   |                      Yes | Measurable success list          |
| acceptanceCriteria | String[] or JSON   |                      Yes | Conditions for done              |
| inScope            | String[] or JSON   |                      Yes | Included work                    |
| outOfScope         | String[] or JSON   |                      Yes | Excluded work                    |
| risks              | String[] or JSON   |                       No | Known risks                      |
| assumptions        | String[] or JSON   |                       No | Assumptions                      |
| dependencies       | String[] or JSON   |                       No | Dependencies                     |
| openQuestions      | String[] or JSON   |                       No | Questions to resolve             |
| aiGenerated        | Boolean            |                      Yes | True if AI created initial draft |
| aiSummary          | Text               |                       No | Optional AI summary              |
| approvedAt         | DateTime           |                       No | Set when approved                |
| createdAt          | DateTime           |                      Yes | Created timestamp                |
| updatedAt          | DateTime           |                      Yes | Updated timestamp                |
| archivedAt         | DateTime           |                       No | Archive timestamp                |
| deletedAt          | DateTime           |                       No | Soft delete timestamp            |

## 7.4 Feature Brief Status Enum

```txt
DRAFT
NEEDS_REVIEW
APPROVED
IN_PROGRESS
SHIPPED
ARCHIVED
```

## 7.5 Relationships

```txt
FeatureBrief belongs to Project.
FeatureBrief belongs to User.
FeatureBrief has many Tasks.
FeatureBrief can be linked to TestPlans.
FeatureBrief can be linked to ReleaseNoteItems.
```

## 7.6 Approval Rule

A feature brief cannot move to `APPROVED` unless these fields are filled:

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

---

# 8. Task Model

## 8.1 Purpose

The `Task` model stores development work items.

Tasks can come from:

- a feature brief
- a bug report
- a test plan
- a manual idea

Main rule:

```txt
A task should be small enough to build, test, and review.
```

## 8.2 Fields

```txt
id
projectId
userId
featureBriefId
bugReportId
testPlanId
title
description
status
type
priority
estimate
doneCriteria
sourceType
sourceId
orderIndex
blockedReason
startedAt
completedAt
createdAt
updatedAt
archivedAt
deletedAt
```

## 8.3 Field Notes

| Field          | Type             | Required Before Ready | Notes                                   |
| -------------- | ---------------- | --------------------: | --------------------------------------- |
| id             | UUID             |                   Yes | Primary key                             |
| projectId      | UUID             |                   Yes | Related project                         |
| userId         | UUID             |                   Yes | Owner user                              |
| featureBriefId | UUID             |                    No | Optional linked feature                 |
| bugReportId    | UUID             |                    No | Optional linked bug                     |
| testPlanId     | UUID             |                    No | Optional linked test plan               |
| title          | String           |                   Yes | Task title                              |
| description    | Text             |                   Yes | What needs to be done                   |
| status         | TaskStatus       |                   Yes | Task lifecycle                          |
| type           | TaskType         |                   Yes | Frontend, backend, database, test, etc. |
| priority       | Priority         |                   Yes | Fix order or build order                |
| estimate       | TaskEstimate     |                    No | Small, medium, large                    |
| doneCriteria   | String[] or JSON |                   Yes | Conditions for completion               |
| sourceType     | TaskSourceType   |                   Yes | Where the task came from                |
| sourceId       | UUID             |                    No | Related source record ID                |
| orderIndex     | Integer          |                    No | Manual ordering                         |
| blockedReason  | Text             |                    No | Why the task is blocked                 |
| startedAt      | DateTime         |                    No | Work start timestamp                    |
| completedAt    | DateTime         |                    No | Done timestamp                          |
| createdAt      | DateTime         |                   Yes | Created timestamp                       |
| updatedAt      | DateTime         |                   Yes | Updated timestamp                       |
| archivedAt     | DateTime         |                    No | Archive timestamp                       |
| deletedAt      | DateTime         |                    No | Soft delete timestamp                   |

## 8.4 Task Status Enum

```txt
BACKLOG
READY
IN_PROGRESS
IN_REVIEW
DONE
BLOCKED
CANCELED
DEFERRED
```

## 8.5 Task Type Enum

```txt
FRONTEND
BACKEND
DATABASE
API
AUTH
AI
TESTING
BUG_FIX
DOCUMENTATION
DEVOPS
REFACTOR
DESIGN
OTHER
```

## 8.6 Task Estimate Enum

```txt
XS
S
M
L
XL
UNKNOWN
```

## 8.7 Task Source Type Enum

```txt
MANUAL
FEATURE_BRIEF
BUG_REPORT
TEST_PLAN
RELEASE_NOTE
AI_SUGGESTION
```

## 8.8 Relationships

```txt
Task belongs to Project.
Task belongs to User.
Task can belong to FeatureBrief.
Task can belong to BugReport.
Task can belong to TestPlan.
Task can be linked to ReleaseNoteItems.
```

## 8.9 Ready Rule

A task cannot move to `READY` unless these fields are filled:

```txt
title
projectId
type
status
description
sourceType
doneCriteria
priority
```

---

# 9. BugReport Model

## 9.1 Purpose

The `BugReport` model stores reproducible software problems.

Main rule:

```txt
A bug report is for reproduction, not complaining.
```

## 9.2 Fields

```txt
id
projectId
userId
title
status
severity
priority
environment
stepsToReproduce
expectedResult
actualResult
evidenceNotes
rootCause
fixNotes
verificationNotes
duplicateOfBugId
createdFromTestCaseId
resolvedAt
verifiedAt
closedAt
createdAt
updatedAt
archivedAt
deletedAt
```

## 9.3 Field Notes

| Field                 | Type             | Required | Notes                            |
| --------------------- | ---------------- | -------: | -------------------------------- |
| id                    | UUID             |      Yes | Primary key                      |
| projectId             | UUID             |      Yes | Related project                  |
| userId                | UUID             |      Yes | Owner user                       |
| title                 | String           |      Yes | Clear bug title                  |
| status                | BugStatus        |      Yes | Bug lifecycle                    |
| severity              | Severity         |      Yes | How bad the bug is               |
| priority              | Priority         |      Yes | How soon to fix                  |
| environment           | JSON             |      Yes | Browser, device, OS, app version |
| stepsToReproduce      | String[] or JSON |      Yes | Reproduction steps               |
| expectedResult        | Text             |      Yes | What should happen               |
| actualResult          | Text             |      Yes | What happened instead            |
| evidenceNotes         | Text             |       No | Screenshot or video notes        |
| rootCause             | Text             |       No | Cause after debugging            |
| fixNotes              | Text             |       No | What changed in the fix          |
| verificationNotes     | Text             |       No | Retest notes                     |
| duplicateOfBugId      | UUID             |       No | Link to original bug             |
| createdFromTestCaseId | UUID             |       No | Failed test case source          |
| resolvedAt            | DateTime         |       No | Fixed timestamp                  |
| verifiedAt            | DateTime         |       No | Verified timestamp               |
| closedAt              | DateTime         |       No | Closed timestamp                 |
| createdAt             | DateTime         |      Yes | Created timestamp                |
| updatedAt             | DateTime         |      Yes | Updated timestamp                |
| archivedAt            | DateTime         |       No | Archive timestamp                |
| deletedAt             | DateTime         |       No | Soft delete timestamp            |

## 9.4 Bug Status Enum

```txt
NEW
TRIAGED
IN_PROGRESS
FIXED
READY_FOR_RETEST
VERIFIED
CLOSED
REOPENED
DEFERRED
REJECTED
DUPLICATE
NEED_MORE_INFO
```

## 9.5 Severity Enum

```txt
LOW
MEDIUM
HIGH
CRITICAL
```

## 9.6 Priority Enum

```txt
LOW
MEDIUM
HIGH
URGENT
```

## 9.7 Environment JSON Example

```json
{
  "browser": "Chrome 126",
  "os": "Windows 11",
  "device": "Desktop",
  "appVersion": "0.1.0",
  "screenSize": "1440x900",
  "apiEnvironment": "local"
}
```

## 9.8 Relationships

```txt
BugReport belongs to Project.
BugReport belongs to User.
BugReport can have many Attachments.
BugReport can create Tasks.
BugReport can be created from TestCase.
BugReport can be linked to ReleaseNoteItems.
```

## 9.9 Verification Rule

A bug should not move to `CLOSED` unless it has been verified.

Recommended flow:

```txt
FIXED
→ READY_FOR_RETEST
→ VERIFIED
→ CLOSED
```

---

# 10. TestPlan Model

## 10.1 Purpose

The `TestPlan` model stores a structured testing plan.

A test plan can be created from:

- an approved feature brief
- a fixed bug report
- a manual testing need

Main rule:

```txt
Happy path alone is not enough.
```

## 10.2 Fields

```txt
id
projectId
userId
featureBriefId
bugReportId
title
status
objective
scope
outOfScope
testStrategy
testEnvironment
testData
successCriteria
risks
aiGenerated
approvedAt
startedAt
completedAt
createdAt
updatedAt
archivedAt
deletedAt
```

## 10.3 Field Notes

| Field           | Type             | Required Before Ready | Notes                       |
| --------------- | ---------------- | --------------------: | --------------------------- |
| id              | UUID             |                   Yes | Primary key                 |
| projectId       | UUID             |                   Yes | Related project             |
| userId          | UUID             |                   Yes | Owner user                  |
| featureBriefId  | UUID             |                    No | Optional linked feature     |
| bugReportId     | UUID             |                    No | Optional linked bug         |
| title           | String           |                   Yes | Test plan title             |
| status          | TestPlanStatus   |                   Yes | Test plan lifecycle         |
| objective       | Text             |                   Yes | What the plan tests         |
| scope           | String[] or JSON |                   Yes | Included testing scope      |
| outOfScope      | String[] or JSON |                   Yes | Excluded testing scope      |
| testStrategy    | Text             |                   Yes | How testing will be done    |
| testEnvironment | JSON             |                   Yes | Environment for testing     |
| testData        | JSON             |                    No | Data needed for testing     |
| successCriteria | String[] or JSON |                   Yes | Conditions for passing      |
| risks           | String[] or JSON |                    No | Testing risks               |
| aiGenerated     | Boolean          |                   Yes | True if AI drafted it       |
| approvedAt      | DateTime         |                    No | Set when marked Ready       |
| startedAt       | DateTime         |                    No | Testing start timestamp     |
| completedAt     | DateTime         |                    No | Testing completed timestamp |
| createdAt       | DateTime         |                   Yes | Created timestamp           |
| updatedAt       | DateTime         |                   Yes | Updated timestamp           |
| archivedAt      | DateTime         |                    No | Archive timestamp           |
| deletedAt       | DateTime         |                    No | Soft delete timestamp       |

## 10.4 Test Plan Status Enum

```txt
DRAFT
READY
IN_PROGRESS
COMPLETED
BLOCKED
ARCHIVED
```

## 10.5 Relationships

```txt
TestPlan belongs to Project.
TestPlan belongs to User.
TestPlan can belong to FeatureBrief.
TestPlan can belong to BugReport.
TestPlan has many TestCases.
TestPlan can be linked to ReleaseNoteItems.
```

## 10.6 Ready Rule

A test plan cannot move to `READY` unless these fields are filled:

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

# 11. TestCase Model

## 11.1 Purpose

The `TestCase` model stores one testable scenario.

A test case should tell the user:

```txt
What to test
How to test it
What result should pass
What result actually happened
```

## 11.2 Fields

```txt
id
testPlanId
projectId
userId
title
type
status
priority
steps
expectedResult
actualResult
notes
orderIndex
failedBugReportId
executedAt
createdAt
updatedAt
deletedAt
```

## 11.3 Field Notes

| Field             | Type             | Required | Notes                           |
| ----------------- | ---------------- | -------: | ------------------------------- |
| id                | UUID             |      Yes | Primary key                     |
| testPlanId        | UUID             |      Yes | Parent test plan                |
| projectId         | UUID             |      Yes | Related project                 |
| userId            | UUID             |      Yes | Owner user                      |
| title             | String           |      Yes | Test case title                 |
| type              | TestCaseType     |      Yes | Happy path, negative, API, etc. |
| status            | TestCaseStatus   |      Yes | Test result status              |
| priority          | Priority         |      Yes | Test importance                 |
| steps             | String[] or JSON |      Yes | Steps to run                    |
| expectedResult    | Text             |      Yes | Expected result                 |
| actualResult      | Text             |       No | Actual result after execution   |
| notes             | Text             |       No | Extra testing notes             |
| orderIndex        | Integer          |       No | Manual ordering                 |
| failedBugReportId | UUID             |       No | Bug created from failed test    |
| executedAt        | DateTime         |       No | Last execution timestamp        |
| createdAt         | DateTime         |      Yes | Created timestamp               |
| updatedAt         | DateTime         |      Yes | Updated timestamp               |
| deletedAt         | DateTime         |       No | Soft delete timestamp           |

## 11.4 Test Case Type Enum

```txt
HAPPY_PATH
NEGATIVE
EDGE_CASE
BOUNDARY
ERROR_STATE
API
REGRESSION
SECURITY_SMOKE
ACCESSIBILITY
PERFORMANCE_SMOKE
OTHER
```

## 11.5 Test Case Status Enum

```txt
NOT_RUN
PASSED
FAILED
BLOCKED
SKIPPED
NEEDS_UPDATE
```

## 11.6 Relationships

```txt
TestCase belongs to TestPlan.
TestCase belongs to Project.
TestCase belongs to User.
TestCase can create BugReport when failed.
```

## 11.7 Failed Test Rule

If a test case fails, the user should be able to create a bug report from it.

Recommended flow:

```txt
TestCase FAILED
→ Create BugReport
→ Link BugReport to TestCase
→ Fix Bug
→ Retest TestCase
```

---

# 12. ReleaseNote Model

## 12.1 Purpose

The `ReleaseNote` model stores a release summary.

It explains what changed in a version.

Main rule:

```txt
Release notes are for humans, not machines.
```

## 12.2 Fields

```txt
id
projectId
userId
title
status
releaseVersion
releaseDate
summary
audience
format
knownIssues
breakingChanges
migrationNotes
testingSummary
aiGenerated
approvedAt
publishedAt
createdAt
updatedAt
archivedAt
deletedAt
```

## 12.3 Field Notes

| Field           | Type              | Required Before Approval | Notes                           |
| --------------- | ----------------- | -----------------------: | ------------------------------- |
| id              | UUID              |                      Yes | Primary key                     |
| projectId       | UUID              |                      Yes | Related project                 |
| userId          | UUID              |                      Yes | Owner user                      |
| title           | String            |                      Yes | Release note title              |
| status          | ReleaseNoteStatus |                      Yes | Release note lifecycle          |
| releaseVersion  | String            |                      Yes | Example: v0.1.0                 |
| releaseDate     | DateTime          |                      Yes | Release date                    |
| summary         | Text              |                      Yes | Short release summary           |
| audience        | ReleaseAudience   |                      Yes | User-facing or developer-facing |
| format          | ReleaseFormat     |                      Yes | Style of release note           |
| knownIssues     | String[] or JSON  |                       No | Known issues                    |
| breakingChanges | String[] or JSON  |                       No | Breaking changes                |
| migrationNotes  | Text              |                       No | Upgrade notes                   |
| testingSummary  | Text              |                       No | What was tested                 |
| aiGenerated     | Boolean           |                      Yes | True if AI drafted it           |
| approvedAt      | DateTime          |                       No | Approval timestamp              |
| publishedAt     | DateTime          |                       No | Publish timestamp               |
| createdAt       | DateTime          |                      Yes | Created timestamp               |
| updatedAt       | DateTime          |                      Yes | Updated timestamp               |
| archivedAt      | DateTime          |                       No | Archive timestamp               |
| deletedAt       | DateTime          |                       No | Soft delete timestamp           |

## 12.4 Release Note Status Enum

```txt
DRAFT
NEEDS_REVIEW
APPROVED
PUBLISHED
ARCHIVED
```

## 12.5 Release Audience Enum

```txt
USER_FACING
DEVELOPER_FACING
BOTH
```

## 12.6 Release Format Enum

```txt
SHORT
DETAILED
CHANGELOG
MARKDOWN
```

## 12.7 Relationships

```txt
ReleaseNote belongs to Project.
ReleaseNote belongs to User.
ReleaseNote has many ReleaseNoteItems.
```

## 12.8 Approval Rule

A release note cannot move to `APPROVED` unless these fields are filled:

```txt
title
projectId
releaseVersion
releaseDate
summary
at least one change item
```

---

# 13. ReleaseNoteItem Model

## 13.1 Purpose

The `ReleaseNoteItem` model stores one change inside a release note.

Examples:

```txt
Added Feature Brief Builder
Fixed bug report validation
Improved test plan generation
Known issue with file upload preview
```

## 13.2 Fields

```txt
id
releaseNoteId
projectId
userId
type
title
description
sourceType
sourceId
userImpact
developerNotes
orderIndex
createdAt
updatedAt
deletedAt
```

## 13.3 Field Notes

| Field          | Type                | Required | Notes                       |
| -------------- | ------------------- | -------: | --------------------------- |
| id             | UUID                |      Yes | Primary key                 |
| releaseNoteId  | UUID                |      Yes | Parent release note         |
| projectId      | UUID                |      Yes | Related project             |
| userId         | UUID                |      Yes | Owner user                  |
| type           | ReleaseNoteItemType |      Yes | Added, fixed, changed, etc. |
| title          | String              |      Yes | Change item title           |
| description    | Text                |      Yes | Change explanation          |
| sourceType     | ReleaseSourceType   |       No | Linked source type          |
| sourceId       | UUID                |       No | Linked source ID            |
| userImpact     | Text                |       No | User-facing impact          |
| developerNotes | Text                |       No | Technical notes             |
| orderIndex     | Integer             |       No | Manual ordering             |
| createdAt      | DateTime            |      Yes | Created timestamp           |
| updatedAt      | DateTime            |      Yes | Updated timestamp           |
| deletedAt      | DateTime            |       No | Soft delete timestamp       |

## 13.4 Release Note Item Type Enum

```txt
NEW_FEATURE
IMPROVEMENT
BUG_FIX
DOCUMENTATION
TESTING
KNOWN_ISSUE
BREAKING_CHANGE
DEPRECATED
REMOVED
SECURITY
OTHER
```

## 13.5 Release Source Type Enum

```txt
FEATURE_BRIEF
TASK
BUG_REPORT
TEST_PLAN
TEST_CASE
MANUAL
AI_SUMMARY
```

## 13.6 Relationships

```txt
ReleaseNoteItem belongs to ReleaseNote.
ReleaseNoteItem belongs to Project.
ReleaseNoteItem belongs to User.
ReleaseNoteItem can link to FeatureBrief.
ReleaseNoteItem can link to Task.
ReleaseNoteItem can link to BugReport.
ReleaseNoteItem can link to TestPlan.
ReleaseNoteItem can link to TestCase.
```

---

# 14. AIJob Model

## 14.1 Purpose

The `AIJob` model tracks AI-assisted generation work.

AI generation may take time, fail, or need review.

This model allows the app to track that process.

Examples:

```txt
Generate feature brief draft
Clean up bug report
Generate test plan
Generate release notes
Break feature into tasks
```

## 14.2 Fields

```txt
id
projectId
userId
type
status
input
output
errorMessage
sourceType
sourceId
targetType
targetId
modelName
startedAt
completedAt
createdAt
updatedAt
deletedAt
```

## 14.3 Field Notes

| Field        | Type         | Required | Notes                        |
| ------------ | ------------ | -------: | ---------------------------- |
| id           | UUID         |      Yes | Primary key                  |
| projectId    | UUID         |       No | Optional related project     |
| userId       | UUID         |      Yes | Owner user                   |
| type         | AIJobType    |      Yes | Type of AI task              |
| status       | AIJobStatus  |      Yes | Job status                   |
| input        | JSON         |      Yes | AI input payload             |
| output       | JSON         |       No | AI output result             |
| errorMessage | Text         |       No | Error message if failed      |
| sourceType   | AISourceType |       No | Source record type           |
| sourceId     | UUID         |       No | Source record ID             |
| targetType   | AITargetType |       No | Target record type           |
| targetId     | UUID         |       No | Created or updated record ID |
| modelName    | String       |       No | Model used                   |
| startedAt    | DateTime     |       No | Job start timestamp          |
| completedAt  | DateTime     |       No | Job completion timestamp     |
| createdAt    | DateTime     |      Yes | Created timestamp            |
| updatedAt    | DateTime     |      Yes | Updated timestamp            |
| deletedAt    | DateTime     |       No | Soft delete timestamp        |

## 14.4 AI Job Type Enum

```txt
GENERATE_FEATURE_BRIEF
IMPROVE_FEATURE_BRIEF
GENERATE_TASKS
CLEAN_BUG_REPORT
GENERATE_DEBUG_CHECKLIST
GENERATE_TEST_PLAN
GENERATE_TEST_CASES
GENERATE_RELEASE_NOTES
SUMMARIZE_PROJECT
OTHER
```

## 14.5 AI Job Status Enum

```txt
QUEUED
RUNNING
SUCCEEDED
FAILED
CANCELED
NEEDS_REVIEW
```

## 14.6 AI Source Type Enum

```txt
PROJECT
FEATURE_BRIEF
TASK
BUG_REPORT
TEST_PLAN
TEST_CASE
RELEASE_NOTE
MANUAL_INPUT
```

## 14.7 AI Target Type Enum

```txt
FEATURE_BRIEF
TASK
BUG_REPORT
TEST_PLAN
TEST_CASE
RELEASE_NOTE
RELEASE_NOTE_ITEM
NONE
```

## 14.8 Relationships

```txt
AIJob belongs to User.
AIJob can belong to Project.
AIJob can link to a source record.
AIJob can link to a target record.
```

## 14.9 AI Review Rule

AI output should not overwrite approved user content without user confirmation.

Recommended behavior:

```txt
AIJob output is saved.
User previews AI output.
User accepts, edits, or rejects output.
Only accepted output updates the main record.
```

---

# 15. Attachment Model

## 15.1 Purpose

The `Attachment` model stores metadata for uploaded files.

The actual file should live in object storage.

For MVP, attachments are mainly used for bug evidence.

Examples:

```txt
bug screenshot
error screen recording
console log file
test result image
```

## 15.2 Fields

```txt
id
projectId
userId
fileName
fileKey
fileUrl
mimeType
fileSize
sourceType
sourceId
description
createdAt
updatedAt
deletedAt
```

## 15.3 Field Notes

| Field       | Type                 | Required | Notes                       |
| ----------- | -------------------- | -------: | --------------------------- |
| id          | UUID                 |      Yes | Primary key                 |
| projectId   | UUID                 |      Yes | Related project             |
| userId      | UUID                 |      Yes | Owner user                  |
| fileName    | String               |      Yes | Original file name          |
| fileKey     | String               |      Yes | Storage key                 |
| fileUrl     | String               |       No | Public or signed URL        |
| mimeType    | String               |      Yes | File MIME type              |
| fileSize    | Integer              |      Yes | Size in bytes               |
| sourceType  | AttachmentSourceType |      Yes | Record type using this file |
| sourceId    | UUID                 |      Yes | Related record ID           |
| description | Text                 |       No | Optional file note          |
| createdAt   | DateTime             |      Yes | Created timestamp           |
| updatedAt   | DateTime             |      Yes | Updated timestamp           |
| deletedAt   | DateTime             |       No | Soft delete timestamp       |

## 15.4 Attachment Source Type Enum

```txt
BUG_REPORT
TEST_CASE
FEATURE_BRIEF
TASK
RELEASE_NOTE
PROJECT
```

## 15.5 Relationships

```txt
Attachment belongs to Project.
Attachment belongs to User.
Attachment can link to BugReport.
Attachment can link to TestCase.
Attachment can link to FeatureBrief.
Attachment can link to Task.
Attachment can link to ReleaseNote.
```

## 15.6 File Upload Rules

For MVP, allowed file types should be limited.

Recommended allowed types:

```txt
image/png
image/jpeg
image/webp
application/pdf
text/plain
```

Recommended size limit:

```txt
10 MB per file
```

---

# 16. ActivityLog Model

## 16.1 Purpose

The `ActivityLog` model stores important user actions.

This helps the user understand project history.

Examples:

```txt
Created feature brief
Approved test plan
Marked bug as verified
Generated release notes
Uploaded bug screenshot
```

## 16.2 Fields

```txt
id
projectId
userId
action
entityType
entityId
metadata
createdAt
```

## 16.3 Field Notes

| Field      | Type               | Required | Notes                |
| ---------- | ------------------ | -------: | -------------------- |
| id         | UUID               |      Yes | Primary key          |
| projectId  | UUID               |       No | Related project      |
| userId     | UUID               |      Yes | Owner user           |
| action     | ActivityAction     |      Yes | Action type          |
| entityType | ActivityEntityType |      Yes | Entity affected      |
| entityId   | UUID               |       No | Related record ID    |
| metadata   | JSON               |       No | Extra action details |
| createdAt  | DateTime           |      Yes | Created timestamp    |

## 16.4 Activity Action Enum

```txt
CREATED
UPDATED
DELETED
ARCHIVED
RESTORED
APPROVED
PUBLISHED
STATUS_CHANGED
AI_GENERATED
FILE_UPLOADED
TEST_RUN
BUG_REOPENED
BUG_VERIFIED
TASK_COMPLETED
OTHER
```

## 16.5 Activity Entity Type Enum

```txt
PROJECT
FEATURE_BRIEF
TASK
BUG_REPORT
TEST_PLAN
TEST_CASE
RELEASE_NOTE
RELEASE_NOTE_ITEM
AI_JOB
ATTACHMENT
USER
```

## 16.6 Relationships

```txt
ActivityLog belongs to User.
ActivityLog can belong to Project.
ActivityLog can link to any important entity.
```

---

# 17. Shared Enums

Some enums are used across multiple models.

## 17.1 Priority

```txt
LOW
MEDIUM
HIGH
URGENT
```

Used by:

```txt
Task
BugReport
TestCase
```

## 17.2 Severity

```txt
LOW
MEDIUM
HIGH
CRITICAL
```

Used by:

```txt
BugReport
```

## 17.3 Source Type Pattern

Many models use this pattern:

```txt
sourceType
sourceId
```

This allows flexible linking without forcing every relationship to be required.

Example:

```txt
Task.sourceType = FEATURE_BRIEF
Task.sourceId = featureBrief.id
```

This is useful for MVP because one task may come from different sources.

---

# 18. Relationship Rules

## 18.1 Project Ownership

Every project belongs to one user.

```txt
Project.userId → User.id
```

## 18.2 Project Child Records

Most records must belong to a project.

Required project relationship:

```txt
FeatureBrief.projectId
Task.projectId
BugReport.projectId
TestPlan.projectId
TestCase.projectId
ReleaseNote.projectId
ReleaseNoteItem.projectId
Attachment.projectId
```

Optional project relationship:

```txt
AIJob.projectId
ActivityLog.projectId
```

## 18.3 User Ownership

Every user-created record should include `userId`.

This makes authorization simple.

```txt
Record.userId must match the logged-in user.
```

## 18.4 Deleting a Project

For MVP, deleting a project should soft delete the project.

Recommended behavior:

```txt
Set Project.deletedAt.
Hide project from normal views.
Keep child records for possible restore.
```

Do not hard delete child records by default.

## 18.5 Archiving

Archiving is different from deleting.

```txt
Archive = keep the record, but remove it from active workflow.
Delete = remove it from normal use.
```

---

# 19. Lifecycle Summary

## 19.1 Feature Brief Lifecycle

```txt
DRAFT
→ NEEDS_REVIEW
→ APPROVED
→ IN_PROGRESS
→ SHIPPED
→ ARCHIVED
```

## 19.2 Task Lifecycle

```txt
BACKLOG
→ READY
→ IN_PROGRESS
→ IN_REVIEW
→ DONE
```

Additional statuses:

```txt
BLOCKED
CANCELED
DEFERRED
```

## 19.3 Bug Lifecycle

```txt
NEW
→ TRIAGED
→ IN_PROGRESS
→ FIXED
→ READY_FOR_RETEST
→ VERIFIED
→ CLOSED
```

Additional statuses:

```txt
REOPENED
DEFERRED
REJECTED
DUPLICATE
NEED_MORE_INFO
```

## 19.4 Test Plan Lifecycle

```txt
DRAFT
→ READY
→ IN_PROGRESS
→ COMPLETED
```

Additional statuses:

```txt
BLOCKED
ARCHIVED
```

## 19.5 Test Case Lifecycle

```txt
NOT_RUN
→ PASSED
```

or

```txt
NOT_RUN
→ FAILED
→ BugReport created
→ Retest
→ PASSED
```

Additional statuses:

```txt
BLOCKED
SKIPPED
NEEDS_UPDATE
```

## 19.6 Release Note Lifecycle

```txt
DRAFT
→ NEEDS_REVIEW
→ APPROVED
→ PUBLISHED
→ ARCHIVED
```

## 19.7 AI Job Lifecycle

```txt
QUEUED
→ RUNNING
→ SUCCEEDED
```

or

```txt
QUEUED
→ RUNNING
→ FAILED
```

Additional statuses:

```txt
CANCELED
NEEDS_REVIEW
```

---

# 20. MVP Database Tables

The first database version should include these tables:

```txt
users
projects
feature_briefs
tasks
bug_reports
test_plans
test_cases
release_notes
release_note_items
ai_jobs
attachments
activity_logs
```

---

# 21. Suggested Prisma Model Names

Recommended Prisma model names:

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

Recommended enum names:

```txt
ProjectStatus
FeatureBriefStatus
TaskStatus
TaskType
TaskEstimate
TaskSourceType
BugStatus
Severity
Priority
TestPlanStatus
TestCaseType
TestCaseStatus
ReleaseNoteStatus
ReleaseAudience
ReleaseFormat
ReleaseNoteItemType
ReleaseSourceType
AIJobType
AIJobStatus
AISourceType
AITargetType
AttachmentSourceType
ActivityAction
ActivityEntityType
```

---

# 22. Suggested Indexes

Indexes should support common queries.

## 22.1 User and Project Queries

```txt
users.email unique
projects.userId
projects.slug
projects.status
```

## 22.2 Module Queries

```txt
feature_briefs.projectId
feature_briefs.userId
feature_briefs.status

tasks.projectId
tasks.userId
tasks.status
tasks.priority
tasks.featureBriefId
tasks.bugReportId

bug_reports.projectId
bug_reports.userId
bug_reports.status
bug_reports.severity
bug_reports.priority

test_plans.projectId
test_plans.userId
test_plans.status

test_cases.testPlanId
test_cases.projectId
test_cases.status

release_notes.projectId
release_notes.userId
release_notes.status
release_notes.releaseVersion

release_note_items.releaseNoteId
release_note_items.projectId
release_note_items.type

ai_jobs.userId
ai_jobs.projectId
ai_jobs.status
ai_jobs.type

attachments.projectId
attachments.userId
attachments.sourceType
attachments.sourceId

activity_logs.userId
activity_logs.projectId
activity_logs.entityType
activity_logs.entityId
activity_logs.createdAt
```

---

# 23. Authorization Rules

In MVP, authorization should be simple.

## 23.1 Main Rule

A logged-in user can only access records where:

```txt
record.userId === currentUser.id
```

## 23.2 Project Child Rule

For project child records, also check:

```txt
record.project.userId === currentUser.id
```

## 23.3 AI Job Rule

AI jobs belong to a user.

The user can only view and apply AI job output if:

```txt
aiJob.userId === currentUser.id
```

## 23.4 Attachment Rule

The user can only access uploaded files if:

```txt
attachment.userId === currentUser.id
```

For private files, use signed URLs instead of permanent public URLs.

---

# 24. Audit and Activity Rules

The app should create an activity log for important events.

Recommended MVP activity events:

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

Activity logs should be append-only.

Do not edit old activity logs unless needed for privacy or deletion.

---

# 25. AI Data Rules

AI features should use structured input and output.

## 25.1 AI Input

AI input should include:

```txt
user prompt
source record content
project context
requested output type
constraints
```

## 25.2 AI Output

AI output should be stored as JSON.

Example:

```json
{
  "summary": "Generated test plan for the Feature Brief Builder.",
  "sections": {
    "happyPath": [],
    "negativeTests": [],
    "edgeCases": []
  },
  "missingQuestions": []
}
```

## 25.3 AI Safety Rule

AI output should not be trusted as final data.

The user must review AI output before it updates important records.

```txt
AI output is draft data.
Approved user content is source-of-truth data.
```

---

# 26. Open Questions

These questions should be answered before final schema implementation.

## 26.1 Relationship Design

Should source links use flexible fields?

```txt
sourceType
sourceId
```

Or should each model use direct foreign keys?

```txt
featureBriefId
bugReportId
testPlanId
```

Recommended MVP answer:

```txt
Use direct foreign keys for common links.
Use sourceType and sourceId for flexible secondary links.
```

## 26.2 JSON vs Child Tables

Some fields can be stored as JSON first.

Examples:

```txt
successCriteria
acceptanceCriteria
inScope
outOfScope
stepsToReproduce
testData
```

Recommended MVP answer:

```txt
Use JSON for list-style fields in MVP.
Create child tables later only if filtering or reporting needs increase.
```

## 26.3 Attachment Storage

Should files be stored locally or in object storage?

Recommended MVP answer:

```txt
Use object storage if possible.
Store only file metadata in PostgreSQL.
```

## 26.4 Activity Logs

Should every small edit create an activity log?

Recommended MVP answer:

```txt
No.
Only log meaningful workflow events.
```

---

# 27. Future Data Model Ideas

These are not part of MVP.

## 27.1 Workspace and Team Support

Future models:

```txt
Workspace
WorkspaceMember
Role
Invitation
```

## 27.2 GitHub Integration

Future models:

```txt
GitHubAccount
GitHubRepository
GitHubIssueLink
GitHubPullRequestLink
GitHubCommitLink
```

## 27.3 Comments

Future model:

```txt
Comment
```

Could be linked to:

```txt
FeatureBrief
Task
BugReport
TestPlan
ReleaseNote
```

## 27.4 Public Changelog

Future models:

```txt
PublicChangelog
PublicChangelogEntry
```

## 27.5 Notifications

Future model:

```txt
Notification
```

---

# 28. MVP Boundary

The MVP data model should support:

- one user account
- multiple projects
- feature brief creation and approval
- task planning
- bug tracking
- test plan generation
- test case execution
- release note creation
- AI job tracking
- basic file attachments
- activity history

The MVP data model should not support yet:

- teams
- billing
- public changelog pages
- GitHub sync
- comments
- advanced analytics
- complex permissions
- mobile offline sync

---

# 29. Final Data Model Summary

The first ShipLoop AI data model is centered around the project.

```txt
User
→ Project
→ Feature Brief
→ Task
→ Bug Report
→ Test Plan
→ Test Case
→ Release Note
```

AI and support records sit around this workflow:

```txt
AIJob
Attachment
ActivityLog
```

This data model supports the full ShipLoop AI loop:

```txt
Plan
→ Build
→ Test
→ Fix
→ Ship
→ Learn
```

The next architecture document should define the API design.

Next file:

```txt
docs/architecture/api-design.md
```
