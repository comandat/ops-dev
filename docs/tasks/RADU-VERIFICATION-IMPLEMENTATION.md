# 🔧 Radu - Email Verification + Remember Me Implementation

**Project**: OpenSales Improvement #2  
**Priority**: 🔴 HIGH (User requested)  
**ETA**: Day 1-2 (8-12 hours)

---

## 📋 Overview

**Two Features**:
1. **Remember Last Login** - Pre-fill email + "Remember Me" checkbox
2. **Email Verification** - 6-digit code before account activation

---

## 🎯 Task List

### Phase 1: Database Setup (1 hour)

**Task 1.1**: Update Prisma Schema
```prisma
// schema.prisma

model User {
  // ... existing fields
  isVerified Boolean @default(false)
  verificationCodes VerificationCode[]
}

model VerificationCode {
  id        String   @id @default(cuid())
  userId    String
  code      String   // 6-digit code
  expiresAt DateTime
  isUsed    Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isUsed])
}
```

**Acțiuni**:
- [ ] Editează `/backend/prisma/schema.prisma`
- [ ] Run migration: `npx prisma migrate dev --name add_email_verification`
- [ ] Run generate: `npx prisma generate`
- [ ] Commit migration file

**Acceptance Criteria**:
- Migration created successfully
- Database updated cu noi câmpuri
- No errors la `prisma generate`

---

### Phase 2: Backend Implementation (3-4 hours)

**Task 2.1**: Create Verification Service
**File**: `/backend/src/auth/verification.service.ts`

**Acțiuni**:
- [ ] Create service with methods:
  - `generateCode(): string` - 6-digit random code
  - `sendVerificationEmail(email: string, code: string): Promise<void>` - Send email
  - `createVerificationCode(userId: string): Promise<VerificationCode>` - Save to DB
  - `verifyCode(userId: string, code: string): Promise<boolean>` - Validate code
  - `isCodeExpired(code: VerificationCode): boolean` - Check 15 min expiry

**Code Template**:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationCode } from '@prisma/client';

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    // Use AgentMail API or SMTP
    // Subject: "OpenSales - Cod de verificare"
    // Body: "Codul tău de verificare este: {code}. Expiră în 15 minute."
  }

  async createVerificationCode(userId: string): Promise<VerificationCode> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Invalidate previous unused codes
    await this.prisma.verificationCode.updateMany({
      where: { userId, isUsed: false },
      data: { isUsed: true },
    });

    return this.prisma.verificationCode.create({
      data: { userId, code, expiresAt },
    });
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: { userId, code, isUsed: false },
    });

    if (!verificationCode) return false;
    if (this.isCodeExpired(verificationCode)) return false;

    // Mark as used
    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { isUsed: true },
    });

    // Mark user as verified
    await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    return true;
  }

  isCodeExpired(code: VerificationCode): boolean {
    return new Date() > code.expiresAt;
  }
}
```

**Acceptance Criteria**:
- Service created with all methods
- Code generation works (6 digits)
- Email sending works (test with AgentMail)
- Code validation works

---

**Task 2.2**: Create Verification Controller
**File**: `/backend/src/auth/verification.controller.ts`

**Acțiuni**:
- [ ] Create controller with endpoints:
  - `POST /auth/send-verification-code` - Send code to email
  - `POST /auth/verify-code` - Verify code and activate account
  - `POST /auth/resend-code` - Resend code (rate limited: 3/hour)

**Code Template**:
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class VerificationController {
  constructor(
    private verificationService: VerificationService,
    private authService: AuthService,
  ) {}

  @Post('send-verification-code')
  @HttpCode(HttpStatus.OK)
  async sendVerificationCode(@Body() body: { email: string }) {
    const user = await this.authService.findUserByEmail(body.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const verificationCode = await this.verificationService.createVerificationCode(user.id);
    await this.verificationService.sendVerificationEmail(user.email, verificationCode.code);

    return { success: true, message: 'Cod de verificare trimis pe email' };
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() body: { email: string; code: string }) {
    const user = await this.authService.findUserByEmail(body.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isValid = await this.verificationService.verifyCode(user.id, body.code);
    if (!isValid) {
      throw new BadRequestException('Cod invalid sau expirat');
    }

    return { success: true, message: 'Cont verificat cu succes' };
  }

  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  async resendCode(@Body() body: { email: string }) {
    // Add rate limiting logic here (max 3/hour)
    const user = await this.authService.findUserByEmail(body.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const verificationCode = await this.verificationService.createVerificationCode(user.id);
    await this.verificationService.sendVerificationEmail(user.email, verificationCode.code);

    return { success: true, message: 'Cod retrimis pe email' };
  }
}
```

**Acceptance Criteria**:
- All 3 endpoints working
- Proper error handling
- Rate limiting on resend (optional v1)

---

**Task 2.3**: Update Auth Controller (Login Flow)
**File**: `/backend/src/auth/auth.controller.ts`

**Acțiuni**:
- [ ] Update login endpoint to check `isVerified`:
```typescript
@Post('login')
async login(@Body() body: { email: string; password: string }) {
  const user = await this.authService.validateUser(body.email, body.password);
  
  if (!user.isVerified) {
    // Send verification code automatically
    const verificationCode = await this.verificationService.createVerificationCode(user.id);
    await this.verificationService.sendVerificationEmail(user.email, verificationCode.code);
    
    throw new UnauthorizedException('Cont nevalidat. Verifică email-ul.');
  }

  // Continue with normal login...
}
```

