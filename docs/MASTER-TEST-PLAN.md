# OpenSales - Master Test Plan

**Document creat**: 2026-04-01  
**Owner**: Bogdan (PM) + Cătălin (QA Lead)  
**Status**: 🟡 In Progress

---

## 📋 Overview

Acest document definește strategia completă de testare pentru platforma OpenSales.

**Platforma**: Multi-tenant SaaS pentru e-commerce operations  
**Integrări**: eMAG, Trendyol, FGO (marketplace + billing)  
**Stack**: Next.js + NestJS + PostgreSQL + Redis + BullMQ  
**Auth**: Lucia Auth

---

## 🎯 Test Strategy

### Testing Pyramid

```
                    /E2E Tests (Playwright)\
                   /                        \
                  /    Integration Tests     \
                 /                            \
                /      Unit Tests (Jest)       \
               /________________________________\
```

### Test Coverage Targets

| Test Type | Coverage Target | Tools |
|-----------|-----------------|-------|
| Unit Tests | 80%+ backend, 60%+ frontend | Jest, React Testing Library |
| Integration Tests | All API endpoints | Jest + Supertest |
| E2E Tests | All critical user flows | Playwright |
| Visual Tests | Key pages | Playwright Screenshots |

---

## 📁 Test Organization

### Folder Structure

```
ops-dev/
├── qa-suite/                    # Root QA folder
│   ├── README.md               # QA documentation
│   ├── playwright.config.ts    # Playwright configuration
│   ├── tests/                  # E2E tests (Playwright)
│   │   ├── auth/              # Authentication tests
│   │   ├── products/          # Product management tests
│   │   ├── orders/            # Order management tests
│   │   ├── plugins/           # Plugin integration tests
│   │   ├── dashboard/         # Dashboard tests
│   │   └── smoke/             # Smoke tests (pre-push)
│   ├── unit/                   # Unit tests
│   │   ├── backend/           # Backend unit tests
│   │   └── frontend/          # Frontend unit tests
│   ├── integration/            # Integration tests
│   │   └── api/               # API integration tests
│   ├── fixtures/               # Test data & fixtures
│   ├── utils/                  # Test utilities
│   │   ├── test-data.ts       # Test data generators
│   │   ├── auth-helpers.ts    # Auth helpers
│   │   └── api-client.ts      # API client for tests
│   └── reports/                # Test reports
├── frontend/
│   └── qa-suite/              # Frontend-specific tests
│       ├── tests/             # Frontend E2E tests
│       └── __tests__/         # Frontend unit tests
└── backend/
    └── src/
        └── __tests__/         # Backend unit tests
```

---

## 🧪 Test Suites

### Suite 1: Authentication & Onboarding (AUTH)

**Owner**: Cătălin-AUTH  
**Priority**: 🔴 Critical  
**Tests**: 15

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| AUTH-01 | Register new user | E2E | Complete registration flow |
| AUTH-02 | Email verification | E2E | Verify email with 6-digit code |
| AUTH-03 | Login with valid credentials | E2E | Successful login |
| AUTH-04 | Login with invalid credentials | E2E | Error handling |
| AUTH-05 | Remember Me functionality | E2E | Email pre-fill on return |
| AUTH-06 | Logout + session cleanup | E2E | Session destroyed on logout |
| AUTH-07 | Password reset request | E2E | Request password reset email |
| AUTH-08 | Password reset with code | E2E | Reset password flow |
| AUTH-09 | Login with unverified account | E2E | Blocked until verified |
| AUTH-10 | Session expiry | E2E | Auto-logout after expiry |
| AUTH-11 | Multi-tab session | E2E | Session shared across tabs |
| AUTH-12 | Protected route redirect | E2E | Redirect to login if not authenticated |
| AUTH-13 | API: Register endpoint | Integration | Backend validation |
| AUTH-14 | API: Login endpoint | Integration | Token generation |
| AUTH-15 | API: Verify email endpoint | Integration | Code validation |

---

### Suite 2: Dashboard & Navigation (DASH)

**Owner**: Cătălin-DASH  
**Priority**: 🔴 Critical  
**Tests**: 10

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| DASH-01 | Dashboard loads after login | E2E | Redirect to /dashboard |
| DASH-02 | Dashboard stats display | E2E | Orders, products, revenue widgets |
| DASH-03 | Navigation menu | E2E | All menu items clickable |
| DASH-04 | Mobile navigation | E2E | Hamburger menu on mobile |
| DASH-05 | Breadcrumbs navigation | E2E | Breadcrumb trail works |
| DASH-06 | Quick actions | E2E | "Add Product", "New Order" buttons |
| DASH-07 | Recent activity feed | E2E | Activity log displays |
| DASH-08 | Dashboard filters | E2E | Date range, status filters |
| DASH-09 | Dashboard refresh | E2E | Manual refresh button |
| DASH-10 | Empty state displays | E2E | No data placeholder |

