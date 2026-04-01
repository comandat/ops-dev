# 🧪 Cătălin - Email Verification + Remember Me QA

**Project**: OpenSales Improvement #2  
**Priority**: 🔴 HIGH  
**ETA**: Day 3 (după ce Radu termină implementarea)

---

## 📋 Overview

**Testezi două feature-uri**:
1. **Remember Last Login** - Email pre-fill + "Remember Me" checkbox
2. **Email Verification** - 6-digit code înainte de login

---

## 🎯 Task List

### Phase 1: Test Plan Review (30 min)

**Task 1.1**: Citește documentația
**Acțiuni**:
- [ ] Citește `/docs/IMPROVEMENTS.md` - secțiunea #2
- [ ] Citește `/docs/tasks/RADU-VERIFICATION-IMPLEMENTATION.md`
- [ ] Înțelege fluxul complet: Register → Verify → Login → Logout → Login (pre-fill)

**Output**: Listă de teste de scris

---

### Phase 2: Manual Testing (2 hours)

**Task 2.1**: Testează Remember Last Login

**Test Cases**:
| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 1 | First login | 1. Deschizi /login<br>2. Introduci email + password<br>3. Login | Login successful |
| 2 | Email saved | 1. Logout<br>2. Înapoi la /login | Email pre-filled din localStorage |
| 3 | Checkbox "Remember Me" | 1. Login cu checkbox checked<br>2. Logout<br>3. Închizi browser<br>4. Deschizi din nou | Email tot pre-filled (30 days) |
| 4 | Clear on logout | 1. Login<br>2. Logout manual | localStorage cleared, email nu mai e pre-filled |
| 5 | Different browser | 1. Login pe Chrome<br>2. Deschizi Firefox | Email NU e pre-filled (localStorage per browser) |

**Acceptance Criteria**:
- ✅ Toate testele pass
- ✅ Email pre-fill works
- ✅ Checkbox funcțional
- ✅ Logout clears storage

---

**Task 2.2**: Testează Email Verification Flow

**Test Cases**:
| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 1 | Register new user | 1. /register<br>2. Completezi form<br>3. Submit | Redirect la /verify, email trimis |
| 2 | Verify with correct code | 1. Deschizi email<br>2. Introduci codul<br>3. Submit | Cont activat, redirect la /login |
| 3 | Verify with wrong code | 1. Introduci cod greșit<br>2. Submit | Error: "Cod invalid sau expirat" |
| 4 | Code expiry | 1. Aștepți 15 min<br>2. Introduci codul | Error: "Cod expirat" |
| 5 | Resend code | 1. Click "Retrimite codul"<br>2. Aștepți 60s<br>3. Click din nou | Cod nou trimis, countdown resetat |
| 6 | Login before verify | 1. Register fără verify<br>2. Încerci login | Error: "Cont nevalidat. Verifică email-ul." |
| 7 | Auto-send code on login | 1. Login cu cont nevalidat<br>2. Verifici email | Cod trimis automat |
| 8 | Verify after login attempt | 1. Primești cod automat<br>2. Verifici<br>3. Login din nou | Login successful |
| 9 | Multiple codes | 1. Ceri 3 coduri<br>2. Verifici cu ultimul | Doar ultimul cod valid |
| 10 | Existing users | 1. Login cu cont creat înainte de feature | Login works (migration: isVerified=true) |

**Acceptance Criteria**:
- ✅ Toate testele pass
- ✅ Email delivery works
- ✅ Code validation works
- ✅ Expiry works (15 min)
- ✅ Resend works (60s cooldown)

---

### Phase 3: E2E Tests (Playwright) (2 hours)

**Task 3.1**: Scrie E2E Tests
**File**: `/qa-suite/tests/verification.spec.ts`

