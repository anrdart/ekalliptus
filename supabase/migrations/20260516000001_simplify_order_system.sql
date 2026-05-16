-- supabase/migrations/20260516000001_simplify_order_system.sql

-- 1. Create order_sync_failures table
CREATE TABLE IF NOT EXISTS order_sync_failures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  target text NOT NULL CHECK (target IN ('sheets', 'telegram')),
  error_message text,
  attempts integer DEFAULT 0,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_sync_failures_unresolved
  ON order_sync_failures (resolved, created_at)
  WHERE resolved = false;

-- 2. Add new order statuses to the enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'new';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'contacted';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'done';

-- 3. Add description and price columns to orders (for simplified flow)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price integer;
