import { useState, useEffect, useRef } from 'react';
import logoHorizontal from '../assets/logo-stocka-horizontal.png';
import {
  ShoppingCart,
  BarChart3,
  BrainCircuit,
  Package,
  Users,
  Globe,
  Smartphone,
  ShieldCheck,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  ScanBarcode,
  Receipt,
  Menu,
  X,
  Phone,
  CreditCard,
  RefreshCw,
  BadgePercent,
  UserPlus,
  FileText,
  Printer,
  AlertTriangle,
  History,
  Truck,
  Puzzle,
  Tags,
  FileSpreadsheet,
  FolderTree,
  Barcode,
  User,
  Star,
  Gift,
  ShoppingBag,
  Bot,
  Gauge,
  Wallet,
  LineChart,
  PieChart,
  Calendar,
  Coins,
  Percent,
  Target,
  PackageCheck,
  DollarSign,
  UserMinus,
  MessageCircle,
  Lightbulb,
  Lock,
  Settings,
  Store,
  LayoutGrid,
} from 'lucide-react';

const featureGroups = [
  {
    id: 'pos',
    category: 'Punto de Venta',
    icon: ShoppingCart,
    intro: 'Cobrá rápido, sin errores y con todos los medios de pago. El corazón del sistema, pensado para las horas pico.',
    items: [
      { icon: Zap, title: 'Cobro en segundos', desc: 'Buscá por nombre, SKU o código de barras y sumá productos al carrito al instante. El flujo está pensado para cuando el local está lleno y no hay tiempo que perder.', benefit: 'Atención más rápida' },
      { icon: ScanBarcode, title: 'Lector de código de barras', desc: 'Escaneá con lector físico o con la cámara del celular. El producto se agrega solo, sin tipear y sin errores de carga.', benefit: 'Cero errores de cobro' },
      { icon: CreditCard, title: 'Todos los medios de pago', desc: 'Efectivo, tarjeta de crédito, débito y transferencia. Cada medio aplica automáticamente sus comisiones e impuestos para que la ganancia real quede clara.', benefit: 'Ganancia real por venta' },
      { icon: BadgePercent, title: 'Descuentos y precio libre', desc: 'Aplicá descuentos por producto o sobre el total, y vendé artículos genéricos con precio libre sin crear un producto nuevo.', benefit: 'Flexibilidad total' },
      { icon: UserPlus, title: 'Cliente asociado y puntos', desc: 'Asociá la venta a un cliente para sumar puntos, aplicar beneficios y dejar registro en su historial de compras.', benefit: 'Fidelización automática' },
      { icon: FileText, title: 'Presupuestos y cotizaciones', desc: 'Generá presupuestos desde el POS con numeración propia y convertilos en venta con un clic cuando el cliente confirma.', benefit: 'Cerrá más ventas' },
      { icon: Printer, title: 'Ticket y reimpresión', desc: 'Imprimí el ticket al instante o reimprimí cualquier venta desde el historial, con todos los datos de la operación.', benefit: 'Comprobantes profesionales' },
      { icon: ShoppingCart, title: 'Carrito inteligente', desc: 'Cantidades, subtotales, totales y control de stock en vivo. Ves exactamente qué estás cobrando antes de confirmar.', benefit: 'Cobro sin sorpresas' },
    ],
  },
  {
    id: 'inventario',
    category: 'Inventario',
    icon: Package,
    intro: 'Tu stock siempre bajo control: qué tenés, qué falta y qué reponer, sin planillas paralelas.',
    items: [
      { icon: Package, title: 'Productos completos', desc: 'Nombre, SKU, código de barras, categoría, proveedor, costo, precio, margen, stock, stock mínimo, unidad de medida e imagen, todo en una ficha.', benefit: 'Catálogo ordenado' },
      { icon: AlertTriangle, title: 'Alertas de stock', desc: 'El sistema avisa cuando un producto llega al mínimo o está por agotarse, para que repongas a tiempo y no pierdas ventas.', benefit: 'Evitá faltantes' },
      { icon: History, title: 'Historial de movimientos', desc: 'Cada entrada, salida, ajuste y venta queda registrado. Sabés por qué falta o sobra mercadería, sin planillas paralelas.', benefit: 'Trazabilidad total' },
      { icon: Truck, title: 'Órdenes de compra', desc: 'Creá órdenes por proveedor y, al recibirlas, el stock se actualiza automáticamente. Sin cargar dos veces la misma mercadería.', benefit: 'Reposición profesional' },
      { icon: Puzzle, title: 'Combos y kits', desc: 'Armá combos manuales o generados con IA, con costo, ganancia y margen calculados antes de publicarlos.', benefit: 'Más ticket promedio' },
      { icon: Tags, title: 'Etiquetas de precio', desc: 'Generá un PDF con etiquetas de todos tus productos listas para imprimir, incluyendo precios fraccionados y bolsa cerrada.', benefit: 'Góndola siempre al día' },
      { icon: FileSpreadsheet, title: 'Excel de ida y vuelta', desc: 'Importá y exportá tu catálogo completo a Excel para cargar o actualizar cientos de productos de una sola vez.', benefit: 'Carga masiva rápida' },
      { icon: FolderTree, title: 'Categorías visuales', desc: 'Organizá por categorías con color e ícono. Se reflejan en el POS, en los filtros y en el catálogo online.', benefit: 'Encontrás todo rápido' },
      { icon: Barcode, title: 'Escaneo al crear productos', desc: 'Cargá el código de barras con el lector o la cámara mientras creás un producto. Ideal para migrar miles de artículos sin tipear.', benefit: 'Alta sin tipear' },
    ],
  },
  {
    id: 'ventas',
    category: 'Ventas y Clientes',
    icon: Users,
    intro: 'Conocé a quién le vendés, qué compra y cómo fidelizarlo. Cada venta queda registrada y cada cliente, identificado.',
    items: [
      { icon: Receipt, title: 'Historial de ventas', desc: 'Todas las ventas con número, fecha, empleado, cliente, medio de pago y estado. Filtrá y encontrá cualquier ticket al instante.', benefit: 'Control total de caja' },
      { icon: TrendingUp, title: 'Ganancia real por venta', desc: 'Cada operación muestra su ganancia usando el costo histórico del producto, no un promedio estimado.', benefit: 'Rentabilidad transparente' },
      { icon: RefreshCw, title: 'Anulaciones con devolución', desc: 'Anulá una venta y el stock y los puntos vuelven automáticamente. Todo el movimiento queda auditado.', benefit: 'Correcciones sin líos' },
      { icon: User, title: 'Ficha de cliente', desc: 'Nombre, teléfono, email, dirección, cumpleaños, estado de afiliado y puntos, con búsqueda por cualquier dato.', benefit: 'Atención personalizada' },
      { icon: Clock, title: 'Historial por cliente', desc: 'Mirá qué compra cada cliente, cuánto gasta y con qué frecuencia, para venderle mejor la próxima vez.', benefit: 'Venta consultiva' },
      { icon: Star, title: 'Programa de afiliados', desc: 'Puntos automáticos por compra, recompensas configurables y canjes con control de saldo.', benefit: 'Clientes que vuelven' },
      { icon: Gift, title: 'Recompensas flexibles', desc: 'Definí premios en efectivo, porcentaje, producto o regalo, y ajustá cuántos pesos equivalen a un punto.', benefit: 'Fidelidad a tu medida' },
      { icon: Globe, title: 'Catálogo online', desc: 'Tu tienda web con banner, buscador, filtros por categoría y carrito. Los pedidos llegan directo al panel.', benefit: 'Vendé 24/7' },
      { icon: ShoppingBag, title: 'Pedidos web', desc: 'Gestioná los pedidos del catálogo con estados (pendiente, confirmado, entregado) y actualización en tiempo real.', benefit: 'Ningún pedido perdido' },
      { icon: Bot, title: 'Chatbot del catálogo', desc: 'La IA responde consultas de clientes y recomienda productos reales del catálogo, con opción de agregarlos al carrito.', benefit: 'Atención 24/7' },
    ],
  },
  {
    id: 'finanzas',
    category: 'Finanzas y Reportes',
    icon: BarChart3,
    intro: 'Decisiones con números, no con intuición. Ventas, gastos, impuestos y ganancia neta, siempre a la vista.',
    items: [
      { icon: Gauge, title: 'Dashboard en vivo', desc: 'Facturación y ganancia del día y del mes, metas, costos fijos y ventas por hora, todo en una sola pantalla.', benefit: 'Decidís en segundos' },
      { icon: BarChart3, title: 'Reportes avanzados', desc: 'Vistas por período, top productos, evolución de ventas e ingresos por medio de pago, listos para analizar.', benefit: 'Números claros' },
      { icon: Wallet, title: 'Flujo de caja', desc: 'Ingresos, gastos y ganancia neta a lo largo del tiempo. Sabés exactamente cuánto te queda.', benefit: 'Salud financiera' },
      { icon: LineChart, title: 'Análisis de ventas con IA', desc: 'Días y horarios fuertes, ticket promedio, rentabilidad por categoría y proyección de la próxima semana.', benefit: 'Planificá con datos' },
      { icon: PieChart, title: 'Estadísticas y mapa de calor', desc: 'Visualizá el rendimiento histórico por día y monto, con semáforos que detectan días flojos al instante.', benefit: 'Detectá oportunidades' },
      { icon: Calendar, title: 'Cierre diario', desc: 'Detalle del día por medio de pago, listado de ventas y ticket imprimible para un cierre de caja firmable.', benefit: 'Cierre sin errores' },
      { icon: Coins, title: 'Gastos y gastos fijos', desc: 'Registrá gastos variables y recurrentes, con categorías, vencimientos y estado de pago.', benefit: 'Ningún gasto olvidado' },
      { icon: Percent, title: 'Impuestos automáticos', desc: 'Retención IIBB, comisiones de MercadoPago y tarjetas, e impuestos personalizados por medio de pago.', benefit: 'Sin sorpresas al liquidar' },
      { icon: Target, title: 'Metas y objetivos', desc: 'Definí metas de facturación y ganancia, y seguí cuánto falta para alcanzarlas todos los días.', benefit: 'Equipo enfocado' },
    ],
  },
  {
    id: 'ia',
    category: 'Inteligencia Artificial',
    icon: BrainCircuit,
    intro: 'Un equipo de consultores dentro del sistema. La IA analiza tus datos reales y te dice qué hacer.',
    items: [
      { icon: BrainCircuit, title: 'Centro de IA', desc: 'Seis análisis con OpenAI y búsqueda web sobre tus datos reales, con acciones concretas y fuentes consultadas.', benefit: 'Un consultor 24/7' },
      { icon: PackageCheck, title: 'Re-stock inteligente', desc: 'Prioriza qué reponer según stock, mínimo, venta diaria y días hasta agotarse, con cantidades sugeridas.', benefit: 'Comprá lo justo' },
      { icon: DollarSign, title: 'Análisis de precios', desc: 'Evalúa si cada precio está alto, bajo o competitivo, con referencias de mercado en pesos.', benefit: 'Precios rentables' },
      { icon: UserMinus, title: 'Clientes inactivos', desc: 'Detecta clientes que dejaron de comprar y propone estrategias con mensajes de WhatsApp listos para enviar.', benefit: 'Recuperá clientes' },
      { icon: TrendingUp, title: 'Tendencias de mercado', desc: 'Investiga tendencias actuales y recomienda categorías y productos para sumar a tu negocio.', benefit: 'Innová a tiempo' },
      { icon: BadgePercent, title: 'Promociones con IA', desc: 'Genera combos y descuentos rentables, validados contra tu catálogo real para no regalar margen.', benefit: 'Promos que rinden' },
      { icon: MessageCircle, title: 'Preguntale a la IA', desc: 'Hacé preguntas en lenguaje natural sobre tus ventas y recibí respuestas redactadas con los datos de respaldo.', benefit: 'Respuestas sin planillas' },
      { icon: Lightbulb, title: 'Ayuda al vendedor', desc: 'Recomendaciones, comparaciones y búsqueda web para que cualquier empleado venda como el más experimentado.', benefit: 'Equipo más fuerte' },
      { icon: History, title: 'Historial de IA', desc: 'Cada análisis queda guardado con parámetros, resultado y empleado, para reutilizar y capacitar al equipo.', benefit: 'Conocimiento que queda' },
    ],
  },
  {
    id: 'admin',
    category: 'Administración',
    icon: ShieldCheck,
    intro: 'El control del negocio en tus manos: usuarios, permisos, configuración y todo conectado.',
    items: [
      { icon: Users, title: 'Usuarios y roles', desc: 'Creá cuentas de administrador o empleado y definí exactamente a qué módulos accede cada uno.', benefit: 'Cada uno ve lo suyo' },
      { icon: Lock, title: 'Permisos por módulo', desc: 'Los módulos financieros, de configuración y de usuarios quedan restringidos solo a administradores.', benefit: 'Datos protegidos' },
      { icon: Settings, title: 'Configuración total', desc: 'Metas, margen por defecto, impuestos, apariencia y datos de la tienda, todo sin tocar código.', benefit: 'Sistema a tu medida' },
      { icon: Store, title: 'Marca y catálogo', desc: 'Personalizá nombre, títulos, textos de envío y pago, footer, redes y WhatsApp del catálogo online.', benefit: 'Tu identidad' },
      { icon: Truck, title: 'Proveedores', desc: 'Contactos, estado y productos asociados a cada proveedor para reponer y comparar alternativas.', benefit: 'Compras organizadas' },
      { icon: LayoutGrid, title: 'Gestión unificada', desc: 'Proveedores, órdenes, gastos y clientes en un solo centro de administración diaria.', benefit: 'Menos pantallas' },
      { icon: Calendar, title: 'Calendario', desc: 'Tareas, notas, pagos, compras, servicios e inversiones con recurrencia y recordatorios.', benefit: 'Agenda conectada' },
      { icon: Clock, title: 'Zona horaria Argentina', desc: 'Todos los cierres, reportes y análisis usan la fecha real del local (UTC-3).', benefit: 'Números correctos' },
      { icon: Smartphone, title: '100% responsive', desc: 'Funciona en PC, tablet y celular sin instalar nada: controlá tu negocio desde donde estés.', benefit: 'Libertad de movimiento' },
    ],
  },
];

