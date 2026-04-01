# Analytics Guide - OpenSales

**Data creare**: 2026-04-01  
**Owner**: Alex (Growth) + Bogdan (PM)  
**Status**: ✅ Live

---

## 📊 Overview

OpenSales folosește **Plausible Analytics** pentru tracking privacy-first (GDPR compliant, no cookies).

### Ce Track-uim

| Event Type | Event Name | Properties | Trigger |
|------------|------------|------------|---------|
| **Page Views** | (auto) | - | Fiecare page load |
| **CTA Clicks** | `cta_click` | `cta: 'primary' \| 'secondary'`, `location: 'hero' \| 'pricing' \| 'footer'` | Click pe butoane CTA |
| **Register Flow** | `register_started` | - | User ajunge pe /register |
| **Register Flow** | `register_completed` | - | Submit successful |
| **Verification** | `email_verified` | - | User verifică email |
| **First Login** | `first_login` | - | Prima autentificare |

---

## 🔐 Access Plausible Dashboard

### Credentials

- **URL**: https://plausible.io/opensales.ro
- **Login**: (shared via password manager)
- **Plan**: $9/month (started with free trial)

### Setup Steps (for reference)

1. Creează cont pe https://plausible.io
2. Adaugă domain: `opensales.ro` (sau URL-ul de Railway)
3. Copiază tracking script → deja implementat în `layout.tsx`
4. Setează env var în Railway: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=opensales.ro`

---

## 📈 Conversion Funnel

### Funnel Definition

```
Visitor → Register → Verified → Active (7d)
```

### Target Conversion Rates

| Stage | Target | Current (TBD) |
|-------|--------|---------------|
| Visitor → Register | 5%+ | - |
| Register → Verified | 80%+ | - |
| Verified → Active (7d) | 70%+ | - |

### Cum Citești Metrics în Plausible

1. **Page Views**: Dashboard principal → total visitors
2. **Custom Events**: Dashboard → Events → filtrează după event name
3. **Goal Conversion**: Settings → Goals → configurează each event ca goal

---

## 📋 Weekly Review Cadence

### Every Monday (Bogdan + Alex)

**Duration**: 30 min  
**Location**: Notion / Google Sheets dashboard

#### Checklist

- [ ] Review weekly visitors (vs previous week)
- [ ] Check CTA click-through rates (hero vs footer)
- [ ] Calculate conversion rates:
  - Visitor → Register
  - Register → Verified
  - Verified → Active
- [ ] Identify drop-off points
- [ ] Decide on 1 optimization test for the week

#### Optimization Ideas Backlog

| Idea | Hypothesis | Priority | Status |
|------|------------|----------|--------|
| Hero CTA copy test | "Începe Gratuit" → "Start Free Trial" may increase CTR | Medium | Backlog |
| Remove "Vezi Demo" | Secondary CTA may distract from primary | Low | Backlog |
| Add social proof | Add customer logos above fold | High | Backlog |

---

## 🛠️ Technical Implementation

### File Locations

| File | Purpose |
|------|---------|
| `/frontend/src/app/layout.tsx` | PlausibleProvider setup |
| `/frontend/src/lib/analytics.ts` | Helper functions |
| `/frontend/src/components/marketing/Hero.tsx` | CTA tracking (hero) |
| `/frontend/src/components/marketing/CtaSection.tsx` | CTA tracking (footer) |
| `/frontend/src/app/register/page.tsx` | Register flow tracking |
| `/frontend/src/app/verify/page.tsx` | Verification tracking |
| `/frontend/src/app/login/page.tsx` | First login tracking |

### Environment Variables

```bash
# Railway (frontend service)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=opensales.ro
```

### Testing Locally

```bash
# 1. Add env var to .env.local
echo "NEXT_PUBLIC_PLAUSIBLE_DOMAIN=opensales.ro" >> .env.local

# 2. Run dev server
npm run dev

# 3. Open browser DevTools → Network tab
# 4. Look for requests to plausible.io
# 5. Trigger events (click CTAs, navigate pages)
# 6. Verify events appear in Plausible dashboard (real-time)
```

---

## 🚨 Troubleshooting

### Events not showing in Plausible

1. Check env var is set correctly in Railway
2. Verify PlausibleProvider is in `layout.tsx`
3. Check browser console for errors
4. Ensure adblocker is disabled during testing

### Page views not tracking

- Plausible auto-tracks page views, no code needed
- If missing, check that `layout.tsx` is being used

### Custom events not firing

- Check that `trackEvent()` is called after user interaction
- Verify window.plausible is defined (check DevTools console)

---

## 📞 Support

- **Plausible Docs**: https://plausible.io/docs
- **next-plausible GitHub**: https://github.com/4lejandrito/next-plausible
- **Internal**: Ask Alex (Growth) or Bogdan (PM)

---

**Last Updated**: 2026-04-01  
**Next Review**: 2026-04-08 (Weekly)
