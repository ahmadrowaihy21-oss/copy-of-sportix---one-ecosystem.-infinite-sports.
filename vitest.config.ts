import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);
const liveEmailTests = [
  "server/resend.credential.test.ts", "server/resend.credentials.test.ts",
  "server/resend.secret.test.ts", "server/resend.live-secret.test.ts",
  "server/resend.from-secret.test.ts", "server/resend.recipient-secret.test.ts",
];
const runLiveEmailChecks = process.env.SPORTIX_LIVE_EMAIL_CHECKS === "1";

export default defineConfig({
  root: templateRoot,
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    exclude: runLiveEmailChecks ? [] : liveEmailTests,
    include: runLiveEmailChecks ? liveEmailTests : ["server/**/*.test.ts", "server/**/*.spec.ts", "client/**/*.test.tsx", "client/src/pages/marketplace*.test.ts", "client/src/pages/goSportix*.test.ts", "client/src/pages/homeAccess.test.ts"],
    environmentMatchGlobs: [["client/**/*.test.tsx", "jsdom"]],
  },
});
