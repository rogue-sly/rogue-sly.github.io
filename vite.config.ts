import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
    assetsInclude: ["**/*.cast"],
    plugins: [sveltekit()],
    esbuild: { treeShaking: true },
    optimizeDeps: { include: ["svelte", "@sveltejs/kit"] },
});
