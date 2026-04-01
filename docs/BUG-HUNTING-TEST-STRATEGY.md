# 🐛 Bug Hunting Test Strategy

**Document creat**: 2026-04-01  
**Owner**: Bogdan (PM) + Cătălin (QA Lead)  
**Philosophy**: "Tests should find bugs, not just pass"

---

## 🎯 Mindset Shift

### ❌ Wrong Approach
```typescript
// Just checking if button exists
await expect(page.locator('button')).toBeVisible();
```

### ✅ Bug Hunting Approach
```typescript
// Checking edge cases, error states, boundary conditions
test('should handle 10,000 products without crashing', async ({ page }) => {
  await createProducts(10000);
  await page.goto('/products');
  
  // Check for performance issues
  const loadTime = await measureLoadTime();
  expect(loadTime).toBeLessThan(5000);
  
  // Check for rendering issues
  await expect(page.locator('.product-row')).toHaveCount(10000);
  
  // Check for memory leaks (no crash after scrolling)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await expect(page).not.toHaveText('Out of memory');
});
```

---

## 🧪 Bug Categories to Hunt

### 1. Edge Cases & Boundary Conditions

**What to test**:
- Empty states (0 items, null values)
- Maximum values (10,000 products, 999,999,999 RON)
- Special characters (Unicode, emojis, SQL injection attempts)
- Very long strings (1000+ character names)
- Date boundaries (leap year, timezone edge cases)

**Example Tests**:
```typescript
// Empty state
test('should handle empty product catalog gracefully', async ({ page }) => {
  await deleteAllProducts();
  await page.goto('/products');
  
  await expect(page.locator('text=Niciun produs')).toBeVisible();
  await expect(page.locator('.add-product-btn')).toBeVisible();
  await expect(page.locator('.empty-state-illustration')).toBeVisible();
});

// Maximum values
test('should handle product with maximum price (999,999,999)', async ({ page }) => {
  await page.goto('/products/new');
  
  await page.fill('input[name="price"]', '999999999');
  await page.click('button[type="submit"]');
  
  // Should save without errors
  await expect(page.locator('text=Produs creat')).toBeVisible();
  
  // Should display correctly
  const savedPrice = await page.locator('.price').textContent();
  expect(savedPrice).toBe('999.999.999,00 RON');
});

// Special characters
test('should handle product names with emojis and special chars', async ({ page }) => {
  await page.goto('/products/new');
  
  const productName = '🔥 Super Produs 🎉 <script>alert("XSS")</script>';
  await page.fill('input[name="name"]', productName);
  await page.click('button[type="submit"]');
  
  // Should save and display without executing scripts
  await expect(page.locator('text=🔥 Super Produs 🎉')).toBeVisible();
  await expect(page.locator('text=<script>')).not.toBeVisible(); // XSS prevention
});
```

---

### 2. Race Conditions & Timing Issues

**What to test**:
- Double-clicks on buttons
- Quick navigation (clicking before page loads)
- Concurrent updates (same resource from multiple tabs)
- Async operations (loading states, optimistic UI)

**Example Tests**:
```typescript
// Double-click prevention
test('should prevent double order submission', async ({ page }) => {
  await page.goto('/orders/new');
  
  // Fill order form
  await page.fill('input[name="customer"]', 'Test Customer');
  
  // Double-click submit button
  await page.click('button[type="submit"]', { clickCount: 2 });
  
  // Should only create ONE order
  const orderCount = await page.locator('.order-row').count();
  expect(orderCount).toBe(1);
  
  // Should show success message only once
  const successMessages = await page.locator('text=Comandă creată').count();
  expect(successMessages).toBe(1);
});

// Quick navigation
test('should handle rapid navigation without crashes', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Rapid navigation
  await page.click('a[href="/products"]');
  await page.click('a[href="/orders"]');
  await page.click('a[href="/customers"]');
  await page.click('a[href="/dashboard"]');
  
  // Should not crash, should end up on dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});

// Concurrent updates
test('should handle concurrent product updates from multiple tabs', async ({ context }) => {
  // Open two tabs
  const page1 = await context.newPage();
  const page2 = await context.newPage();
  
  await page1.goto('/products/1/edit');
  await page2.goto('/products/1/edit');
  
  // Both tabs update same product
  await page1.fill('input[name="price"]', '100');
  await page2.fill('input[name="price"]', '200');
  
  await page1.click('button[type="submit"]');
  await page2.click('button[type="submit"]');
  
  // One should succeed, other should show conflict error
  const page1Success = await page1.locator('text=Produs actualizat').isVisible();
  const page2Error = await page2.locator('text=Conflict detected').isVisible();
  
  expect(page1Success || page2Error).toBeTruthy();
});
```

