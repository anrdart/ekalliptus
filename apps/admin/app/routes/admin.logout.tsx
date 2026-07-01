import { redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { ADMIN_COOKIE_NAME } from "@ekalliptus/core";

export const action = async ({ request }: ActionFunctionArgs) => {
  return redirect("/admin/login", {
    headers: {
      "Set-Cookie": `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`,
    },
  });
};

export const loader = async () => {
  return redirect("/admin/login");
};
