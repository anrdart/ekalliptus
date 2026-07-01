import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Redirect root URL to /admin
  index("routes/index.tsx"),

  // Session routes
  route("admin/login", "routes/admin.login.tsx"),
  route("admin/logout", "routes/admin.logout.tsx"),
  route("api/admin/audit-logs", "routes/api.admin.audit-logs.ts"),
  route("api/admin/leads", "routes/api.admin.leads.ts"),
  route("api/admin/leads/:id", "routes/api.admin.leads.$id.ts"),
  route("api/admin/consultations", "routes/api.admin.consultations.ts"),
  route("api/admin/consultations/:id/messages", "routes/api.admin.consultations.$id.messages.ts"),

  // Authenticated Admin Dashboard and Sub-views
  layout("routes/admin.tsx", [
    route("admin", "routes/admin.dashboard.tsx"),
    route("admin/orders", "routes/admin.orders.tsx"),
    route("admin/orders/:id", "routes/admin.order-detail.tsx"),
    route("admin/pipeline", "routes/admin.pipeline.tsx"),
    route("admin/consultations", "routes/admin.consultations.tsx"),
    route("admin/blog", "routes/admin.blog.tsx"),
    route("admin/blog/:id", "routes/admin.blog-edit.tsx"),
    route("admin/blog/new", "routes/admin.blog-new.tsx"),
    route("admin/customers", "routes/admin.customers.tsx"),
    route("admin/customers/:id", "routes/admin.customer-detail.tsx"),
    route("admin/payments", "routes/admin.payments.tsx"),
    route("admin/payments/gateways", "routes/admin.payments-gateways.tsx"),
    route("admin/vouchers", "routes/admin.vouchers.tsx"),
    route("admin/activities", "routes/admin.activities.tsx"),
    route("admin/reports", "routes/admin.reports.tsx"),
    route("admin/audit-logs", "routes/admin.audit-logs.tsx"),
    route("admin/settings", "routes/admin.settings.tsx"),
  ]),
] satisfies RouteConfig;
