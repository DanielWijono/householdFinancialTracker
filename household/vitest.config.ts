import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // tests/*.test.mjs use node:test and run via `node --test`.
    include: ["lib/**/*.test.ts"],
  },
});
