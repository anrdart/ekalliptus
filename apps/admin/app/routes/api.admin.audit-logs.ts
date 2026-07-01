import type { LoaderFunctionArgs } from "react-router";
import { getAdminSession, listAudit, captureRuntimeEnv } from "@ekalliptus/core";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = (context as any).cloudflare?.env;
  if (env) captureRuntimeEnv(env);

  const session = await getAdminSession(request.headers.get("Cookie"));
  if (!session || (session.role !== "owner" && session.role !== "admin")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const result = await listAudit({
    table: url.searchParams.get("table") ?? undefined,
    action: url.searchParams.get("action") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    page: Number(url.searchParams.get("page") ?? "1") || 1
  });

  return Response.json({ 
    logs: result.rows, 
    total: result.total, 
    totalPages: result.totalPages, 
    page: result.page 
  });
};
