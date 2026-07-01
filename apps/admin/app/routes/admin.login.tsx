import { useState } from "react";
import { 
  Form, 
  useActionData, 
  useLoaderData, 
  useSearchParams, 
  redirect,
  Link
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { createClient } from "@supabase/supabase-js";
import { 
  captureRuntimeEnv, 
  readSupabaseEnv, 
  getAdminSession, 
  ADMIN_COOKIE_NAME 
} from "@ekalliptus/core";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  // Capture Cloudflare Workers environment
  const env = (context as any).cloudflare?.env;
  if (env) captureRuntimeEnv(env);

  const session = await getAdminSession(request.headers.get("Cookie"));
  if (session) {
    const url = new URL(request.url);
    const next = url.searchParams.get("next") || "/admin";
    const safeNext = next.startsWith("/admin") ? next : "/admin";
    return redirect(safeNext);
  }
  return null;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  // Capture Cloudflare Workers environment
  const env = (context as any).cloudflare?.env;
  if (env) captureRuntimeEnv(env);

  try {
    const form = await request.formData();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const next = String(form.get("next") ?? "/admin") || "/admin";

    if (!email || !password) {
      return { error: "Email dan password wajib diisi." };
    }

    const { url: supabaseUrl, anonKey: supabaseAnonKey, serviceRoleKey: supabaseServiceKey } = readSupabaseEnv();

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("[admin/login] Supabase env vars missing:", {
        hasUrl: !!supabaseUrl,
        hasAnon: !!supabaseAnonKey,
        hasServiceRole: !!supabaseServiceKey
      });
      return { error: "Server belum dikonfigurasi. Cek SUPABASE_SERVICE_ROLE_KEY." };
    }

    // Fresh request-scoped clients
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      console.error("[admin/login] signInWithPassword failed:", error?.message);
      return { error: "Email atau password salah." };
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (!profile) {
      console.error("[admin/login] No profile row for user_id:", data.user.id);
      return { error: "User berhasil login tapi belum punya profile dengan role owner/admin." };
    }

    const safeNext = next.startsWith("/admin") ? next : "/admin";
    const maxAge = data.session.expires_in ?? 3600;

    return redirect(safeNext, {
      headers: {
        "Set-Cookie": `${ADMIN_COOKIE_NAME}=${data.session.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`
      }
    });
  } catch (err) {
    console.error("[admin/login] Unhandled exception:", err);
    return { error: "Terjadi kesalahan internal server." };
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  
  const queryError = searchParams.get("error");
  const errorMessages: Record<string, string> = {
    invalid: "Email atau password salah.",
    server: "Server Supabase belum dikonfigurasi. Cek SUPABASE_SERVICE_ROLE_KEY di .env.",
    no_profile: "User berhasil login tapi belum punya row di tabel profiles. Insert profile dengan role owner.",
    empty: "Email dan password wajib diisi."
  };
  const errorMessage = actionData?.error || (queryError ? (errorMessages[queryError] ?? "Login gagal. Coba lagi.") : null);

  return (
    <div className="bg-background min-h-screen text-foreground flex items-center justify-center p-4" data-admin="true">
      <main className="glass-panel relative z-10 w-full max-w-sm rounded-3xl p-8">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo_mobile.webp" alt="Ekalliptus Digital" width="48" height="32" className="h-12 w-auto mb-4 invert dark:invert-0" />
          <h1 className="text-xl font-bold tracking-tight">Admin Login</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Ekalliptus Digital</p>
        </div>
        
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <Form method="POST" className="space-y-4">
          <input type="hidden" name="next" value={next} />
          
          <label className="block">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Email</span>
            <input 
              type="email" 
              name="email" 
              required 
              autoComplete="username" 
              className="mt-1.5 block w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition" 
            />
          </label>
          
          <label className="block">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Password</span>
            <input 
              type="password" 
              name="password" 
              required 
              autoComplete="current-password" 
              className="mt-1.5 block w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition" 
            />
          </label>
          
          <button 
            type="submit" 
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition active:scale-[0.98]"
          >
            Masuk
          </button>
        </Form>
        
        <a href="/" className="mt-5 block text-center text-xs text-muted-foreground hover:text-foreground transition">
          ← Kembali ke beranda
        </a>
      </main>
    </div>
  );
}
