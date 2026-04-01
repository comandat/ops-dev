# OpenSales - Improvement Proposals

**Document creat**: 2026-04-01  
**Owner**: Bogdan (PM) + Alex (Frontend)  
**Automation**: Hourly check (every 1 hour, continuous)

---

## 📋 Cum Funcționează

- **Automation**: Cron job la fiecare 1 oră (24/7)
- **Trigger**: Doar când Bogdan nu are task-uri active importante
- **Output**: Propuneri clare, dezbătute, cu task-uri acționabile
- **Locație**: Acest document + task files în `/docs/tasks/`

---

## 💡 Propuneri

### #1 - Sistem Automated Error Tracking & Bug Resolution

**Data**: 2026-04-01  
**Status**: 🟢 În dezbatere  
**Inițiat de**: User request

#### 🎯 Problema

Platforma SaaS va avea inevitabil:
- Bug-uri în cod (frontend/backend)
- Erori de integrare (marketplace APIs: eMAG, Trendyol, FGO)
- Probleme de infrastructură (Railway, PostgreSQL, Redis)
- Timeout-uri la sync-uri mari (10k+ produse)
- Erori de autentificare/autorizare

**Fără sistem de tracking**:
- Bug-urile trec neobservate până se plâng clienții
- Debugging lent (cauți logs manual)
- Nu știi prioritatea reală (câți users afectați?)
- Radu nu primește task-uri automate
- Cătălin nu poate testa fix-urile sistematic

#### ✅ Soluția Propusă

**Sistem complet de error tracking cu auto-task creation:**

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR DETECTED                           │
│  (Frontend Sentry / Backend Logger / Infrastructure Alert) │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  ERROR CATEGORIZATION                       │
│  - Severity: Critical / High / Medium / Low                │
│  - Type: Frontend / Backend / Integration / Infra          │
│  - Tenant Affected: Single / Multiple / All                │
│  - Auto-tag: #bug, #integration, #timeout, #auth           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 AUTO-TASK CREATION (GitHub)                 │
│  - Create Issue în ops-dev repo                            │
│  - Assign: Radu (developer)                                │
│  - Labels: severity, type, affected-tenant                 │
│  - Description: error details, logs, stack trace, context  │
│  - Template: Bug Report standardizat                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              NOTIFICARE ECHIPĂ                              │
│  - Radu: Primește task-ul (email + GitHub notification)    │
│  - Bogdan: PM notified pentru prioritizare                 │
│  - Cătălin: QA notified (va testa după fix)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  RADU FIXES BUG                             │
│  - Investighează eroarea                                   │
│  - Scrie fix-ul                                            │
│  - Commit pe branch: `fix/[issue-number]-short-desc`       │
│  - Push + PR pe dev                                        │
│  - Mark Issue: "Ready for QA"                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              CĂTĂLIN QA VERIFICATION                        │
│  - Testează fix-ul (manual + E2E dacă e relevant)          │
│  - Verifică regression (alte features afectate?)           │
│  - Mark Issue: "QA Passed" sau "QA Failed - Reopen"        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  BOGDAN APPROVAL                            │
│  - Review final (PM sign-off)                              │
│  - Verifică impact pe users                                │
│  - Dacă QA Passed + PM Approved → Auto-merge pe dev        │
│  - Deploy automat pe Railway (din dev branch)              │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   ISSUE CLOSED                              │
│  - Update changelog                                        │
│  - Notify affected tenants (dacă e bug critic)             │
│  - Documentează în POST-MORTEM.md dacă a fost critical     │
└─────────────────────────────────────────────────────────────┘
```

#### 🛠️ Implementare Tehnică

**1. Frontend Error Tracking (Sentry)**
```typescript
// frontend/src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  
  // Auto-capture errors
  beforeSend(event, hint) {
    // Auto-create GitHub issue pentru errors noi
    // Trimite webhook către Bogdan agent
    return event;
  },
});
```

**2. Backend Error Logger (NestJS + GitHub API)**
```typescript
// backend/src/common/decorators/catch-errors.decorator.ts
import { createGitHubIssue } from '../utils/github-issue-creator';

