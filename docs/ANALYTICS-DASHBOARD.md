# Conversion Funnel Dashboard Template

**Platform**: Google Sheets / Notion  
**Owner**: Bogdan (PM)  
**Update Frequency**: Daily (auto via Plausible export) / Weekly (manual review)

---

## 📊 Google Sheets Template

### Sheet 1: Daily Metrics

| Date | Visitors | Unique Visitors | Page Views | CTA Clicks (Hero) | CTA Clicks (Footer) | Register Started | Register Completed | Email Verified | First Logins |
|------|----------|-----------------|------------|-------------------|---------------------|------------------|-------------------|----------------|--------------|
| 2026-04-01 | =PLAUSIBLE_VISITORS() | =PLAUSIBLE_UNIQUE() | =PLAUSIBLE_PAGEVIEWS() | =PLAUSIBLE_EVENT("cta_click", "hero") | =PLAUSIBLE_EVENT("cta_click", "footer") | =PLAUSIBLE_EVENT("register_started") | =PLAUSIBLE_EVENT("register_completed") | =PLAUSIBLE_EVENT("email_verified") | =PLAUSIBLE_EVENT("first_login") |
| 2026-04-02 | ... | ... | ... | ... | ... | ... | ... | ... | ... |

> **Note**: Google Sheets doesn't have native Plausible integration. Use one of:
> - Manual daily export from Plausible dashboard (copy/paste)
> - Plausible API + Google Apps Script (automated)
> - Notion database (alternative)

---

### Sheet 2: Conversion Rates (Auto-Calculated)

| Date | Visitor → Register | Register → Verified | Verified → Active (7d) | Overall Conversion |
|------|-------------------|---------------------|------------------------|-------------------|
| 2026-04-01 | =C2/B2*100 | =H2/G2*100 | =I2/H2*100 | =I2/B2*100 |
| 2026-04-02 | ... | ... | ... | ... |

**Target Benchmarks** (highlight in green if met):
- Visitor → Register: **5%+**
- Register → Verified: **80%+**
- Verified → Active (7d): **70%+**

---

### Sheet 3: Weekly Trends

| Week | Total Visitors | Total Registers | Total Verified | Total Active | Conv. Rate (V→R) | Conv. Rate (R→V) | Conv. Rate (V→A) |
|------|----------------|-----------------|----------------|--------------|------------------|------------------|------------------|
| W13 (Mar 30 - Apr 5) | =SUM(B2:B8) | =SUM(G2:G8) | =SUM(H2:H8) | =SUM(I2:I8) | =G9/B9*100 | =H9/G9*100 | =I9/H9*100 |
| W14 (Apr 6-12) | ... | ... | ... | ... | ... | ... | ... |

---

### Sheet 4: CTA Performance

| Week | Hero Primary Clicks | Hero Secondary Clicks | Footer Primary Clicks | Footer Secondary Clicks | Hero CTR | Footer CTR |
|------|---------------------|-----------------------|-----------------------|-------------------------|----------|------------|
| W13 | =PLAUSIBLE_EVENT("cta_click", "hero", "primary") | =PLAUSIBLE_EVENT("cta_click", "hero", "secondary") | =PLAUSIBLE_EVENT("cta_click", "footer", "primary") | =PLAUSIBLE_EVENT("cta_click", "footer", "secondary") | =(D2+E2)/B2*100 | =(F2+G2)/B2*100 |
| W14 | ... | ... | ... | ... | ... | ... |

---

## 📈 Charts to Create

### Chart 1: Daily Visitors Trend (Line Chart)
- **X-axis**: Date
- **Y-axis**: Visitors
- **Purpose**: Track traffic growth

### Chart 2: Conversion Funnel (Funnel Chart)
- **Stages**: Visitors → Registered → Verified → Active
- **Purpose**: Visualize drop-off points

### Chart 3: Weekly Conversion Rates (Multi-line Chart)
- **X-axis**: Week
- **Y-axis**: Conversion Rate %
- **Lines**: V→R, R→V, V→A
- **Purpose**: Track improvement over time

### Chart 4: CTA Click-Through Rates (Bar Chart)
- **X-axis**: Week
- **Y-axis**: CTR %
- **Bars**: Hero Primary, Hero Secondary, Footer Primary, Footer Secondary
- **Purpose**: Optimize CTA placement/copy

---

## 🤖 Automation Options

### Option A: Manual Export (Simple)
1. Go to Plausible dashboard
2. Export CSV for date range
3. Copy/paste into Google Sheets
4. Formulas auto-calculate

**Time**: 5 min/day

### Option B: Plausible API + Apps Script (Automated)
```javascript
// Google Apps Script example
function fetchPlausibleData() {
  const domain = 'opensales.ro';
  const apiKey = 'YOUR_API_KEY';
  const date = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd');
  
  const url = `https://plausible.io/api/v1/stats/breakdown?site_id=${domain}&period=day&date=${date}&property=event:name`;
  
  const options = {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  
  // Write to sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Daily Metrics');
  // ... write data logic
}
```

**Time**: 1-2 hours setup, then 0 min/day

### Option C: Notion Database (Alternative)
- Create Notion database with same structure
- Use Plausible API + Make.com/Zapier automation
- Better for team collaboration

---

## 📋 Weekly Review Template

### Meeting: Monday 10:00 AM (30 min)
**Attendees**: Bogdan (PM), Alex (Growth)

#### Agenda

1. **Review Last Week's Metrics** (10 min)
   - Total visitors vs target
   - Conversion rates vs benchmarks
   - Any significant changes?

2. **Identify Issues** (10 min)
   - Where is the biggest drop-off?
   - Any technical issues (tracking broken?)
   - External factors (holidays, marketing campaigns)?

3. **Decide on 1 Optimization Test** (10 min)
   - Hypothesis
   - Implementation plan
   - Success metric
   - Timeline

#### Meeting Notes Template

```markdown
## Week [X] Review - [Date]

### Metrics Summary
- Visitors: [X] ([+/-]% vs last week)
- Visitor → Register: [X]% (target: 5%+)
- Register → Verified: [X]% (target: 80%+)
- Verified → Active: [X]% (target: 70%+)

### Key Insights
- [Insight 1]
- [Insight 2]

### Optimization Test for This Week
- **Hypothesis**: [What we think will happen]
- **Change**: [What we're changing]
- **Metric**: [What we're measuring]
- **Owner**: [Who implements]
- **Review Date**: [When we check results]
```

---

## 🎯 Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Weekly Visitors | 500+ | TBD | 🟡 |
| Visitor → Register | 5%+ | TBD | 🟡 |
| Register → Verified | 80%+ | TBD | 🟡 |
| Verified → Active (7d) | 70%+ | TBD | 🟡 |

---

## 🔗 Resources

- **Plausible Dashboard**: https://plausible.io/opensales.ro
- **Plausible API Docs**: https://plausible.io/docs/api
- **Google Sheets Template**: [Link to be created]
- **Notion Dashboard**: [Link to be created]

---

**Last Updated**: 2026-04-01  
**Next Review**: 2026-04-08
