import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
  },
  // tsconfig keeps JSX for Next to compile; tests need it compiled here.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  resolve: {
    alias: { "@": root },
  },
});
