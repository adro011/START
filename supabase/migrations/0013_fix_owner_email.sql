-- brand-store 0013: correct owner email typo.
--
-- 0012 seeded the admin as 'ziahoque@1980@gmail.com' (stray @).
-- The real address is 'ziahoque1980@gmail.com'.
--
-- Idempotent: only rewrites the old row if it still exists.

UPDATE public.registry_users
SET email = 'ziahoque1980@gmail.com',
    updated_at = now()
WHERE email = 'ziahoque@1980@gmail.com';
