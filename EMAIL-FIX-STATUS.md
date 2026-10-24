# Contact email fix — status & resume checklist

## State: COMPLETE — domain verified, email delivery live.

## Root causes fixed
1. `/api/contact` was a stub (validated then returned `ok:true`, never stored/emailed).
2. Supabase was missing `registrations` and `contact_messages` tables (migrations never applied).
3. No email transport (`RESEND_API_KEY` absent).
4. Native `<form>` posts returned `Invalid JSON body.` (route only parsed JSON).

## What was changed
- `src/app/api/contact/route.ts` — rate-limit, honeypot, JSON **and** form-urlencoded/multipart, store to Supabase, email via Resend, 303 redirect for no-JS posts.
- `src/lib/email.ts` — shared Resend sender (`sendEmail`, `isEmailConfigured`, HTML helpers).
- `src/lib/contact.ts` — schema, `saveContactMessage`, `notifyContactMessage` (Reply-To = customer), `hashIp`, admin list/status/delete helpers.
- `src/components/contact-form.tsx` — real client form (replaced fragile inline `<script>`).
- `src/app/contact/page.tsx` — uses the component, reads `?sent=`/`?error=` searchParams.
- `src/app/admin/messages/page.tsx` + `admin/layout.tsx` nav — admin inbox.
- `supabase/migrations/0016_contact_messages.sql` — table migration.
- `supabase/apply-contact-and-registrations.sql` — idempotent one-paste migration (registrations + contact_messages), already applied via Supabase Management API.
- `.env.example` — documents `CONTACT_NOTIFY_EMAIL`.

## Resend domain — VERIFIED
- `abrar-exclusive.shop` now `verified` in Resend → sender `ABRAR <support@abrar-exclusive.shop>` can email any recipient.
- DNS records were added at Spaceship and verified (TXT `resend._domainkey`, CNAME `send`, CNAME `rsend`).
- Domain id: `bdf316fd-c037-46f9-8f74-c75e00d03309`.

## End-to-end verification (done)
1. ✅ `POST https://www.abrar-exclusive.shop/api/contact` → `{"ok":true,"id":4,"emailed":true}`.
2. ✅ Row persisted in `contact_messages` (`id=4`, `emailed_at=2026-10-24T07:09:56Z`, `status=new`).
3. ✅ `CONTACT_NOTIFY_EMAIL=ziahoque1980@gmail.com` receives the notification (Reply-To = customer).
4. ✅ `/api/contact` stores with service role (RLS: only admins read via the inbox).

## Security notes
- Supabase Personal Access Token used once (not stored in repo) — rotate/revoke if desired.
- Resend key + Supabase keys live only in Vercel env / `.env.local` (gitignored).
