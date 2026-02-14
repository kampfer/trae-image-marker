import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
});
