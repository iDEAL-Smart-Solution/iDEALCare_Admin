# AGENTS.md — iDEAL Care Platform Admin (iDEALCare_Admin) Instructions

This file is for any AI model (Codex, Claude, Copilot, Cursor, etc.) working in the **iDEALCare_Admin** repository. Read this in full before writing or modifying code.

---

## 1. What this project is

`iDEALCare_Admin` is the dedicated web client for **iDEAL Smart Solution platform administrators**. 
It is completely separate from `iDEALCare-Web` (which is tenant-facing for clinics, patients, and staff).

Its core responsibilities:
1. **Tenant Provisioning & Management**: Onboarding new tenants (clinics/providers), configuring domains, managing initial admin credentials, and activating/suspending tenant status.
2. **Subscription Management**: Managing subscription tiers, tracking active/expired/suspended subscriptions, handling no-mid-cycle plan change scheduling, and reconciling payments.
3. **Platform Governance**: Reviewing cross-tenant audit trails, monitoring platform health, and reviewing operational metrics.

---

## 2. Stack

- **Framework**: React 19, TypeScript, Vite
- **Routing**: React Router 7 (`BrowserRouter`)
- **State Management**: Zustand
- **HTTP Client**: Axios (single instance in `src/lib/apiClient.ts`)
- **Styling**: Vanilla CSS with custom properties (`src/index.css`). No heavy external component frameworks.

---

## 3. Structure and Layering Rules

```
src/types/        TypeScript interfaces mirroring backend platform DTOs exactly
src/lib/          apiClient.ts (the ONLY Axios instance), authStorage.ts, formatters.ts
src/api/          One service file per backend platform domain (platformAuthApi, platformTenantsApi, etc.)
src/stores/       Zustand stores (platformAuthStore, etc.)
src/routes/       PlatformProtectedRoute and routing configuration
src/layouts/      AdminLayout (sidebar, header, breadcrumbs, outlet) and AuthLayout
src/pages/        Route-level views (Dashboard, Tenants, Subscriptions, Audit)
src/components/   Shared presentational UI (DataTable, Badge, Modal, Card, MetricCard)
docs/             Architecture and implementation plan (PLATFORM_ADMIN_PLAN.md)
```

Rules:
- **Never call Axios directly in components or pages.** Always call functions in `src/api/*`.
- **Never use `fetch` or instantiate a second Axios instance.**
- **No tenant domain resolution.** This app operates across tenants; it does NOT send a `domain` param during login or query.

---

## 4. Key Invariants & Business Rules

1. **Platform Authentication**:
   - Platform admins authenticate via `/api/platform/auth/login` with email and password only.
   - Platform admins have `User.TenantId == null` and the `PlatformAdmin` role.
   - Failure responses are generic to prevent account enumeration.
2. **Tenant Onboarding**:
   - Domains are unique and case-insensitive.
   - Registering a tenant creates the `Tenant`, the initial `User` (Owner), and initial `TenantSubscription`.
3. **Subscription Invariants (PRS Part XI)**:
   - Subscriptions are **tenant-level**, never per-user.
   - **No mid-cycle plan changes**: Plan switching (Monthly ↔ Yearly) is queued for the end of the current period (`PeriodEnd`).
   - **Subscription Expiry**: Restricts normal tenant operational access, but **never deletes historical tenant records**.
   - **Subscription Payments**: Tracked separately from patient billing payments.
4. **Error Handling**:
   - `401 Unauthorized`: Clears platform auth store and redirects to `/login`.
   - `403 Forbidden`: Displays clear insufficient permission message.
   - `409 Conflict`: Displays backend-provided conflict message (e.g., domain already registered).

---

## 5. Reference Documentation

- Complete Architecture & Plan: `docs/PLATFORM_ADMIN_PLAN.md`
- Backend PRS: `../iDEALCare-Server/docs/iDEAL_Care_PRS_v1.1.docx`
- Backend AGENTS Guidelines: `../iDEALCare-Server/AGENTS.md`
