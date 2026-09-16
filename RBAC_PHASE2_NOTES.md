# ACMS RBAC Phase 2

This phase hardens API authorization for role-based access.

## Rules
- ADMIN: unrestricted access to application data and administration.
- ADVOCATE: restricted to cases assigned to the logged-in advocate and related clients, hearings, documents, notes, dates, timelines, related cases, invoices and eCourts operations.
- STAFF: operational access remains available; user/advocate/staff administration remains ADMIN-only. Expenses are STAFF/ADMIN because Expense currently has no owner/case relation in the database.

## Verification
Run locally after extracting:

```powershell
npm install
npx prisma generate
npx tsc --noEmit
npm run build
```

Do not run `prisma migrate reset`.
