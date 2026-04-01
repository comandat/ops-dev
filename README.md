# OpenSales – SaaS Platform

Platformă SaaS multi-tenant pentru gestionarea vânzărilor pe marketplace-uri (eMAG, Trendyol, FGO etc.).

**Homepage**: https://frontend-development-39d3.up.railway.app (Development)

## Structura Proiectului

```
OpenSales/
├── backend/          # NestJS API (Serviciu Railway #1)
├── frontend/         # Next.js App (Serviciu Railway #2)
├── qa-suite/         # Teste E2E cu Playwright (rulare locală)
├── docs/             # Documentație plugin-uri și integrări
└── docker-compose.saas.yml
```

## Pornire Locală

### Backend
```bash
cd backend
npm ci
npx prisma generate
npx prisma db push
npm run start:dev
```

### Frontend
```bash
cd frontend
npm ci
npm run dev
```

Asigură-te că ai un fișier `backend/.env` cu:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/opensales
JWT_SECRET=your-secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Rulare cu Docker (local)

```bash
docker compose -f docker-compose.saas.yml up --build
```

## Teste

### Unit + Integration (Backend)
```bash
cd backend
npm ci
npm test
```

### E2E cu Playwright
```bash
cd qa-suite
npm ci
npx playwright test
```

> **Regulă:** Rulează testele înainte de fiecare `git push` pe `main`.

## 🧭 Team Access (Development)

- **Branch**: Toate dezvoltările pe `dev` branch
- **PM**: Bogdan (Lead Product Manager)
- **Dev**: Radu (radu@agentmail.to)
- **Railway Project**: responsible-nature (Development environment)

## Deploy pe Railway

Proiectul folosește **un singur repo GitHub** (monorepo) cu **2 servicii Railway separate**:

| Serviciu | Root Directory | Watch Path |
|----------|---------------|------------|
| Backend  | `backend/`    | `backend/**` |
| Frontend | `frontend/`   | `frontend/**` |

### Variabile de mediu Railway

**Backend:**
- `DATABASE_URL` – oferit de Railway PostgreSQL plugin
- `JWT_SECRET` – setează un secret puternic
- `REDIS_HOST` / `REDIS_PORT` – Railway Redis plugin
- `OPENSALES_MODE=saas`

**Frontend:**
- `NEXT_PUBLIC_API_URL` – URL-ul serviciului Backend Railway

## 🏠 Homepage (Marketing Site)

Homepage-ul de marketing este live pe `/` și include:
- **Hero Section** - Headline + CTA-uri către register/login
- **Stats Bar** - 99.9% uptime, 2k+ comenzi/minut
- **Features** - 4 cards (Marketplace Sync, Order Management, Pricing Automation, Analytics)
- **Pricing** - 4 tiers (Free, Starter €29, Pro €79, Enterprise Custom)
- **CTA Section** - Final call-to-action
- **Footer** - Links și informații legale

**Design**: Dark theme premium (inspirat de Linear.app + Stripe.com)  
**Responsive**: Mobile-first, testat pe 375px - 1920px  
**Performance**: Lighthouse >90 (target)

### Routes
```
/                 → Marketing homepage (public)
/dashboard        → Dashboard aplicație (auth required)
/login            → Login page
/register         → Register page
```

Documentație completă: `docs/DEPLOY.md`

---

## Plugin-uri

Documentația integrărilor externe se găsește în `docs/plugin-integrations/`:
- `emag/` – API eMAG Marketplace v4.5
- `trendyol/` – Documentație API Trendyol  
- `fgo/` – Specificații API FGO
