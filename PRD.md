# Product Requirements Document: Daily OKR Task Planner

## 1. Product Overview

### 1.1 Product Vision
A personal productivity system that bridges strategic planning (OKRs) with daily execution through automated morning reminders and an intuitive task management webapp. 

### 1.2 Target User
Individual knowledge workers who use OKRs for goal setting and want to align daily tasks with quarterly objectives. The objectives can be personal or work oriented. 

### 1.3 Core Value Proposition
- Maintain focus on quarterly goals through daily reminders
- Seamlessly connect strategic objectives to daily actions
- Track progress against both goals and health metrics
- Start each day with intentional planning
- Make weekly retrospectives easily to collect and share

---

## 2. User Stories

### Primary Flow
1. **As a user**, I want to receive an email at 9am each morning reminding me of my current OKRs, so I stay focused on what matters most
2. **As a user**, I want to click a link in the email that takes me to a webapp where I can plan my day
3. **As a user**, I want to list my tasks for the day and assign them to specific OKRs or health metrics
4. **As a user**, I want to set deadlines for my tasks so I manage my time effectively
5. **As a user**, I want to break down larger tasks into subtasks for better manageability

### Secondary Flows
6. **As a user**, I want to manage my quarterly OKRs (create, edit, archive) so the system reflects my current priorities
7. **As a user**, I want to list an objective with 3-5 key results so I can track each key result's progress separately
8. **As a user**, I want to update the progress of individual key results so I can measure advancement toward my objectives
9. **As a user**, I want to define personal health metrics (exercise, sleep, meditation, etc.) that I can track alongside work goals
10. **As a user**, I want to view my task history to see how I've been spending my time
11. **As a user**, I want to customize my email delivery time

---

## 3. Functional Requirements

### 3.1 Email System

#### 3.1.1 Daily Reminder Email
**Priority: P0 (Must Have)**

