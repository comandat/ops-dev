# Team Access - OpenSales

## 📧 Email (AgentMail)

### Radu (Developer)
- **Email**: radu@agentmail.to
- **API Key**: Configurat în OpenClaw config
- **Setup**: `npx clawhub@latest install agentmail`
- **Status**: ✅ Ready

Radu poate primi emailuri cu notificări de deploy, PR-uri, și update-uri de la echipă.

## 🔐 GitHub

### Bogdan (PM)
- **Token**: GitHub Personal Access Token configurat
- **Permissions**: repo, workflow, read:org
- **Repo**: https://github.com/comandat/ops-dev
- **Branch**: dev (toate dezvoltările)
- **Status**: ✅ Ready

### Radu (Developer)
- **Access**: Needs invite la repository
- **Action**: Bogdan să invite Radu ca collaborator pe ops-dev

## 🚂 Railway

### Proiect: responsible-nature
- **Environment**: Development
- **Frontend**: https://frontend-development-39d3.up.railway.app
- **Invite Link**: https://railway.com/invite/zrn8XSzDIiR
- **Status**: ✅ Invite generat

**Pași pentru Radu:**
1. Click pe link-ul de invite de mai sus
2. Acceptă invite-ul (login cu GitHub)
3. Va avea acces automat la proiectul "responsible-nature"

## 📋 Checklist Onboarding Radu

- [ ] GitHub invite la ops-dev repo
- [ ] Railway invite la proiectul "responsible-nature"
- [ ] Email access verificat (radu@agentmail.to)
- [ ] Local setup: `docker compose -f docker-compose.saas.yml up`
- [ ] Branch checkout: `git checkout dev`