---

### Suite 3: Product Management (PROD)

**Owner**: Cătălin-PROD  
**Priority**: 🔴 Critical  
**Tests**: 20

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| PROD-01 | View products list | E2E | Products table loads |
| PROD-02 | Create new product | E2E | Add product form |
| PROD-03 | Edit product | E2E | Update product details |
| PROD-04 | Delete product | E2E | Delete with confirmation |
| PROD-05 | Bulk delete products | E2E | Multi-select delete |
| PROD-06 | Product search | E2E | Search by name/SKU |
| PROD-07 | Product filters | E2E | Filter by status, category |
| PROD-08 | Product pagination | E2E | Navigate pages |
| PROD-09 | Product images upload | E2E | Upload multiple images |
| PROD-10 | Low stock alert | E2E | Warning when stock < threshold |
| PROD-11 | Product validation | E2E | Required fields validation |
| PROD-12 | Duplicate SKU error | E2E | SKU must be unique per tenant |
| PROD-13 | API: Create product | Integration | POST /api/products |
| PROD-14 | API: Get products | Integration | GET /api/products |
| PROD-15 | API: Update product | Integration | PUT /api/products/:id |
| PROD-16 | API: Delete product | Integration | DELETE /api/products/:id |
| PROD-17 | API: Product validation | Unit | Schema validation |
| PROD-18 | Multi-tenant isolation | Integration | Can't see other tenant products |
| PROD-19 | Product export CSV | E2E | Export products to CSV |
| PROD-20 | Product import CSV | E2E | Import products from CSV |

---

### Suite 4: Product Offers / Marketplace Listings (OFFER)

**Owner**: Cătălin-OFFER  
**Priority**: 🔴 High  
**Tests**: 15

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| OFFER-01 | Create product offer | E2E | Link product to marketplace |
| OFFER-02 | Edit offer details | E2E | Override title, price, description |
| OFFER-03 | Link/unlink offer | E2E | Toggle isLinked |
| OFFER-04 | Offer status display | E2E | DRAFT, SYNCED, ERROR states |
| OFFER-05 | Push offer to eMAG | E2E | Sync to eMAG marketplace |
| OFFER-06 | Push offer to Trendyol | E2E | Sync to Trendyol |
| OFFER-07 | Push offer to FGO | E2E | Sync to FGO billing |
| OFFER-08 | Offer sync error handling | E2E | Display sync errors |
| OFFER-09 | Bulk push offers | E2E | Sync multiple offers |
| OFFER-10 | Offer template apply | E2E | Use template for new offer |
| OFFER-11 | API: Create offer | Integration | POST /api/offers |
| OFFER-12 | API: Update offer | Integration | PUT /api/offers/:id |
| OFFER-13 | API: Push offer | Integration | POST /api/offers/:id/push |
| OFFER-14 | Price inheritance | Unit | Null = inherit from product |
| OFFER-15 | Multi-marketplace offers | Integration | Same product, different offers |

---

### Suite 5: Order Management (ORDER)

**Owner**: Cătălin-ORDER  
**Priority**: 🔴 Critical  
**Tests**: 18

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| ORDER-01 | View orders list | E2E | Orders table loads |
| ORDER-02 | Order details page | E2E | View single order |
| ORDER-03 | Order status change | E2E | Update order status |
| ORDER-04 | Order status history | E2E | View status timeline |
| ORDER-05 | Add order notes | E2E | Internal notes |
| ORDER-06 | Order search | E2E | Search by order number |
| ORDER-07 | Order filters | E2E | Filter by status, date, source |
| ORDER-08 | Order export CSV | E2E | Export orders |
| ORDER-09 | Order from eMAG | Integration | Import eMAG order |
| ORDER-10 | Order from Trendyol | Integration | Import Trendyol order |
| ORDER-11 | Order items display | E2E | Line items, quantities |
| ORDER-12 | Customer linkage | E2E | Order linked to customer |
| ORDER-13 | API: Get orders | Integration | GET /api/orders |
| ORDER-14 | API: Update order | Integration | PUT /api/orders/:id |
| ORDER-15 | API: Order status | Integration | POST /api/orders/:id/status |
| ORDER-16 | Order number uniqueness | Unit | Unique per tenant |
| ORDER-17 | Multi-tenant order isolation | Integration | Can't see other tenant orders |
| ORDER-18 | Order total calculation | Unit | Sum of line items |

