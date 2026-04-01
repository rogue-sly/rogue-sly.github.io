import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
    plugins: [sveltekit(), devtoolsJson()],
    test: { include: ["tests/**/*.{test,spec}.{js,ts}"] },
    esbuild: { treeShaking: true },
    optimizeDeps: { include: ["svelte", "@sveltejs/kit"] },
});
