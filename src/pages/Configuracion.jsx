import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { getUiScale, applyUiScale } from '../utils/uiScale';
import {
  Settings, Save, Target, TrendingUp, Award, Coins, RefreshCw, DollarSign, Wallet,
  Store, Type, Percent, Plus, Trash2, User, KeyRound, Power, Receipt, ALargeSmall,
  MapPin, Phone, Mail, Clock, Camera, Globe, MessageCircle, PanelBottom
} from 'lucide-react';
import toast from 'react-hot-toast';

const fmt = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

const METAS_INICIALES = {
  metaFacturacionDiaria: 40000,
  metaGananciaDiaria: 30000,
  metaFacturacionMensual: 4000000,
  margenGananciaDefecto: 30,
  pesosPorPunto: 200,
};

const TIENDA_INICIAL = {
  nombreTienda: 'Poroto MiniMarket',
  catalogoTitulo: 'Poroto MiniMarket',
  catalogoSubtitulo: 'Alimentos, bebidas, limpieza y mas. Elegi online, retira en el local o coordina el envio.',
  catalogoTextoEnvio: 'Coordinamos el envio por WhatsApp',
  catalogoTextoPago: 'Efectivo, transferencia y tarjetas',
};

const CAMPOS_META = [
  { key: 'metaFacturacionDiaria', title: 'Meta de facturación diaria', desc: 'Objetivo de $ vendidos por día (barra del Dashboard).', icon: Target, gradient: 'from-primary to-primaryDark', type: 'currency' },
  { key: 'metaGananciaDiaria', title: 'Meta de ganancia diaria', desc: 'Objetivo de ganancia ($) por día.', icon: Wallet, gradient: 'from-violet-500 to-purple-700', type: 'currency' },
  { key: 'metaFacturacionMensual', title: 'Meta de facturación mensual', desc: 'Objetivo de $ vendidos por mes.', icon: DollarSign, gradient: 'from-blue-500 to-blue-700', type: 'currency' },
  { key: 'margenGananciaDefecto', title: 'Margen de ganancia por defecto (%)', desc: 'Margen usado al crear productos para calcular el precio desde el costo.', icon: TrendingUp, gradient: 'from-amber-500 to-orange-600', type: 'percent', suffix: '%' },
  { key: 'pesosPorPunto', title: 'Pesos por punto de afiliado', desc: 'Cada $X de un cliente afiliado = 1 punto.', icon: Award, gradient: 'from-purple-500 to-purple-700', type: 'money' },
];

const CAMPOS_TIENDA = [
  { key: 'nombreTienda', title: 'Nombre de la tienda', desc: 'Se muestra en el encabezado, el pie y los tickets del catálogo.', icon: Store },
  { key: 'catalogoTitulo', title: 'Título del catálogo', desc: 'Título del banner principal de la tienda online.', icon: Type },
  { key: 'catalogoSubtitulo', title: 'Descripción del catálogo', desc: 'Texto informativo que aparece en el pie del catálogo.', icon: Type },
  { key: 'catalogoTextoEnvio', title: 'Texto de envíos', desc: 'Beneficio de envíos que se muestra en la tira de beneficios.', icon: Type },
  { key: 'catalogoTextoPago', title: 'Texto de pagos', desc: 'Beneficio de pago que se muestra en la tira de beneficios.', icon: Type },
];

// Textos y datos del pie del catálogo público (opcionales: vacío oculta el elemento)
const FOOTER_INICIAL = {
  footerUbicacion: 'Av. Siempre Viva 742, Buenos Aires, Argentina',
  footerTelefono: '+54 11 5555-1234',
  footerEmail: 'info@porotomimarket.com',
  footerHorario: 'Lunes a Sabado · 9:00 a 20:00 hs',
  footerInstagram: 'https://instagram.com/porotomimarket',
  footerFacebook: 'https://facebook.com/porotomimarket',
  footerWhatsapp: '5491162589131',
  footerPedidosTexto: 'Arma tu pedido en el catalogo y envialo por WhatsApp. Te confirmamos disponibilidad y formas de pago.',
  footerCopyright: 'Precios sujetos a cambios sin previo aviso',
  footerHechoCon: 'Hecho con ♥ para tu barrio',
};