---

### Suite 6: Customer Management (CUST)

**Owner**: Cătălin-CUST  
**Priority**: 🟡 Medium  
**Tests**: 10

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| CUST-01 | View customers list | E2E | Customers table |
| CUST-02 | Create customer | E2E | Add new customer |
| CUST-03 | Edit customer | E2E | Update customer details |
| CUST-04 | Delete customer | E2E | Delete with confirmation |
| CUST-05 | Customer search | E2E | Search by email/name |
| CUST-06 | Customer orders | E2E | View customer's orders |
| CUST-07 | Customer details | E2E | Full profile view |
| CUST-08 | API: Get customers | Integration | GET /api/customers |
| CUST-09 | API: Create customer | Integration | POST /api/customers |
| CUST-10 | Duplicate email error | Unit | Email unique per tenant |

---

### Suite 7: Plugin Configuration (PLUGIN)

**Owner**: Cătălin-PLUGIN  
**Priority**: 🔴 High  
**Tests**: 15

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| PLUGIN-01 | View plugins list | E2E | Available plugins |
| PLUGIN-02 | Configure eMAG plugin | E2E | API keys setup |
| PLUGIN-03 | Configure Trendyol plugin | E2E | API keys setup |
| PLUGIN-04 | Configure FGO plugin | E2E | API keys setup |
| PLUGIN-05 | Enable/disable plugin | E2E | Toggle plugin active |
| PLUGIN-06 | Plugin connection test | E2E | Test API credentials |
| PLUGIN-07 | Plugin sync trigger | E2E | Manual sync button |
| PLUGIN-08 | Plugin sync status | E2E | Last sync time display |
| PLUGIN-09 | Plugin error display | E2E | Show connection errors |
| PLUGIN-10 | API: Get plugins | Integration | GET /api/plugins |
| PLUGIN-11 | API: Update plugin config | Integration | PUT /api/plugins/:id |
| PLUGIN-12 | API: Test connection | Integration | POST /api/plugins/:id/test |
| PLUGIN-13 | API: Trigger sync | Integration | POST /api/plugins/:id/sync |
| PLUGIN-14 | Plugin credentials encryption | Unit | API keys encrypted |
| PLUGIN-15 | Plugin sync job (BullMQ) | Integration | Background job runs |

---

### Suite 8: Pricing Rules (PRICE)

**Owner**: Cătălin-PRICE  
**Priority**: 🟡 Medium  
**Tests**: 10

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| PRICE-01 | View pricing rules | E2E | Rules list |
| PRICE-02 | Create pricing rule | E2E | Add new rule |
| PRICE-03 | Edit pricing rule | E2E | Update rule |
| PRICE-04 | Delete pricing rule | E2E | Delete rule |
| PRICE-05 | PERCENTAGE_ABOVE rule | Unit | Price + X% |
| PRICE-06 | FIXED_ABOVE rule | Unit | Price + X RON |
| PRICE-07 | FIXED_PRICE rule | Unit | Fixed price |
| PRICE-08 | Rule per marketplace | Integration | Different rules per plugin |
| PRICE-09 | Rule priority | Unit | Multiple rules conflict |
| PRICE-10 | API: Pricing rules CRUD | Integration | All endpoints |

---

### Suite 9: Offer Templates (TEMPLATE)

**Owner**: Cătălin-TEMPLATE  
**Priority**: 🟡 Medium  
**Tests**: 8

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| TEMPLATE-01 | View templates | E2E | Templates list |
| TEMPLATE-02 | Create template | E2E | New template form |
| TEMPLATE-03 | Edit template | E2E | Update template |
| TEMPLATE-04 | Delete template | E2E | Delete template |
| TEMPLATE-05 | Apply template to offer | E2E | Use template |
| TEMPLATE-06 | Template variables | Unit | {name}, {sku} substitution |
| TEMPLATE-07 | Template per marketplace | Integration | Templates per plugin |
| TEMPLATE-08 | API: Templates CRUD | Integration | All endpoints |

---

### Suite 10: Multi-Tenancy & Security (SECURITY)

