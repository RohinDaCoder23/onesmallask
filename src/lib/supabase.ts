import type { ConfirmedGift, ContactReveal } from "../types";

/**
 * A ~90-line PostgREST client instead of @supabase/supabase-js.
 *
 * The whole surface Kindly uses is one INSERT and two SELECTs. A hand-written
 * fetch wrapper adds zero KB to the bundle, cannot break on a major-version
 * bump, and lets every call carry an explicit timeout. Nothing here throws —
 * callers get `null` and render the committed fallback.
 */

const URL_BASE = (import.meta.env.VITE_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

/** True only when both values are present at build time. */
export const trackingConfigured: boolean = URL_BASE.length > 0 && ANON_KEY.length > 0;

const TIMEOUT_MS = 6000;

function headers(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function request(path: string, init: RequestInit): Promise<Response | null> {
  if (!trackingConfigured) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${URL_BASE}/rest/v1/${path}`, { ...init, signal: controller.signal });
  } catch {
    // Network down, CORS, DNS, timeout — all identical from here: no data.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function getJson<T>(path: string): Promise<T | null> {
  const res = await request(path, { method: "GET", headers: headers() });
  if (!res || !res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Returns true only on a confirmed write. Callers queue on false. */
export async function insertReveals(rows: ContactReveal[]): Promise<boolean> {
  if (rows.length === 0) return true;
  const res = await request("contact_reveals", {
    method: "POST",
    headers: headers({ Prefer: "return=minimal,resolution=merge-duplicates" }),
    body: JSON.stringify(rows),
  });
  return res !== null && res.ok;
}

export interface TotalsRow {
  requests_reviewed: number | null;
  requests_published: number | null;
  contact_reveals: number | null;
  confirmed_gifts: number | null;
  confirmed_usd: number | null;
  first_reveal_ts: string | null;
  last_reveal_ts: string | null;
}

export async function fetchTotals(): Promise<TotalsRow | null> {
  const rows = await getJson<TotalsRow[]>("public_impact_totals?select=*&limit=1");
  if (!rows || rows.length === 0) return null;
  return rows[0] ?? null;
}

export async function fetchConfirmed(): Promise<ConfirmedGift[] | null> {
  return getJson<ConfirmedGift[]>(
    "public_confirmed_gifts?select=*&order=matched_on.desc&limit=500",
  );
}
