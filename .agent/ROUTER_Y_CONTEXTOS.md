# Router, Auth y Carrito

## Rutas públicas (ver App.jsx)
- `/login` - Login split-screen
- `/catalogo` - Catálogo público con paleta configurable
- `/p/:id` - **Ficha pública de producto con QR** (muestra precio actualizado)
- `/informacion-sistema-pos` - Landing informativa

## Rutas protegidas (dentro de Layout)
Principales:
- `/dashboard` - Resumen
- `/pos` - Punto de venta
- `/products` - ABM productos + etiquetas PDF + QR
- `/categories` - Categorías
- `/sales` / `/orders` - Ventas/pedidos
- `/stock` - Movimientos/stock
- `/clientes` / `/clientes/:id`
- `/proveedores` / `/ordenes-compra`
- `/gastos` / `/gastos-fijos`
- `/presupuestos` - Presupuestos
- `/promociones` - Promociones
- `/reportes` / `/statistics` / `/impuestos` / `/rventas`
- `/calendario` / `/afiliados`
- `/asistente` / `/ai-hub` / `/preguntar-ia` / `/analisis-productos` / `/ai-history`
- `/users` - Solo admin
- `/configuracion` - Solo admin (tienda, metas, paleta catálogo, footer)

## AuthContext (`src/context/AuthContext.jsx`)
- Guarda `userInfo` en `localStorage`
- Expone `user`, `login`, `logout`, `loading`

## CartContext (`src/context/CartContext.jsx`)
- Maneja carrito para POS/catalogo
- Agregar/quitar/cantidad

## Axios (`src/api/axios.js`)
- `baseURL`: `import.meta.env.VITE_API_URL || '/api'`
- Interceptor agrega `Authorization: Bearer <token>`
- Interceptor 401 limpia sesión y redirige a `/login`
