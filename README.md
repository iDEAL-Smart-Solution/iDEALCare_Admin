# iDEALCare_Admin

The **Platform Administration Console** for **iDEAL Care** (owned and operated by iDEAL Smart Solution).

This application handles cross-tenant administrative tasks, specifically:
- **Tenant Registration & Onboarding**: Provisioning new healthcare providers and clinics, configuring tenant domains, creating initial primary owners, and setting tenant-level operational rules.
- **Tenant Subscription Management**: Managing subscription tiers (Monthly and Yearly), tracking subscription lifecycles, queuing mid-cycle plan changes, recording manual/offline payments, and monitoring MRR/ARR.
- **Platform Telemetry & Governance**: Reviewing cross-tenant audit logs, tenant status (Active/Suspended/Expired), and platform health.

---

## Architecture & Documentation

- [Platform Admin Architecture & Implementation Plan](file:///docs/PLATFORM_ADMIN_PLAN.md): Complete blueprint detailing PRS references, backend API contracts, frontend architecture, and onboarding/subscription workflows.
- [Codebase Guidelines & Invariants (AGENTS.md)](file:///AGENTS.md): Architectural layering, invariants, and conventions for development.

---

## Tech Stack

- **Framework**: React 19, TypeScript, Vite
- **Routing**: React Router 7
- **State Management**: Zustand
- **HTTP Client**: Axios (single instance with JWT interceptor)
- **Styling**: Vanilla CSS Design Tokens (Dark & Light mode support)

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file:
   ```env
   VITE_API_BASE_URL=https://localhost:7128
   ```

3. **Run local dev server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Vercel deployment

Production builds default to `https://care.api.idealsmartsolutions.com` via `.env.production`. If `VITE_API_BASE_URL` is set in the Vercel project environment, set it to the same backend origin; environment variables override the file. Vite embeds this value at build time, so redeploy after changing it. The backend must also allow the admin origin in its CORS configuration.

The included `vercel.json` serves the React app for client-side routes such as `/login`, including direct visits and refreshes. Configure Vercel's project root to point to this admin application so that the configuration is included in the deployment.
