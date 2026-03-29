# M-Resume Builder

Next.js-based resume platform with anonymous + authenticated editing, template system, export, sharing, and admin tooling.

## Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma + MySQL
- NextAuth
- Framer Motion
- dnd-kit
- Nodemailer
- Zod

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

3. Set values in `.env` for:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SMTP_*`
- `REDIS_URL`
- `CAPTCHA_SECRET_KEY`

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run database migration:

```bash
npx prisma migrate dev --name init
```

6. Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Security Rules
- Keep MySQL and email credentials server-side only.
- Never expose secrets through `NEXT_PUBLIC_*`.
- Place DB/email integrations under server-only code (`src/lib/server`, route handlers, server actions).

## Planning
- Product and architecture roadmap is in [PROJECT.md](./PROJECT.md).

## Auth Endpoints
- `POST /api/auth/register` for account creation
- `GET|POST /api/auth/[...nextauth]` for session/login flow
