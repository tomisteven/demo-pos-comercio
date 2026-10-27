export const isHexColor = (value) => /^#[0-9a-fA-F]{6}$/.test(String(value || '').trim());

export const normalizeHex = (value) => {
  let s = String(value || '').trim();
  if (!s.startsWith('#')) s = `#${s}`;
  return isHexColor(s) ? s.toLowerCase() : null;
};

export const rgbToHex = (r, g, b) => `#${[r, g, b]
  .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
  .join('')}`;

export const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return { r: 249, g: 115, b: 22 };
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

// Mezcla el color A hacia B. t=0 devuelve A, t=1 devuelve B.
export const mix = (a, b, t) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const k = Math.max(0, Math.min(1, t));
  return rgbToHex(A.r + (B.r - A.r) * k, A.g + (B.g - A.g) * k, A.b + (B.b - A.b) * k);
};

const channel = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const contrastRatio = (a, b) => {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
};

// Devuelve blanco o el texto oscuro de la marca, el que mejor contraste tenga.
export const contrastText = (hex) => {
  const white = contrastRatio('#ffffff', hex);
  const dark = contrastRatio('#12211b', hex);
  return white >= dark ? '#ffffff' : '#12211b';
};

// Ajusta un color hasta que tenga contraste suficiente con el fondo.
export const ensureContrast = (fg, bg, min = 4.5) => {
  const base = normalizeHex(fg) || '#ffffff';
  const bgc = normalizeHex(bg) || '#000000';
  if (contrastRatio(base, bgc) >= min) return base;
  const towards = luminance(bgc) < 0.5 ? '#ffffff' : '#000000';
  let c = base;
  for (let i = 0; i < 24; i += 1) {
    c = mix(c, towards, 0.08);
    if (contrastRatio(c, bgc) >= min) return c;
  }
  return towards;
};

// Garantiza contraste contra varios fondos a la vez (ej: página y tarjetas).
export const ensureOn = (fg, backgrounds, min = 4.5) => {
  const list = (Array.isArray(backgrounds) ? backgrounds : [backgrounds])
    .map((b) => normalizeHex(b) || '#000000');
  const base = normalizeHex(fg) || '#ffffff';
  if (!list.length) return base;
  const minRatio = (c) => Math.min(...list.map((b) => contrastRatio(c, b)));
  if (minRatio(base) >= min) return base;
  const avg = list.reduce((s, b) => s + luminance(b), 0) / list.length;
  const whiteRatio = minRatio('#ffffff');
  const blackRatio = minRatio('#000000');
  const towards = whiteRatio >= blackRatio ? '#ffffff' : '#000000';
  const towardsRatio = Math.max(whiteRatio, blackRatio);
  const baseRatio = minRatio(base);
  if (towardsRatio <= baseRatio) return base;
  const distance = Math.abs(luminance(base) - avg);
  if (towardsRatio < min && distance > 0.35) return towards;
  let c = base;
  for (let i = 0; i < 32; i += 1) {
    c = mix(c, towards, 0.08);
    if (minRatio(c) >= min) return c;
  }
  return towardsRatio >= baseRatio ? towards : base;
};
