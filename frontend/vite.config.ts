import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, process.cwd(), '');
  let apiTarget = env.VITE_API_URL || 'https://hungtin-prod.up.railway.app';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
})

