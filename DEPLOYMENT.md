# Deployment Guide - Render

This guide will help you deploy your Daily Task Planner app to Render for free.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com - it's free!)
3. Git installed on your computer

## Step 1: Push Your Code to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   cd C:\Users\cwodt\OneDrive\Desktop\Clauding\goal
   git init
   git add .
   git commit -m "Prepare for deployment"
   ```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it something like `daily-task-planner`
   - Make it **Private** (since this is for personal use)
   - Don't initialize with README (we already have code)
   - Click "Create repository"

3. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/daily-task-planner.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend to Render

1. **Log into Render** at https://dashboard.render.com

2. **Create a new Web Service:**
   - Click "New +" button → "Web Service"
   - Connect your GitHub account if prompted
   - Select your `daily-task-planner` repository
   - Click "Connect"

3. **Configure the backend service:**
   - **Name:** `task-planner-backend` (or whatever you prefer)
   - **Region:** Choose the one closest to you (e.g., Oregon)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

4. **Add Environment Variables:**
   Click "Advanced" and add these environment variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (leave this blank for now, we'll update it after deploying frontend)

5. **Click "Create Web Service"**
   - Render will start building and deploying your backend
   - Wait for the deploy to complete (this takes 2-5 minutes)
   - Copy the URL (something like `https://task-planner-backend-xyz.onrender.com`)

## Step 3: Deploy Frontend to Render

1. **Create another new Web Service:**
   - Click "New +" button → "Web Service"
   - Select your `daily-task-planner` repository again
   - Click "Connect"

2. **Configure the frontend service:**
   - **Name:** `task-planner-frontend` (or whatever you prefer)
   - **Region:** Same as backend
   - **Root Directory:** `frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview`
   - **Instance Type:** `Free`

3. **Add Environment Variables:**
   Click "Advanced" and add:
   - `VITE_API_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
     (Use the backend URL you copied in Step 2)

4. **Click "Create Web Service"**
   - Wait for deployment to complete
   - Copy the frontend URL (something like `https://task-planner-frontend-xyz.onrender.com`)

## Step 4: Update Backend CORS Settings

1. **Go back to your backend service** in Render dashboard

2. **Update Environment Variables:**
   - Edit `FRONTEND_URL` and set it to your frontend URL
     (e.g., `https://task-planner-frontend-xyz.onrender.com`)

3. **Save changes**
   - Render will automatically redeploy the backend

## Step 5: Test Your Deployment!

1. Visit your frontend URL
2. Try logging in with your email
3. Test creating tasks, OKRs, etc.

## Important Notes

### Free Tier Limitations:
- ⚠️ **Services "sleep" after 15 minutes of inactivity**
  - First load will be slow (30-60 seconds)
  - This is normal for the free tier
  - Subsequent loads are fast

### Database:
- SQLite database is stored on the server
- **Data will persist** between deployments
- **Data may be lost** if Render spins down your service for extended periods
- For production use, consider upgrading to PostgreSQL

### Troubleshooting:

**Frontend can't connect to backend:**
- Check that `VITE_API_URL` in frontend matches your backend URL
- Check that `FRONTEND_URL` in backend matches your frontend URL
- Make sure both include `https://` (not `http://`)

**Build failures:**
- Check the logs in Render dashboard
- Make sure `package.json` has all dependencies listed

**Magic link not working:**
- Email sending is not set up yet (console logging only)
- For production, you'll need to configure a real email service

## Next Steps

Once you're happy with the deployment and want to use it seriously:
1. Set up actual email sending (Nodemailer + Gmail/SendGrid)
2. Consider upgrading to paid tier to remove sleep time
3. Consider migrating to PostgreSQL for better data persistence

## Sharing with Friends

Just send them your frontend URL! They can:
- Log in with their email
- Create their own OKRs and tasks
- Everything is isolated per user

Remember to warn them: **First load might be slow (30-60 seconds) if the service is "asleep"**
