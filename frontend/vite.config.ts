import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // les appels /api/... sont transmis au backend, comme le fait nginx dans Docker :
    // le site et l'API partagent la même adresse, donc pas de souci de CORS
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        // on garde l'adresse du site (localhost:5173), comme nginx avec « Host $http_host » :
        // sinon Spring voit arriver « localhost:8080 » et refuse les POST et PUT (CORS)
        changeOrigin: false,
      },
    },
  },
})
