-- Apply only after configuring the server service-role secret. No public session IDs are authorization.
BEGIN;
DROP POLICY IF EXISTS "Allow public insert consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow public select own consultation" ON public.consultations;
DROP POLICY IF EXISTS "Allow public update own consultation" ON public.consultations;
DROP POLICY IF EXISTS "Allow public insert messages" ON public.consultation_messages;
DROP POLICY IF EXISTS "Allow public select messages" ON public.consultation_messages;
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert order_attachments" ON public.order_attachments;
COMMIT;
