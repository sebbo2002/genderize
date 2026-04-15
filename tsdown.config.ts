import { defineConfig } from 'tsdown';

export default defineConfig({
    dts: true,
    entry: ['src/lib/index.ts'],
    format: ['esm'],
    format: ['esm', 'cjs'],
    minify: true,
    sourcemap: true,
});
