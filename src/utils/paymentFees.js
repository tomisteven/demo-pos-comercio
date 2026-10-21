// Deducciones (%) que el comercio absorbe según el medio de pago.
// El precio para el cliente NO cambia: estas deducciones salen de la ganancia.
// Los porcentajes se configuran desde Configuración (SystemConfig.impuestos);
// estos valores son solo el fallback si la config todavía no se cargó.

export const PAYMENT_METHOD_LABELS = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta crédito',
  tarjeta_debito: 'Tarjeta débito',
  transferencia: 'Transferencia',
};

export const IMPUESTOS_DEFECTO = [
  { nombre: 'Retención IIBB', porcentaje: 2.5, metodoPago: 'tarjeta', activo: true },
  { nombre: 'Comisión Mercado Pago', porcentaje: 6.29, metodoPago: 'tarjeta', activo: true },
  { nombre: 'Retención IIBB', porcentaje: 2.5, metodoPago: 'tarjeta_debito', activo: true },
  { nombre: 'Comisión Mercado Pago', porcentaje: 2, metodoPago: 'tarjeta_debito', activo: true },
];

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// impuestos: lista de impuestos configurados ({ nombre, porcentaje, metodoPago, activo })
export const calcularDeduccionesPago = (metodoPago, totalFinal, impuestos = IMPUESTOS_DEFECTO) => {
  const total = Number(totalFinal) || 0;
  const aplicables = (impuestos || IMPUESTOS_DEFECTO).filter(
    (i) => i && i.activo !== false && i.metodoPago === metodoPago && Number(i.porcentaje) > 0
  );

  if (aplicables.length === 0) {
    return { retencionIIBB: 0, comisionMP: 0, impuestosPago: 0, totalNeto: round2(total), tieneDeducciones: false, impuestosDetalle: [] };
  }

  let retencionIIBB = 0;
  let comisionMP = 0;
  let impuestosPago = 0;
  const impuestosDetalle = [];

  for (const imp of aplicables) {
    const monto = round2((total * Number(imp.porcentaje)) / 100);
    impuestosPago += monto;
    impuestosDetalle.push({ nombre: imp.nombre, porcentaje: Number(imp.porcentaje), monto });
    if (/\biibb\b/i.test(imp.nombre)) retencionIIBB += monto;
    else if (/\bmercado\b|\bmp\b/i.test(imp.nombre)) comisionMP += monto;
  }

  return {
    retencionIIBB: round2(retencionIIBB),
    comisionMP: round2(comisionMP),
    impuestosPago: round2(impuestosPago),
    totalNeto: round2(total - impuestosPago),
    tieneDeducciones: true,
    impuestosDetalle,
  };
};

export const getPaymentMethodLabel = (metodoPago) =>
  PAYMENT_METHOD_LABELS[metodoPago] || metodoPago;
