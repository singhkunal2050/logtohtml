import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.js"],
  },
});
