---
name: ecommerce-rules
description: Pricing, stock, coupons, and order lifecycle guarantees.
---

# E-commerce Rules

## Pricing
- Currency BDT (৳), integer paisa in DB and logic. No floats.
- NEVER trust client totals. `create_order` recalculates from DB.
- Rounding: round per-line to paisa, then sum. Discount before shipping.
- `price_override_paisa` on variant wins over product price.

## Stock
- Decrement stock in ONE transaction inside `create_order`.
- Validate `stock >= qty` row-locked (`FOR UPDATE`). Fail = whole order fails.
- Live UI hint ("Only 3 left") is advisory; RPC is source of truth.
- `cancel_order` restores stock exactly once (idempotency key).

## Coupons
- Validate server-side: `active`, date window, `min_subtotal_paisa`, `usage_limit`.
- Types: `percent` (cap at subtotal), `fixed`, `free_shipping`.
- Increment `used_count` in same transaction as order insert.

## Order state machine
- States: `pending → confirmed → packed → shipped → delivered`.
- Terminal deviations: `cancelled`, `returned` (only from allowed states).
- Reject illegal transitions in RPC + zod. Log every change to `order_events`.
- `payment_status`: `unpaid|paid|failed|refunded`, independent of status.

## Webhooks
- Idempotent IPN: unique `tran_id`, verify amount + order via validation API.
- Replay same IPN = no double stock/paid update.
