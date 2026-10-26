import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" emits RELATIVE asset paths. The exact same /dist works at
// username.github.io/onesmallask, at a custom domain root, on Netlify, or opened
// from the filesystem. Combined with HashRouter this removes the single
// most common cause of a blank-white GitHub Pages deploy.
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react()],
  define: {
    // Demo mode exists so the site can be shown end to end on a laptop while the
    // live list is still honestly empty. It is a COMPILE-TIME constant: only
    // `vite --mode demo` (npm run demo / npm run build:demo) sets it to true, and
    // in every other build the demo branches are dead code and are stripped from
    // the bundle. The deploy workflow greps the output for the demo marker and
    // refuses to publish if it is ever present. See src/lib/demo.ts.
    __OSA_DEMO__: JSON.stringify(mode === "demo"),
  },
  build: {
    outDir: mode === "demo" ? "dist-demo" : "dist",
    sourcemap: false,
    target: "es2020",
  },
}));
