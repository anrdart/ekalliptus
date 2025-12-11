-- Ekalliptus Database Schema
-- Synced from Supabase project: ekalliptus (muyzxygtlwsfegzyvgcm)
-- Last updated: 2025-12-11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    display_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'finance', 'cs', 'tech', 'editor')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    customer_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    company TEXT,
    service_type TEXT NOT NULL CHECK (service_type IN ('website', 'wordpress', 'mobile', 'editing', 'service_device')),
    urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'express', 'priority')),
    scope JSONB NOT NULL,
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('pickup', 'ship')),
    schedule_date DATE NOT NULL,
    schedule_time TEXT NOT NULL,
    shipping_cost INTEGER DEFAULT 0,
    voucher_code TEXT,
    subtotal INTEGER NOT NULL,
    discount INTEGER DEFAULT 0,
    dpp INTEGER NOT NULL,
    ppn INTEGER NOT NULL,
    fee INTEGER DEFAULT 0,
    grand_total INTEGER NOT NULL,
    deposit INTEGER NOT NULL,
    remaining INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting_dp' CHECK (status IN ('waiting_dp', 'dp_paid', 'waiting_onsite_payment', 'onsite_paid', 'cancelled')),
    payment_ref TEXT,
    payment_url TEXT
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

COMMENT ON COLUMN orders.user_id IS 'User ID from auth.users. NULL for anonymous orders.';

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    line_total INTEGER NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDER ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    bucket TEXT NOT NULL DEFAULT 'orders',
    path TEXT NOT NULL,
    filename TEXT NOT NULL,
    content_type TEXT,
    size INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VOUCHERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vouchers (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('percent', 'nominal')),
    value NUMERIC NOT NULL,
    min_spend INTEGER DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('dp', 'full', 'onsite', 'refund')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    method TEXT NOT NULL,
    reference TEXT,
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDER STATS CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_stats_cache (
    cache_key TEXT PRIMARY KEY,
    result JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_service_type ON orders(service_type);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON order_attachments(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Allow anonymous insert orders" ON orders
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated insert orders" ON orders
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated select orders" ON orders
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update orders" ON orders
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Order items policies
CREATE POLICY "Allow authenticated select order_items" ON order_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert order_items" ON order_items
    FOR INSERT TO authenticated WITH CHECK (true);

-- Order attachments policies
CREATE POLICY "Allow anonymous insert attachments" ON order_attachments
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated select attachments" ON order_attachments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert attachments" ON order_attachments
    FOR INSERT TO authenticated WITH CHECK (true);

-- Payment transactions policies
CREATE POLICY "Allow authenticated select payments" ON payment_transactions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert payments" ON payment_transactions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update payments" ON payment_transactions
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Audit logs policies
CREATE POLICY "Allow authenticated select audit_logs" ON audit_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert audit_logs" ON audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);
