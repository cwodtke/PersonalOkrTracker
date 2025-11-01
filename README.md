# Daily OKR Task Planner - Prototype

A personal productivity system that bridges strategic planning (OKRs) with daily execution through automated morning reminders and an intuitive task management webapp.

## What This Prototype Does

1. **Daily Email Reminders** - Sends you an email at 9am (configurable) with your quarterly OKRs
2. **Magic Link Access** - Click the link in the email to access your daily task planner
3. **OKR Management** - Create and track Objectives and Key Results per quarter
4. **Health Metrics** - Define personal wellness goals (exercise, sleep, etc.)
5. **Task Planning** - Create tasks, assign them to OKRs or health metrics, set deadlines
6. **Subtasks** - Break down larger tasks into manageable subtasks
7. **Multiple Views** - See Today's tasks, Upcoming tasks, or All tasks

## Tech Stack

### Backend
- **Node.js + Express** - REST API server
- **JSON File Database** - Simple file-based storage (data.json)
- **Node-cron** - Daily email scheduling
- **Nodemailer** - Email sending (currently logs to console for demo)

### Frontend
- **React 19** - Modern UI library
- **React Router** - Client-side routing
- **Vite** - Fast development build tool
- **CSS** - Custom styling with gradient purple theme

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

Both servers are already running! But if you need to restart:

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # (already done)
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # (already done)
npm run dev
```

### Access the App

1. **Open your browser**: http://localhost:5173
2. **Login**: Enter any email address (creates a new user automatically)
3. **You're in!** For this prototype, you're logged in immediately (no actual email sent)

## How to Use

### First Time Setup

1. **Create Your First OKR**
   - Click "Manage OKRs" in the header
   - Click "+ Add OKR"
   - Fill in:
     - Objective Title (e.g., "Improve product engagement")
     - Quarter and Year
     - Key Results (e.g., "Increase DAU by 20%")
   - Click "Create OKR"

2. **Add Health Metrics** (optional)
   - Still on the Manage OKRs page
   - Scroll down to "Health Metrics"
   - Click "+ Add Metric"
   - Examples: "Exercise", "Sleep 7+ hours", "Meditation"

3. **Return to Dashboard**
   - Click "Back to Dashboard"
   - Your OKRs now appear at the top

### Daily Workflow

1. **Add a Task**
   - Click "+ Add a task..."
   - Enter task title
   - Optionally:
     - Add description
     - Assign to an OKR or Health Metric
     - Set a deadline
   - Click "Create Task"

2. **Add Subtasks**
   - Click the "+" button next to any task
   - Enter subtask title
   - Click "Add Subtask"

3. **Complete Tasks**
   - Check the checkbox next to a task to mark it done
   - Tasks with strikethrough are completed

4. **Edit or Delete**
   - Hover over a task to see edit/delete buttons
   - Click ✏️ to edit
   - Click 🗑️ to delete

5. **Switch Views**
   - **Today** - Tasks due today or with no deadline
   - **Upcoming** - Tasks with future deadlines
   - **All Tasks** - Everything

### Test the Daily Email

Click the **"Test Email"** button in the header to simulate the 9am email. Check your **backend terminal** to see the HTML email that would be sent. It includes:
- Your current quarter's OKRs with progress
- A magic link to access the webapp

## File Structure

```
goal!/
├── PRD.md                   # Product Requirements Document
├── README.md               # This file
├── backend/
│   ├── server.js          # Express API server
│   ├── database.js        # JSON file database
│   ├── email.js           # Email generation logic
│   ├── data.json          # Your data (auto-created)
│   └── package.json       # Backend dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main app with routing
    │   ├── api.js         # API client functions
    │   ├── pages/
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Dashboard.jsx     # Main task planner
    │   │   ├── ManageOKRs.jsx    # OKR management
    │   │   └── VerifyMagicLink.jsx
    │   ├── components/
    │   │   ├── TaskItem.jsx      # Individual task display
    │   │   └── TaskForm.jsx      # Task creation form
    │   └── [CSS files...]
    └── package.json       # Frontend dependencies
