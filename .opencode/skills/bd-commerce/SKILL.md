---
name: bd-commerce
description: Bangladesh checkout, COD rules, SSLCommerz, and courier adapters.
---

# BD Commerce Rules

## Address / shipping
- BD form: division → district → area cascade. Store snapshot as `address jsonb`.
- `shipping_zones`: districts[], `fee_paisa`, `free_over_paisa`, `eta_days`.
- Default zones: Dhaka city / Outside Dhaka (fees in `site_settings`).

## Phone
- Validate `01[3-9]\d{8}` (11 digits) with zod on client + server.
- Normalize to `+8801XXXXXXXXX` for storage/display. Used for `/track` lookup.

## COD
- Default payment. High-value orders (over threshold in settings) require OTP/phone confirm.
- Show COD fee/advance if set. Confirm page + Resend email + WhatsApp option.

## SSLCommerz (behind `PAYMENT_SSLCOMMERZ_ENABLED`)
- Flow: init → redirect → success/fail/cancel → IPN validate via validation API.
- Check amount + order_no match. Idempotent on `tran_id`. Sandbox in dev.

## Couriers
- Adapter interface `createShipment/track/cancel` behind flags.
- Optional Steadfast / Pathao / RedX adapters; manual tracking_no fallback.
- Assign courier + tracking in admin; expose timeline via `order_events`.
