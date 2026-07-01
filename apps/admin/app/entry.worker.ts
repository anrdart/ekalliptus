import { createRequestHandler } from "react-router";
// @ts-ignore
import * as build from "virtual:react-router/server-build";

const requestHandler = createRequestHandler(build, import.meta.env.MODE);

export default {
  async fetch(request: Request, env: any, ctx: any) {
    return requestHandler(request, {
      cloudflare: { env, ctx }
    });
  }
} satisfies ExportedHandler;
