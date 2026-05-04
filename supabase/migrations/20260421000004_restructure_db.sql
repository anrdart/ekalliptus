BEGIN;

DO $$ BEGIN
  CREATE TYPE service_type AS ENUM ('website', 'wordpress', 'mobile', 'editing', 'service_device');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('waiting_dp', 'dp_paid', 'waiting_onsite_payment', 'onsite_paid', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE urgency_level AS ENUM ('normal', 'express', 'priority');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_gateway AS ENUM ('midtrans', 'pakasir', 'qiospay', 'sanpay', 'tripay');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'expired', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_type AS ENUM ('full', 'dp', 'remaining');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE consultation_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_method AS ENUM ('pickup', 'delivery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TABLE IF EXISTS order_stats_cache CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payment_logs CASCADE;

DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
END LOOP;
END $$;

ALTER TABLE payment_gateways DROP CONSTRAINT IF EXISTS payment_gateways_name_check;
ALTER TABLE payment_gateways DROP CONSTRAINT IF EXISTS payment_gateways_name_unique;
ALTER TABLE payment_gateways ALTER COLUMN name DROP DEFAULT;
ALTER TABLE payment_gateways ALTER COLUMN name TYPE payment_gateway USING name::payment_gateway;
ALTER TABLE payment_gateways ADD CONSTRAINT payment_gateways_name_unique UNIQUE (name);

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_gateway_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ALTER COLUMN gateway DROP DEFAULT;
ALTER TABLE payments ALTER COLUMN payment_type DROP DEFAULT;
ALTER TABLE payments ALTER COLUMN status DROP DEFAULT;
ALTER TABLE payments ALTER COLUMN gateway TYPE payment_gateway USING gateway::payment_gateway;
ALTER TABLE payments ALTER COLUMN payment_type TYPE payment_type USING payment_type::payment_type;
ALTER TABLE payments ALTER COLUMN status TYPE payment_status USING status::payment_status;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_order_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_tx ON payments(gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;

ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_status_check;
ALTER TABLE consultations ALTER COLUMN status DROP DEFAULT;
ALTER TABLE consultations ALTER COLUMN status TYPE consultation_status USING status::consultation_status;

ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_order_id_fkey;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_payment_id_fkey;

ALTER TABLE consultations ADD CONSTRAINT consultations_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE consultations ADD CONSTRAINT consultations_payment_id_fkey
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_consultations_order_id ON consultations(order_id);

ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE blog_posts ALTER COLUMN status DROP DEFAULT;
ALTER TABLE blog_posts ALTER COLUMN status TYPE blog_post_status USING status::blog_post_status;

ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_slug_locale_unique;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_locale_unique UNIQUE (slug, locale);

CREATE INDEX IF NOT EXISTS idx_blog_posts_locale_status ON blog_posts(locale, status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON blog_posts(publish_date DESC);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS pricing JSONB NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'subtotal'
  ) THEN
    UPDATE orders SET pricing = jsonb_build_object(
      'subtotal', COALESCE(subtotal, 0),
      'discount', COALESCE(discount, 0),
      'dpp', COALESCE(dpp, 0),
      'ppn', COALESCE(ppn, 0),
      'fee', COALESCE(fee, 0),
      'shipping_cost', COALESCE(shipping_cost, 0),
      'grand_total', COALESCE(grand_total, 0),
      'deposit', COALESCE(deposit, 0),
      'remaining', COALESCE(remaining, 0)
    ) WHERE pricing = '{}'::jsonb
      AND subtotal IS NOT NULL;
  END IF;
END $$;

DO $$
DECLARE
  col_exists TEXT;
BEGIN
  SELECT column_name INTO col_exists FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'service_type_new';
  IF col_exists IS NULL THEN
    PERFORM 1 FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'service_type'
      AND data_type = 'character varying';
    IF FOUND THEN
      ALTER TABLE orders ADD COLUMN service_type_new service_type;
      UPDATE orders SET service_type_new = service_type::service_type WHERE service_type IS NOT NULL;
      ALTER TABLE orders DROP COLUMN service_type;
      ALTER TABLE orders RENAME COLUMN service_type_new TO service_type;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  col_exists TEXT;
BEGIN
  SELECT column_name INTO col_exists FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status_new';
  IF col_exists IS NULL THEN
    PERFORM 1 FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'status'
      AND data_type = 'character varying';
    IF FOUND THEN
      ALTER TABLE orders ADD COLUMN status_new order_status;
      UPDATE orders SET status_new = status::order_status WHERE status IS NOT NULL;
      ALTER TABLE orders DROP COLUMN status;
      ALTER TABLE orders RENAME COLUMN status_new TO status;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  col_exists TEXT;
BEGIN
  SELECT column_name INTO col_exists FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'urgency_new';
  IF col_exists IS NULL THEN
    PERFORM 1 FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'urgency'
      AND data_type = 'character varying';
    IF FOUND THEN
      ALTER TABLE orders ADD COLUMN urgency_new urgency_level;
      UPDATE orders SET urgency_new = urgency::urgency_level WHERE urgency IS NOT NULL;
      ALTER TABLE orders DROP COLUMN urgency;
      ALTER TABLE orders RENAME COLUMN urgency_new TO urgency;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  col_exists TEXT;
BEGIN
  SELECT column_name INTO col_exists FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_method_new';
  IF col_exists IS NULL THEN
    PERFORM 1 FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'delivery_method'
      AND data_type = 'character varying';
    IF FOUND THEN
      ALTER TABLE orders ADD COLUMN delivery_method_new delivery_method;
      UPDATE orders SET delivery_method_new = delivery_method::delivery_method WHERE delivery_method IS NOT NULL;
      ALTER TABLE orders DROP COLUMN delivery_method;
      ALTER TABLE orders RENAME COLUMN delivery_method_new TO delivery_method;
    END IF;
  END IF;
END $$;

ALTER TABLE orders DROP COLUMN IF EXISTS subtotal;
ALTER TABLE orders DROP COLUMN IF EXISTS discount;
ALTER TABLE orders DROP COLUMN IF EXISTS dpp;
ALTER TABLE orders DROP COLUMN IF EXISTS ppn;
ALTER TABLE orders DROP COLUMN IF EXISTS fee;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_cost;
ALTER TABLE orders DROP COLUMN IF EXISTS grand_total;
ALTER TABLE orders DROP COLUMN IF EXISTS deposit;
ALTER TABLE orders DROP COLUMN IF EXISTS remaining;
ALTER TABLE orders DROP COLUMN IF EXISTS payment_ref;
ALTER TABLE orders DROP COLUMN IF EXISTS payment_url;

ALTER TABLE orders ALTER COLUMN service_type SET NOT NULL;
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
ALTER TABLE orders ALTER COLUMN urgency SET DEFAULT 'normal';
ALTER TABLE orders ALTER COLUMN urgency SET NOT NULL;
ALTER TABLE orders ALTER COLUMN delivery_method SET DEFAULT 'pickup';
ALTER TABLE orders ALTER COLUMN delivery_method SET NOT NULL;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_anon_insert" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "orders_anon_select_own" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "orders_service_role_all" ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "payments_anon_insert" ON payments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "payments_anon_select" ON payments FOR SELECT TO anon USING (true);
CREATE POLICY "payments_service_role_all" ON payments FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "consultations_anon_insert" ON consultations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "consultations_anon_select" ON consultations FOR SELECT TO anon USING (true);
CREATE POLICY "consultations_service_role_all" ON consultations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "gateways_anon_select" ON payment_gateways FOR SELECT TO anon USING (true);
CREATE POLICY "gateways_service_role_all" ON payment_gateways FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "blog_anon_select_published" ON blog_posts FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "blog_service_role_all" ON blog_posts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP FUNCTION IF EXISTS create_order_with_attachments CASCADE;
DROP FUNCTION IF EXISTS get_transaction_statistics CASCADE;
DROP FUNCTION IF EXISTS sanitize_payment_data CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_cache CASCADE;

COMMIT;
