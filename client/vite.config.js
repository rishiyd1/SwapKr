import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
        "/socket.io": {
          target: env.VITE_BACKEND_URL,
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      tailwindcss(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
