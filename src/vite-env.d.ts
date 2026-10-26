/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Compile-time flag set by vite.config.ts: true only under `--mode demo`.
 * In a normal build it is the literal `false`, so every `if (DEMO_MODE)` branch
 * is removed from the bundle. Never read this anywhere except src/lib/demo.ts.
 */
declare const __OSA_DEMO__: boolean;
