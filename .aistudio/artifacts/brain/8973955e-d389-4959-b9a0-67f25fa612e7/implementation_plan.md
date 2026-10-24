# Supabase Multi-Tenant Server-Side Authentication & Tenant Isolation

Establish a robust server-side authentication and multi-tenant data isolation layer using Express and Supabase, ensuring all database queries and API endpoints verify the requester's `tenant_id`.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Tenant Isolation**: Every table in Supabase will include a `tenant_id` foreign key referencing the `tenants` table. Row Level Security (RLS) policies and Express backend middleware will enforce strict tenant boundaries.
> - **Server-Side Verification**: Express middleware will validate Supabase JWT tokens, fetch the user's tenant membership, and inject `tenant_id` into request contexts for all API calls.

- **Confirmed Decision 1**: Tenant ID column on all tables with foreign key to tenants table.
- **Confirmed Decision 2**: Express server backend handling API routes and Supabase service role checks.

---

## 1. Overview & Core Concept

- **What It Does**: Secures the multi-client WhatsApp Automation SaaS backend by authenticating users via Supabase Auth and enforcing strict tenant isolation across all database operations and Express API endpoints.
- **Target Audience / Persona**: SaaS Owner Admins and Tenant Clients managing WhatsApp automation workflows.
- **Key Value**: Prevents unauthorized cross-tenant data access, secures webhook processing, and guarantees isolated client workspaces.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. User logs in via Supabase client auth (Admin or Client).
  2. Frontend sends Supabase JWT in the `Authorization` header (`Bearer <token>`).
  3. Express backend authenticates the user, resolves their `tenant_id`, and scopes all database queries.
  4. Unauthorized or cross-tenant requests are rejected with `401 Unauthorized` or `403 Forbidden`.
- **Visual Identity & Theme**: Professional dashboard aesthetic with clear authentication error handling and loading indicators.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Express Backend Middleware + Supabase Service Role for Privileged Operations
  - *Chosen Approach*: Validate JWTs on Express routes and use Supabase service role client securely on the backend where needed while enforcing RLS/tenant filtering.
  - *Why*: Allows secure server-side execution of webhooks and multi-tenant administrative actions without exposing service keys to the browser.
- **Decision 2**: Explicit `tenant_id` foreign key columns
  - *Chosen Approach*: Add `tenant_id` to all domain tables (`whatsapp_accounts`, `automation_rules`, `messages`, `webhook_logs`, etc.).
  - *Why*: Ensures deterministic data partitioning and simplifies auditing.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                      Client Browser                    │
│     (React SPA + Supabase Auth SDK + Bearer Token)     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / API Request
                            ▼
┌────────────────────────────────────────────────────────┐
│             Express Backend (`server.ts`)              │
│  - Supabase Auth Middleware (JWT Verification)         │
│  - Tenant Resolution Middleware (User -> Tenant Map)   │
└───────────────────────────┬────────────────────────────┘
                            │ Scored Query (`WHERE tenant_id = ?`)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Supabase Database                    │
│      (Tenants, Users, WhatsApp Accounts, Messages)     │
└────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `tenants`: id, name, created_at, status
  - `user_profiles`: id (auth.users FK), tenant_id (tenants FK), role ('admin' | 'client'), email
  - `whatsapp_accounts`: id, tenant_id, phone_number_id, waba_id, access_token, status
  - `automation_rules`: id, tenant_id, name, trigger_keyword, response_template, is_active
  - `messages`: id, tenant_id, sender, recipient, body, status, created_at
  - `webhook_logs`: id, tenant_id, payload, response_status, created_at
- **Interactive Component & State Mapping**:
  - API requests intercepted by `requireAuth` and `requireTenant` middleware.
  - Supabase queries automatically injected with `.eq('tenant_id', req.tenantId)`.
