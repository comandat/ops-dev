# Railway MCP Setup - OpenSales Development

## Proiect Railway
- **Project Name**: responsible-nature
- **Environment**: Development
- **Frontend URL**: https://frontend-development-39d3.up.railway.app

## MCP Configuration

### Cursor / VS Code
Configurat în `.cursor/mcp.json` la nivel de workspace.

### Comenzi disponibile Railway MCP:
- `check-railway-status` - Verifică instalarea CLI și autentificarea
- `list-projects` - Listează toate proiectele
- `create-project-and-link` - Creează proiect nou
- `list-services` - Listează serviciile din proiect
- `link-service` - Link la un serviciu
- `deploy` - Deploy unui serviciu
- `deploy-template` - Deploy din template
- `create-environment` - Creează environment nou
- `link-environment` - Link la environment
- `list-variables` - Listează variabile de environment
- `set-variables` - Setează variabile
- `generate-domain` - Generează domeniu Railway
- `get-logs` - Log-uri serviciu

## Autentificare Necesară

Pentru a folosi Railway MCP, trebuie să fii autentificat:

```bash
# Rulează în terminal
railway login
```

Sau prin browser: https://railway.com/login

## Acces pentru Radu (Developer)

Radu are nevoie de acces la proiectul Railway pentru a putea face deploy. Pași:

1. Deschide https://railway.com
2. Mergi la proiectul "responsible-nature"
3. Settings → Members → Invite
4. Adaugă email-ul lui Radu cu permisiuni de Developer

## Development Workflow

1. **Branch**: Toate dezvoltările pe `dev` branch
2. **Push**: Git push pe `dev` → auto-deploy pe Railway Development
3. **Test**: Verifică pe frontend-development-39d3.up.railway.app
4. **QA**: Rulează testele din `qa-suite/`
5. **Production**: Doar după aprobare, merge pe `main`
