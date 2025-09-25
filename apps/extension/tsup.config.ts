import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    background: "src/background/index.ts",
    content: "src/content/index.ts",
  },
  format: ["esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  outDir: "dist",
  target: "es2021",
  onSuccess: "node ./scripts/copy-assets.mjs",
});
