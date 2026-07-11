import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/taxi-map.ts',
      name: 'TaxiMapWidget',
      fileName: 'taxi-map'
    }
  }
});
