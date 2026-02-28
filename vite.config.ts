import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
    plugins: [sveltekit()],
    build: { chunkSizeWarningLimit: 600 },
    test: {
        include: ["tests/**/*.{test,spec}.{js,ts}"],
    },
});
