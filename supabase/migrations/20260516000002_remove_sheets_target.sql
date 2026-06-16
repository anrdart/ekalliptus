-- Remove 'sheets' from order_sync_failures target constraint
ALTER TABLE order_sync_failures DROP CONSTRAINT IF EXISTS order_sync_failures_target_check;
ALTER TABLE order_sync_failures ADD CONSTRAINT order_sync_failures_target_check CHECK (target IN ('telegram'));
