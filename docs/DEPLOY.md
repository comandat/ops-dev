# Deploy Guide - OpenSales

**Last Updated**: 2026-04-01  
**Platform**: Railway

---

## 🚀 Quick Deploy

### Prerequisites
- Railway account with access to "responsible-nature" project
- GitHub access to ops-dev repository
- Node.js 20+ (for local testing)

---

## Development Deploy (Auto)

### Workflow
1. **Push to `dev` branch** → Triggers automatic deploy
   ```bash
   git checkout dev
   git push origin dev
   ```

2. **Railway builds automatically**
   - Detects `frontend/` folder
   - Runs `npm install`
   - Runs `npm run build`
   - Runs `npm run start`

3. **Deploy URL**: https://frontend-development-39d3.up.railway.app

### Check Deploy Status
1. Go to https://railway.com/project/responsible-nature
2. Select "frontend" service
3. View "Deployments" tab
4. Check logs for errors

---

## Production Deploy (Manual)

### Steps
1. **Merge `dev` → `main`**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

2. **Update Railway production environment**
   - Go to Railway dashboard
   - Switch to "Production" environment
   - Trigger deploy from `main` branch

3. **Verify production URL**
   - Custom domain (if configured)
   - Or Railway subdomain

---

## Environment Variables

### Frontend Service
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://backend-production-xxx.up.railway.app

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://frontend-production-xxx.up.railway.app

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### How to Set (Railway Dashboard)
1. Go to project "responsible-nature"
2. Select "frontend" service
3. Click "Variables" tab
4. Add each variable
5. Click "Deploy" to apply changes

---

## Local Testing Before Deploy

### Run Locally
```bash
cd frontend
npm install
npm run dev
```

### Build Test
```bash
cd frontend
npm run build
npm run start
```

### Lighthouse Check
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Performance", "Accessibility", "Best Practices", "SEO"
4. Click "Analyze page load"
5. Target: All scores >90

---

## Troubleshooting

### Build Fails
**Symptoms**: `npm run build` fails on Railway

**Solutions**:
1. Check build logs on Railway dashboard
2. Run `npm run build` locally to reproduce
3. Common issues:
   - TypeScript errors → Fix type issues
   - Missing dependencies → Add to package.json
   - Environment variables → Check variable names

### Page Shows 404
**Symptoms**: Homepage returns 404

**Solutions**:
1. Verify `frontend/src/app/page.tsx` exists
2. Check Railway root directory is set to `frontend/`
3. Verify build output in Railway logs

### Styles Not Loading
**Symptoms**: Page renders but no CSS

**Solutions**:
1. Check `globals.css` is imported in layout
2. Verify Tailwind CSS is configured
3. Clear browser cache

### API Calls Fail
**Symptoms**: Frontend can't reach backend

**Solutions**:
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is deployed and running
3. Check CORS configuration on backend

---

## Rollback Procedure

### Quick Rollback (Railway)
1. Go to Railway dashboard
2. Select "frontend" service
3. Click "Deployments"
4. Find previous successful deployment
5. Click "Rollback"

### Git Rollback
```bash
# Revert last commit
git revert HEAD

# Or checkout specific commit
git checkout <commit-hash>

# Push to trigger redeploy
git push origin dev
```

---

## Monitoring

### Railway Logs
- Real-time logs: Railway dashboard → "Deployments" → "View Logs"
- Filter by: Build, Runtime, Errors

### Performance Monitoring
- Lighthouse: Run on live URL after each deploy
- Railway Metrics: CPU, Memory, Request count

### Error Tracking
- Check browser console for client-side errors
- Monitor Railway logs for server errors
- Set up error alerts (Railway Pro feature)

---

## Checklist Before Deploy

- [ ] Local build passes (`npm run build`)
- [ ] Lighthouse score >90
- [ ] No console errors in dev tools
- [ ] All links functional
- [ ] Mobile responsive tested
- [ ] Environment variables set
- [ ] Team notified of deploy

---

## Contact

For deploy issues:
- Railway Support: https://station.railway.com
- Team: Check #dev channel on Slack/Discord