```

## Key Features Demonstrated

### ✅ Implemented in Prototype
- User authentication (simplified - email only)
- OKR creation and viewing (quarterly)
- Key Result tracking with progress calculation
- Health metrics definition
- Task creation with assignment to OKRs/metrics
- Subtask creation (nested tasks)
- Deadline management
- Task completion tracking
- Multiple task views (Today, Upcoming, All)
- Daily email HTML generation
- Responsive UI design

### 🚧 Simplified for Prototype
- **Email sending**: Logs to console instead of actually sending
- **Database**: JSON file instead of PostgreSQL
- **Authentication**: Instant login instead of magic link email flow
- **Scheduling**: Cron job set up but not actively sending emails
- **Time zones**: Basic support, not fully tested

### 📋 Future Enhancements (from PRD)
- Actual email delivery via SendGrid/AWS SES
- Production database (PostgreSQL)
- Real magic link authentication via email
- Progress analytics dashboard
- Historical quarter views
- Recurring tasks
- Team/shared OKRs
- Mobile apps
- Calendar integration

## Data Storage

All your data is stored in `backend/data.json`. This includes:
- Users
- Objectives and Key Results
- Health Metrics
- Tasks and Subtasks
- Magic Links

The file is human-readable JSON, so you can inspect or edit it directly if needed.

## Troubleshooting

### Backend won't start
- Make sure port 3001 is not in use
- Check `backend/data.json` is valid JSON
- Delete `backend/data.json` to reset database

### Frontend won't start
- Make sure port 5173 is not in use
- Try deleting `frontend/node_modules/.vite` folder

### Can't create tasks
- Make sure both frontend and backend are running
- Check browser console for errors (F12)
- Verify you're logged in (check localStorage has userId)

### Dropbox sync errors
- This is normal - Dropbox syncs the files while they're being written
- Doesn't affect functionality
- Consider moving the project outside Dropbox for development

## API Endpoints

The backend exposes these REST endpoints:

### Authentication
- `POST /api/auth/login` - Login/create user
- `GET /api/auth/verify/:token` - Verify magic link

### OKRs
- `GET /api/objectives` - Get all OKRs
- `GET /api/objectives/current` - Get current quarter's OKRs
- `POST /api/objectives` - Create OKR
- `PUT /api/objectives/:id` - Update OKR
- `DELETE /api/objectives/:id` - Delete OKR
- `PUT /api/key-results/:id` - Update key result progress

### Health Metrics
- `GET /api/health-metrics` - Get all metrics
- `POST /api/health-metrics` - Create metric

### Tasks
- `GET /api/tasks?view={today|upcoming|all}` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Email
- `POST /api/email/test` - Test daily email

## Learning Notes

This prototype demonstrates:
1. **Full-stack architecture** - Separate backend API and frontend SPA
2. **RESTful API design** - Clean endpoints for CRUD operations
3. **State management** - React hooks for UI state
4. **File-based database** - Simple but effective for prototyping
5. **Hierarchical data** - Parent/child relationships (tasks/subtasks)
6. **Scheduled jobs** - Cron for daily emails
7. **Email templating** - Dynamic HTML generation
8. **Responsive design** - CSS Flexbox and Grid

## Next Steps

To turn this into a production app:
1. Set up a PostgreSQL database
2. Configure email service (SendGrid/AWS SES)
3. Implement proper authentication (OAuth or JWT)
4. Add user settings page
5. Implement progress analytics
6. Add data export functionality
7. Deploy to cloud (Vercel for frontend, Railway/Fly.io for backend)
8. Set up custom domain
9. Add monitoring and error tracking

## Credits

Built with [Radical Focus](https://www.amazon.com/Radical-Focus-SECOND-Achieving-Objectives/dp/1955603049) OKR methodology by Christina Wodtke.

---

**Status**: Prototype Ready ✅
**Version**: 1.0
**Date**: October 2024
