import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';

const fmt = (v) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(Number(v) || 0);

// Renderiza un código de barras Code128 a PNG (dataURL). Devuelve null si falla.
const barcodeDataUrl = (value) => {
  try {
    if (!value) return null;
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, String(value), {
      format: 'CODE128',
      displayValue: false,
      margin: 0,
      width: 2,
      height: 44,
      background: '#ffffff',
      lineColor: '#000000',
    });
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
};

// Dibuja una etiqueta de precio dentro del rectángulo (x, y, w, h) en mm.
const drawLabel = (doc, p, x, y, w, h, storeName) => {
  const pad = 2.5;
  const innerW = w - pad * 2;

  doc.setDrawColor(205);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);

  // Nombre del comercio
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(120);
  doc.text(String(storeName || '').toUpperCase(), x + pad, y + 3.6, { maxWidth: innerW });

  // Nombre del producto (hasta 2 líneas)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20);
  const nombreLineas = doc.splitTextToSize(String(p.nombre || ''), innerW).slice(0, 2);
  doc.text(nombreLineas, x + pad, y + 7.6);
  const nombreBottom = y + 7.6 + (nombreLineas.length - 1) * 3.2;

  const fraccionado = !!p.esFraccionado
    && ((Number(p.precioFraccionado) || 0) > 0 || (Number(p.precioBolsaCerrada) || 0) > 0);
  const tieneBarcode = !!p.codigoBarras;
  // Reservamos la franja inferior: código de barras (si hay) + texto del código.
  const bottomStart = y + h - (tieneBarcode ? 11 : 5.5);

  // Zona del precio: desde debajo del nombre hasta el comienzo del código de barras.
  const priceTop = nombreBottom + 1.5;
  const priceCenterY = (priceTop + bottomStart) / 2;

  if (fraccionado) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(90);
    doc.text('Fraccionado', x + pad, priceCenterY - 2.4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text(fmt(p.precioFraccionado), x + w - pad, priceCenterY - 2.1, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(90);
    doc.text('Bolsa cerrada', x + pad, priceCenterY + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text(fmt(p.precioBolsaCerrada), x + w - pad, priceCenterY + 4.5, { align: 'right' });
  } else {
    // Precio grande, centrado vertical y horizontalmente en la zona disponible.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(20);
    doc.text(fmt(p.precioVenta), x + w / 2, priceCenterY + 2.2, { align: 'center' });
  }

  // Código de barras / SKU
  const codeY = y + h - 11;
  if (tieneBarcode) {
    const dataUrl = barcodeDataUrl(p.codigoBarras);
    if (dataUrl) {
      const bcH = 6;
      const bcW = Math.min(innerW, 42);
      try {
        doc.addImage(dataUrl, 'PNG', x + (w - bcW) / 2, codeY, bcW, bcH);
      } catch {
        /* si falla el barcode, seguimos con el texto */
      }
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(90);
  doc.text(String(p.codigoBarras || p.sku || ''), x + w / 2, y + h - 1.4, {
    align: 'center',
    maxWidth: innerW,
  });
};

/**
 * Genera un PDF A4 con etiquetas de precio de todos los productos.
 * - Grilla de 3 columnas x 8 filas (24 etiquetas por hoja).
 * - Los productos con `esFraccionado` muestran precio fraccionado y bolsa cerrada.
 * - Si el producto tiene `codigoBarras`, se imprime el código Code128.
 *
 * @param {{ products: object[], storeName?: string, copies?: number }} opts
 * @returns {Promise<{ total: number, productos: number }>}
 */
export const generateProductLabelsPdf = async ({ products = [], storeName = 'MiniMarket', copies = 1 } = {}) => {
  const lista = products.filter((p) => p.activo !== false && !p.esCombo);
  if (!lista.length) throw new Error('No hay productos activos para generar etiquetas');

  const nCopias = Math.max(1, Math.min(50, Number(copies) || 1));

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const cols = 3;
  const rows = 8;
  const marginX = 6;
  const marginY = 6;
  const pageW = 210;
  const pageH = 297;
  const cellW = (pageW - marginX * 2) / cols;
  const cellH = (pageH - marginY * 2) / rows;
  const labelW = cellW - 2;
  const labelH = cellH - 2;
  const perPage = cols * rows;

  // Expandir por cantidad de copias
  const etiquetas = [];
  lista.forEach((p) => {
    for (let i = 0; i < nCopias; i++) etiquetas.push(p);
  });

  etiquetas.forEach((p, i) => {
    if (i > 0 && i % perPage === 0) doc.addPage();
    const slot = i % perPage;
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    const x = marginX + col * cellW + 1;
    const y = marginY + row * cellH + 1;
    drawLabel(doc, p, x, y, labelW, labelH, storeName);
  });

  const fecha = new Date().toISOString().slice(0, 10);
  doc.save(`Etiquetas-Precios-${fecha}.pdf`);

  return { total: etiquetas.length, productos: lista.length };
};
