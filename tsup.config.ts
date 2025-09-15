import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: {
    index: "./src/index.ts",
    "client/index": "./src/client/index.ts",
    "next-js/index": "./src/integrations/next-js.ts",
  },
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
});
