-- ============================================================
-- Blog Posts Schema for ekalliptus.com
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'id' CHECK (locale IN ('id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr')),
  title TEXT NOT NULL,
  description TEXT,
  body_html TEXT,
  publish_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ,
  category TEXT NOT NULL DEFAULT 'Web Development',
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'Tim Ekalliptus',
  image TEXT,
  image_alt TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  seo_meta_title TEXT,
  seo_meta_description TEXT,
  seo_noindex BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slug, locale)
);

-- Idempotent fix for existing deployments: ensure CHECK allows 'archived'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'blog_posts'
      AND c.conname LIKE '%status%check%'
      AND pg_get_constraintdef(c.oid) LIKE '%archived%'
  ) THEN
    ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
    ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_status_check
      CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

-- 2. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale ON public.blog_posts (locale);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON public.blog_posts (publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale_status ON public.blog_posts (locale, status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug_locale_status ON public.blog_posts (slug, locale, status);

-- 3. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts only
CREATE POLICY "Public can read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Authenticated users (admin) can do everything
CREATE POLICY "Authenticated users can insert blog posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog posts"
  ON public.blog_posts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 5. Storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read blog images
CREATE POLICY "Public can read blog images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Authenticated users can upload blog images
CREATE POLICY "Authenticated users can upload blog images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Authenticated users can update blog images
CREATE POLICY "Authenticated users can update blog images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Authenticated users can delete blog images
CREATE POLICY "Authenticated users can delete blog images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- ============================================================
-- Done! You can verify with:
--   SELECT * FROM public.blog_posts;
--   SELECT * FROM storage.buckets WHERE id = 'blog-images';
-- ============================================================
