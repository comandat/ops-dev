# Quick Start - OpenSales Homepage Deploy

**For**: User / Project Owner  
**Date**: 2026-04-01

---

## 🚨 Action Required: Railway Access

Radu (the AI developer) has completed the homepage code and pushed it to the `dev` branch. 

**To complete the deploy, you need to:**

### Step 1: Accept Railway Invite
Click here: **https://railway.com/invite/zrn8XSzDIiR**

### Step 2: Login to Railway
- Use your GitHub account to login
- Navigate to the "responsible-nature" project

### Step 3: Verify Frontend Service
1. Click on the "frontend" service
2. Check that it's configured correctly:
   - **Root Directory**: `frontend/`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

### Step 4: Check Deployment
1. Go to "Deployments" tab
2. You should see a new deployment triggered by the latest commit
3. Click "View Logs" to see build progress
4. Once complete, the homepage will be live at:
   **https://frontend-development-39d3.up.railway.app**

### Step 5: Verify Environment Variables
1. Click "Variables" tab
2. Ensure these are set:
   - `NEXT_PUBLIC_API_URL` = (backend Railway URL)
   - `NEXT_PUBLIC_SITE_URL` = (frontend Railway URL)

---

## ✅ What Radu Already Completed

- ✅ Built entire marketing homepage (9 components)
- ✅ Restructured routes (`/` = homepage, `/dashboard` = app)
- ✅ Code committed and pushed to `dev` branch
- ✅ Build tested locally (passes successfully)
- ✅ Documentation created (DEPLOY.md, status reports)
- ✅ Email template ready to send to team

---

## 📊 What's Left (After Railway Access)

Once you grant Railway access, Radu will:
- Run Lighthouse performance test (target >90)
- Cross-browser testing (Chrome, Firefox, Safari)
- Fix any issues found
- Send notification email to team
- Provide final status report

**Estimated time**: 1-2 hours

---

## 🔗 Quick Links

- **Railway Project**: https://railway.com/project/responsible-nature
- **GitHub Repo**: https://github.com/comandat/ops-dev
- **Dev Branch**: https://github.com/comandat/ops-dev/tree/dev
- **Frontend URL**: https://frontend-development-39d3.up.railway.app

---

## 📧 Team Notification

Once everything is verified, Radu will send an email to:
- Alex (Frontend)
- Sorin (Frontend)
- Andrei (UX)
- Cătălin (QA)
- Bogdan (PM)

Email template is ready in: `docs/TEAM-NOTIFICATION-EMAIL.md`

---

## ❓ Questions?

Check these docs:
- `docs/DEPLOY.md` - Full deploy guide
- `docs/HOMEPAGE-DEPLOY-STATUS.md` - Detailed status
- `docs/tasks/RADU-HOMEPAGE-INTEGRATION-STATUS.md` - Radu's report

---

**TL;DR**: Click the Railway invite link, login, verify the deploy, then Radu will handle the rest! 🚀
