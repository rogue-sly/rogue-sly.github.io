import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        include: ["tests/**/*.{test,spec}.{js,ts}"],
    },
    build: {
        target: "esnext",
        minify: "esbuild",
        rollupOptions: {
            output: {
                manualChunks(id: string) {
                    if (id.includes("node_modules/shiki")) {
                        return "shiki";
                    }
                    if (id.includes("node_modules/svelte") || id.includes("node_modules/@sveltejs")) {
                        return "svelte-vendor";
                    }
                },
            },
        },
    },
    esbuild: {
        treeShaking: true,
    },
    optimizeDeps: {
        include: ["svelte", "@sveltejs/kit"],
    },
});