**Test Template**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Email Verification', () => {
  test('should send verification code on register', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@opensales.ro');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/verify');
    await expect(page.locator('text=Cod de verificare')).toBeVisible();
  });

  test('should verify account with correct code', async ({ page }) => {
    // Assuming test email with known code (mock)
    await page.goto('/verify?email=test@opensales.ro');
    await page.fill('input[name="code"]', '123456');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=Cont verificat')).toBeVisible();
  });

  test('should reject expired code', async ({ page }) => {
    // Mock expired code scenario
    await page.goto('/verify?email=test@opensales.ro');
    await page.fill('input[name="code"]', '999999');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Cod invalid sau expirat')).toBeVisible();
  });

  test('should resend verification code', async ({ page }) => {
    await page.goto('/verify?email=test@opensales.ro');
    await page.click('button:has-text("Retrimite codul")');
    
    // Wait 60s cooldown
    await page.waitForTimeout(60000);
    
    await page.click('button:has-text("Retrimite codul")');
    await expect(page.locator('text=Cod retrimis')).toBeVisible();
  });
});

test.describe('Remember Last Login', () => {
  test('should pre-fill email on return visit', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@opensales.ro');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Logout
    await page.click('button:has-text("Logout")');
    
    // Return to login
    await page.goto('/login');
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveValue('test@opensales.ro');
  });

  test('should clear email on logout', async ({ page }) => {
    // Login with remember me unchecked
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@opensales.ro');
    await page.fill('input[name="password"]', 'Test123!');
    await page.uncheck('input[name="rememberMe"]');
    await page.click('button[type="submit"]');
    
    // Logout
    await page.click('button:has-text("Logout")');
    
    // Email should be cleared
    await page.goto('/login');
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveValue('');
  });
});
```

**Acțiuni**:
- [ ] Creează fișierul `/qa-suite/tests/verification.spec.ts`
- [ ] Scrie toate testele (minim 8-10 teste)
- [ ] Rulează testele local: `npx playwright test verification`
- [ ] Fix any failing tests

**Acceptance Criteria**:
- ✅ Toate testele E2E pass
- ✅ Coverage pentru toate fluxurile critice
- ✅ Tests pot rula în CI/CD

---

### Phase 4: Cross-Browser Testing (1 hour)

**Task 4.1**: Testează pe multiple browsere

**Browsers**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Testuri per browser**:
- [ ] Email pre-fill works
- [ ] Verification code input works
- [ ] Timer countdown works
- [ ] Resend button works

**Acceptance Criteria**:
- ✅ Toate browserele funcționează identic
- ✅ No browser-specific issues

---

### Phase 5: Performance & Security (30 min)

**Task 5.1**: Performance Check

**Acțiuni**:
- [ ] Verify page Lighthouse score (>90)
- [ ] Code input response time (<100ms)
- [ ] Email delivery time (<30 sec)

**Task 5.2**: Security Check

**Acțiuni**:
- [ ] Rate limiting pe resend code (max 3/hour)
- [ ] Code expiry enforced (15 min)
- [ ] LocalStorage doar email (nu password)
- [ ] HTTPS only cookies

**Acceptance Criteria**:
- ✅ No security vulnerabilities
- ✅ Performance within targets

---

## 📁 Deliverables

- [ ] Manual test results (spreadsheet sau doc)
- [ ] E2E tests în `/qa-suite/tests/verification.spec.ts`
- [ ] Cross-browser test results
- [ ] Performance + security report
- [ ] QA sign-off (PASS/FAIL recommendation)

---

## 🎯 Success Criteria

| Criteria | Target |
|----------|--------|
| Manual tests pass | 100% |
| E2E tests pass | 100% |
| Critical bugs | 0 |
| Medium bugs | <3 |
| Email delivery time | <30 sec |
| Code expiry enforced | Yes |

---

## 🔗 Dependencies

- **Blocked by**: Radu implementation complete + deployed pe dev
- **Blocks**: Final deploy pe production

---

**Start**: După ce Radu termină implementarea  
**ETA**: 6-8 hours  
**Status**: 🟡 Waiting on Radu
