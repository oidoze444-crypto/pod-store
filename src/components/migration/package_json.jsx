// ============================================================
// Backend — package.json
// ============================================================
{
  "name": "pod-store-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}

// ============================================================
// Frontend — .env (Vite ou Create React App)
// ============================================================

// Para Vite:
// VITE_API_URL=https://seudominio.com.br/api

// Para CRA:
// REACT_APP_API_URL=https://seudominio.com.br/api

// ============================================================
// Frontend — vite.config.js (se usar Vite)
// ============================================================
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})