const benefits = [
  { icon: Zap, title: 'Más rápido', desc: 'Cobrás en segundos. Menos filas y más clientes atendidos por día.' },
  { icon: TrendingUp, title: 'Más rentable', desc: 'Ganancia real por venta, márgenes controlados y compras inteligentes.' },
  { icon: BrainCircuit, title: 'IA aplicada', desc: 'Decisiones basadas en tus datos, no en corazonadas.' },
  { icon: Smartphone, title: '100% responsive', desc: 'Funciona perfecto en PC, tablet y celular, sin instalar nada.' },
  { icon: ShieldCheck, title: 'Seguro y auditable', desc: 'Roles, permisos y trazabilidad completa de cada movimiento.' },
  { icon: Clock, title: 'Todo integrado', desc: 'POS, stock, ventas, compras, finanzas e IA en un solo sistema.' },
];

const stats = [
  { value: 40, suffix: '+', label: 'Módulos integrados' },
  { value: 6, suffix: '', label: 'Análisis con IA' },
  { value: 100, suffix: '%', label: 'Basado en tus datos' },
  { value: 24, suffix: '/7', label: 'Catálogo online' },
];

const NAV_LINKS = [
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#ia', label: 'Inteligencia Artificial' },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = '' }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

function Counter({ value, suffix }) {
  const { ref, visible } = useReveal();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let raf;
    const start = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

// Logo horizontal oficial. Si por algún motivo no carga, se muestra
// el monograma + wordmark de respaldo, así el header nunca queda roto.
function Brand() {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <span className="flex items-center min-w-0">
        <img
          src={logoHorizontal}
          alt="STOCKA"
          className="h-10 w-auto max-w-[190px] object-contain"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-lg bg-[#0f3b2e] flex items-center justify-center shadow-sm shrink-0">
        <span className="text-[#e2c063] font-black text-xl tracking-tighter">S</span>
      </div>
      <div className="leading-none border-l border-[#ddd7c8] pl-3">
        <p className="text-[15px] font-extrabold tracking-[0.14em] text-[#0f3b2e]">STOCKA</p>
        <p className="text-[9.5px] uppercase tracking-[0.18em] text-[#7c857e] mt-1">Inventario · POS</p>
      </div>
    </span>
  );
}

function DashboardMockup() {
  const bars = [42, 68, 55, 82, 64, 90, 74];
  return (
    <div className="ispos-float relative w-full max-w-md">
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#0f3b2e]/15 via-[#14523f]/10 to-[#c49a4a]/15 rounded-[2rem] blur-2xl" />
      <div className="relative rounded-2xl bg-white border border-[#e4dfd2] shadow-2xl shadow-[#0f3b2e]/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0f3b2e] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#e2c063]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#8a9089] font-semibold">Panel</p>
              <p className="text-sm font-bold text-[#12211b]">Hoy</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-[#0f3b2e] bg-[#eef3ee] border border-[#d5e2d8] rounded-full px-2 py-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2f7d5b] animate-pulse" /> En vivo
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="rounded-xl bg-[#f7f5f0] border border-[#e7e1d5] p-3">
            <p className="text-[10px] text-[#6b746d] font-medium">Facturación</p>
            <p className="text-lg font-bold text-[#12211b]">$ 284.500</p>
            <p className="text-[10px] text-[#2f7d5b] font-semibold">▲ 12,4%</p>
          </div>
          <div className="rounded-xl bg-[#f7f5f0] border border-[#e7e1d5] p-3">
            <p className="text-[10px] text-[#6b746d] font-medium">Ganancia</p>
            <p className="text-lg font-bold text-[#12211b]">$ 96.200</p>
            <p className="text-[10px] text-[#2f7d5b] font-semibold">▲ 8,1%</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#eeeade] bg-[#faf9f5] p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-[#6b746d]">Ventas por día</p>
            <span className="text-[10px] text-[#0f3b2e] font-semibold">Semana</span>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[#0f3b2e] to-[#3f8566]" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 rounded-xl bg-white border border-[#e4dfd2] shadow-xl p-3 flex items-center gap-2 ispos-float-slow">
        <div className="w-8 h-8 rounded-lg bg-[#f3efe3] flex items-center justify-center">
          <BrainCircuit className="w-4 h-4 text-[#9a7b32]" />
        </div>
        <div>
          <p className="text-[10px] text-[#8a9089] font-semibold">IA sugiere</p>
          <p className="text-xs font-bold text-[#12211b]">Reponer 12 productos</p>
        </div>
      </div>
    </div>
  );
}

export default function InformacionSistemaPos() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = 'STOCKA — Tu inventario, bajo control';
    return () => { document.title = prev; };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#12211b] overflow-x-clip selection:bg-[#d8e6dd]">

      <style>{`
        @keyframes ispos-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes ispos-float-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes ispos-blob { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(26px,-22px) scale(1.1)} }
        @keyframes ispos-fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ispos-float{animation:ispos-float 6s ease-in-out infinite}
        .ispos-float-slow{animation:ispos-float-slow 8s ease-in-out infinite}
        .ispos-blob{animation:ispos-blob 14s ease-in-out infinite}
        .ispos-grid{
          background-image:linear-gradient(to right,rgba(15,59,46,.06) 1px,transparent 1px),
                           linear-gradient(to bottom,rgba(15,59,46,.06) 1px,transparent 1px);
          background-size:56px 56px;
          mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,#000 40%,transparent 100%);
          -webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,#000 40%,transparent 100%);
        }
        .ispos-gold-underline{
          background-image:linear-gradient(transparent 62%, rgba(196,154,74,.45) 62%);
          background-repeat:no-repeat;
        }
        @media (prefers-reduced-motion: reduce){
          .ispos-float,.ispos-float-slow,.ispos-blob{animation:none}
        }
      `}</style>

      {/* Barra superior */}
      <div className="hidden md:block bg-[#0a2a20] text-[#cfcabb]">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between text-[11px] tracking-wide">
          <p>Sistema de gestión para comercios · Stock, ventas e inteligencia artificial</p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> Hecho en Argentina</span>
            <a href="/catalogo" className="hover:text-[#e2c063] transition-colors">Ver catálogo online</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#f7f5f0]/90 backdrop-blur-xl border-b border-[#e2ddd0] shadow-[0_4px_24px_-12px_rgba(15,59,46,.25)]'
            : 'bg-[#f7f5f0]/70 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
          <a href="#top" className="flex items-center min-w-0">
            <Brand />
          </a>

          <div className="hidden md:flex items-center gap-9">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative text-[13px] font-semibold text-[#41524a] hover:text-[#0f3b2e] transition-colors group"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-[#c49a4a] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="/catalogo"
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#41524a] hover:text-[#0f3b2e] hover:bg-[#eae5d8] transition-colors"
            >
              Catálogo
            </a>
            <a
              href="/login"
              className="px-5 py-2.5 rounded-lg bg-[#0f3b2e] hover:bg-[#0a2a20] text-white text-[13px] font-bold tracking-wide transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
            >
              Ingresar <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden p-2 rounded-lg hover:bg-[#eae5d8]" aria-label="Menú">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-[#e2ddd0] bg-[#f7f5f0] px-6 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-[#41524a]">
                {l.label}
              </a>
            ))}
            <a href="/catalogo" className="block text-sm font-semibold text-[#41524a]">Catálogo</a>
            <a href="/login" className="block text-center px-4 py-2.5 rounded-lg bg-[#0f3b2e] text-white text-sm font-bold">Ingresar</a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 ispos-grid" />
        <div className="absolute -top-32 -left-24 w-[520px] h-[520px] bg-[#cadfd2]/60 rounded-full blur-[130px] ispos-blob" />
        <div className="absolute top-10 right-0 w-[420px] h-[420px] bg-[#e6d9b8]/60 rounded-full blur-[130px] ispos-blob" style={{ animationDelay: '-5s' }} />

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#ddd7c8] text-[#0f3b2e] text-xs font-semibold mb-7 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c49a4a]" />
                  Stock, ventas e inteligencia artificial
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold tracking-tight leading-[1.06] mb-6 text-[#12211b]">
                  El control total de tu
                  <span className="ispos-gold-underline"> stock y tus ventas</span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="text-lg md:text-xl text-[#57655d] leading-relaxed mb-9 max-w-xl">
                  Punto de venta, inventario, finanzas, clientes y catálogo online en una sola plataforma.
                  Sumá inteligencia artificial para decidir mejor y vender más.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="/login" className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#0f3b2e] hover:bg-[#0a2a20] text-white font-bold tracking-wide transition-all shadow-lg shadow-[#0f3b2e]/20">
                    Acceder al sistema
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="/catalogo" className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-white border border-[#ddd7c8] hover:border-[#c49a4a] hover:bg-[#fbfaf6] text-[#12211b] font-semibold transition-all">
                    Ver catálogo online
                    <Globe className="w-5 h-5 text-[#9a7b32]" />
                  </a>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <div className="flex items-center gap-2 mt-7 text-sm text-[#7c857e]">
                  <CheckCircle2 className="w-4 h-4 text-[#2f7d5b]" />
                  Implementación inmediata · Adaptado a Argentina · Sin instalar nada
                </div>
              </Reveal>
            </div>

            <Reveal delay={200} className="flex justify-center lg:justify-end">
              <DashboardMockup />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-[#e2ddd0] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 80} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-[#0f3b2e] mb-2">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm font-medium text-[#7c857e]">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="max-w-7xl mx-auto px-6 py-24">
        <Reveal>
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a7b32] mb-3">Beneficios</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">¿Por qué elegir STOCKA?</h2>
            <p className="text-lg text-[#57655d]">
              Un sistema pensado para ahorrar tiempo, aumentar ventas y controlar tu negocio como nunca antes.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <Reveal key={i} delay={i * 70}>
              <div className="group h-full p-7 rounded-xl bg-white border border-[#e4dfd2] hover:border-[#0f3b2e]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0f3b2e]/10">
                <div className="w-12 h-12 rounded-lg bg-[#f1f4f0] border border-[#dde5dd] flex items-center justify-center mb-5 group-hover:bg-[#0f3b2e] transition-all duration-300">
                  <b.icon className="w-6 h-6 text-[#0f3b2e] group-hover:text-[#e2c063] transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2">{b.title}</h3>
                <p className="text-[#57655d] leading-relaxed">{b.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="relative py-24 bg-white border-y border-[#e2ddd0]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-10 max-w-3xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a7b32] mb-3">Funcionalidades</p>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Todo lo que tu negocio necesita</h2>
              <p className="text-lg text-[#57655d]">
                Recorré el sistema completo: {featureGroups.reduce((n, g) => n + g.items.length, 0)} funcionalidades agrupadas en {featureGroups.length} áreas,
                explicadas en simple para que sepas exactamente qué resuelve cada una en tu comercio.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {featureGroups.map((g) => (
                <a
                  key={g.id}
                  href={`#feat-${g.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#f1efe8] text-[#41524a] hover:bg-[#0f3b2e] hover:text-white transition-all"
                >
                  <g.icon className="w-4 h-4" />
                  {g.category}
                </a>
              ))}
            </div>
          </Reveal>

          <div>
            {featureGroups.map((g, gi) => (
              <div
                id={`feat-${g.id}`}
                key={g.id}
                className="scroll-mt-28 py-14 border-t border-[#e7e1d5] first:border-t-0 first:pt-10"
              >
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0f3b2e] text-[#e2c063] flex items-center justify-center shadow-sm">
                          <g.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black tracking-[0.2em] text-[#c49a4a]">0{gi + 1}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">{g.category}</h3>
                      <p className="text-[#57655d] leading-relaxed">{g.intro}</p>
                      <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#0f3b2e] bg-[#eef3ee] border border-[#d5e2d8] rounded-full px-3 py-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {g.items.length} funcionalidades
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
                    {g.items.map((item) => (
                      <div
                        key={item.title}
                        className="group rounded-xl bg-[#faf9f5] border border-[#e7e1d5] p-5 hover:border-[#c49a4a]/60 hover:bg-white hover:shadow-lg hover:shadow-[#0f3b2e]/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-lg bg-[#eef3ee] flex items-center justify-center shrink-0 group-hover:bg-[#0f3b2e] transition-colors">
                            <item.icon className="w-[18px] h-[18px] text-[#0f3b2e] group-hover:text-[#e2c063] transition-colors" />
                          </div>
                          <h4 className="font-bold text-[15px] leading-tight group-hover:text-[#0f3b2e] transition-colors">{item.title}</h4>
                        </div>
                        <p className="text-sm text-[#57655d] leading-relaxed">{item.desc}</p>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#9a7b32] uppercase tracking-[0.12em]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {item.benefit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IA */}
      <section id="ia" className="max-w-7xl mx-auto px-6 py-24">
        <Reveal>
          <div className="relative rounded-2xl overflow-hidden bg-[#0a2a20]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f3b2e] via-[#0a2a20] to-[#08221a]" />
            <div className="absolute -top-24 -right-16 w-[420px] h-[420px] bg-[#1f6b4f]/30 rounded-full blur-[110px] ispos-blob" />
            <div className="absolute -bottom-24 -left-16 w-[380px] h-[380px] bg-[#c49a4a]/15 rounded-full blur-[110px] ispos-blob" style={{ animationDelay: '-6s' }} />

            <div className="relative px-8 md:px-16 py-16 md:py-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-[#e2c063] text-xs font-semibold mb-6">
                    <BrainCircuit className="w-4 h-4" />
                    Inteligencia artificial aplicada
                  </div>
                  <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
                    Tu negocio con <span className="text-[#e2c063]">cerebro propio</span>
                  </h2>
                  <p className="text-lg text-[#c3cfc7] leading-relaxed mb-8">
                    Seis análisis que usan los datos reales de tu comercio y búsqueda web: reposición, precios,
                    clientes inactivos, tendencias, promociones rentables y proyección de ventas.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-9">
                    {['Re-stock', 'Precios', 'Clientes', 'Tendencias', 'Promos', 'Ventas'].map((t) => (
                      <span key={t} className="px-3 py-1.5 rounded-md bg-white/[0.07] border border-white/10 text-[#dfe7e2] text-sm font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                  <a href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#e2c063] text-[#12211b] font-bold hover:bg-[#eccd78] transition-all shadow-xl">
                    Descubrir la IA
                    <Sparkles className="w-5 h-5" />
                  </a>
                </div>

                <div className="relative">
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#c3cfc7] mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#e2c063]" /> Análisis de reposición
                    </div>
                    {[
                      { name: 'Gaseosa 2,25 L', tag: 'Urgente', color: 'text-rose-200 bg-rose-500/15 border-rose-400/30' },
                      { name: 'Arroz largo fino 1 kg', tag: 'Alta', color: 'text-amber-200 bg-amber-500/15 border-amber-400/30' },
                      { name: 'Yerba mate 1 kg', tag: 'Media', color: 'text-emerald-200 bg-emerald-500/15 border-emerald-400/30' },
                    ].map((r) => (
                      <div key={r.name} className="flex items-center justify-between rounded-lg bg-[#f7f5f0] px-3.5 py-2.5">
                        <span className="text-sm font-semibold text-[#12211b]">{r.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.color}`}>{r.tag}</span>
                      </div>
                    ))}
                    <div className="rounded-lg bg-[#0f3b2e] border border-[#2a6b52] px-3.5 py-3 text-xs text-[#d7e2db] leading-relaxed">
                      «Pedí gaseosas antes del viernes: se agotan en 2 días según tu rotación.»
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Operación */}
      <section className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: ScanBarcode, title: 'Escaneá y vendé', desc: 'Lector de código de barras y cámara para cargar productos sin tipear.' },
            { icon: Receipt, title: 'Cierres claros', desc: 'Ticket, presupuesto y cierre de caja diario firmable.' },
            { icon: ShieldCheck, title: 'Permisos reales', desc: 'El empleado ve lo suyo; el dueño controla todo.' },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="flex items-start gap-4 p-6 rounded-xl bg-white border border-[#e4dfd2]">
                <div className="w-11 h-11 rounded-lg bg-[#f1f4f0] flex items-center justify-center flex-shrink-0">
                  <c.icon className="w-5 h-5 text-[#0f3b2e]" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{c.title}</h3>
                  <p className="text-sm text-[#57655d] leading-relaxed">{c.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <Reveal>
          <div className="relative rounded-2xl overflow-hidden bg-[#0f3b2e] px-8 md:px-16 py-16 text-center">
            <div className="absolute inset-0 opacity-[0.08] ispos-grid" />
            <div className="absolute -top-20 right-0 w-[360px] h-[360px] bg-[#2a6b52]/40 rounded-full blur-[100px]" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Listo para modernizar tu negocio
              </h2>
              <p className="text-lg md:text-xl text-[#c3cfc7] mb-9 max-w-2xl mx-auto">
                Control total, ventas más rápidas, mayor rentabilidad y decisiones inteligentes en un solo sistema.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/login" className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-[#e2c063] text-[#12211b] font-bold hover:bg-[#eccd78] transition-all shadow-xl">
                  Acceder ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="/catalogo" className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-white/[0.08] border border-white/20 text-white font-semibold hover:bg-white/15 transition-all">
                  Ver demo del catálogo
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2ddd0] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Brand />
          <div className="text-center md:text-right text-sm text-[#7c857e]">
            <p>© {new Date().getFullYear()} STOCKA. Todos los derechos reservados.</p>
            <p className="text-xs mt-1">Diseñado para maximizar tu rentabilidad.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
