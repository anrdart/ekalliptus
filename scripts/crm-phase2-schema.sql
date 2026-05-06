-- ============================================================
-- CRM Phase 2: leads + activities
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE lead_stage AS ENUM ('new','contacted','qualified','proposal','negotiation','won','lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM ('note','call','meeting','follow_up','task','email');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  company TEXT,
  service_interest TEXT,
  stage lead_stage NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'manual',
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  notes TEXT,
  estimated_value BIGINT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON public.leads(whatsapp);
CREATE INDEX IF NOT EXISTS idx_leads_consultation_id ON public.leads(consultation_id);
CREATE INDEX IF NOT EXISTS idx_leads_order_id ON public.leads(order_id);

DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;
CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type activity_type NOT NULL DEFAULT 'note',
  title TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activity_target_required;
ALTER TABLE public.activities ADD CONSTRAINT activity_target_required
  CHECK (lead_id IS NOT NULL OR order_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_order_id ON public.activities(order_id);
CREATE INDEX IF NOT EXISTS idx_activities_due ON public.activities(due_date) WHERE is_completed = false;

-- 4. RLS (admin uses service role, but enable RLS for safety)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
