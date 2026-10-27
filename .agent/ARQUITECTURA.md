# Arquitectura Cliente

## Entrypoints
- `src/main.jsx` - Monta React
- `src/App.jsx` - Router principal, `AuthProvider`, `CartProvider`, rutas públicas/privadas
- `src/index.css` - Estilos globales + tema configurable del catálogo (`.catalogo-theme`)
- `index.html` - Título/favicon

## Estructura
```
src/
├── api/        # Configuración Axios
├── assets/     # Imágenes/logos
├── components/ # Componentes compartidos (Layout, ProtectedRoute, BarcodeScannerModal, Chatbot, SalesEditor)
├── context/    # AuthContext, CartContext
├── hooks/      # Custom hooks (useDebounce)
├── pages/      # Vistas completas por ruta
├── utils/      # Helpers (colors, labelPdf, exportProductsExcel, paymentFees, uiScale)
└── App.jsx
```

## Notas
- Todo lo relacionado a autenticación va por `AuthContext`
- El carrito vive en `CartContext` (usado por `POS` y `Catalogo`)
- Las rutas protegidas usan `ProtectedRoute`
- El layout general (sidebar/topbar) está en `Layout.jsx`
