# M-Resume Builder Project Plan

## 1. Project Overview
Build a modern resume builder using **Next.js** with:
- Anonymous + authenticated resume creation
- Multiple templates
- PDF + DOCX export
- Shareable public/private links
- Admin analytics and moderation
- Full light/dark mode support across every page (no page left unthemed)

Tech constraints:
- Frontend: Next.js + Tailwind + Framer Motion
- Backend DB: MySQL
- Secrets (MySQL/email credentials) must stay server-side only
- Architecture must support heavy traffic and future ad integrations

---

## 2. Core Tech Stack
- **Framework**: Next.js (App Router, TypeScript)
- **UI**: Tailwind CSS, Framer Motion
- **Drag/Drop**: dnd-kit
- **Database**: MySQL + Prisma ORM
- **Auth**: NextAuth (credentials + optional providers)
- **Export**:
  - PDF: `html2canvas` + `jsPDF`
  - DOCX: `docx`
- **Email**: Nodemailer
- **Validation/Security**: Zod, rate limiting, captcha, password hashing
- **Scalability**: Redis caching + queue workers + CDN-ready asset strategy
- **Ads (Future)**: Ad slots with consent-aware loading and Core Web Vitals-safe rendering

---

## 3. Implementation Phases

### Phase Status (Updated: 2026-03-15)
- `Phase 1: Foundation` -> `Completed`
- `Phase 2: Auth + User Management` -> `Completed`
- `Phase 3: Resume Builder Engine` -> `Completed`
- `Phase 4: Templates System` -> `Completed`
- `Phase 5: Export System` -> `Pending`
- `Phase 6: Sharing + Privacy` -> `Pending`
- `Phase 7: Dashboard + Admin Panel` -> `In Progress` (route scaffolds + protection done; feature modules pending)
- `Phase 8: Logging, Legal, Performance` -> `In Progress` (base production/security config done; logs/legal/perf modules pending)
- `Phase 9: Traffic Scaling + Ads Readiness` -> `Planned` (strategy documented, implementation pending)

### Phase 1: Foundation
1. Initialize Next.js project with TypeScript + Tailwind.
2. Setup Prisma with MySQL.
3. Configure environment files.
4. Setup linting/formatting and base folder structure.
5. Add production-grade app config for caching, compression, and observability hooks.
6. Implement global theme system (light/dark) with persistent user preference.

### Phase 2: Auth + User Management
1. Implement login/signup and role system (`user`, `admin`).
2. Add anonymous mode (browser draft only).
3. Enforce max 2 resumes per authenticated user.
4. Add OTP verification and password reset flow.

### Phase 3: Resume Builder Engine
1. Build section-based editor (add, remove, reorder, inline edit).
2. Add sticky toolbar, theme controls, and profile photo upload.
3. Implement real-time preview and auto-save.
4. Include required sections:
   - Personal Info, Summary, Skills, Experience, Education,
   - Projects, Certifications, Languages, Achievements, Social Links.

### Phase 4: Templates System
1. Define template schema (`JSON + layout component`).
2. Implement 6 templates:
   - Modern, Professional, Minimal, Creative, Corporate, ATS Friendly.
3. Add template switching in editor.

### Phase 5: Export System
1. Implement A4 print-ready PDF export.
2. Implement editable DOCX export.
3. Add export activity logs.

### Phase 6: Sharing + Privacy
1. Shareable URLs (`/r/[username]/[resumeId]` and `/resume/[slug]`).
2. Visibility controls: Public / Private / Link-only.
3. Password-protected resume viewer (store hashed password only).
4. SEO metadata for public resumes.

### Phase 7: Dashboard + Admin Panel
1. User dashboard: list/edit/delete resumes and profile settings.
2. Admin dashboard (`/admin`):
   - total users, total resumes, public resumes,
   - traffic trends, top countries.
3. Resume moderation tools.
4. Newsletter send panel.

### Phase 8: Logging, Legal, Performance
1. Activity logs for login/create/edit/export/anonymous usage.
2. Legal pages: Privacy, Terms, Disclaimer, Contact, About.
3. Performance optimization: lazy load, caching, image optimization.
4. Final QA for mobile + export compatibility.

### Phase 9: Traffic Scaling + Ads Readiness
1. Add Redis for:
   - hot resume cache,
   - rate limiting counters,
   - short-lived share view/session metadata.
2. Add background jobs for email, analytics aggregation, and heavy tasks.
3. Configure CDN strategy for static assets and public resume pages.
4. Add DB scaling strategy:
   - proper indexes,
   - read replica ready architecture,
   - query performance monitoring.
5. Add ads architecture (future toggle):
   - defined ad slots in layout,
   - lazy ad loading after core content,
   - consent/region-aware ad initialization,
   - strict script isolation to protect editor performance.

---

## 4. Database (High-Level)
Main tables:
- `users`
- `resumes`
- `resume_sections`
- `resume_templates`
- `resume_shares`
- `resume_views`
- `activity_logs`
- `newsletter_subscribers`
- `otp_tokens`
- `password_resets`
- `ad_impressions` (future)
- `ad_clicks` (future)

---

## 5. Security Rules (Must Follow)
1. Never expose DB/email credentials in frontend code.
2. Keep secrets only in server env vars:
   - `DATABASE_URL`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
3. Never use `NEXT_PUBLIC_` for secrets.
4. Database and mail calls only in server-side code (`route handlers`, `server actions`, `lib/server`).
5. Hash all passwords and resume protection passwords.
6. Apply input validation, XSS protection, rate limiting, and captcha.

---

## 6. Suggested Folder Structure
```txt
src/
  app/
    (public)/
    (auth)/
    dashboard/
    admin/
    api/
  components/
    builder/
    templates/
    ui/
  lib/
    server/
    client/
  features/
    auth/
    resumes/
    export/
    sharing/
    admin/
  prisma/
```

---

## 7. MVP Scope (First Release)
- Auth + anonymous mode
- Resume editor with core sections
- 2 templates initially (expand to 6 after MVP)
- PDF export
- Shareable public/link-only resume
- Basic dashboard

Then expand to DOCX, admin analytics, newsletter, and advanced moderation.

---

## 8. High Traffic Strategy (Non-Negotiable)
1. Use server-side pagination for dashboards and admin tables.
2. Cache frequently accessed public resume pages.
3. Add queue-based processing for non-blocking tasks (emails/log aggregation/newsletter).
4. Add structured logging and monitoring (error rate, slow queries, API latency).
5. Keep routes stateless for horizontal scaling.

---

## 10. UI Consistency Rule (Non-Negotiable)
1. Every page and major component must support both light and dark mode.
2. Theme preference must persist per user/browser.
3. New pages cannot be merged without dark/light visual QA on mobile and desktop.

---

## 9. Ads Integration Strategy (Future-Proof)
1. Ads should never block resume editor interactions.
2. Keep ad code in isolated client components with lazy loading.
3. Load ads only after consent checks and policy checks.
4. Preserve CLS/LCP budgets while adding ad units.
5. Add admin controls to enable/disable ad placements without redeploy.
