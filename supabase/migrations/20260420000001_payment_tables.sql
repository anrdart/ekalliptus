-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL CHECK (gateway IN ('midtrans', 'pakasir', 'qiospay', 'sanpay', 'tripay')),
  gateway_transaction_id TEXT,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('full', 'dp', 'remaining')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'expired', 'refunded')),
  payment_url TEXT,
  qr_string TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  webhook_received_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment gateways configuration table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('midtrans', 'pakasir', 'qiospay', 'sanpay', 'tripay')),
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  fee_percent NUMERIC DEFAULT 0.7 CHECK (fee_percent >= 0),
  fee_flat NUMERIC DEFAULT 0 CHECK (fee_flat >= 0),
  supports_qr BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  gateway TEXT NOT NULL,
  event_type TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status TEXT NOT NULL,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);

-- Insert default gateways
INSERT INTO payment_gateways (name, display_name, priority, fee_percent) VALUES
  ('midtrans', 'Midtrans', 1, 0.7),
  ('pakasir', 'Pakasir', 2, 0.65),
  ('qiospay', 'Qiospay', 3, 0.7),
  ('sanpay', 'Sanpay', 4, 0.7),
  ('tripay', 'Tripay', 5, 0.7)
ON CONFLICT (name) DO NOTHING;

-- Add columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_option TEXT CHECK (payment_option IN ('full', 'dp'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS consultation_required BOOLEAN DEFAULT false;

-- Updated_at trigger function (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_gateways_updated_at ON payment_gateways;
CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON payment_gateways
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Service role can access all payments" ON payments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view payments for their orders" ON payments
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for consultations
CREATE POLICY "Service role can access all consultations" ON consultations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view consultations for their orders" ON consultations
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for payment_gateways
CREATE POLICY "Anyone can view active payment gateways" ON payment_gateways
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage payment gateways" ON payment_gateways
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for payment_logs
CREATE POLICY "Service role can access all payment logs" ON payment_logs
  FOR ALL USING (auth.role() = 'service_role');