const GRUPOS_FOOTER = ['Contacto', 'Redes sociales', 'Textos del pie'];

const CAMPOS_FOOTER = [
  { key: 'footerUbicacion', title: 'Ubicación', desc: 'Dirección del local.', icon: MapPin, group: 'Contacto' },
  { key: 'footerTelefono', title: 'Teléfono', desc: 'Se muestra como enlace para llamar.', icon: Phone, group: 'Contacto' },
  { key: 'footerEmail', title: 'Email', desc: 'Se muestra como enlace de correo.', icon: Mail, group: 'Contacto' },
  { key: 'footerHorario', title: 'Horario', desc: 'Ej: Lunes a Sabado · 9:00 a 20:00 hs.', icon: Clock, group: 'Contacto' },
  { key: 'footerInstagram', title: 'Instagram', desc: 'URL del perfil. Dejar vacío para ocultar.', icon: Camera, group: 'Redes sociales' },
  { key: 'footerFacebook', title: 'Facebook', desc: 'URL del perfil. Dejar vacío para ocultar.', icon: Globe, group: 'Redes sociales' },
  { key: 'footerWhatsapp', title: 'WhatsApp', desc: 'Código de país + número (ej: 5491155551234). Dejar vacío para ocultar.', icon: MessageCircle, group: 'Redes sociales' },
  { key: 'footerPedidosTexto', title: 'Texto de pedidos', desc: 'Párrafo de la columna "Pedidos".', icon: Type, group: 'Textos del pie', textarea: true },
  { key: 'footerCopyright', title: 'Aviso del pie', desc: 'Ej: Precios sujetos a cambios sin previo aviso.', icon: Type, group: 'Textos del pie' },
  { key: 'footerHechoCon', title: 'Frase "Hecho con"', desc: 'Se muestra con un ♥ al lado. Dejar vacío para ocultar.', icon: Type, group: 'Textos del pie' },
];

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta crédito' },
  { value: 'tarjeta_debito', label: 'Tarjeta débito' },
  { value: 'transferencia', label: 'Transferencia' },
];

const SECCIONES = [
  { id: 'metas', label: 'Metas y parámetros', icon: Target },
  { id: 'tienda', label: 'Tienda y catálogo', icon: Store },
  { id: 'footer', label: 'Footer del catálogo', icon: PanelBottom },
  { id: 'impuestos', label: 'Impuestos por medio de pago', icon: Percent },
  { id: 'apariencia', label: 'Apariencia', icon: ALargeSmall },
  { id: 'cuenta', label: 'Mi cuenta', icon: User },
];

// Presets de tamaño de interfaz (%)
const UI_SCALE_PRESETS = [
  { value: 75, label: 'Muy pequeño' },
  { value: 85, label: 'Pequeño' },
  { value: 100, label: 'Normal' },
  { value: 115, label: 'Grande' },
  { value: 130, label: 'Muy grande' },
];

// Devuelve solo las claves indicadas que existan en el objeto
const pick = (obj, keys) => keys.reduce((acc, k) => { if (obj[k] !== undefined) acc[k] = obj[k]; return acc; }, {});