**Requirements:**
- Send automated email at user-configured time (default: 9:00 AM in user's timezone)
- Email subject: "Good morning! Here are your goals for Q[N] [YEAR]"
- Email content must include:
  - Greeting with current date
  - List of active OKRs for current quarter
    - Objective name
    - Key Results with current progress (if trackable)
  - Prominent call-to-action: "What are you going to do today?"
  - Single-use magic link to webapp (secure, expires after 24 hours)
  - Footer with option to skip tomorrow or adjust settings

**Technical Considerations:**
- Timezone-aware scheduling
- Handle DST transitions
- Retry logic for failed sends
- Email deliverability (SPF, DKIM, DMARC)
- Template system for easy updates

#### 3.1.2 Email Preferences
**Priority: P1 (Should Have)**

- Pause emails (vacation mode)
- Adjust delivery time
- Choose email frequency (daily, weekdays only, custom)
- Opt-out management

### 3.2 OKR Management

#### 3.2.1 OKR Creation & Editing
**Priority: P0 (Must Have)**

**Requirements:**
- Create Objectives with:
  - Title (required, max 200 chars)
  - Description (optional, rich text)
  - Quarter and Year (required)
  - Status: Active, Completed, Archived
- Add Key Results to each Objective:
  - Support 3-5 Key Results per Objective (recommended best practice)
  - Description (required, max 200 chars)
  - Type: Numeric (with start/current/target values) or Binary (done/not done)
  - Status tracking
  - Individual progress tracking for each Key Result
- Edit/delete existing OKRs
- Archive past quarters

#### 3.2.2 OKR Viewing
**Priority: P0 (Must Have)**

- **Dashboard view**: Current quarter's active OKRs only (maintains focus)
- Display objectives with key results listed separately for easy scanning
- **Historical view**: Past quarters' OKRs with all associated tasks
- Confidence level visualization for key results
- Never delete OKRs - archive past quarters for future analysis

**Archival Policy:**
- OKRs from past quarters remain accessible via History page
- All historical data preserved for quarter-over-quarter analysis
- Archive view shows: objective, key results, confidence levels at end of quarter, all related tasks

#### 3.2.3 Key Result Progress Tracking
**Priority: P0 (Must Have)**

**Requirements:**
- Update current value for numeric Key Results
- View progress percentage calculated automatically
- Mark binary Key Results as complete/incomplete
- View Key Results organized under their parent Objective
- Update Key Results from both Dashboard and Manage OKRs pages
- Visual progress indicators (percentage, progress bar, or color coding)

### 3.3 Health Metrics

#### 3.3.1 Health Metric Definition
**Priority: P0 (Must Have)**

**Philosophy:**
Health metrics use a simple Red/Yellow/Green status system for daily check-ins. Green is always the target - the goal is to keep all areas green. Users define their own custom metrics to track what matters to them.

**Examples:**
- Finances
- Physical health
- Mental health
- Family
- Relationships
- Energy
- Or any other area that matters to the user

**Requirements:**
- Each metric tracks:
  - Name (required, user-defined) - e.g., "Exercise", "Finances", "Sleep"
  - Description (optional) - what this metric represents
  - Current status: 🔴 Red | 🟡 Yellow | 🟢 Green
  - Notes (optional) - updated weekly to capture what's affecting this metric
  - Last updated date
- One-click status update
- Weekly notes field to add context about what's affecting each metric
- Status history for trend analysis
- Full customization - users create any metrics they want

### 3.4 Task Management

#### 3.4.1 Task Creation
**Priority: P0 (Must Have)**

**Requirements:**
- Quick-add task interface on daily planning page
- Task properties:
  - Title (required, max 200 chars)
  - Description (optional, rich text)
  - Deadline (optional, date + time)
  - Assignment:
    - Link to specific OKR (by selecting Objective)
    - Link to health metric
    - Or mark as "Other" (unaligned)
  - Status: Todo, In Progress, Done, Cancelled
  - Created date (auto)
- Batch task creation (add multiple tasks quickly)

#### 3.4.2 Subtask Management
**Priority: P0 (Must Have)**

**Requirements:**
- Create subtasks under any parent task
- Subtask properties:
  - Title (required, max 200 chars)
  - Deadline (optional, date + time)
  - Status: Todo, Done
  - **Inherits assignment from parent task** (cannot be changed)
- View subtasks in hierarchical structure with optional deadlines displayed
- Mark parent task complete only when all subtasks done (optional enforcement)
- Support up to 3 levels of nesting
- Each subtask can have its own deadline independent of parent task
- Subtask form does NOT show assignment fields (automatically inherits from parent)

#### 3.4.3 Task Editing
**Priority: P0 (Must Have)**

**Requirements:**
- Edit any task field after creation:
  - Title
  - Description
  - Deadline
  - **Assignment** (can reassign to different OKR, health metric, or Other)
  - Status
- Inline editing using the same form interface as task creation
- Changes save immediately when form is submitted
- Cancel option to discard changes
- When editing a task, reassignment updates all future references
- Subtasks cannot be reassigned (they always inherit parent assignment)

#### 3.4.4 Task Viewing & Organization
**Priority: P0 (Must Have)**

**Requirements:**
- **Today view**: Tasks planned for today (excludes completed)
- **Upcoming view**: Tasks with future deadlines (excludes completed)
- **All tasks view**: All incomplete tasks
- **History view**: Completed and cancelled tasks with completion dates
- Filter by:
  - Assignment (specific OKR, health metric, unaligned)
  - Status
  - Date range
- Sort by: deadline, created date, status, completion date
- Search tasks by title/description

**Data Retention Policy:**
- All tasks remain in the system indefinitely
- Completed tasks move to History view automatically
- Never delete tasks - preserve complete work history for analysis
- Maintain audit trail of all work toward OKRs

#### 3.4.4 Task Updates
**Priority: P0 (Must Have)**

- Update status (drag-and-drop or dropdown)
- Edit task properties inline
- Delete tasks (with confirmation)
- Move tasks (change assignment, deadline)
- Complete multiple tasks at once (bulk actions)

### 3.5 Progress Tracking & Analytics

#### 3.5.1 Progress Dashboard
**Priority: P1 (Should Have)**

**Requirements:**
- Overview of current quarter:
  - OKR progress (completion percentage)
  - Health metrics tracking
  - Tasks completed this week/month/quarter
- Visual charts:
  - Tasks by OKR (distribution)
  - Completion rate over time
  - Health metric trends

#### 3.5.2 Historical View
**Priority: P2 (Nice to Have)**

- View past quarters' OKRs and tasks
- Compare quarter-over-quarter progress
- Export data (CSV, JSON)

### 3.6 Authentication & Security

#### 3.6.1 User Authentication
**Priority: P0 (Must Have)**

**Requirements:**
- Magic link authentication from email (primary method)
- Traditional login (email + password) as backup
- Session management (7-day session duration)
- Secure password reset flow

#### 3.6.2 Data Security
**Priority: P0 (Must Have)**

- All data encrypted at rest and in transit (HTTPS/TLS)
- User data isolation (multi-tenant architecture)
- Regular backups
- GDPR compliance (right to export, right to deletion)

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Webapp loads in <2 seconds on 4G connection
- Email sends within 1 minute of scheduled time
- Support for up to 1,000 tasks per user without performance degradation

### 4.2 Reliability
- 99.5% uptime SLA
- Email delivery success rate >98%
- Automatic failover for email service

### 4.3 Usability
- Mobile-responsive webapp (works on phones, tablets, desktop)
- Keyboard shortcuts for power users
- Accessible (WCAG 2.1 Level AA compliance)
- Maximum 3 clicks to create a task from landing page

### 4.4 Scalability
- Support for single user initially
- Architecture should allow for 100+ users if needed

---

## 5. Technical Architecture (High-Level)

### 5.1 System Components

#### Frontend
- Modern web framework (React, Vue, or Svelte)
- Responsive design (mobile-first)
- Progressive Web App (PWA) for offline capability
- State management for task updates

#### Backend
- RESTful API or GraphQL
- Authentication service
- Database for user data, OKRs, tasks
- Job scheduler for daily emails

#### Email Service
- Transactional email provider (SendGrid, AWS SES, Postmark)
- HTML email templates
- Click tracking for magic links

#### Infrastructure
- Cloud hosting (AWS, GCP, or Vercel/Railway for simple deployment)
- Database (PostgreSQL or similar)
- Job queue for scheduled tasks (cron, or service like Inngest)

### 5.2 Data Model (Core Entities)

```
User
- id
- email
- timezone
- email_time (default: 09:00)
- email_enabled
- created_at

Objective
- id
- user_id
- title
- description
- quarter (1-4)
- year
- status (active, completed, archived)
- created_at

KeyResult
- id
- objective_id
- description
- type (numeric, binary)
- start_value
- current_value
- target_value
- status

HealthMetric
- id
- user_id
- name
- description
- type (counter, boolean)
- target
- active
- created_at

Task
- id
- user_id
- title
- description
- deadline
- status (todo, in_progress, done, cancelled)
- assignment_type (objective, health_metric, other)
- assignment_id (nullable)
- parent_task_id (nullable, for subtasks)
- created_at
- completed_at

MagicLink
- id
- user_id
- token (unique, secure)
- expires_at
- used_at
```

---

## 6. User Interface Wireframes

### 6.1 Daily Email
```
┌─────────────────────────────────────────┐
│ Good morning! Here are your goals for   │
│ Q4 2024                                 │
│                                         │
│ Thursday, October 30, 2024              │
│                                         │
│ Your Objectives:                        │
│                                         │
│ 📊 Improve product engagement           │
│    • Increase DAU by 20% (Progress: 45%)│
│    • Reduce churn to 5% (Progress: 60%) │
│                                         │
│ 💪 Maintain health & wellness           │
│    • Exercise 4x/week                   │
│    • Sleep 7+ hours/night               │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  What are you going to do today? ➜  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Skip tomorrow | Adjust settings         │
└─────────────────────────────────────────┘
```

### 6.2 Daily Planning Webapp (Landing Page)

```
┌──────────────────────────────────────────────────┐
│  Daily Task Planner          Thursday, Oct 30    │
├──────────────────────────────────────────────────┤
│                                                  │
│  Your OKRs for Q4 2024            [Manage OKRs] │
│                                                  │
│  📊 Improve product engagement                   │
│  💪 Maintain health & wellness                   │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  What are you working on today?                 │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ + Add a task...                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Today's Tasks (3)                              │
│                                                  │
│  ☐ Write product spec                           │
│     🎯 Improve product engagement  📅 Today      │
│     ↳ ☐ Research competitor features            │
│     ↳ ☐ Draft initial outline                   │
│                                                  │
│  ☐ Morning workout                               │
│     💪 Exercise  📅 Today                         │
│                                                  │
│  ☐ Review analytics dashboard                   │
│     📋 Other  📅 Today                            │
│                                                  │
├──────────────────────────────────────────────────┤
│  [Today] [Upcoming] [All Tasks] [Progress]      │
└──────────────────────────────────────────────────┘
```

### 6.3 Task Creation Modal

```
┌────────────────────────────────────────┐
│  Create Task                      [✕]  │
├────────────────────────────────────────┤
│                                        │
│  Task title *                          │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Description                           │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Assign to:                            │
│  ( ) OKR: [Select objective ▼]        │
│  ( ) Health metric: [Select metric ▼] │
│  (•) Other                             │
│                                        │
│  Deadline                              │
│  ┌──────────────────┐  ┌────────────┐ │
│  │ 10/30/2024     ▼ │  │ 5:00 PM  ▼ │ │
│  └──────────────────┘  └────────────┘ │
│                                        │
│           [Cancel]  [Create Task]     │
└────────────────────────────────────────┘
```

---

## 7. Success Metrics

### 7.1 Engagement Metrics
- Email open rate >40%
- Click-through rate from email >25%
- Daily active users (task creation rate)
- Average tasks created per day per user

### 7.2 Retention Metrics
- Day 7 retention
- Day 30 retention
- Weekly active users

### 7.3 Product Health
- Task completion rate
- Average subtasks per task
- OKR assignment rate (% of tasks linked to OKRs)

---

## 8. Launch Phases

### Phase 1: MVP (Weeks 1-4)
**Goal: Core functionality for single user**

Features:
- Daily email with OKR reminders
- Basic OKR management (create, view)
- Task creation with OKR assignment
- Task list view (Today, All)
- Magic link authentication

Success Criteria:
- Successfully send daily emails for 7 consecutive days
- Create and complete 10+ tasks
- Link tasks to OKRs

### Phase 2: Enhanced Usability (Weeks 5-8)
**Goal: Improve daily workflow**

Features:
- Subtask management
- Health metrics tracking
- Deadline management
- Task filters and search
- Bulk actions
- Mobile responsive design

Success Criteria:
- Use app for 30 consecutive days
- Create tasks with subtasks
- Complete health metric tracking

### Phase 3: Insights & Optimization (Weeks 9-12)
**Goal: Learn from usage patterns**

Features:
- Progress dashboard
- Historical views
- Analytics and charts
- Email customization options
- Keyboard shortcuts

Success Criteria:
- View weekly progress reports
- Identify trends in task completion
- Optimize daily workflow

---

## 9. Open Questions & Future Considerations

### 9.1 Open Questions
1. Should tasks be explicitly scheduled for specific days, or just have deadlines?
2. How should recurring tasks be handled (e.g., daily exercise)?
3. Should there be team/shared OKRs or keep it strictly personal?
4. What happens if user doesn't open email for several days?
5. Should the system suggest task prioritization?

### 9.2 Future Features (Post-MVP)

#### v2 - Radical Focus Enhancements
**Goal: Deeper alignment with Radical Focus methodology**

- **Confidence Tracking**: Track confidence level (0-10 scale) for each Key Result
  - Weekly confidence updates
  - Confidence trend visualization
  - Alerts when confidence drops below threshold
- **Weekly Celebrations & Reflections**:
  - Friday celebration prompts (What did we accomplish?)
  - Weekly learning capture (What did we learn?)
  - Monday commitment planning (What will move the needle this week?)
- **P1/P2 Task Priority**: Distinguish between tasks that move the needle (P1) and maintenance work (P2)
  - Tag tasks as P1 (objective-aligned) or P2 (important but not critical)
  - Filter views by priority
  - Analytics on P1 vs P2 time allocation
- **Focus on ONE**: Encourage single objective focus per quarter
  - Optional "single objective mode"
  - Visual emphasis on THE primary objective
  - Warnings when adding multiple objectives
- **Weekly Cadence View**: Complement daily planning with weekly rhythm
  - Week-at-a-glance view
  - Weekly commitment tracking
  - Week-over-week progress comparison

#### General Future Features
- Mobile native apps (iOS, Android)
- Calendar integration (Google Calendar, Outlook)
- Recurring tasks and habits
- AI-powered task suggestions based on OKRs
- Time tracking integration
- Collaboration features (share OKRs with accountability partner)
- Integration with other tools (Notion, Todoist, etc.)
- Voice input for task creation
- Weekly/monthly summary emails
- Gamification (streaks, achievements)

---

## 10. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Email deliverability issues | High | Medium | Use reputable ESP, implement authentication, monitor bounce rates |
| User forgets to check email | Medium | High | Add reminder notifications, allow email time customization |
| Too complex for daily use | High | Medium | Focus on simplicity in MVP, progressive disclosure of features |
| Timezone handling bugs | Medium | Medium | Thorough testing, use established timezone libraries |
| Data loss | High | Low | Regular automated backups, implement soft deletes |
| User abandonment after initial enthusiasm | High | High | Focus on habit formation, minimal friction for daily use |

---

## 11. Appendix

### 11.1 Glossary
- **OKR**: Objectives and Key Results - goal-setting framework
- **Health Metric**: Personal wellness indicator (exercise, sleep, etc.)
- **Magic Link**: Passwordless authentication link sent via email
- **Subtask**: Child task under a parent task

### 11.2 References
- OKR methodology: "Radical Focus" by Christina Wodtke
- Task management best practices
- Email deliverability standards

---

**Document Version**: 1.1
**Last Updated**: 2025-10-31
**Author**: Product Owner
**Status**: Ready for Review
