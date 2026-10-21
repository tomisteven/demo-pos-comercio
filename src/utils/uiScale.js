// Escala de la interfaz (tamaño de fuente de todo el sistema).
// Tailwind usa unidades `rem`, así que escalar el font-size del <html>
// escala toda la UI proporcionalmente (textos, paddings, gaps, etc.).
// Se guarda por dispositivo en localStorage, así cada pantalla
// (computadora, tele, etc.) puede tener su propio tamaño.

const KEY = 'uiScale';
const BASE_PX = 16; // font-size base del root
const MIN = 60;
const MAX = 160;

export const getUiScale = () => {
  const raw = parseFloat(localStorage.getItem(KEY));
  if (isNaN(raw)) return 100;
  return Math.min(MAX, Math.max(MIN, raw));
};

export const applyUiScale = (scale) => {
  const s = Math.min(MAX, Math.max(MIN, Number(scale) || 100));
  localStorage.setItem(KEY, String(s));
  document.documentElement.style.fontSize = `${(BASE_PX * s) / 100}px`;
  return s;
};

// Llamar una vez al arrancar la app (main.jsx)
export const initUiScale = () => applyUiScale(getUiScale());
