import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" emits RELATIVE asset paths. The exact same /dist works at
// username.github.io/onesmallask, at a custom domain root, on Netlify, or opened
// from the filesystem. Combined with HashRouter this removes the single
// most common cause of a blank-white GitHub Pages deploy.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
  },
});