---

### 3. Error State Testing

**What to test**:
- API failures (500 errors, timeouts)
- Network disconnections
- Invalid data submission
- Permission errors
- Database constraint violations

**Example Tests**:
```typescript
// API failure handling
test('should show friendly error when API returns 500', async ({ page }) => {
  // Mock API failure
  await page.route('**/api/products', async route => {
    await route.fulfill({ status: 500, body: 'Internal Server Error' });
  });
  
  await page.goto('/products');
  
  // Should show friendly error, not crash
  await expect(page.locator('text=Eroare la încărcare')).toBeVisible();
  await expect(page.locator('text=Internal Server Error')).not.toBeVisible();
  
  // Should have retry button
  await expect(page.locator('button:has-text("Încearcă din nou")')).toBeVisible();
});

// Network disconnection
test('should handle network disconnection gracefully', async ({ page, context }) => {
  await page.goto('/products');
  
  // Disconnect network
  await context.setOffline(true);
  
  // Try to create product
  await page.click('button:has-text("Adaugă Produs")');
  
  // Should show offline message
  await expect(page.locator('text=Ești offline')).toBeVisible();
  
  // Should not crash
  await expect(page.locator('button:has-text("Încearcă din nou")')).toBeVisible();
});

// Invalid data submission
test('should reject product with negative price', async ({ page }) => {
  await page.goto('/products/new');
  
  await page.fill('input[name="name"]', 'Test Product');
  await page.fill('input[name="price"]', '-100');
  await page.click('button[type="submit"]');
  
  // Should show validation error
  await expect(page.locator('text=Prețul nu poate fi negativ')).toBeVisible();
  
  // Should not submit
  await expect(page).toHaveURL('/products/new');
});
```

---

### 4. Multi-Tenancy & Security Bugs

**What to test**:
- Tenant isolation (can't see other tenant's data)
- Authentication bypass attempts
- Authorization (role-based access)
- Data leakage in API responses
- CSRF/XSS vulnerabilities

**Example Tests**:
```typescript
// Tenant isolation
test('should NOT see products from other tenant', async ({ page }) => {
  // Login as Tenant A user
  await loginAs('user@tenant-a.com', 'password');
  await page.goto('/products');
  
  // Create product for Tenant A
  await createProduct('Tenant A Product');
  
  // Logout
  await logout();
  
  // Login as Tenant B user
  await loginAs('user@tenant-b.com', 'password');
  await page.goto('/products');
  
  // Should NOT see Tenant A's product
  await expect(page.locator('text=Tenant A Product')).not.toBeVisible();
  
  // Should only see Tenant B's products
  const products = await page.locator('.product-row').allTextContents();
  products.forEach(product => {
    expect(product).not.toContain('Tenant A');
  });
});

// Authentication bypass
test('should redirect to login when accessing protected route without auth', async ({ page }) => {
  // Try to access dashboard without login
  await page.goto('/dashboard');
  
  // Should redirect to login
  await expect(page).toHaveURL('/login');
  
  // Should show login page
  await expect(page.locator('text=Autentificare')).toBeVisible();
});

// Role-based access
test('should NOT allow regular user to access admin settings', async ({ page }) => {
  await loginAs('user@tenant.com', 'password'); // Regular user
  await page.goto('/settings/admin');
  
  // Should show access denied or redirect
  await expect(page.locator('text=Acces interzis')).toBeVisible();
  // OR
  await expect(page).toHaveURL('/dashboard');
});
```

---

### 5. Performance & Memory Leaks

**What to test**:
- Large datasets (10k+ products, orders)
- Memory leaks (long sessions, repeated actions)
- Slow API responses
- Bundle size / page load time
- Infinite loops

**Example Tests**:
```typescript
// Large dataset performance
test('should handle 10,000 products without performance degradation', async ({ page }) => {
  // Create 10,000 products
  await createProducts(10000);
  
  // Measure load time
  const startTime = Date.now();
  await page.goto('/products');
  await page.waitForSelector('.product-row');
  const loadTime = Date.now() - startTime;
  
  // Should load in under 5 seconds
  expect(loadTime).toBeLessThan(5000);
  
  // Should paginate correctly
  await expect(page.locator('.pagination')).toBeVisible();
  
  // Should scroll smoothly (no lag)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  
  // Should not crash (memory check)
  const jsHeapSize = await page.evaluate(() => performance.memory?.usedJSHeapSize);
  expect(jsHeapSize).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
});

// Memory leak detection
test('should not have memory leaks after repeated actions', async ({ page }) => {
  await page.goto('/products');
  
  // Get initial memory
  const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
  
  // Repeat action 100 times
  for (let i = 0; i < 100; i++) {
    await page.click('button:has-text("Refresh")');
    await page.waitForTimeout(100);
  }
  
  // Get final memory
  const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
  
  // Memory increase should be less than 50MB
  const memoryIncrease = finalMemory - initialMemory;
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
});
```

