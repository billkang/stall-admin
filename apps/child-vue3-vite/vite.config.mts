import { defineConfig } from '@stall/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        port: 3000,
      },
    },
  };
});
