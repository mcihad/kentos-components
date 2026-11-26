import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The showcase of @kentos/components: every component and token on one site.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5320, strictPort: true },
  build: { target: "es2022", chunkSizeWarningLimit: 1000 },
});
