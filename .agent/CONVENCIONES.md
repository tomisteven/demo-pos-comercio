# Convenciones Cliente

## Código
- Componentes funcionales con hooks
- Tailwind para estilos
- Evitar comentarios innecesarios
- Mantener consistencia con el patrón existente

## Colores catálogo
- Usar clases semánticas `.cat-product`, `.cat-desc`, `.cat-category`, `.cat-price`
- Las variables CSS `--cat-*` se inyectan inline desde `Catalogo.jsx`
- Siempre garantizar legibilidad con `ensureOn/contrastText`

## Antes de commitear
- `npm run lint` (0 errores esperados)
- `npm run build` sin errores
- Probar flujos críticos: login, POS, productos, catálogo
