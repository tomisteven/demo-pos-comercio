import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader, MessageCircle, Package, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { contrastText, ensureOn, mix } from '../utils/colors';

const fmt = (v) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(Number(v) || 0);

const DEFAULT_COLORS = {
  catalogoColorAcento: '#f97316',
  catalogoColorFondo: '#0f0f0f',
  catalogoColorSuperficie: '#1a1a1a',
  catalogoColorTexto: '#ffffff',
  catalogoColorProducto: '#ffffff',
  catalogoColorSubtitulo: '#a3a3a3',
  catalogoColorDescripcion: '#a3a3a3',
  catalogoColorCategoria: '#a3a3a3',
  catalogoColorPrecio: '#ffffff',
};

const ProductoPublico = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const [prod, cfg] = await Promise.all([
          api.get(`/products/public/${id}`),
          api.get('/system-config/public').catch(() => ({ data: {} })),
        ]);
        if (cancelado) return;
        setProduct(prod.data);
        setConfig(cfg.data || {});
      } catch (err) {
        if (cancelado) return;
        setError(err.response?.status === 404 ? 'Este producto no está disponible.' : 'No pudimos cargar el producto.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargar();
    return () => { cancelado = true; };
  }, [id]);

  useEffect(() => {
    if (product?.nombre) document.title = `${product.nombre} · Precio actualizado`;
    return () => { document.title = 'Stocka POS'; };
  }, [product]);

  const tema = useMemo(() => {
    const c = { ...DEFAULT_COLORS, ...(config || {}) };
    const bg = c.catalogoColorFondo;
    const surface = c.catalogoColorSuperficie;
    const alt = mix(surface, bg, 0.28);
    const on = (color, min) => ensureOn(color, [surface, alt], min);
    return {
      bg,
      surface,
      alt,
      accent: c.catalogoColorAcento,
      onAccent: contrastText(c.catalogoColorAcento),
      title: on(c.catalogoColorTexto, 4.5),
      product: on(c.catalogoColorProducto, 4.5),
      subtitle: on(c.catalogoColorSubtitulo, 4),
      desc: on(c.catalogoColorDescripcion, 4),
      category: on(c.catalogoColorCategoria, 4),
      price: on(c.catalogoColorPrecio, 4.5),
      nombreTienda: c.nombreTienda || 'Mi comercio',
      whatsapp: String(c.footerWhatsapp || '').replace(/\D/g, ''),
      instagram: c.footerInstagram,
      telefono: c.footerTelefono,
    };
  }, [config]);

  const lineaWhatsApp = useMemo(() => {
    if (!product || !tema.whatsapp) return '';
    const texto = `Hola ${tema.nombreTienda}, quiero consultar por: ${product.nombre} (${fmt(product.precioVenta)}).`;
    return `https://wa.me/${tema.whatsapp}?text=${encodeURIComponent(texto)}`;
  }, [product, tema]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ backgroundColor: tema.bg, color: tema.title }}>
        <div className="flex items-center gap-3 text-sm">
          <Loader size={20} className="animate-spin" style={{ color: tema.accent }} />
          Cargando producto...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen grid place-items-center px-4" style={{ backgroundColor: tema.bg, color: tema.title }}>
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="mx-auto mb-3" style={{ color: tema.accent }} />
          <h1 className="text-lg font-bold mb-1" style={{ color: tema.title }}>Producto no disponible</h1>
          <p className="text-sm mb-5" style={{ color: tema.subtitle }}>{error}</p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ backgroundColor: tema.accent, color: tema.onAccent }}
          >
            <ArrowLeft size={16} /> Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const fraccionado = !!product.esFraccionado
    && ((Number(product.precioFraccionado) || 0) > 0 || (Number(product.precioBolsaCerrada) || 0) > 0);
  const disponible = Number(product.stock) > 0;
  const fecha = product.updatedAt
    ? new Date(product.updatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: tema.bg, color: tema.title }}>
      <header className="border-b" style={{ backgroundColor: tema.surface, borderColor: `${tema.title}1f` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/catalogo" className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg shrink-0 grid place-items-center text-xs font-black" style={{ backgroundColor: tema.accent, color: tema.onAccent }}>
              S
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold truncate" style={{ color: tema.title }}>{tema.nombreTienda}</span>
              <span className="block text-[10px] uppercase tracking-widest" style={{ color: tema.subtitle }}>Precio en línea</span>
            </span>
          </Link>
          <Link
            to="/catalogo"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border"
            style={{ color: tema.title, borderColor: `${tema.title}26`, backgroundColor: tema.alt }}
          >
            <ArrowLeft size={14} /> Catálogo
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div
          className="rounded-2xl border overflow-hidden grid md:grid-cols-2"
          style={{ backgroundColor: tema.surface, borderColor: `${tema.title}1f` }}
        >
          <div className="relative min-h-[260px] sm:min-h-[340px]" style={{ backgroundColor: tema.alt }}>
            <div className="absolute inset-0 grid place-items-center">
              <Package size={64} style={{ color: tema.subtitle, opacity: 0.45 }} />
            </div>
            {product.imagen && (
              <img
                src={product.imagen}
                alt={product.nombre}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span
              className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border"
              style={{ backgroundColor: tema.alt, borderColor: `${tema.category}40`, color: tema.category }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.categoria?.color || tema.category }} />
              {product.categoria?.nombre || 'Producto'}
            </span>
          </div>

          <div className="p-5 sm:p-7 flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: tema.category }}>
              Precio actualizado
            </p>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight" style={{ color: tema.product }}>
              {product.nombre}
            </h1>
            {product.descripcion && (
              <p className="text-sm mt-2 leading-relaxed" style={{ color: tema.desc }}>
                {product.descripcion}
              </p>
            )}

            <div className="mt-5 space-y-2">
              {fraccionado ? (
                <>
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-xs font-medium" style={{ color: tema.subtitle }}>Fraccionado</span>
                    <span className="text-2xl font-black" style={{ color: tema.price }}>{fmt(product.precioFraccionado)}</span>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-xs font-medium" style={{ color: tema.subtitle }}>Bolsa cerrada</span>
                    <span className="text-2xl font-black" style={{ color: tema.price }}>{fmt(product.precioBolsaCerrada)}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-end gap-2 flex-wrap">
                  <span className="text-4xl font-black" style={{ color: tema.price }}>{fmt(product.precioVenta)}</span>
                  {product.unidadMedida && product.unidadMedida !== 'unidad' && (
                    <span className="text-xs pb-1.5" style={{ color: tema.subtitle }}>por {product.unidadMedida}</span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-md border"
                style={{
                  color: disponible ? tema.price : '#ef4444',
                  borderColor: disponible ? `${tema.price}33` : '#ef444455',
                  backgroundColor: disponible ? `${tema.price}14` : '#ef444414',
                }}
              >
                {disponible ? 'Disponible' : 'Sin stock'}
              </span>
              {product.sku && (
                <span className="text-[10px] font-mono px-2 py-1 rounded-md border" style={{ color: tema.subtitle, borderColor: `${tema.title}1f` }}>
                  {product.sku}
                </span>
              )}
            </div>

            <div className="mt-auto pt-6 space-y-3">
              {lineaWhatsApp && (
                <a
                  href={lineaWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: tema.accent, color: tema.onAccent }}
                >
                  <MessageCircle size={18} /> Consultar por WhatsApp
                </a>
              )}
              <p className="text-[11px] leading-relaxed flex items-start gap-1.5" style={{ color: tema.subtitle }}>
                <RefreshCw size={12} className="mt-0.5 shrink-0" />
                {fecha ? `Precio vigente al ${fecha}. ` : ''}
                Si el comercio actualiza el precio, esta página muestra el valor nuevo automáticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/catalogo" className="text-xs font-semibold underline underline-offset-4" style={{ color: tema.subtitle }}>
            Ver todos los productos del catálogo
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ProductoPublico;
