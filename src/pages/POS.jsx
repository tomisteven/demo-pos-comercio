import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { useDebounce } from '../hooks/useDebounce';
import { CartContext } from '../context/CartContext';
import {
   Search, Plus, Minus, Trash2, Tag, ShoppingCart, XCircle, FileText, Sparkles, User, UserPlus, Award, X, Pencil, PackagePlus, ScanBarcode, ChevronDown, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { calcularDeduccionesPago } from '../utils/paymentFees';

const arsFormat = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const formatCurrency = (val) => arsFormat.format(val);

// Etiquetas cortas para los chips de método de pago (una sola fila compacta)
const SHORT_PAYMENT_LABELS = {
   efectivo: 'Efectivo',
   tarjeta: 'Crédito',
   tarjeta_debito: 'Débito',
   transferencia: 'Transfer.',
};

const pad2 = (n) => String(n).padStart(2, '0');
const toLocalDateTimeInput = (d) => {
   if (!d || isNaN(d.getTime())) return '';
   return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const fechaLocalHoy = () => toLocalDateTimeInput(new Date()).slice(0, 10);

const ProductCard = React.memo(function ProductCard({ p, qty, onOpenCustom, onAdd, onQuickAdd }) {
   const sinStock = (Number(p.stock) || 0) <= 0;

   return (
      <div
         onClick={() => {
            if (p.esGenerico) {
               onOpenCustom(p, 'generic');
               return;
            }
            onAdd(p);
         }}
         className={`relative bg-surface p-3 rounded-xl border flex flex-col cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-lg ${sinStock ? 'border-red-500/40 hover:border-red-400' : 'border-stone-800 hover:border-primary/50'}`}
      >
         {sinStock && (
            <button
               onClick={(e) => { e.stopPropagation(); onQuickAdd(p); }}
               className="absolute top-2 right-2 w-6 h-6 z-10 flex items-center justify-center rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-white transition-colors"
               title="Sumar stock +1"
            >
               <PackagePlus size={13} />
            </button>
         )}
         <h4 className={`font-semibold text-textLight text-sm leading-tight line-clamp-2 ${sinStock ? 'pr-6' : ''}`}>{p.nombre}</h4>
         <p className={`text-[10px] font-medium mt-1 ${sinStock ? 'text-red-400' : 'text-primary'}`}>
            {p.unidadMedida || 'unidad'}{sinStock ? ' · Sin stock' : ''}
         </p>
         <div className="flex justify-between items-end mt-auto pt-2">
            <p className="font-bold text-base text-primary">{formatCurrency(p.precioVenta)}</p>
            {qty > 0 && (
               <span className="text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded">{qty} en carrito</span>
            )}
         </div>
      </div>
   );
});

const PromoCard = React.memo(function PromoCard({ promo, qty, onAdd }) {
   return (
      <div
         onClick={() => onAdd(promo)}
         className="bg-surface p-3 rounded-xl border border-primary/40 cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:border-primary"
      >
         <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">Promo</span>
            <span className="text-[10px] text-textMuted font-mono">{promo.numero}</span>
         </div>
         <h4 className="font-semibold text-textLight text-sm leading-tight mb-1 line-clamp-2">{promo.nombre}</h4>
         <p className="text-[10px] text-textMuted mb-1">{promo.items?.length} productos · {promo.descuento}% OFF</p>
         <div className="flex justify-between items-end mt-1">
            <p className="font-bold text-base text-primary">{formatCurrency(promo.precioFinal)}</p>
            <span className="text-[10px] font-bold text-emerald-400">
               {formatCurrency(promo.ganancia)} gan.
            </span>
         </div>
         {qty > 0 && (
            <p className="text-[10px] text-primary mt-1 font-bold">{qty} en carrito</p>
         )}
      </div>
   );
});

const POS = () => {
   const {
      cartItems, addToCart, updateQuantity, clearCart,
      discount, setDiscount, cartSubtotal, cartTotal
   } = useContext(CartContext);

   const [products, setProducts] = useState([]);
   const [categories, setCategories] = useState([]);
   const [promotions, setPromotions] = useState([]);
   const [showPromos, setShowPromos] = useState(false);
   const [loading, setLoading] = useState(true);
   const [impuestosConfig, setImpuestosConfig] = useState(null);

   // Filters
   const [searchTerm, setSearchTerm] = useState('');
   const debouncedSearch = useDebounce(searchTerm, 300);
   const [activeCategory, setActiveCategory] = useState('');

   // Payment
   const [metodoPago, setMetodoPago] = useState('efectivo');
   const [montoRecibido, setMontoRecibido] = useState('');
   const [notas, setNotas] = useState('');
   const [fechaVenta, setFechaVenta] = useState(() => toLocalDateTimeInput(new Date()));
  const [budgetName, setBudgetName] = useState('');
   const [budgetPhone, setBudgetPhone] = useState('');
   const [budgetNotas, setBudgetNotas] = useState('');
   const [showBudgetModal, setShowBudgetModal] = useState(false);
   const [showCartSheet, setShowCartSheet] = useState(false);
   // Pestañas colapsables del footer del carrito
   const [showAdvanced, setShowAdvanced] = useState(false); // fecha + notas
   const [showTaxDetail, setShowTaxDetail] = useState(false); // detalle de impuestos

   // Modals Interactivo Productos
   const [activeCustomProduct, setActiveCustomProduct] = useState(null); // { product, type: 'generic' }
   const [customPriceInput, setCustomPriceInput] = useState('');

   // Lectura de código de barras
   const [barcodeInput, setBarcodeInput] = useState('');

   // Cliente de la venta
   const [selectedCustomer, setSelectedCustomer] = useState(null);
   const [showCustomerModal, setShowCustomerModal] = useState(false);
   const [customers, setCustomers] = useState([]);
   const [customerSearch, setCustomerSearch] = useState('');
   const debouncedCustomerSearch = useDebounce(customerSearch, 300);
   const [newCustomerName, setNewCustomerName] = useState('');
   const [newCustomerPhone, setNewCustomerPhone] = useState('');
   const [customersLoading, setCustomersLoading] = useState(false);

   useEffect(() => {
      fetchCategories();
   }, []);

   useEffect(() => {
      api.get('/promotions?estado=activa')
         .then(({ data }) => setPromotions(data))
         .catch(() => {});
   }, []);

   useEffect(() => {
      api.get('/system-config')
         .then(({ data }) => setImpuestosConfig(data?.config?.impuestos || null))
         .catch(() => setImpuestosConfig(null));
   }, []);

   useEffect(() => {
      if (!showCustomerModal) return;
      setCustomersLoading(true);
      api.get('/customers?all=true')
         .then(({ data }) => {
            const q = debouncedCustomerSearch.toLowerCase();
            setCustomers(q ? data.filter(c => c.nombre?.toLowerCase().includes(q) || c.telefono?.includes(q)) : data);
         })
         .catch(() => {})
         .finally(() => setCustomersLoading(false));
   }, [showCustomerModal, debouncedCustomerSearch]);

   const fetchCategories = async () => {
      try {
         const res = await api.get('/categories');
         setCategories(res.data);
      } catch (error) {
         console.error(error);
      }
   };

   const fetchProducts = useCallback(async () => {
      setLoading(true);
      try {
         let url = '/products?sort=masVendidos&';
         if (debouncedSearch) url += `search=${debouncedSearch}&`;
         if (activeCategory) url += `category=${activeCategory}`;

         const res = await api.get(url);
         setProducts(res.data);
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
   }, [debouncedSearch, activeCategory]);

   useEffect(() => {
      fetchProducts();
   }, [fetchProducts]);

   const quickAddStock = useCallback(async (p) => {
      try {
         await api.patch(`/products/${p._id}/stock`, {
            tipo: 'entrada',
            cantidad: 1,
            motivo: 'Desde POS'
         });
         toast.success(`+1 stock: ${p.nombre}`);
         fetchProducts();
      } catch (error) {
         toast.error(error.response?.data?.message || 'Error al sumar stock');
      }
   }, [fetchProducts]);

   const openCustomProduct = useCallback((p) => {
      setActiveCustomProduct({ product: p, type: 'generic' });
      setCustomPriceInput('');
   }, []);

   const handleMontoChange = (e) => {
      setMontoRecibido(e.target.value);
   };

   // Busca por código de barras y agrega el producto al carrito
   const handleBarcodeSearch = useCallback(async (e) => {
      e?.preventDefault?.();
      const code = barcodeInput.trim();
      if (!code) return;

      try {
         const { data } = await api.get(`/products?search=${encodeURIComponent(code)}&limit=50`);
         const found = (data?.products || data || []).find(
            (p) => p.codigoBarras && String(p.codigoBarras).trim() === code
         );

         if (!found) {
            toast.error('Ningún producto coincide con ese código de barras');
            return;
         }
         if (found.esGenerico) {
            openCustomProduct(found);
         } else {
            addToCart(found);
            toast.success(`${found.nombre} agregado`);
         }
         setBarcodeInput('');
      } catch {
         toast.error('Error al buscar el código de barras');
      }
   }, [barcodeInput, addToCart, openCustomProduct]);

   const vueltoCalculado = montoRecibido ? (parseFloat(montoRecibido) - cartTotal) : 0;

   const productCartMap = useMemo(() => {
      const map = new Map();
      cartItems.forEach((i) => {
         if (!i.promocion && i.producto) map.set(i.producto, (map.get(i.producto) || 0) + i.cantidad);
      });
      return map;
   }, [cartItems]);

   const promoCartMap = useMemo(() => {
      const map = new Map();
      cartItems.forEach((i) => {
         if (i.promocion) map.set(i.promocion, (map.get(i.promocion) || 0) + i.cantidad);
      });
      return map;
   }, [cartItems]);

   const addPromo = useCallback((promo) => {
      const added = addToCart(promo, {
         esPromocion: true,
         promocion: promo._id,
         nombre: promo.nombre,
         precioVenta: promo.precioFinal,
         precioCompra: promo.subtotalCosto,
      });
      if (added) toast.success('Promoción agregada al carrito');
   }, [addToCart]);

   const handleCheckout = async () => {
      if (cartItems.length === 0) return toast.error('El carrito está vacío');
      if (metodoPago === 'efectivo' && montoRecibido && parseFloat(montoRecibido) < cartTotal) {
         return toast.error('El monto recibido es menor al total');
      }

      try {
         const payload = {
            items: cartItems.map(i => ({
               producto: i.producto,
               cantidad: i.cantidad,
               promocion: i.promocion,
               precioUnitario: i.precioUnitario,
               subtotal: i.subtotal
            })),
            descuento: discount,
            metodoPago,
            notas: notas.trim() || undefined,
            montoPagado: metodoPago === 'efectivo' && montoRecibido ? parseFloat(montoRecibido) : cartTotal,
            cliente: selectedCustomer?._id,
            fecha: fechaVenta ? new Date(fechaVenta).toISOString() : undefined
         };

         await api.post('/sales', payload);
         clearCart();
         setMetodoPago('efectivo');
         setMontoRecibido('');
         setNotas('');
         setFechaVenta(toLocalDateTimeInput(new Date()));
         setShowCartSheet(false);
         fetchProducts();
         const esOtroDia = (fechaVenta || '').slice(0, 10) !== fechaLocalHoy();
         toast.success(esOtroDia ? 'Venta registrada en la fecha seleccionada' : 'Venta registrada con éxito');
      } catch (error) {
         toast.error(error.response?.data?.message || 'Error al procesar la venta');
      }
   };

   const handleBudget = async () => {
      if (cartItems.length === 0) return toast.error('El carrito está vacío');

      try {
         const payload = {
            items: cartItems.map(i => ({
               producto: i.producto,
               promocion: i.promocion,
               cantidad: i.cantidad,
               precioUnitario: i.precioVenta,
               subtotal: i.subtotal
            })),
            descuento: discount,
            notas: budgetNotas.trim() || undefined,
            clienteNombre: budgetName.trim() || undefined,
            clienteTelefono: budgetPhone.trim() || undefined
         };

         await api.post('/budgets', payload);
         toast.success('Presupuesto creado');
         clearCart();
         setShowCartSheet(false);
         setBudgetName('');
         setBudgetPhone('');
         setBudgetNotas('');
      } catch {
         toast.error('Error al crear presupuesto');
      }
   };

   const createQuickCustomer = async () => {
      if (!newCustomerName.trim()) return toast.error('Ingresá el nombre del cliente');
      try {
         const { data } = await api.post('/customers', {
            nombre: newCustomerName.trim(),
            telefono: newCustomerPhone.trim() || undefined
         });
         setCustomers(prev => [data, ...prev]);
         setSelectedCustomer(data);
         setNewCustomerName('');
         setNewCustomerPhone('');
         setShowCustomerModal(false);
         toast.success('Cliente creado y asignado a la venta');
      } catch {
         toast.error('Error al crear cliente');
      }
   };

const fmtMoneda = formatCurrency;

   const deduccionesPago = calcularDeduccionesPago(metodoPago, cartTotal, impuestosConfig || undefined);

   const cartPanel = (onMobileClose) => (
      <>
         <div className="p-3 md:p-4 border-b border-stone-800 flex justify-between items-center bg-stone-900/50 rounded-t-xl shrink-0">
            <h3 className="font-bold text-sm md:text-lg text-textLight flex items-center">
               <ShoppingCart className="mr-2 text-primary" size={18} />
               Venta
            </h3>
            <div className="flex items-center gap-2">
               {cartItems.length > 0 && (
                  <button onClick={clearCart} className="text-[10px] md:text-xs text-danger hover:text-red-400 transition-colors flex items-center">
                     <Trash2 size={10} className="mr-1" /> Vaciar
                  </button>
               )}
               {onMobileClose && (
                  <button onClick={onMobileClose} className="md:hidden p-1.5 text-textMuted hover:text-textLight rounded-lg"><X size={18} /></button>
               )}
            </div>
         </div>

         {/* Items del Carrito */}
         <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 custom-scrollbar min-h-[180px]">
            {cartItems.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-textMuted opacity-50">
                  <ShoppingCart size={36} className="mb-3" />
                  <p className="text-sm">Carrito vacío</p>
               </div>
            ) : (
               cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between items-center bg-background p-2.5 rounded-lg border border-stone-800">
                     <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-textLight text-xs md:text-sm truncate">{item.nombre}</p>
                        {item.esPromocion && (
                           <span className="text-[9px] uppercase font-bold px-1 py-0.5 rounded bg-primary/20 text-primary">Promo</span>
                        )}
                        <p className="text-primary font-semibold text-xs md:text-sm">{fmtMoneda(item.subtotal)} <span className="text-[10px] text-textMuted font-normal ml-1">({fmtMoneda(item.precioVenta)} c/u)</span></p>
                     </div>
                     <div className="flex items-center gap-1.5 shrink-0 bg-stone-800 rounded-lg p-0.5">
                        <button onClick={() => updateQuantity(item.cartItemId, item.cantidad - 1)} className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded bg-stone-700 text-white hover:bg-stone-600">
                           <Minus size={12} />
                        </button>
                        <span className="w-5 md:w-6 text-center text-xs md:text-sm font-bold text-textLight">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, item.cantidad + 1)} disabled={item.stockMaximo > 0 && item.cantidad >= item.stockMaximo} className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded bg-stone-700 text-white hover:bg-stone-600 disabled:opacity-50">
                           <Plus size={12} />
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>

         {/* Totales y Pago */}
         <div className="p-3 md:p-4 border-t border-stone-800 bg-stone-900/80 rounded-b-xl shrink-0">
            {/* Subtotal + Descuento en una sola fila */}
            <div className="flex items-center justify-between gap-2 mb-2">
               <span className="text-xs text-textMuted">Subtotal</span>
               <div className="flex items-center gap-1.5">
                  <span className="text-xs text-textLight font-medium">{fmtMoneda(cartSubtotal)}</span>
                  <span className="text-[10px] text-textMuted">· Desc</span>
                  <input
                     type="number"
                     min="0" max="100"
                     value={discount}
                     onChange={(e) => setDiscount(Number(e.target.value))}
                     className="w-12 bg-surface border border-stone-700 rounded text-right px-1.5 py-1 text-xs text-textLight focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-textMuted">%</span>
               </div>
            </div>

            {/* Total destacado */}
            <div className="flex items-center justify-between bg-stone-900 rounded-lg border border-stone-800 px-3 py-2 mb-2">
               <span className="text-sm text-textLight font-bold">Total</span>
               <span className="text-xl text-primary font-black">{fmtMoneda(cartTotal)}</span>
            </div>

            {/* Método de pago: chips en una sola fila */}
            <div className="mb-2">
               <label className="text-[10px] text-textMuted block mb-1">Método de pago</label>
               <div className="grid grid-cols-4 gap-1.5">
                  {['efectivo', 'tarjeta', 'tarjeta_debito', 'transferencia'].map(m => (
                     <button
                        key={m}
                        onClick={() => setMetodoPago(m)}
                        className={`py-1.5 rounded-lg text-[10px] font-semibold transition-colors border ${metodoPago === m ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-stone-700 text-textMuted hover:border-stone-500'}`}
                     >
                        {SHORT_PAYMENT_LABELS[m]}
                     </button>
                  ))}
               </div>
            </div>

            {/* Recibido + Vuelto (solo efectivo) */}
            {metodoPago === 'efectivo' && cartItems.length > 0 && (
               <div className="mb-2 grid grid-cols-2 gap-2 items-end">
                  <div>
                     <label className="text-[10px] text-textMuted block mb-1">Recibido</label>
                     <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                        <input
                           type="number"
                           value={montoRecibido}
                           onChange={handleMontoChange}
                           className="w-full bg-surface border border-stone-700 rounded-lg pl-5 pr-2 py-1.5 text-xs text-textLight focus:outline-none focus:border-primary font-bold"
                           placeholder="Recibido"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] text-textMuted block mb-1">Vuelto</label>
                     <div className={`w-full bg-surface px-2.5 py-1.5 rounded-lg border flex items-center h-[34px] text-xs ${vueltoCalculado < 0 ? 'border-danger/50 text-danger' : 'border-stone-800 text-emerald-400'} font-bold`}>
                        {vueltoCalculado < 0 ? 'Inválido' : fmtMoneda(vueltoCalculado)}
                     </div>
                  </div>
               </div>
            )}

            {/* Impuestos: línea compacta con detalle desplegable */}
            {deduccionesPago.tieneDeducciones && cartItems.length > 0 && (
               <div className="mb-2">
                  <button
                     onClick={() => setShowTaxDetail(v => !v)}
                     className="w-full flex items-center justify-between bg-stone-900/60 border border-stone-800 rounded-lg px-3 py-1.5 text-[11px] hover:border-stone-700 transition-colors"
                  >
                     <span className="text-textMuted">
                        Neto <span className="text-emerald-400 font-bold">{fmtMoneda(deduccionesPago.totalNeto)}</span>
                     </span>
                     <span className="flex items-center gap-1 text-textMuted">
                        Imp. {fmtMoneda(deduccionesPago.impuestosPago)}
                        <ChevronDown size={12} className={`transition-transform ${showTaxDetail ? 'rotate-180' : ''}`} />
                     </span>
                  </button>
                  {showTaxDetail && (
                     <div className="mt-1 bg-stone-900/40 border border-stone-800 rounded-lg px-3 py-1.5 text-[10px] space-y-0.5">
                        {(deduccionesPago.impuestosDetalle || []).map((imp, idx) => (
                           <div key={`${imp.nombre}-${idx}`} className="flex justify-between text-textMuted">
                              <span>{imp.nombre} ({imp.porcentaje}%)</span>
                              <span className="text-textLight font-semibold">-{fmtMoneda(imp.monto)}</span>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            )}

            {/* Cliente de la venta */}
            <div className="mb-2">
               {selectedCustomer ? (
                  <div className="flex items-center justify-between bg-surface border border-stone-700 rounded-lg px-2.5 py-1.5">
                     <div className="flex items-center gap-2 min-w-0">
                        <User size={14} className="text-primary shrink-0" />
                        <div className="min-w-0">
                           <p className="text-xs font-medium text-textLight truncate">{selectedCustomer.nombre}</p>
                           <p className="text-[10px] text-textMuted flex items-center gap-1">
                              <Award size={10} className="text-amber-400" /> {selectedCustomer.puntos ?? 0} pts
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setShowCustomerModal(true)} className="p-1 text-textMuted hover:text-textLight rounded-lg transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setSelectedCustomer(null)} className="p-1 text-danger/70 hover:text-danger rounded-lg transition-colors"><X size={13} /></button>
                     </div>
                  </div>
               ) : (
                  <button
                     onClick={() => setShowCustomerModal(true)}
                     className="w-full bg-surface border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-textMuted hover:border-primary hover:text-textLight transition-colors flex items-center gap-2"
                  >
                     <User size={14} /> Cliente
                  </button>
               )}
            </div>

            {/* Venta con otra fecha / notas (colapsados por defecto) */}
            <button
               onClick={() => setShowAdvanced(v => !v)}
               className="w-full flex items-center justify-between text-[11px] text-textMuted hover:text-textLight mb-2 px-0.5 transition-colors"
            >
               <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  Venta con otra fecha / notas
                  {((fechaVenta || '').slice(0, 10) !== fechaLocalHoy() || notas) && (
                     <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
               </span>
               <ChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            {showAdvanced && (
               <div className="mb-2 space-y-2">
                  <div>
                     <label className="text-[10px] text-textMuted block mb-1">Fecha y hora de la venta</label>
                     <input
                        type="datetime-local"
                        value={fechaVenta}
                        max={toLocalDateTimeInput(new Date())}
                        onChange={(e) => setFechaVenta(e.target.value)}
                        className="w-full bg-surface border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-textLight focus:outline-none focus:border-primary"
                     />
                     <p className="text-[9px] text-textMuted mt-1">
                        Podés cargar ventas de días anteriores: se suman a ese día.
                     </p>
                  </div>
                  <input
                     type="text"
                     value={notas}
                     onChange={(e) => setNotas(e.target.value)}
                     placeholder="Notas (opcional)"
                     className="w-full bg-surface border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-textLight focus:outline-none focus:border-primary"
                  />
               </div>
            )}

            <div className="flex gap-2">
               <button
                  onClick={() => setShowBudgetModal(true)}
                  disabled={cartItems.length === 0}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/30 disabled:text-white/50 text-white font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 text-xs transition-colors shadow-lg shadow-amber-500/20"
               >
                  <FileText size={14} />
                  Presupuestar
               </button>
               <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || loading || (metodoPago === 'efectivo' && montoRecibido && parseFloat(montoRecibido) < cartTotal)}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:text-white/50 text-white font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 text-xs uppercase tracking-wide transition-colors shadow-lg shadow-emerald-500/20"
               >
                  Vender
               </button>
            </div>
         </div>
      </>
   );

   return (
      <div className="h-full grid grid-rows-1 md:grid-rows-1 md:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-4 md:gap-6 overflow-hidden">
         {/* Columna Izquierda - Catálogo */}
         <div className="flex flex-col gap-3 md:gap-4 overflow-hidden min-h-0">
            {/* Buscador y Filtros */}
            <div className="bg-surface p-3 md:p-4 rounded-xl border border-stone-800 shrink-0">
               <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                  <input
                     type="text"
                     placeholder="Buscar producto..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-background border border-stone-700 rounded-lg pl-10 pr-4 py-2.5 text-textLight focus:ring-2 focus:ring-primary focus:outline-none"
                  />
               </div>
               <form onSubmit={handleBarcodeSearch} className="relative mb-3">
                  <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                     type="text"
                     inputMode="numeric"
                     placeholder="Escanear código de barras..."
                     value={barcodeInput}
                     onChange={(e) => setBarcodeInput(e.target.value)}
                     className="w-full bg-background border border-stone-700 rounded-lg pl-10 pr-4 py-2.5 text-textLight focus:ring-2 focus:ring-primary focus:outline-none"
                  />
               </form>
               <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <button
                     onClick={() => setActiveCategory('')}
                     className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${activeCategory === '' ? 'bg-primary text-white' : 'bg-stone-800 text-textMuted hover:bg-stone-700'}`}
                  >
                     Todas
                  </button>
                  {categories.map((c) => (
                     <button
                        key={c._id}
                        onClick={() => setActiveCategory(c._id)}
                        className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 border border-transparent`}
                        style={{
                           backgroundColor: activeCategory === c._id ? `${c.color}20` : '#1e293b',
                           color: activeCategory === c._id ? c.color : '#94a3b8',
                           borderColor: activeCategory === c._id ? c.color : 'transparent'
                        }}
                     >
                        <Tag size={10} fill={activeCategory === c._id ? c.color : 'none'} />
                        {c.nombre}
                     </button>
                  ))}
               </div>
               <div className="mt-2 pt-2 border-t border-stone-800">
                  <button
                     onClick={() => setShowPromos(!showPromos)}
                     className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                        showPromos ? 'bg-gradient-to-r from-primary to-primaryDark text-white shadow-lg shadow-primary/20' : 'bg-stone-800 text-textMuted hover:text-textLight'
                     }`}
                  >
                     <Sparkles size={14} />
                     {showPromos ? 'Mostrando Promociones' : `Promociones (${promotions.length})`}
                  </button>
               </div>
            </div>

            {/* Grid de Productos */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 content-start pb-20 md:pb-0">
               {loading ? (
                  <div className="col-span-full flex justify-center py-10">
                     <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
               ) : showPromos ? (
                  promotions.length === 0 ? (
                     <div className="col-span-full text-center py-10 text-textMuted text-sm">
                        No hay promociones activas.
                     </div>
) : (
                     promotions.map((promo) => (
                        <PromoCard key={promo._id} promo={promo} qty={promoCartMap.get(promo._id) || 0} onAdd={addPromo} />
                     ))
                  )
               ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-textMuted text-sm">
                     No se encontraron productos.
                  </div>
               ) : (
                     products.map((p) => (
                        <ProductCard
                           key={p._id}
                           p={p}
                           qty={productCartMap.get(p._id) || 0}
                           onOpenCustom={openCustomProduct}
                           onAdd={addToCart}
                           onQuickAdd={quickAddStock}
                        />
                     ))
                  )}
            </div>
         </div>

         {/* Columna Derecha - Carrito (Solo Desktop) */}
         <div className="hidden md:flex bg-surface border border-stone-800 rounded-xl flex-col shadow-lg overflow-hidden min-h-0">
            {cartPanel(null)}
         </div>

         {/* FAB Mobile - Abrir Carrito */}
         <button
            onClick={() => setShowCartSheet(true)}
            className="md:hidden fixed bottom-5 right-4 left-4 z-40 bg-gradient-to-r from-primary to-primaryDark text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-between px-5 py-3.5 active:scale-[0.98] transition-transform"
         >
            <span className="flex items-center gap-2">
               <ShoppingCart size={20} className="text-white" />
               <span className="text-sm font-bold">
                  Ver Carrito{cartItems.length > 0 ? ` (${cartItems.reduce((a, i) => a + i.cantidad, 0)})` : ' vacío'}
               </span>
            </span>
            <span className="text-base font-extrabold">{fmtMoneda(cartTotal)}</span>
         </button>

         {/* Bottom Sheet Carrito Mobile */}
         {showCartSheet && (
            <div className="fixed inset-0 z-50 md:hidden">
               <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCartSheet(false)} />
               <div className="absolute inset-x-0 bottom-0 bg-surface rounded-t-3xl border-t border-stone-700 shadow-2xl flex flex-col h-[92dvh] animate-slide-up">
                  <div className="shrink-0 w-full flex justify-center pt-3 pb-1">
                     <div className="w-10 h-1.5 bg-stone-700 rounded-full" />
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                     {cartPanel(() => setShowCartSheet(false))}
                  </div>
               </div>
            </div>
         )}

         {/* Modal Selección Cliente */}
         {showCustomerModal && (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4" onClick={() => setShowCustomerModal(false)}>
               <div className="bg-surface rounded-t-2xl md:rounded-2xl border border-stone-800 w-full md:max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up md:animate-none" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-stone-800 flex items-center justify-between shrink-0">
                     <h3 className="text-lg font-bold text-textLight flex items-center gap-2">
                        <User size={18} className="text-primary" /> Seleccionar cliente
                     </h3>
                     <button onClick={() => setShowCustomerModal(false)} className="text-textMuted hover:text-textLight"><X size={20} /></button>
                  </div>
                  <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
                     <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                        <input
                           type="text"
                           placeholder="Buscar por nombre o teléfono..."
                           value={customerSearch}
                           onChange={e => setCustomerSearch(e.target.value)}
                           className="w-full bg-background border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-sm text-textLight focus:outline-none focus:border-primary"
                        />
                     </div>
                     <div className="border-b border-stone-800 pb-4">
                        <p className="text-xs font-bold text-textMuted uppercase mb-2">Crear cliente rápido</p>
                        <div className="flex gap-2">
                           <input type="text" placeholder="Nombre" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} className="flex-1 min-w-0 bg-background border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-primary" />
                           <input type="tel" placeholder="Tel" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} className="w-24 bg-background border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-primary" />
                           <button onClick={createQuickCustomer} className="bg-primary hover:bg-primaryDark text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium shrink-0">
                              <UserPlus size={16} /> Crear
                           </button>
                        </div>
                     </div>
                     <div className="max-h-52 overflow-y-auto space-y-1.5 custom-scrollbar">
                        {customersLoading && <p className="text-sm text-textMuted text-center py-4">Cargando...</p>}
                        {!customersLoading && customers.length === 0 && <p className="text-sm text-textMuted text-center py-4">No hay clientes</p>}
                        {customers.map(c => (
                           <button
                              key={c._id}
                              onClick={() => { setSelectedCustomer(c); setShowCustomerModal(false); }}
                              className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-stone-800/50 transition-colors text-left"
                           >
                              <div className="min-w-0">
                                 <p className="text-sm font-medium text-textLight truncate">{c.nombre}</p>
                                 <p className="text-xs text-textMuted">{c.telefono || 'Sin teléfono'}</p>
                              </div>
                              {c.esAfiliado ? (
                                 <span className="text-[11px] text-amber-400 flex items-center gap-1 shrink-0">
                                    <Award size={12} /> {c.puntos ?? 0} pts
                                 </span>
                              ) : (
                                 <span className="text-[11px] text-textMuted shrink-0">No afiliado</span>
                              )}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Modal Interactivo de Producto Custom */}
         {activeCustomProduct && (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
               <div className="bg-surface w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-stone-700 shadow-2xl flex flex-col p-5 md:p-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-slide-up md:animate-none">
                  <div className="flex justify-between items-center mb-4">
                      <div>
                         <h3 className="text-lg md:text-xl font-bold text-textLight">{activeCustomProduct.product.nombre}</h3>
                         <p className="text-[11px] text-textMuted mt-0.5">
                            Precio libre por {activeCustomProduct.product.unidadMedida || 'unidad'}
                         </p>
                      </div>
                      <button onClick={() => setActiveCustomProduct(null)} className="text-textMuted hover:text-textLight"><XCircle size={24} /></button>
                   </div>

                  {activeCustomProduct.type === 'generic' && (
                     <div className="space-y-4">
                        <label className="block text-sm font-medium text-textMuted">Ingrese el precio a cobrar por este artículo</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                           <input
                              type="number"
                              min="0"
                              value={customPriceInput}
                              onChange={(e) => setCustomPriceInput(e.target.value)}
                              className="w-full bg-background border border-stone-700 rounded-xl pl-8 pr-4 py-3 text-textLight focus:ring-2 focus:ring-primary focus:outline-none font-bold text-lg"
                              placeholder="0.00"
                              autoFocus
                           />
                        </div>
                        <button
                           onClick={() => {
                              const val = parseFloat(customPriceInput);
                              if (!val || val <= 0) return toast.error('Ingrese un valor válido');
                              const added = addToCart(activeCustomProduct.product, {
                                 esGenerico: true,
                                 precioVenta: val
                              });
                              if (added) setActiveCustomProduct(null);
                           }}
                           className="w-full mt-4 bg-primary hover:bg-primaryDark text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20"
                        >Agregar al Carrito</button>
                     </div>
                  )}

               </div>
            </div>
         )}

         {/* Modal Presupuesto */}
         {showBudgetModal && (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4" onClick={() => setShowBudgetModal(false)}>
               <div className="bg-surface rounded-t-2xl md:rounded-2xl border border-stone-700 w-full md:max-w-sm shadow-2xl animate-slide-up md:animate-none" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-stone-800">
                     <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                           <FileText size={18} /> Presupuestar
                        </h3>
                        <button onClick={() => setShowBudgetModal(false)} className="text-textMuted hover:text-textLight md:hidden"><X size={20} /></button>
                     </div>
                  </div>
                  <div className="p-5 space-y-3">
                     <input type="text" placeholder="Nombre del cliente" value={budgetName}
                        onChange={e => setBudgetName(e.target.value)}
                        className="w-full bg-background border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-amber-500" />
                     <input type="tel" placeholder="Teléfono (para WhatsApp)" value={budgetPhone}
                        onChange={e => setBudgetPhone(e.target.value)}
                        className="w-full bg-background border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-amber-500" />
                     <textarea placeholder="Notas (opcional)" value={budgetNotas}
                        onChange={e => setBudgetNotas(e.target.value)} rows={2}
                        className="w-full bg-background border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-amber-500 resize-none" />
                  </div>
                  <div className="flex gap-3 p-5 border-t border-stone-800 pb-6 md:pb-5">
                     <button onClick={() => setShowBudgetModal(false)}
                        className="flex-1 py-2.5 rounded-lg border border-stone-700 text-textMuted hover:text-textLight transition-colors text-sm font-medium">
                        Cancelar
                     </button>
                     <button onClick={() => { handleBudget(); setShowBudgetModal(false); }}
                        className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                        <FileText size={16} /> Crear
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default POS;
