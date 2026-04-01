# 🧪 Cătălin (QA Engineer) - Homepage Tasks

**Project**: OpenSales Homepage  
**Priority**: 🔴 High  
**ETA**: Day 4 (QA + audit)

---

## 📋 Task List

### Task 5.1: Cross-Browser Testing
**Time**: 1.5 hours  
**Output**: Compatibility report

**Acțiuni**:
- [ ] Testează homepage pe următoarele browsere:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)
- [ ] Verifică fiecare secțiune:
  - Hero (layout, buttons, stats)
  - Features (grid, cards, icons)
  - Pricing (cards, responsive)
  - CTA (button, copy)
  - Footer (links, layout)
- [ ] Notează orice diferențe vizuale între browsere
- [ ] Verifică console errors în fiecare browser

**Acceptance Criteria**:
- Toate browserele afișează homepage corect
- No layout shifts sau broken elements
- Console curat (fără erori critice)

---

### Task 5.2: Responsive Testing
**Time**: 1 hour  
**Output**: Device compatibility report

**Acțiuni**:
- [ ] Testează pe următoarele rezoluții:
  - Mobile: 375px (iPhone), 414px (iPhone Max)
  - Tablet: 768px (iPad), 1024px (iPad Pro)
  - Desktop: 1440px, 1920px
- [ ] Verifică breakpoints:
  - Hero se adaptează corect
  - Features grid trece de la 2x2 la 1x4
  - Pricing cards se stack-uiesc pe mobile
  - Footer se adaptează
- [ ] Testează touch targets pe mobile (butons, links)
- [ ] Verifică că textul e lizibil pe toate device-urile

**Acceptance Criteria**:
- Homepage arată bine pe toate rezoluțiile
- Touch targets >44px pe mobile
- No horizontal scroll pe mobile
- Text readable fără zoom

---

### Task 5.3: Performance Audit (Lighthouse)
**Time**: 45 min  
**Output**: Lighthouse report

**Acțiuni**:
- [ ] Deschide Chrome DevTools → Lighthouse
- [ ] Rulează audit pe homepage (mobile + desktop)
- [ ] Verifică metrics:
  - Performance: target >90
  - Accessibility: target >90
  - Best Practices: target >90
  - SEO: target >90
- [ ] Identifică issues:
  - Large images (dacă sunt)
  - Unused JavaScript
  - Render-blocking resources
  - CLS (Cumulative Layout Shift)
- [ ] Documentează recommendations pentru optimizare

**Acceptance Criteria**:
- Performance score >90
- Accessibility score >90
- No critical issues
- Report shared cu echipa

---

### Task 5.4: E2E Test (Playwright)
**Time**: 1.5 hours  
**Output**: Playwright test file

**Acțiuni**:
- [ ] Creează `/qa-suite/tests/homepage.spec.ts`
- [ ] Scrie teste pentru:
  ```typescript
  // Homepage loads successfully
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/OpenSales/);
  });

  // Hero section visible
  test('hero section visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Accelerăm vânzările')).toBeVisible();
  });

  // Pricing section visible
  test('pricing section visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=29€')).toBeVisible();
  });

  // CTA buttons work
  test('CTA buttons clickable', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Începe Gratuit');
    // Should navigate to /register
  });

  // Mobile responsive
  test('mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // Verify layout adapts
  });
  ```
- [ ] Rulează testele local
- [ ] Fix any failing tests
- [ ] Documentează results

**Acceptance Criteria**:
- Toate testele pass
- Coverage pentru toate secțiunile principale
- Test file committed în repo

---

### Task 5.5: Accessibility Check
**Time**: 45 min  
**Output**: Accessibility report

**Acțiuni**:
- [ ] Rulează axe DevTools sau Lighthouse Accessibility
- [ ] Verifică:
  - Color contrast (text pe background)
  - Alt text pe imagini (dacă sunt)
  - Focus states pe buttons/links
  - Keyboard navigation (Tab order)
  - Screen reader compatibility
- [ ] Testează keyboard-only navigation:
  - Poți naviga prin toată pagina cu Tab?
  - Focus visible pe fiecare element?
  - Poți activa CTA buttons cu Enter/Space?
- [ ] Documentează issues

**Acceptance Criteria**:
- WCAG 2.1 AA compliance
- No critical accessibility issues
- Keyboard navigation works
- Focus states visible

---

## 📁 Deliverables Location

```
/qa-suite/
├── tests/
│   └── homepage.spec.ts
└── reports/
    ├── lighthouse-report.json
    └── accessibility-report.md
```

---

## 🔗 Dependencies

- **Blocked by**: Radu Task 4.4 (homepage deployed)
- **Blocks**: Final merge to dev

---

## 🎯 Success Metrics

- [ ] Cross-browser: No critical issues
- [ ] Responsive: All devices pass
- [ ] Performance: Lighthouse >90
- [ ] E2E Tests: All passing
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Report shared cu Bogdan + echipa

---

**Start**: După ce Radu deploy-uiește homepage  
**ETA**: End of Day 4  
**Status**: 🟡 Waiting on deployment