---

### 6. UI/UX Bugs

**What to test**:
- Responsive design (mobile, tablet, desktop)
- Broken layouts (overflow, overlapping elements)
- Accessibility issues (missing labels, keyboard navigation)
- Browser inconsistencies
- Dark mode / theme switching

**Example Tests**:
```typescript
// Responsive design
test('should work on mobile (375px width)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/dashboard');
  
  // No horizontal scroll
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  
  // Mobile menu should work
  await page.click('.hamburger-menu');
  await expect(page.locator('.mobile-nav')).toBeVisible();
});

// Broken layout detection
test('should not have overlapping elements on products page', async ({ page }) => {
  await page.goto('/products');
  
  // Check for overlapping elements
  const overlaps = await page.evaluate(() => {
    const elements = document.querySelectorAll('.product-card');
    let hasOverlap = false;
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const rect1 = elements[i].getBoundingClientRect();
        const rect2 = elements[j].getBoundingClientRect();
        
        if (
          rect1.left < rect2.right &&
          rect1.right > rect2.left &&
          rect1.top < rect2.bottom &&
          rect1.bottom > rect2.top
        ) {
          hasOverlap = true;
          break;
        }
      }
    }
    
    return hasOverlap;
  });
  
  expect(overlaps).toBe(false);
});

// Accessibility
test('should have proper accessibility labels', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Check for missing alt text
  const imagesWithoutAlt = await page.evaluate(() => {
    const images = document.querySelectorAll('img:not([alt])');
    return images.length;
  });
  
  expect(imagesWithoutAlt).toBe(0);
  
  // Check for form labels
  const inputsWithoutLabels = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input:not([aria-label]):not([id])');
    return inputs.length;
  });
  
  expect(inputsWithoutLabels).toBe(0);
});
```

---

## 🎯 Bug Hunting Test Templates

### Template 1: Edge Case Test
```typescript
test('should handle [EDGE_CASE] without crashing', async ({ page }) => {
  // Arrange: Set up edge case
  await [SETUP_EDGE_CASE];
  
  // Act: Perform action
  await [ACTION];
  
  // Assert: No crash, proper error handling
  await expect([ERROR_MESSAGE_OR_FALLBACK]).toBeVisible();
  await expect([CRASH_INDICATOR]).not.toBeVisible();
});
```

### Template 2: Race Condition Test
```typescript
test('should handle [RAPID_ACTION] without data corruption', async ({ page }) => {
  // Act: Perform rapid actions
  await [RAPID_ACTION_1];
  await [RAPID_ACTION_2];
  
  // Assert: Data integrity maintained
  expect([DATA_CONSISTENCY_CHECK]).toBeTruthy();
  await expect([CORRUPTION_INDICATOR]).not.toBeVisible();
});
```

### Template 3: Security Test
```typescript
test('should prevent [SECURITY_VULNERABILITY]', async ({ page }) => {
  // Act: Attempt vulnerability
  await [ATTEMPT_VULNERABILITY];
  
  // Assert: Blocked properly
  await expect([ACCESS_DENIED_OR_REDIRECT]).toBeVisible();
  await expect([SENSITIVE_DATA]).not.toBeVisible();
});
```

---

## 📊 Bug Severity Classification

| Severity | Description | Example | Action |
|----------|-------------|---------|--------|
| 🔴 Critical | Data loss, security breach, system crash | Tenant isolation bypass | Block release |
| 🟠 High | Major feature broken, workaround exists | Order creation fails | Fix before release |
| 🟡 Medium | Minor feature broken, UX issue | Button misaligned | Fix in next sprint |
| 🟢 Low | Cosmetic, edge case | Typo in error message | Backlog |

---

## 🚀 Integration with CI/CD

### GitHub Actions - Bug Hunting Tests

```yaml
name: Bug Hunting Tests

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  bug-hunting:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run bug hunting tests
        run: npx playwright test --grep "@bug-hunt"
      - name: Upload bug report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: bug-report
          path: |
            reports/
            test-results/
```

---

## 📈 Success Metrics

| Metric | Target |
|--------|--------|
| Bugs found before production | 90%+ |
| Critical bugs in production | 0 |
| Test coverage (edge cases) | 80%+ |
| False positive rate | < 5% |
| Bug hunting test execution time | < 30 min |

---

**Last Updated**: 2026-04-01  
**Next Review**: After each bug found in production
