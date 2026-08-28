import type {
  Category,
  ConfirmedGift,
  ContactReveal,
  ImpactData,
  ImpactTotals,
} from "../types";
import snapshot from "../data/impact-snapshot.json";
import { readJson, remove, storageAvailable, writeJson } from "./storage";
import {
  fetchConfirmed,
  fetchTotals,
  insertReveals,
  trackingConfigured,
} from "./supabase";

const K_SESSION = "osa.session.v1";
const K_REVEALS = "osa.reveals.v1";
const K_QUEUE = "osa.queue.v1";

/** Hard caps so a shared or kiosk browser can never blow the storage quota. */
const MAX_LOCAL = 500;
const MAX_QUEUE = 200;

export { trackingConfigured };

function uuid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  if (c && typeof c.getRandomValues === "function") {
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = ((b[6] ?? 0) & 0x0f) | 0x40; // RFC 4122 v4
    b[8] = ((b[8] ?? 0) & 0x3f) | 0x80;
    const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Random per-browser id. Not tied to any identity, never sent anywhere else. */
export function sessionId(): string {
  const existing = readJson<string | null>(K_SESSION, null);
  if (typeof existing === "string" && existing.length > 0) return existing;
  const fresh = uuid();
  writeJson(K_SESSION, fresh);
  return fresh;
}

export function localReveals(): ContactReveal[] {
  const rows = readJson<ContactReveal[]>(K_REVEALS, []);
  return Array.isArray(rows) ? rows : [];
}

function queued(): ContactReveal[] {
  const rows = readJson<ContactReveal[]>(K_QUEUE, []);
  return Array.isArray(rows) ? rows : [];
}

export interface RevealInput {
  requestId: string;
  requestTitle: string;
  category: Category;
  amountUsd: number;
  source: string;
}

/**
 * Records that a donor was shown how to reach a requester.
 *
 * This is an INTENT signal and nothing more. One Small Ask cannot see the payment —
 * the two people settle it themselves, on an app One Small Ask has no access to — so
 * this number must never be presented as money moved. The Impact page keeps it
 * in a separate column from confirmed gifts for exactly that reason.
 *
 * Never throws, never blocks the reveal: the local write is synchronous and the
 * network write is fire-and-forget with a retry queue behind it.
 */
export function logReveal(input: RevealInput): ContactReveal {
  const row: ContactReveal = {
    id: uuid(),
    ts: new Date().toISOString(),
    request_id: input.requestId,
    request_title: input.requestTitle,
    category: input.category,
    amount_usd: Math.round(input.amountUsd * 100) / 100,
    source: input.source,
    session_id: sessionId(),
  };

  writeJson(K_REVEALS, [...localReveals(), row].slice(-MAX_LOCAL));

  if (!trackingConfigured) return row;

  void insertReveals([row]).then((ok) => {
    if (!ok) writeJson(K_QUEUE, [...queued(), row].slice(-MAX_QUEUE));
  });

  return row;
}

/** Retries anything a previous visit could not send. Called once on app boot. */
export async function flushQueue(): Promise<void> {
  if (!trackingConfigured || !storageAvailable()) return;
  const pending = queued();
  if (pending.length === 0) return;
  if (await insertReveals(pending)) remove(K_QUEUE);
}

function emptyTotals(): ImpactTotals {
  return {
    requestsReviewed: 0,
    requestsPublished: 0,
    contactReveals: 0,
    confirmedGifts: 0,
    confirmedUsd: 0,
    firstRevealTs: null,
    lastRevealTs: null,
  };
}

interface SnapshotShape {
  generatedOn: string;
  totals: ImpactTotals;
  confirmed: ConfirmedGift[];
}

function fromSnapshot(): ImpactData {
  const s = snapshot as unknown as SnapshotShape;
  const confirmed = Array.isArray(s.confirmed) ? s.confirmed : [];
  const totals = { ...emptyTotals(), ...s.totals };
  return {
    // Derive the confirmed figures from the rows rather than trusting a
    // hand-typed total — the two cannot drift apart this way.
    totals: {
      ...totals,
      confirmedGifts: confirmed.length || totals.confirmedGifts,
      confirmedUsd:
        confirmed.reduce((sum, c) => sum + (Number(c.amount_usd) || 0), 0) ||
        totals.confirmedUsd,
    },
    confirmed,
    source: "snapshot",
    generatedOn: s.generatedOn ?? null,
  };
}

/**
 * Three-tier read, in strict order of trustworthiness:
 *   live      — the database answered
 *   snapshot  — the figures committed to the repo, always present
 *   local     — this browser's own reveals, when there is nothing else to show
 * The Impact page labels which one it is rendering. It never spins forever and
 * never shows an error page.
 */
export async function loadImpact(): Promise<ImpactData> {
  if (trackingConfigured) {
    const [totals, confirmed] = await Promise.all([fetchTotals(), fetchConfirmed()]);
    if (totals !== null) {
      const rows = confirmed ?? [];
      return {
        totals: {
          requestsReviewed: Number(totals.requests_reviewed) || 0,
          requestsPublished: Number(totals.requests_published) || 0,
          contactReveals: Number(totals.contact_reveals) || 0,
          confirmedGifts: Number(totals.confirmed_gifts) || rows.length,
          confirmedUsd:
            Number(totals.confirmed_usd) ||
            rows.reduce((s, c) => s + (Number(c.amount_usd) || 0), 0),
          firstRevealTs: totals.first_reveal_ts,
          lastRevealTs: totals.last_reveal_ts,
        },
        confirmed: rows,
        source: "live",
        generatedOn: null,
      };
    }
  }

  const snap = fromSnapshot();
  const hasSnapshotData =
    snap.totals.contactReveals > 0 ||
    snap.totals.confirmedGifts > 0 ||
    snap.totals.requestsReviewed > 0;
  if (hasSnapshotData) return snap;

  const mine = localReveals();
  if (mine.length === 0) return snap;

  const sorted = [...mine].sort((a, b) => a.ts.localeCompare(b.ts));
  return {
    totals: {
      ...emptyTotals(),
      contactReveals: mine.length,
      firstRevealTs: sorted[0]?.ts ?? null,
      lastRevealTs: sorted[sorted.length - 1]?.ts ?? null,
    },
    confirmed: [],
    source: "local",
    generatedOn: null,
  };
}

const CSV_COLUMNS: ReadonlyArray<keyof ContactReveal> = [
  "ts",
  "request_id",
  "request_title",
  "category",
  "amount_usd",
  "source",
  "session_id",
];

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Leading =, +, -, @ are formula-injection vectors in Excel and Sheets.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function revealsToCsv(rows: ContactReveal[]): string {
  const header = CSV_COLUMNS.join(",");
  const body = rows.map((r) => CSV_COLUMNS.map((c) => csvCell(r[c])).join(","));
  return [header, ...body].join("\r\n");
}

/** Triggers a client-side download. Returns false if the browser blocked it. */
export function downloadCsv(filename: string, csv: string): boolean {
  try {
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
