# Ralsha Leads Dashboard

An internal read-only lead touchpoint viewer built with Next.js 14.2.11 App Router.

---

## ⚠️ Public Access & PII Risk Notice

> **Temporary access decision:** Ralsha Leads Dashboard version 1 has no application-level login or authorization. Anyone who can access the deployed dashboard URL may be able to access displayed lead data and its data endpoints. `noindex` and an obscure URL are not security controls. Production sharing requires separate explicit approval from the user/manager. Authentication can be added in a later phase.

- `noindex, nofollow` metadata is applied but does NOT provide access control.
- No CSV export is implemented to minimize unauthenticated PII exposure.
- Do not deploy or share publicly without explicit approval.

---

## Architecture

- **Type**: API-first dashboard — does NOT connect directly to MongoDB.
- **Data Source**: Proxies requests to the Ralsha backend API (`GET /api/user-details`).
- **Data Unit**: The backend returns one record per UTM touchpoint, NOT one unique lead. Returning users may appear in multiple rows.
- **Access Control**: None in v1. Dashboard is read-only — no mutations, status editing, or deletions.
- **CSV Export**: Not implemented in v1.

### Page-Only Features

Search, filtering, and sorting operate strictly on the currently loaded page of records. They are labeled in the UI as:
- `Search Current Page`
- `Filter Current Page`
- `Sort Current Page`

Global backend search and filtering are not supported by the current backend API and are not faked.

---

## Required Environment Variable

| Variable | Required | Description |
|---|---|---|
| `RALSHA_BACKEND_API_URL` | ✅ Yes | Base URL of the Ralsha backend (server-side only) |

**Setup:**
```bash
cp .env.example .env.local
# Then edit .env.local and add the real backend URL
```

> ⚠️ Never prefix `RALSHA_BACKEND_API_URL` with `NEXT_PUBLIC_`.
> ⚠️ Never commit `.env.local` to Git.
> ⚠️ `http://localhost:3000` is only for local development and will not work from a Vercel deployment unless the Ralsha backend is running at that address.

---

## Local Development

**Prerequisites:**
- Node.js LTS `v20.x` (minimum `>=18.18.0`)
- npm

**Steps:**
```bash
npm install
cp .env.example .env.local
# Edit .env.local with your real RALSHA_BACKEND_API_URL
npm run dev
# Open http://localhost:3001 (or the port shown in terminal)
```

---

## Verification

```bash
# Check for whitespace issues
git diff --check

# TypeScript strict check
npx tsc --noEmit

# ESLint
npx eslint . --ext .ts,.tsx

# Production build
npm run build
```

---

## Deployment

> **Production deployment requires separate explicit approval.**
> Vercel Preview is not equivalent to private access. Do not share preview URLs externally without explicit sign-off.

If hosting-provider deployment protection is enabled later, it must be documented as external protection — not application-level authentication.

---

## Remaining Blockers Before Preview/Production

1. Real deployed value of `RALSHA_BACKEND_API_URL`
2. GitHub repository URL or approval to create a new repository
3. Production deployment explicit approval
4. Public URL sharing approval (no authentication exists in v1)
