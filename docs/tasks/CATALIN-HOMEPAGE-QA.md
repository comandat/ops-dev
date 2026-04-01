# 🧪 Cătălin - QA Tasks: Homepage

**Project**: OpenSales Homepage  
**Priority**: 🔴 High (Day 4)  
**PRD Reference**: `docs/PRD-HOMEPAGE.md`

---

## 📋 Overview

Ești responsabil de **calitatea finală** a homepage-ului. 
Testează everything: functionality, responsive, performance, accessibility.

---

## ✅ Task List

### Task 1: Test Plan Creation (1 hour)
- [ ] Citește PRD-ul (`docs/PRD-HOMEPAGE.md`)
- [ ] Identifică toate user stories (US1-US6)
- [ ] Creează checklist de testare în `qa-suite/checklists/homepage-checklist.md`
- [ ] Definește test cases pentru fiecare componentă

### Task 2: Functional Testing (2-3 ore)
- [ ] **Hero Section**:
  - [ ] Headline se afișează corect
  - [ ] Subheadline se afișează corect
  - [ ] CTA "Începe Gratuit" link la /register
  - [ ] CTA "Vezi Demo" funcțional
- [ ] **Stats Bar**:
  - [ ] Toate stats-urile vizibile
  - [ ] Numbers se afișează corect
- [ ] **Features Section**:
  - [ ] 4 feature cards prezente
  - [ ] Iconițe + text corecte
  - [ ] Hover effects funcționale
- [ ] **Pricing Section**:
  - [ ] 4 pricing tiers prezente
  - [ ] Prețuri afișate corect
  - [ ] Features lists complete
  - [ ] CTA buttons funcționale
  - [ ] "Most popular" badge vizibil (dacă e cazul)
- [ ] **CTA Section**:
  - [ ] Headline + subheadline corecte
  - [ ] Button funcțional
- [ ] **Footer**:
  - [ ] Toate link-urile prezente
  - [ ] Links nu sunt broken (404)
  - [ ] Copyright text corect

### Task 3: Responsive Testing (2 ore)
- [ ] **Mobile (375px)**:
  - [ ] Toate secțiunile stack vertical
  - [ ] Text lizibil (nu prea mic)
  - [ ] Buttons touch-friendly (min 44px height)
  - [ ] No horizontal scroll
- [ ] **Tablet (768px)**:
  - [ ] Grid 2x2 pentru features/pricing
  - [ ] Spacing consistent
- [ ] **Desktop (1024px+)**:
  - [ ] Layout full-width
  - [ ] All elements aligned
- [ ] **Browser testing**:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari (dacă e access)
  - [ ] Edge (optional)

### Task 4: Performance Testing (1-2 ore)
- [ ] Run Lighthouse (Chrome DevTools)
  - [ ] Performance: target >90
  - [ ] Accessibility: target >90
  - [ ] Best Practices: target >90
  - [ ] SEO: target >90
- [ ] Capture screenshot cu scores
- [ ] Identifică issues dacă score <90
- [ ] Creează issue-uri pentru optimization

### Task 5: Accessibility Testing (1-2 ore)
- [ ] **Keyboard navigation**:
  - [ ] Tab prin toate elementele interactive
  - [ ] Focus states vizibile
  - [ ] No keyboard traps
- [ ] **Screen reader** (optional, axe DevTools):
  - [ ] Alt text pe imagini/iconițe
  - [ ] ARIA labels pe buttons
  - [ ] Heading hierarchy corectă (H1 → H2 → H3)
- [ ] **Color contrast**:
  - [ ] Text lizibil pe background
  - [ ] Contrast ratio >4.5:1 (normal text)

### Task 6: E2E Test Creation (2-3 ore)
- [ ] Creează test file: `qa-suite/tests/homepage.spec.ts`
- [ ] Test cases:
  ```typescript
  - Homepage loads successfully
  - Hero headline is visible
  - CTA button navigates to /register
  - Features section has 4 cards
  - Pricing section has 4 tiers
  - Footer links are not broken
  - Mobile responsive (viewport change)
  ```
- [ ] Rulează testele: `npx playwright test`
- [ ] Fix failures + re-run

### Task 7: Bug Reporting (1 hour)
- [ ] Pentru fiecare bug găsit:
  - [ ] Descriere clară
  - [ ] Pași de reproducere
  - [ ] Screenshot/screen recording
  - [ ] Severity (Critical/Major/Minor)
  - [ ] Creează GitHub issue
- [ ] Prioritizează bug-urile cu Bogdan

### Task 8: Final Sign-off (30 min)
- [ ] Toate testele pass
- [ ] Toate bug-urile critice fixate
- [ ] Lighthouse scores OK
- [ ] Semnează off în `qa-suite/checklists/homepage-checklist.md`
- [ ] Notifică Bogdan că homepage e ready pentru review

---

## 📁 Deliverables

- [ ] `qa-suite/checklists/homepage-checklist.md` (completed)
- [ ] `qa-suite/tests/homepage.spec.ts` (Playwright tests)
- [ ] Lighthouse report (screenshot)
- [ ] GitHub issues pentru bugs (dacă e cazul)
- [ ] Final sign-off

---

## 🎯 Acceptance Criteria

- [ ] Toate user stories (US1-US6) validate
- [ ] Zero critical bugs
- [ ] Zero broken links
- [ ] Lighthouse scores >90 (toate categoriile)
- [ ] Responsive pe toate device-urile
- [ ] E2E tests passing

---

## 💡 Tips

- **Be thorough** - mai bine găsești tu bug-ul decât user-ul
- **Document everything** - screenshot-uri, pași de reproducere
- **Think like a user** - nu doar ca un tester
- **Communicate** - dacă găsești ceva major, spune imediat

---

## 🔗 Dependencies

- **Blocked by**: Radu (homepage deployed live)
- **Parallel with**: None (final gate before launch)
- **Blocks**: Bogdan (final review + user demo)

---

**Start**: După ce Radu face deploy live  
**ETA**: End of Day 4  
**Review**: Bogdan
