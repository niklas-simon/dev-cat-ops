import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // Ermöglicht globale Test-APIs wie `describe`, `it`, `expect`
    environment: "jsdom", // Simuliert eine Browser-Umgebung für React/Next.js
    setupFiles: "vitest.setup.ts", // Falls du globale Mocks oder Setup benötigst
  },
});
