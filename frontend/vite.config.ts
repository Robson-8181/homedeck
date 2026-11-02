import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

// The OFL requires the license text to travel with the bundled fonts.
function fontLicenses(): Plugin {
  return {
    name: "homedeck-font-licenses",
    generateBundle() {
      for (const font of ["outfit", "figtree"]) {
        this.emitFile({
          type: "asset",
          fileName: `fonts/${font}-LICENSE.txt`,
          source: readFileSync(resolve(__dirname, `node_modules/@fontsource-variable/${font}/LICENSE`), "utf8"),
        });
      }
    },
  };
}

// App build (not library mode): Vite's lib mode skips minification for ES
// output, which shipped a ~600 kB unminified panel to every wall tablet.
export default defineConfig({
  // Relative base: fonts resolve next to homedeck-panel.js under /homedeck_static/.
  base: "./",
  plugins: [react(), fontLicenses()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    emptyOutDir: true,
    minify: "esbuild",
    target: "es2022",
    modulePreload: false,
    copyPublicDir: false,
    outDir: resolve(
      __dirname,
      "../custom_components/homedeck/frontend",
    ),
    rollupOptions: {
      input: resolve(__dirname, "src/main.tsx"),
      preserveEntrySignatures: "strict",
      output: {
        format: "es",
        entryFileNames: "homedeck-panel.js",
        assetFileNames: "fonts/[name]-[hash][extname]",
        inlineDynamicImports: true,
      },
    },
  },
});
