import terser from '@rollup/plugin-terser';

const shared = {
  plugins: [terser()],
};

export default [
  // Main library — ESM + CJS
  {
    input: 'src/index.js',
    output: [
      { file: 'dist/just-in-vibes.esm.js', format: 'es' },
      { file: 'dist/just-in-vibes.cjs.js', format: 'cjs', exports: 'named' },
    ],
    ...shared,
  },
  // UMD bundle for <script> tag usage (exposes window.JustInVibes)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/just-in-vibes.umd.js',
      format: 'umd',
      name: 'JustInVibes',
      exports: 'named',
    },
    ...shared,
  },
  // Auto-init bundle — include after setting VIBE_CONFIG
  {
    input: 'src/auto.js',
    output: {
      file: 'dist/just-in-vibes.auto.js',
      format: 'iife',
      globals: {},
    },
    ...shared,
  },
];