**Acceptance Criteria**:
- Login blocked for unverified users
- Verification code sent automatically on login attempt

---

### Phase 3: Frontend Implementation (3-4 hours)

**Task 3.1**: Update Login Page (Remember Me)
**File**: `/frontend/src/app/login/page.tsx`

**Acțiuni**:
- [ ] Add localStorage logic:
  - On login success: Save email to localStorage
  - On page load: Read email from localStorage, pre-fill input
  - On logout: Clear localStorage
- [ ] Add "Remember Me" checkbox (optional 30-day session)
- [ ] Add "Last used" label under email input

**Code Snippet**:
```tsx
// On page load
useEffect(() => {
  const lastEmail = localStorage.getItem('lastLoginEmail');
  if (lastEmail) {
    setEmail(lastEmail);
  }
}, []);

// On login success
const handleLogin = async () => {
  await login(email, password);
  localStorage.setItem('lastLoginEmail', email);
};

// On logout
const handleLogout = () => {
  localStorage.removeItem('lastLoginEmail');
  logout();
};
```

**Acceptance Criteria**:
- Email pre-filled on return visit
- Checkbox "Ține-mă minte" funcțional
- Logout clears stored email

---

**Task 3.2**: Create Verification Page
**File**: `/frontend/src/app/verify/page.tsx`

**Acțiuni**:
- [ ] Create new page with:
  - Email display (masked: `n***@companie.ro`)
  - 6-digit code input (auto-focus, numeric only)
  - Countdown timer (15:00 → 00:00)
  - "Retrimite codul" button (disabled 60 sec after send)
  - "Înapoi la login" link

**UI Mockup**:
```tsx
<div className="min-h-screen bg-slate-950 flex items-center justify-center">
  <div className="bg-slate-900 p-8 rounded-lg max-w-md w-full">
    <h1 className="text-2xl font-bold text-white mb-2">Verifică Email-ul</h1>
    <p className="text-slate-400 mb-6">
      Am trimis un cod de verificare la: <strong>n***@companie.ro</strong>
    </p>

    <input
      type="text"
      maxLength={6}
      placeholder="000000"
      className="w-full text-center text-2xl tracking-widest mb-4"
    />

    <div className="text-center text-3xl font-mono text-indigo-400 mb-6">
      {timeRemaining}
    </div>

    <button
      onClick={handleVerify}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
    >
      Verifică Contul
    </button>

    <button
      onClick={handleResend}
      disabled={resendDisabled}
      className="w-full mt-4 text-slate-400 hover:text-white disabled:opacity-50"
    >
      {resendDisabled ? `Resend în ${resendTimer}s` : 'Retrimite codul'}
    </button>

    <Link href="/login" className="block text-center mt-6 text-slate-400 hover:text-white">
      Înapoi la login
    </Link>
  </div>
</div>
```

**Acceptance Criteria**:
- Page renders correctly
- Code input works (6 digits)
- Timer counts down from 15:00
- Resend button works (with 60s cooldown)
- Verification API call on submit

---

**Task 3.3**: Update Register Page
**File**: `/frontend/src/app/register/page.tsx`

**Acțiuni**:
- [ ] After registration success → redirect to `/verify?email=...`
- [ ] Show message: "Verifică email-ul pentru a continua"

**Acceptance Criteria**:
- Register flow includes verification step
- Auto-redirect to verify page

---

### Phase 4: Testing & Deploy (2 hours)

**Task 4.1**: Local Testing
**Acțiuni**:
- [ ] Testează register → verify code → login
- [ ] Testează login cu cont nevalidat → primești cod
- [ ] Testează remember me (logout → login → pre-fill)
- [ ] Testează code expiry (așteaptă 15 min)
- [ ] Testează resend code

**Acceptance Criteria**:
- Toate fluxurile funcționează
- No console errors
- Emailuri primite corect

---

**Task 4.2**: Deploy pe Railway
**Acțiuni**:
- [ ] Commit toate fișierele
- [ ] Push pe dev branch
- [ ] Verifică deploy pe Railway
- [ ] Testează pe live URL

**Acceptance Criteria**:
- Deploy successful
- Live testing works

---

## 📁 Files Summary

### New Files:
- `/backend/src/auth/verification.service.ts`
- `/backend/src/auth/verification.controller.ts`
- `/frontend/src/app/verify/page.tsx`
- `/frontend/src/components/auth/VerificationForm.tsx` (optional)

### Modified Files:
- `/backend/prisma/schema.prisma`
- `/backend/src/auth/auth.controller.ts`
- `/frontend/src/app/login/page.tsx`
- `/frontend/src/app/register/page.tsx`

---

## 🎯 Deliverables

- [ ] Database migration created + applied
- [ ] Backend verification service + controller
- [ ] Frontend verification page
- [ ] Remember me functionality
- [ ] Full flow tested locally
- [ ] Deployed pe Railway (dev)

---

**Start**: ASAP  
**ETA**: 8-12 hours  
**Status**: 🟡 Ready to start
