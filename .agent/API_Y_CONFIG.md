# API, Configuración y Build

## Variables
- **Dev:** Usa proxy de Vite `server.proxy['/api']` -> backend
- **Prod (Netlify):** Usar `VITE_API_URL` apuntando a API en Vercel + `/api`

## Vite config (`vite.config.js`)
```js
server: {
  port: 5173,
  proxy: { '/api': { target: 'http://localhost:9090', changeOrigin: true } }
}
```

## Build
- `npm run build` genera `dist/`
- `netlify.toml` tiene redirect SPA `/* -> /index.html` status 200

## Catálogo público
- `GET /api/products/public/catalog`
- `GET /api/system-config/public`
- Ficha QR: `GET /api/products/public/:id`