@CatchErrors({
  autoCreateIssue: true,
  severity: 'HIGH', // sau auto-detect din error type
  assignee: 'radu-dev',
  notifyTeam: true,
})
export class SomeService {
  async syncProducts() {
    // Dacă aruncă eroare → auto GitHub issue
  }
}
```

**3. GitHub Issue Template**
```markdown
---
name: Bug Report
about: Create a bug report for OpenSales
title: '[BUG] '
labels: ['bug', 'severity:high', 'needs-triage']
assignees: radu-dev
---

**Describe the bug**
Clear description of what happened.

**Error Details**
- Type: Frontend / Backend / Integration / Infrastructure
- Severity: Critical / High / Medium / Low
- Tenant Affected: [tenant-id or "all"]
- Environment: Development / Production

**Logs & Stack Trace**
```
[auto-inserted from error capture]
```

**Reproduction Steps**
1. ...
2. ...
3. ...

**Expected Behavior**
What should have happened.

**Screenshots**
If applicable.

**Additional Context**
Marketplace involved, sync job details, etc.
```

**4. Automation Script (Bogdan Agent)**
```typescript
// Când error e captat:
1. Sentry/Logger → Webhook către Bogdan
2. Bogdan parsează error details
3. Bogdan creează GitHub Issue cu template
4. Bogdan notifică Radu (email + GitHub assign)
5. Bogdan track în `/docs/BUG-TRACKER.md`
```

**5. Bug Tracker Dashboard**
```markdown
# BUG-TRACKER.md