**Owner**: Cătălin-SECURITY  
**Priority**: 🔴 Critical  
**Tests**: 12

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| SEC-01 | Tenant isolation - products | Integration | Tenant A can't see Tenant B products |
| SEC-02 | Tenant isolation - orders | Integration | Tenant A can't see Tenant B orders |
| SEC-03 | Tenant isolation - customers | Integration | Tenant A can't see Tenant B customers |
| SEC-04 | Auth required - API | Integration | 401 without token |
| SEC-05 | Auth required - routes | E2E | Redirect to login |
| SEC-06 | Role-based access | Integration | ADMIN vs USER roles |
| SEC-07 | CSRF protection | Integration | CSRF tokens |
| SEC-08 | Rate limiting | Integration | API rate limits |
| SEC-09 | SQL injection prevention | Integration | Input sanitization |
| SEC-10 | XSS prevention | Integration | Output encoding |
| SEC-11 | Activity logging | Integration | All actions logged |
| SEC-12 | Data encryption at rest | Unit | Sensitive data encrypted |

---

### Suite 11: Performance & Load (PERF)

**Owner**: Cătălin-PERF  
**Priority**: 🟡 Medium  
**Tests**: 8

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| PERF-01 | Homepage load time | Performance | < 2 seconds |
| PERF-02 | Dashboard load time | Performance | < 3 seconds |
| PERF-03 | Products list (1000 items) | Performance | Pagination works |
| PERF-04 | Orders list (10000 items) | Performance | Pagination + filters |
| PERF-05 | Product sync (10k products) | Performance | BullMQ job completes |
| PERF-06 | API response time | Performance | p95 < 500ms |
| PERF-07 | Concurrent users (100) | Load | No degradation |
| PERF-08 | Memory usage | Performance | No memory leaks |

---

### Suite 12: Smoke Tests (Pre-Push) (SMOKE)

**Owner**: Cătălin-SMOKE  
**Priority**: 🔴 Critical (Gatekeeper)  
**Tests**: 10

**These tests run before EVERY push to GitHub**

| ID | Test Name | Type | Description |
|----|-----------|------|-------------|
| SMOKE-01 | Homepage loads | E2E | / returns 200 |
| SMOKE-02 | Login page loads | E2E | /login returns 200 |
| SMOKE-03 | Register page loads | E2E | /register returns 200 |
| SMOKE-04 | Login with valid creds | E2E | Successful login |
| SMOKE-05 | Dashboard loads after login | E2E | Redirect works |
| SMOKE-06 | Products page loads | E2E | /products returns 200 |
| SMOKE-07 | Orders page loads | E2E | /orders returns 200 |
| SMOKE-08 | API health check | Integration | GET /api/health |
| SMOKE-09 | Database connection | Integration | Can query database |
| SMOKE-10 | No console errors | E2E | Clean browser console |

---

## 🚀 Execution Strategy

### Pre-Push (Local)

```bash
# Run smoke tests before every push
npm run test:smoke

# Must pass before push allowed
```

### CI/CD (GitHub Actions)

```yaml
# On push to dev:
- Run all unit tests
- Run all integration tests
- Run E2E tests (parallel)
- Generate coverage report
- Block merge if tests fail

# On push to main:
- All above +
- Performance tests
- Security scan
```

### Daily (Scheduled)

```bash
# Run full test suite daily at 3 AM UTC
- All E2E tests
- All integration tests
- Performance benchmarks
- Generate daily report
```

---

## 📊 Reporting

### Test Report Format

```markdown
# Test Run Report - [Date]

## Summary
- Total: X tests
- Passed: Y
- Failed: Z
- Skipped: W
- Duration: X min

## Failed Tests
| Test ID | Name | Error | Screenshot |
|---------|------|-------|------------|
| ... | ... | ... | ... |

## Coverage
- Backend: X%
- Frontend: Y%
- Overall: Z%

## Recommendations
- ...
```

---

## 🎯 Success Criteria

| Criteria | Target |
|----------|--------|
| Smoke tests pass rate | 100% (blocker) |
| Critical tests pass rate | 95%+ |
| Overall test pass rate | 90%+ |
| Code coverage | 80%+ backend, 60%+ frontend |
| E2E test duration | < 30 minutes (full suite) |
| False positive rate | < 2% |

---

## 📁 Related Documents

- `/qa-suite/README.md` - QA documentation
- `/qa-suite/playwright.config.ts` - Playwright config
- `/docs/plugin-integrations/` - Plugin API docs
- `/backend/prisma/schema.prisma` - Database schema

---

**Last Updated**: 2026-04-01  
**Next Review**: After each major feature release
