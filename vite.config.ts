/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { validateContentPlugin } from "./vite/plugins/validateContent";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), validateContentPlugin()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
