import { defineConfig } from 'tsdown';

export default defineConfig({
    dts: true,
    entry: ['src/lib/index.ts', 'src/bin/cli.ts', 'src/bin/start.ts'],
    entry: ['src/lib/index.ts', 'src/bin/cli.ts', 'src/bin/start.ts'],
    format: ['esm'],
    format: ['esm', 'cjs'],
    minify: true,
    sourcemap: true,
});
