# 🎨 Design References - OpenSales Homepage

**Created**: 2026-04-01  
**Author**: Andrei (UX Designer)  
**Purpose**: Moodboard & design patterns for OpenSales homepage

---

## 📚 Reference Sites Analyzed

### 1. Stripe.com - Gold Standard for SaaS
**URL**: https://stripe.com

#### What Works:
- **Hero Section**: Clean headline + subheadline hierarchy, dual CTAs (primary + secondary)
- **Stats Bar**: Large numbers with context ("135+ currencies", "$1.9T volume", "99.999% uptime")
- **Social Proof**: Customer logos + testimonials with specific quotes
- **Gradient Accents**: Subtle purple/blue gradients on buttons and highlights
- **Whitespace**: Generous padding between sections (80-120px)
- **Typography**: Clear hierarchy - large headlines (48-64px), readable body (16-18px)

#### Key Takeaways for OpenSales:
```
✅ Stats should be BIG and specific (not vague)
✅ Use gradient on primary CTA only
✅ Customer testimonials add credibility (even if just stats for now)
✅ Section spacing: 96px desktop, 64px mobile
```

---

### 2. Linear.app - Premium Dark Theme
**URL**: https://linear.app

#### What Works:
- **Dark Background**: Not pure black - uses #0A0A0F to #121217 range
- **Text Hierarchy**: 
  - Headlines: White (#FFFFFF)
  - Subheadlines: Light gray (#A1A1AA)
  - Body: Medium gray (#71717A)
- **Gradient Borders**: Subtle gradient strokes on cards (blue → violet)
- **Glassmorphism**: Slight transparency on nav/sticky elements
- **Micro-interactions**: Hover states with subtle lift + glow
- **Feature Grid**: 3-column layout with icon + title + description

#### Key Takeaways for OpenSales:
```
✅ Background: #0A0A0F (base), #121217 (cards)
✅ Text: #FFFFFF (primary), #A1A1AA (secondary), #71717A (tertiary)
✅ Accent gradient: #6366F1 (indigo) → #8B5CF6 (violet)
✅ Card border: 1px solid with 10-15% opacity gradient
✅ Hover: translateY(-2px) + subtle shadow
```

---

### 3. Raycast.com - Clean Layout
**URL**: https://raycast.com

#### What Works:
- **Hero Copy**: Emotional benefit ("feeling like you're never wasting time")
- **Visual Flow**: Keyboard visualization → features → testimonials → CTA
- **Feature Cards**: Clean icons, short descriptions, consistent spacing
- **Testimonial Grid**: Real people with photos + titles + specific quotes
- **CTA Repetition**: Multiple CTAs throughout page (not just hero)
- **Simple Color Palette**: Black/white + one accent color

#### Key Takeaways for OpenSales:
```
✅ Headline should focus on OUTCOME not features
✅ Repeat CTA at hero + mid-page + bottom
✅ Testimonials: use stats if no customers yet ("2k+ orders/min")
✅ Icon size: 48px for feature cards
✅ Card padding: 32px consistent
```

---

### 4. Supermetrics.com - B2B SaaS Pricing
**URL**: https://supermetrics.com

#### What Works:
- **Pricing Cards**: Clear tier names, prominent prices, feature checkmarks
- **Comparison Table**: Easy to scan what's included in each plan
- **Enterprise CTA**: "Contact Sales" for custom pricing (not just a number)
- **Trust Signals**: "200,000+ companies" logo wall
- **Free Trial**: Clear trial period mentioned (14 days)

#### Key Takeaways for OpenSales:
```
✅ 4 pricing tiers: Free, Starter (€29), Pro (€79), Enterprise (Custom)
✅ Highlight recommended tier with border/badge
✅ Feature list: checkmarks for included, gray for excluded
✅ Trial period visible on all CTAs
✅ Enterprise = "Contact Sales" not fixed price
```

---

## 🎨 Moodboard Summary

### Color Palette (Dark Theme)
```
Backgrounds:
- Base: #0A0A0F (near black with blue tint)
- Surface: #121217 (cards, sections)
- Elevated: #1A1A24 (hover states)

Text:
- Primary: #FFFFFF (100% opacity)
- Secondary: #A1A1AA (70% opacity)
- Tertiary: #71717A (50% opacity)
- Muted: #52525B (30% opacity)

Accents:
- Primary Gradient: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)
- Primary Solid: #6366F1 (indigo-500)
- Primary Hover: #4F46E5 (indigo-600)
- Success: #10B981 (emerald-500)
- Warning: #F59E0B (amber-500)

Borders:
- Subtle: rgba(255, 255, 255, 0.08)
- Medium: rgba(255, 255, 255, 0.12)
- Strong: rgba(255, 255, 255, 0.20)
```

### Typography Scale
```
Headlines:
- Hero: 64px / 72px line-height / 700 weight (desktop)
- Hero: 40px / 48px line-height / 700 weight (mobile)
- Section: 48px / 56px line-height / 600 weight
- Subsection: 32px / 40px line-height / 600 weight
- Card Title: 20px / 28px line-height / 600 weight

Body:
- Large: 18px / 28px line-height / 400 weight
- Base: 16px / 24px line-height / 400 weight
- Small: 14px / 20px line-height / 400 weight
- Tiny: 12px / 16px line-height / 400 weight

Font Family: Inter (or system sans-serif fallback)
```

### Spacing Scale (Tailwind-based)
```
Section padding: py-24 (96px) desktop, py-16 (64px) mobile
Card padding: p-8 (32px)
Gap between cards: gap-6 (24px) or gap-8 (32px)
Container max-width: max-w-7xl (1280px)
Horizontal padding: px-6 (24px) mobile, px-12 (48px) desktop
```

### Button Styles
```
Primary:
- Background: gradient(135deg, #6366F1 → #8B5CF6)
- Text: #FFFFFF
- Padding: 14px 32px (md), 16px 40px (lg)
- Border-radius: 8px
- Font: 16px / 600 weight
- Hover: brightness-110 + subtle shadow

Secondary:
- Background: transparent
- Border: 1px solid rgba(255,255,255,0.2)
- Text: #FFFFFF
- Padding: same as primary
- Hover: background rgba(255,255,255,0.05)
```

### Card Styles
```
Background: #121217
Border: 1px solid rgba(255,255,255,0.08)
Border-radius: 12px
Padding: 32px
Shadow: 0 4px 6px -1px rgba(0,0,0,0.3)
Hover: 
  - Border: rgba(255,255,255,0.15)
  - Transform: translateY(-2px)
  - Shadow: 0 10px 15px -3px rgba(0,0,0,0.4)
```

---

## 📐 Layout Structure

### Homepage Flow (Desktop)
```
┌─────────────────────────────────────────┐
│            NAVIGATION                   │
│  Logo | Features | Pricing | [Login]    │
├─────────────────────────────────────────┤
│                                         │
│              HERO SECTION               │
│         Headline (64px, centered)       │
│       Subheadline (20px, centered)      │
│      [Primary CTA] [Secondary CTA]      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│              STATS BAR                  │
│   [99.9% Uptime]  [2k+ Orders/min]      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│            FEATURES SECTION             │
│     Section Title (48px, centered)      │
│                                         │
│  [Card 1]  [Card 2]  [Card 3]  [Card 4] │
│  Marketplace  Orders   Pricing  Analytics│
│                                         │
├─────────────────────────────────────────┤
│                                         │
│             PRICING SECTION             │
│     Section Title (48px, centered)      │
│                                         │
│  [Free] [Starter*] [Pro] [Enterprise]   │
│   €0     €29/mo   €79/mo    Custom      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│              FINAL CTA                  │
│   "Începe acum - 14 zile trial gratuit" │
│           [Primary CTA]                 │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│               FOOTER                    │
│  Logo | Links | Contact | Legal         │
│                                         │
└─────────────────────────────────────────┘
```

### Mobile Adaptations
- Stack all cards vertically (1 column)
- Reduce headline sizes by ~40%
- Reduce section padding from 96px to 64px
- Full-width buttons (px-4 left/right)
- Hamburger menu for navigation

---

## ✨ Micro-interactions

### Hover States
```css
/* Card hover */
.card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.15);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4);
}

/* Button hover */
.btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Link hover */
.link:hover {
  color: #6366F1;
  text-decoration: underline;
}
```

### Scroll Animations (Framer Motion)
```
- Fade in + slide up (20px) for sections
- Stagger children (100ms delay between cards)
- Duration: 0.5s ease-out
- Trigger: when 20% visible in viewport
```

---

## 🎯 Next Steps

1. ✅ **Research Complete** - References analyzed
2. ⏳ **Wireframe** - Create low-fidelity layout
3. ⏳ **Design System** - Document all tokens
4. ⏳ **High-Fidelity Mockups** - Full visual design
5. ⏳ **Component Specs** - Developer handoff

---

**References Saved**: 2026-04-01  
**Next**: Wireframe low-fidelity structure
