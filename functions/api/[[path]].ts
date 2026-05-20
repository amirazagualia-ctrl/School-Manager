// ============================================================
// Cloudflare Pages Function — Catch-all pour /api/*
// ============================================================
import app from '../../src/worker/index';

export const onRequest: PagesFunction<{
  DB: D1Database;
  OPENAI_API_KEY?: string;
}> = async (context) => {
  return app.fetch(context.request, context.env, context);
};
