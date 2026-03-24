import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
    base: '',
    plugins: [
        cssInjectedByJsPlugin(),
    ],
    build: {
        rollupOptions: {
            output: {
                // This ensures the output file has a predictable name
                manualChunks: undefined,
                entryFileNames: `rrule-gui.js`,
                chunkFileNames: `rrule-gui.js`,
                assetFileNames: `[name].[ext]`,
            },
        },
    },
});