const Configuracion = () => {
  const { user: me } = useContext(AuthContext);
  const [seccion, setSeccion] = useState('metas');

  const [metas, setMetas] = useState(METAS_INICIALES);
  const [tienda, setTienda] = useState(TIENDA_INICIAL);
  const [footer, setFooter] = useState(FOOTER_INICIAL);
  const [impuestos, setImpuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mi cuenta
  const [cuenta, setCuenta] = useState({ nombre: '', email: '', password: '' });
  const [savingCuenta, setSavingCuenta] = useState(false);

  // Nuevo impuesto
  const [nuevoImp, setNuevoImp] = useState({ nombre: '', porcentaje: '', metodoPago: 'tarjeta' });

  // Apariencia (tamaño de interfaz, por dispositivo)
  const [uiScale, setUiScale] = useState(100);

  useEffect(() => {
    setUiScale(getUiScale());
  }, []);

  useEffect(() => {
    api.get('/system-config')
      .then(res => {
        const c = res.data?.config;
        if (!c) return;
        setMetas({ ...METAS_INICIALES, ...pick(c, Object.keys(METAS_INICIALES)) });
        setTienda({ ...TIENDA_INICIAL, ...pick(c, Object.keys(TIENDA_INICIAL)) });
        setFooter({ ...FOOTER_INICIAL, ...pick(c, Object.keys(FOOTER_INICIAL)) });
        setImpuestos(Array.isArray(c.impuestos) ? c.impuestos : []);
      })
      .catch(err => toast.error(err.response?.data?.message || 'Error al cargar la configuración'))
      .finally(() => setLoading(false));

    if (me) setCuenta({ nombre: me.nombre || '', email: me.email || '', password: '' });
  }, [me]);

  const saveMetas = async () => {
    const payload = {};
    for (const c of CAMPOS_META) {
      const val = Number(metas[c.key]);
      if (!isNaN(val) && val >= 0) payload[c.key] = val;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/system-config', payload);
      if (data.config) setMetas({ ...METAS_INICIALES, ...pick(data.config, Object.keys(METAS_INICIALES)) });
      toast.success('Metas guardadas');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar las metas');
    } finally {
      setSaving(false);
    }
  };

  const saveTienda = async () => {
    const payload = {};
    for (const c of CAMPOS_TIENDA) {
      const val = String(tienda[c.key] || '').trim();
      if (!val) return toast.error(`"${c.title}" no puede estar vacío`);
      payload[c.key] = val;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/system-config', payload);
      if (data.config) setTienda({ ...TIENDA_INICIAL, ...pick(data.config, Object.keys(TIENDA_INICIAL)) });
      toast.success('Datos de la tienda guardados');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar la tienda');
    } finally {
      setSaving(false);
    }
  };

  const saveFooter = async () => {
    const payload = { ...pick(footer, Object.keys(FOOTER_INICIAL)) };
    setSaving(true);
    try {
      const { data } = await api.put('/system-config', payload);
      if (data.config) setFooter({ ...FOOTER_INICIAL, ...pick(data.config, Object.keys(FOOTER_INICIAL)) });
      toast.success('Footer guardado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar el footer');
    } finally {
      setSaving(false);
    }
  };

  const saveImpuestos = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/system-config', { impuestos });
      if (data.config?.impuestos) setImpuestos(data.config.impuestos);
      toast.success('Impuestos guardados');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar los impuestos');
    } finally {
      setSaving(false);
    }
  };

  const addImpuesto = () => {
    const nombre = nuevoImp.nombre.trim();
    const porcentaje = parseFloat(nuevoImp.porcentaje);
    if (!nombre) return toast.error('Ingresá un nombre para el impuesto');
    if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) return toast.error('El porcentaje debe estar entre 0 y 100');
    setImpuestos(prev => [...prev, { nombre, porcentaje, metodoPago: nuevoImp.metodoPago, activo: true }]);
    setNuevoImp({ nombre: '', porcentaje: '', metodoPago: 'tarjeta' });
  };

  const updateImpuesto = (idx, campo, valor) => {
    setImpuestos(prev => prev.map((imp, i) => (i === idx ? { ...imp, [campo]: valor } : imp)));
  };

  const removeImpuesto = (idx) => {
    setImpuestos(prev => prev.filter((_, i) => i !== idx));
  };

  const saveCuenta = async (e) => {
    e.preventDefault();
    const payload = {};
    if (cuenta.nombre.trim()) payload.nombre = cuenta.nombre.trim();
    if (cuenta.email.trim()) payload.email = cuenta.email.trim();
    if (cuenta.password) payload.password = cuenta.password;
    if (Object.keys(payload).length === 0) return toast.error('No hay cambios para guardar');

    setSavingCuenta(true);
    try {
      const { data } = await api.put('/auth/me', payload);
      // Actualizar el usuario guardado en localStorage
      const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...stored, ...data }));
      setCuenta({ nombre: data.nombre || '', email: data.email || '', password: '' });
      toast.success('Datos de la cuenta actualizados. Volvé a iniciar sesión si cambiaste la contraseña.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar la cuenta');
    } finally {
      setSavingCuenta(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-textLight">Configuración del sistema</h2>
            <p className="text-textMuted text-xs mt-0.5">Metas, datos de la tienda, impuestos y tu cuenta</p>
          </div>
        </div>
      </div>

      {/* Navegación por secciones */}
      <div className="flex flex-wrap gap-2 bg-surface p-1.5 rounded-xl border border-stone-800 w-fit">
        {SECCIONES.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSeccion(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                seccion === s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-textMuted hover:text-textLight hover:bg-stone-800'
              }`}
            >
              <Icon size={14} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ─── SECCIÓN: Metas ─── */}
      {seccion === 'metas' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAMPOS_META.map((campo) => {
              const Icon = campo.icon;
              const val = metas[campo.key];
              return (
                <div key={campo.key} className="bg-surface rounded-2xl border border-stone-800/80 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${campo.gradient}`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-textLight text-sm">{campo.title}</p>
                      {campo.type === 'percent' && val !== '' && <p className="text-[10px] text-textMuted">Vigente: {val}%</p>}
                      {campo.type !== 'percent' && val !== '' && <p className="text-[10px] text-textMuted">Vigente: {fmt(val)}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-textMuted mb-4">{campo.desc}</p>
                  <div className="relative">
                    {campo.type !== 'percent' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>}
                    <input
                      type="number"
                      min="0"
                      step={campo.type === 'percent' ? '1' : '100'}
                      value={val}
                      onChange={(e) => setMetas(m => ({ ...m, [campo.key]: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                      className={`w-full bg-background border border-stone-700 rounded-xl py-3 ${campo.type !== 'percent' ? 'pl-8' : 'pl-4'} pr-14 text-textLight focus:outline-none focus:border-primary font-bold text-lg`}
                    />
                    {campo.suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">{campo.suffix}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={saveMetas} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-fit">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar metas
          </button>
        </>
      )}

      {/* ─── SECCIÓN: Tienda y catálogo ─── */}
      {seccion === 'tienda' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAMPOS_TIENDA.map((campo) => {
              const Icon = campo.icon;
              return (
                <div key={campo.key} className={`bg-surface rounded-2xl border border-stone-800/80 p-5 ${campo.key === 'catalogoSubtitulo' ? 'md:col-span-2' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                      <Icon size={16} className="text-white" />
                    </div>
                    <p className="font-bold text-textLight text-sm">{campo.title}</p>
                  </div>
                  <p className="text-xs text-textMuted mb-3">{campo.desc}</p>
                  <input
                    type="text"
                    value={tienda[campo.key] || ''}
                    onChange={(e) => setTienda(t => ({ ...t, [campo.key]: e.target.value }))}
                    className="w-full bg-background border border-stone-700 rounded-xl px-4 py-3 text-textLight focus:outline-none focus:border-primary"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-xs text-textMuted">
            <Store size={16} className="text-primary shrink-0 mt-0.5" />
            <p>Estos textos se muestran en la tienda online (/catalogo). El nombre de la tienda también aparece en el encabezado y el pie del catálogo.</p>
          </div>
          <button onClick={saveTienda} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-fit">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar tienda
          </button>
        </>
      )}

      {/* ─── SECCIÓN: Footer del catálogo ─── */}
      {seccion === 'footer' && (
        <>
          <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-xs text-textMuted">
            <PanelBottom size={16} className="text-primary shrink-0 mt-0.5" />
            <p>Estos textos y datos se muestran en el pie de la tienda online (/catalogo). Los campos vacíos ocultan el elemento correspondiente.</p>
          </div>

          {GRUPOS_FOOTER.map((grupo) => (
            <div key={grupo} className="bg-surface rounded-2xl border border-stone-800/80 overflow-hidden">
              <div className="px-5 py-3 border-b border-stone-800">
                <h3 className="font-bold text-textLight text-sm">{grupo}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                {CAMPOS_FOOTER.filter((c) => c.group === grupo).map((campo) => {
                  const Icon = campo.icon;
                  return (
                    <div key={campo.key} className={campo.textarea ? 'md:col-span-2' : ''}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon size={14} className="text-primary shrink-0" />
                        <p className="font-bold text-textLight text-sm">{campo.title}</p>
                      </div>
                      <p className="text-[11px] text-textMuted mb-2">{campo.desc}</p>
                      {campo.textarea ? (
                        <textarea
                          rows={3}
                          value={footer[campo.key] || ''}
                          onChange={(e) => setFooter(f => ({ ...f, [campo.key]: e.target.value }))}
                          className="w-full bg-background border border-stone-700 rounded-xl px-4 py-3 text-sm text-textLight focus:outline-none focus:border-primary resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={footer[campo.key] || ''}
                          onChange={(e) => setFooter(f => ({ ...f, [campo.key]: e.target.value }))}
                          className="w-full bg-background border border-stone-700 rounded-xl px-4 py-3 text-sm text-textLight focus:outline-none focus:border-primary"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button onClick={saveFooter} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-fit">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar footer
          </button>
        </>
      )}

      {/* ─── SECCIÓN: Impuestos ─── */}
      {seccion === 'impuestos' && (
        <>
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-textMuted">
            <Receipt size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p>Estos porcentajes se descuentan de la ganancia según el medio de pago que elija el cliente (no cambian el precio que paga). Se aplican en cada venta registrada.</p>
          </div>

          {/* Lista de impuestos por método */}
          <div className="bg-surface rounded-2xl border border-stone-800/80 overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-bold text-textLight text-sm flex items-center gap-2"><Percent size={16} className="text-primary" /> Deducciones configuradas</h3>
              <span className="text-[10px] font-bold uppercase text-textMuted bg-stone-800 px-2 py-1 rounded-full">{impuestos.length}</span>
            </div>
            {impuestos.length === 0 ? (
              <p className="text-center py-8 text-textMuted text-sm">No hay impuestos cargados. Se usarán los valores por defecto (IIBB y Mercado Pago) hasta que agregues uno.</p>
            ) : (
              <div className="divide-y divide-stone-800">
                {impuestos.map((imp, idx) => (
                  <div key={imp._id || idx} className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${imp.activo === false ? 'opacity-50' : ''}`}>
                    <input
                      type="text"
                      value={imp.nombre}
                      onChange={(e) => updateImpuesto(idx, 'nombre', e.target.value)}
                      className="flex-1 min-w-0 bg-background border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-primary"
                    />
                    <select
                      value={imp.metodoPago}
                      onChange={(e) => updateImpuesto(idx, 'metodoPago', e.target.value)}
                      className="bg-background border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-primary"
                    >
                      {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <div className="relative shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={imp.porcentaje}
                        onChange={(e) => updateImpuesto(idx, 'porcentaje', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-background border border-stone-700 rounded-lg px-3 py-2 pr-7 text-sm text-textLight focus:outline-none focus:border-primary text-right font-bold"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">%</span>
                    </div>
                    <button
                      onClick={() => updateImpuesto(idx, 'activo', imp.activo === false)}
                      title={imp.activo === false ? 'Activado (inactivo)' : 'Activo'}
                      className={`shrink-0 p-2 rounded-lg border transition-colors ${imp.activo === false ? 'border-stone-700 text-stone-500' : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'}`}
                    >
                      <Power size={15} />
                    </button>
                    <button onClick={() => removeImpuesto(idx)} title="Eliminar" className="shrink-0 p-2 rounded-lg border border-stone-700 text-danger hover:text-red-400 hover:border-red-400/40 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agregar impuesto personalizado */}
          <div className="bg-surface rounded-2xl border border-dashed border-stone-700 p-4">
            <p className="text-xs font-bold uppercase text-textMuted mb-3 flex items-center gap-2"><Plus size={14} className="text-primary" /> Agregar impuesto personalizado</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Nombre (ej: Retención Ganancias)"
                value={nuevoImp.nombre}
                onChange={(e) => setNuevoImp(n => ({ ...n, nombre: e.target.value }))}
                className="flex-1 min-w-0 bg-background border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-textLight focus:outline-none focus:border-primary"
              />
              <select
                value={nuevoImp.metodoPago}
                onChange={(e) => setNuevoImp(n => ({ ...n, metodoPago: e.target.value }))}
                className="bg-background border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-textLight focus:outline-none focus:border-primary"
              >
                {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <div className="relative shrink-0">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="%"
                  value={nuevoImp.porcentaje}
                  onChange={(e) => setNuevoImp(n => ({ ...n, porcentaje: e.target.value }))}
                  className="w-24 bg-background border border-stone-700 rounded-lg px-3 py-2.5 pr-7 text-sm text-textLight focus:outline-none focus:border-primary text-right font-bold"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">%</span>
              </div>
              <button onClick={addImpuesto} className="shrink-0 flex items-center justify-center gap-1.5 bg-primary hover:bg-primaryDark text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
                <Plus size={16} /> Agregar
              </button>
            </div>
          </div>

          <button onClick={saveImpuestos} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-fit">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar impuestos
          </button>
        </>
      )}

      {/* ─── SECCIÓN: Apariencia ─── */}
      {seccion === 'apariencia' && (
        <>
          <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-xs text-textMuted">
            <ALargeSmall size={16} className="text-primary shrink-0 mt-0.5" />
            <p>Ajusta el tamaño de todo el sistema (textos, botones, tablas). Se guarda en este dispositivo: cada pantalla (computadora, tele, etc.) puede tener su propio tamaño.</p>
          </div>

          <div className="bg-surface rounded-2xl border border-stone-800/80 p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center">
                  <ALargeSmall size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-textLight">Tamaño de la interfaz</p>
                  <p className="text-[11px] text-textMuted">Vista previa en vivo</p>
                </div>
              </div>
              <span className="text-2xl font-black text-primary">{uiScale}%</span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="60"
              max="160"
              step="5"
              value={uiScale}
              onChange={(e) => setUiScale(applyUiScale(Number(e.target.value)))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-primary"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-4">
              {UI_SCALE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setUiScale(applyUiScale(p.value))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    uiScale === p.value ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-stone-700 text-textMuted hover:border-stone-500'
                  }`}
                >
                  {p.label} ({p.value}%)
                </button>
              ))}
            </div>

            {/* Vista previa */}
            <div className="mt-5 bg-background border border-stone-800 rounded-xl p-4">
              <p className="text-xs text-textMuted mb-1">Vista previa</p>
              <p className="text-sm text-textLight">Texto de ejemplo — Producto · $1.200</p>
            </div>

            <button
              onClick={() => setUiScale(applyUiScale(100))}
              className="mt-4 flex items-center gap-2 text-xs text-textMuted hover:text-textLight transition-colors"
            >
              <RefreshCw size={13} /> Restablecer al 100%
            </button>
          </div>
        </>
      )}

      {/* ─── SECCIÓN: Mi cuenta ─── */}
      {seccion === 'cuenta' && (
        <form onSubmit={saveCuenta} className="bg-surface rounded-2xl border border-stone-800/80 p-6 max-w-lg space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-textLight">Editar mis datos</p>
              <p className="text-[11px] text-textMuted">Nombre, email y contraseña de tu cuenta</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Nombre</label>
            <input type="text" value={cuenta.nombre} onChange={(e) => setCuenta(c => ({ ...c, nombre: e.target.value }))} className="w-full bg-background border border-stone-700 rounded-lg px-4 py-3 text-textLight focus:ring-1 focus:ring-primary focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Email</label>
            <input type="email" value={cuenta.email} onChange={(e) => setCuenta(c => ({ ...c, email: e.target.value }))} className="w-full bg-background border border-stone-700 rounded-lg px-4 py-3 text-textLight focus:ring-1 focus:ring-primary focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2 flex items-center gap-1.5"><KeyRound size={13} /> Nueva contraseña <span className="text-xs font-normal opacity-50">(dejar en blanco para no cambiar)</span></label>
            <input type="password" value={cuenta.password} onChange={(e) => setCuenta(c => ({ ...c, password: e.target.value }))} placeholder="••••••••" className="w-full bg-background border border-stone-700 rounded-lg px-4 py-3 text-textLight focus:ring-1 focus:ring-primary focus:outline-none" />
          </div>

          <button type="submit" disabled={savingCuenta} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {savingCuenta ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar cambios
          </button>

          <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-xs text-textMuted">
            <Coins size={16} className="text-primary shrink-0 mt-0.5" />
            <p>Tu rol actual es <span className="font-bold text-textLight uppercase">{me?.rol}</span>. Para crear o editar otras cuentas, usá la sección Usuarios.</p>
          </div>
        </form>
      )}
    </div>
  );
};

export default Configuracion;
