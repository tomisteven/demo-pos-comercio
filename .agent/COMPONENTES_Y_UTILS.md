# Componentes y Utilidades

## Componentes
| Archivo | Uso |
|---|---|
| `components/Layout.jsx` | Sidebar, header, nombre tienda desde config pública |
| `components/ProtectedRoute.jsx` | Protege rutas, `requireAdmin` |
| `components/BarcodeScannerModal.jsx` | Escáner con `html5-qrcode` |
| `components/Chatbot.jsx` | Asistente IA |
| `components/SalesEditor.jsx` | Editor de venta |

## Utils
| Archivo | Uso |
|---|---|
| `utils/colors.js` | `hexToRgb`, `luminance`, `contrastRatio`, `contrastText`, `ensureContrast`, `ensureOn`, `mix` |
| `utils/labelPdf.js` | Genera PDF A4 3x8 con etiquetas. Soporta `includeBarcode`, `includeQr`, `publicBaseUrl` |
| `utils/exportProductsExcel.js` | Exporta productos a Excel |
| `utils/paymentFees.js` | Etiquetas/formas de pago |
| `utils/uiScale.js` | Escala UI global |
| `hooks/useDebounce.js` | Debounce para búsquedas |