| Issue # | Severity | Type | Assigned | Status | QA | Approved | Merged |
|---------|----------|------|----------|--------|----|----------|--------|
| #42     | High     | Backend | Radu  | Fixed | ✅ | ⏳ | ❌ |
| #41     | Medium   | Frontend | Radu | In Progress | ⏳ | - | - |
| #40     | Critical | Integration | Radu | Fixed | ✅ | ✅ | ✅ |
```

#### 📊 Beneficii

| Beneficiu | Impact |
|-----------|--------|
| **Detecție rapidă** | Bug-uri prinse în secunde, nu ore/zile |
| **Auto-task creation** | Radu nu așteaptă să fie notificat manual |
| **Prioritizare clară** | Severity labels = Radu știe ce să facă primul |
| **QA integration** | Cătălin vede automat bug-urile de testat |
| **Audit trail** | Tot istoricul în GitHub Issues |
| **Client trust** | Bug-uri fixate înainte să se plângă |

#### ⚠️ Riscuri & Mitigare

| Risc | Mitigare |
|------|----------|
| **Prea multe alerte** (alert fatigue) | Severity thresholds, doar High+ auto-create issues, Low+ log only |
| **False positives** | Bogdan review înainte de notify (poate fi async) |
| **GitHub API rate limits** | Batch issues, cache errors, retry logic |
| **Sensitive data în logs** | Sanitize PII before logging (emails, tokens, tenant data) |

#### 📁 Fișiere de Creat

- [ ] `/backend/src/lib/error-tracker.ts` - Backend logger + GitHub integration
- [ ] `/frontend/src/lib/sentry.ts` - Frontend error capture
- [ ] `.github/ISSUE_TEMPLATE/bug-report.md` - GitHub template
- [ ] `/docs/BUG-TRACKER.md` - Live bug tracking dashboard
- [ ] `/docs/POST-MORTEM.md` - Template pentru critical bugs
- [ ] Railway env vars: `SENTRY_DSN`, `GITHUB_BOT_TOKEN`

#### 🎯 Task-uri pentru Echipă

**Radu (Developer)**:
- [ ] Setup Sentry în frontend + backend
- [ ] Creează GitHub Issue template
- [ ] Implementează error logger decorator (NestJS)
- [ ] Testează cu error simulat

**Cătălin (QA)**:
- [ ] Scrie E2E test pentru error capture
- [ ] Verifică că issues se creează corect
- [ ] Testează fluxul complet (error → issue → fix → QA → merge)

**Bogdan (PM)**:
- [ ] Configurează GitHub bot token
- [ ] Setup bug tracker dashboard
- [ ] Definește severity thresholds
- [ ] Process doc pentru critical bugs (post-mortem)

---

### #2 - Remember Last Login + Email Verification

**Data**: 2026-04-01  
**Status**: 🟢 Approved for Implementation  
**Inițiat de**: User request (Hourly Check #2)

#### 🎯 Problema

**Partea 1 - Last Login Memory**:
- Userii se loghează des cu același cont
- Fiecare session trebuie să introducă email + password de la zero
- Nu există "Remember Me" sau "Last Used Account"
- **Impact**: Frecare la login, time loss, user frustration

**Partea 2 - Email Verification**:
- Oricine poate crea cont fără verificare email
- Risc de spam accounts, fake users
- Nu putem contacta users în caz de issues
- **Impact**: Security risk, no user validation

---

#### ✅ Soluția Propusă

**Partea 1: Remember Last Login**

```
┌─────────────────────────────────────────────────┐
│  LOGIN PAGE                                     │
├─────────────────────────────────────────────────┤
│  Email Business                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ nume@companie.ro                        │   │ ← Pre-filled if remembered
│  └─────────────────────────────────────────┘   │
│  [x] 📌 ține-mă minte data viitoare            │ ← New checkbox
│                                                 │
│  Parolă Securizată                              │
│  ┌─────────────────────────────────────────┐   │
│  │ ••••••••                                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [ ] Remember Me (30 days)                      │ ← Optional extended session
│                                                 │
│  [Acces Dashboard]                              │
└─────────────────────────────────────────────────┘
```

**Implementare Tehnică**:
1. **LocalStorage** (frontend): Salvează email după login success
2. **Cookie** (30 days): Optional "Remember Me" pentru session extins
3. **Pre-fill** la next visit: Citește localStorage, completează email field
4. **Clear** la logout: Șterge email din localStorage

**Files de modificat**:
- `/frontend/src/app/login/page.tsx` - Add localStorage logic
- `/frontend/src/components/auth/LoginForm.tsx` - Add checkbox + pre-fill
- `/backend/src/auth/auth.controller.ts` - Add "remember me" cookie option

---

**Partea 2: Email Verification (Light)**

```
┌─────────────────────────────────────────────────┐
│  REGISTER PAGE                                  │
├─────────────────────────────────────────────────┤
│  1. Completezi formularul (email, password)    │
│  2. Primești email cu verification code        │
│  3. Introduci codul în app                     │
│  4. ✅ Cont activat → Login                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  LOGIN PAGE (unverified user)                   │
├─────────────────────────────────────────────────┤
│  ⚠️ Contul tău nu este verificat                │
│  Email trimis la: nume@companie.ro             │
│  [Retrimite Email] [Introdu Codul]             │
└─────────────────────────────────────────────────┘
```

**Implementare Tehnică**:
1. **Database**: Add `isVerified` boolean la User model
2. **Verification Code**: 6-digit code, expires în 15 min
3. **Email Service**: AgentMail (radu@agentmail.to) sau SMTP
4. **Flow**:
   - Register → Create user (isVerified=false) → Send email code
   - User enters code → Verify → isVerified=true → Login allowed
   - Login attempt + !isVerified → Show verification screen

**Files de creat/modificat**:
- `backend/prisma/schema.prisma` - Add `isVerified` + `VerificationCode` model
- `backend/src/auth/verification.service.ts` - Code generation + email
- `backend/src/auth/verification.controller.ts` - Verify code endpoint
- `/frontend/src/app/register/page.tsx` - Add verification step
- `/frontend/src/app/verify/page.tsx` - New page for code entry

---

#### 📊 Beneficii

| Beneficiu | Impact |
|-----------|--------|
| **Last Login** | 1-click login pentru returning users |
| **Email Verification** | Security ↑, spam ↓, user validation |
| **User Trust** | Professional feel, security signals |

---

#### ⚠️ Riscuri & Mitigare

| Risc | Mitigare |
|------|----------|
| **LocalStorage security** | Doar email (nu password), HTTPS only |
| **Email delivery failures** | Retry button, resend code (max 3/hour) |
| **Code expiry confusion** | Clear UI messaging "Code expires in 15:00" |
| **Existing users unverified** | Migration: mark all existing as verified, require new users only |

---

#### 📁 Fișiere de Creat/Modificat

**Frontend**:
- [ ] `/frontend/src/app/login/page.tsx` - Pre-fill email + checkbox
- [ ] `/frontend/src/app/verify/page.tsx` - Verification code page (NEW)
- [ ] `/frontend/src/app/register/page.tsx` - Add verification step
- [ ] `/frontend/src/components/auth/VerificationForm.tsx` - NEW

**Backend**:
- [ ] `/backend/prisma/schema.prisma` - Add `isVerified` + `VerificationCode`
- [ ] `/backend/src/auth/verification.service.ts` - NEW
- [ ] `/backend/src/auth/verification.controller.ts` - NEW
- [ ] `/backend/src/auth/auth.controller.ts` - Update login flow
- [ ] Email template (verification code)

**Database Migration**:
- [ ] `prisma/migrations/[timestamp]_add_verification/` - Migration file

---

#### 🎯 Task-uri pentru Echipă

**Radu (Full-stack)**:
- [ ] Update Prisma schema (isVerified + VerificationCode model)
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Create verification service (code generation + email)
- [ ] Create verification controller (verify endpoint)
- [ ] Update auth controller (check isVerified on login)
- [ ] Update login page (pre-fill + remember me checkbox)
- [ ] Create verify page (code entry UI)
- [ ] Test flow complet (register → verify → login)

**Cătălin (QA)**:
- [ ] Testează last login memory (logout → login → pre-fill works?)
- [ ] Testează email verification flow
- [ ] Testează code expiry (15 min)
- [ ] Testează resend code functionality
- [ ] Testează migration pe existing users
- [ ] E2E test: register → verify → login → logout → login (pre-fill)

**Bogdan (PM)**:
- [ ] Definește email template copy
- [ ] Definește UI messages (errors, success)
- [ ] Migration plan pentru existing users
- [ ] Final approval înainte de deploy

---

#### 📈 Success Metrics

| Metric | Target |
|--------|--------|
| Login time (returning users) | <5 sec (vs 30+ sec înainte) |
| Email verification rate | >90% within 1 hour |
| Code delivery success | >95% |
| User complaints | 0 despre verification complexity |

---

#### 🚀 Priority & Timeline

**Priority**: 🔴 **HIGH** (user request + security improvement)

**Timeline**:
- **Day 1**: Radu - Database + Backend implementation
- **Day 2**: Radu - Frontend implementation
- **Day 3**: Cătălin - QA testing
- **Day 4**: Deploy pe Railway (dev → production)

**Estimated Effort**: 8-12 hours total

---

### #3 - [Next Improvement - TBD]

**Data**: TBD  
**Status**: ⏳ Așteaptă next hourly check  
**Inițiat de**: Bogdan/Alex session

---

## 📊 Stats

| Total Proposals | Implemented | In Debate | Rejected |
|-----------------|-------------|-----------|----------|
| 1 | 0 | 1 | 0 |

---

## 🔄 Automation Log

| Date/Time | Triggered | Output |
|-----------|-----------|--------|
| 2026-04-01 13:40 | Manual setup | Cron job creat + Proposal #1 documented |

---

**Last Updated**: 2026-04-01 13:40 UTC  
**Next Check**: Every hour (automated)
