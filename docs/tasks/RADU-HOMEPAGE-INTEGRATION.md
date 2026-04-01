# 🔧 Radu - Integration Tasks: Homepage

**Project**: OpenSales Homepage  
**Priority**: 🔴 High (Day 3)  
**PRD Reference**: `docs/PRD-HOMEPAGE.md`

---

## 📋 Overview

Ești responsabil de **integrarea finală**, **deploy pe Railway**, și **setup environment**. 
După ce Alex + Sorin termină componentele, tu te asiguri că totul funcționează live.

---

## ✅ Task List

### Task 1: Code Review & Merge (1-2 ore)
- [ ] Review PR-urile de la Alex + Sorin
- [ ] Verifică că nu sunt conflicts
- [ ] Verifică că nu sunt console errors
- [ ] Verifică responsive (devtools mobile)
- [ ] Approve + merge în `dev` branch

### Task 2: Railway Environment Setup (1-2 ore)
- [ ] Acceptă invite Railway: https://railway.com/invite/zrn8XSzDIiR
- [ ] Verifică proiectul "responsible-nature"
- [ ] Verifică că frontend service e configurat corect:
  - Root: `frontend/`
  - Build: `npm run build`
  - Start: `npm run start`
- [ ] Setează variabile de mediu:
  - `NEXT_PUBLIC_API_URL` = backend Railway URL
  - `NEXT_PUBLIC_SITE_URL` = frontend Railway URL

### Task 3: Deploy Homepage (1-2 ore)
- [ ] Push la `dev` branch (trigger auto-deploy)
- [ ] Monitorizează build logs pe Railway
- [ ] Verifică deploy-ul: https://frontend-development-39d3.up.railway.app
- [ ] Testează homepage live (nu doar local)

### Task 4: Performance Check (1 hour)
- [ ] Run Lighthouse pe homepage live
- [ ] Target: Performance >90, Accessibility >90
- [ ] Dacă e sub target, identifică bottleneck-uri:
  - Images neoptimize?
  - Bundle size mare?
  - Unused CSS?
- [ ] Creează issue-uri pentru optimization dacă e nevoie

### Task 5: Cross-Browser Testing (1 hour)
- [ ] Chrome (desktop + mobile)
- [ ] Firefox (desktop)
- [ ] Safari (dacă ai access)
- [ ] Verifică:
  - Layout nu se rupe
  - Fonts se încarcă
  - Buttons funcționale
  - Links corecte

### Task 6: Documentation Update (30 min)
- [ ] Actualizează `README.md` cu homepage info
- [ ] Adaugă screenshot la homepage în `docs/`
- [ ] Scrie scurt ghid de deploy în `docs/DEPLOY.md`

### Task 7: Email Notification (15 min)
- [ ] Trimite email la echipă (via AgentMail) când homepage e live
- [ ] Include link către homepage
- [ ] Include screenshot
- [ ] Cere feedback

---

## 📁 Deliverables

- [ ] Homepage live pe Railway
- [ ] Lighthouse report (screenshot)
- [ ] Email de notification către echipă

---

## 🎯 Acceptance Criteria

- [ ] Homepage accesibilă public (fără login)
- [ ] Toate link-urile funcționale
- [ ] Responsive pe mobile + desktop
- [ ] Lighthouse Performance >90
- [ ] No 404 errors
- [ ] Deploy pipeline funcțional (push → auto-deploy)

---

## 💡 Tips

- **Monitor logs** - Railway logs îți spun dacă ceva se rupe
- **Test înainte de push** - `npm run build` local să nu dea errors
- **Environment vars** - verifică de 2 ori înainte de deploy
- **Communicate** - ține echipa la curent cu status-ul

---

## 🔗 Dependencies

- **Blocked by**: Alex + Sorin (frontend implementation)
- **Parallel with**: Cătălin (QA testing)
- **Blocks**: Bogdan (final review + user demo)

---

**Start**: După ce Alex + Sorin termină implementarea  
**ETA**: End of Day 3  
**Review**: Bogdan
