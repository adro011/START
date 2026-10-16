-- RLS manual checks (run as a staff/admin in Supabase SQL editor).
-- Proves plan §9: customers cannot read others' orders or write products.
-- Each probe is a SELECT returning pass=true when the policy holds.
-- NOTE: replace the placeholder UUIDs with two real user ids + one order id.

-- 0. RLS is enabled where it must be -------------------------------------
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'products', 'product_variants', 'profiles', 'addresses')
ORDER BY tablename;
-- Expect: rls_enabled = true for every row.

-- 1. Policies exist for the customer-owned tables -------------------------
SELECT policyname, cmd, roles, qual IS NOT NULL AS has_using, with_check IS NOT NULL AS has_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('orders', 'products')
ORDER BY tablename, policyname;
-- Expect: orders has a SELECT policy scoped to auth.uid() = user_id;
-- products has NO insert/update/delete policy for anon/authenticated.

-- 2. Anon sees zero orders (no session) -----------------------------------
-- Run while signed OUT (anon key, no JWT).
SELECT count(*) = 0 AS pass_anon_sees_no_orders
FROM public.orders;
-- Expect: pass = true (0 rows).

-- 3. Customer A cannot read customer B's order ----------------------------
-- Sign in as customer A, then run with B's order id:
--   SELECT * FROM public.orders WHERE id = '<ORDER_OF_CUSTOMER_B>';
-- Expect: 0 rows. Equivalent assertion form (paste B's order id):
SELECT count(*) = 0 AS pass_cannot_read_others_order
FROM public.orders
WHERE id = '00000000-0000-0000-0000-000000000000'; -- <- replace with B's order id
-- Expect: pass = true when executed as A (or anon).

-- 4. Anon / customer cannot INSERT products --------------------------------
-- Do NOT actually run the insert in prod; verify no write policy exists:
SELECT count(*) = 0 AS pass_no_product_write_policy_for_clients
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'products'
  AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
  AND roles && ARRAY['anon', 'authenticated'];
-- Expect: pass = true. A live attempt must fail with:
--   "new row violates row-level security policy for table products".

-- 5. Customer can read their OWN orders (sanity: policy is not deny-all) --
-- Sign in as the order owner, then:
--   SELECT count(*) > 0 FROM public.orders WHERE user_id = auth.uid();
-- Expect: true (proves the SELECT policy permits own rows while §2/§3 deny others).
