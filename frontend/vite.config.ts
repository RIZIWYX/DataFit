import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // les appels /api/... sont transmis au backend, comme le fait nginx dans Docker :
    // le site et l'API partagent la même adresse, donc pas de souci de CORS
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
