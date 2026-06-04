import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Eleventy test builds all write to ./_site — run files sequentially to avoid collisions
    fileParallelism: false,
  },
});
