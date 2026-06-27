import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['demo/bundle-entry.ts'],
  format: ['esm'],
  outDir: 'demo/vendor',
  dts: false,
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  target: 'es2022',
  platform: 'browser',
  treeshake: true,
  noExternal: [/./],  // bundle everything
  banner: {
    js: '// aixa.js — Agent Interaction & eXecution Agreement (AIXA) SDK — self-contained ESM bundle',
  },
});
