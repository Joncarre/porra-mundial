import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDemo = env.VITE_DEMO_MODE === 'true';

  return {
    plugins: [react()],
    resolve: {
      alias: isDemo
        ? {
            'firebase/app': path.resolve('./src/demo/mockFirebaseApp.js'),
            'firebase/firestore': path.resolve('./src/demo/mockFirestore.js'),
          }
        : {},
    },
  };
});
