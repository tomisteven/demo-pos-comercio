import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useDebounce } from '../hooks/useDebounce';
import { ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const formatStock = (val) => {
  if (val === undefined || val === null) return '0';
  // Si es entero, lo dejamos como está, si tiene decimales, limitamos a 2
  return Number.isInteger(val) ? val.toString() : Number(val).toFixed(2);
};

const getTipoIcon = (tipo) => {
  switch(tipo) {
     case 'entrada': return <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-500"><ArrowDownToLine size={16} /></div>;
     case 'salida': return <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-500"><ArrowUpFromLine size={16} /></div>;
     case 'ajuste': return <div className="p-1.5 rounded-md bg-beige/20 text-beige"><RefreshCcw size={16} /></div>;
     case 'venta': return <div className="p-1.5 rounded-md bg-primary/20 text-primary"><ArrowRightLeft size={16} /></div>;
     default: return null;
  }
};

const StockRow = React.memo(function StockRow({ m }) {
  const esEntrada = m.tipo === 'entrada' || (m.tipo === 'ajuste' && m.stockNuevo > m.stockAnterior);
  return (
    <tr className="hover:bg-stone-800/60 transition-colors odd:bg-stone-900/30">
      <td className="px-4 py-3 whitespace-nowrap align-top">
         <div className="text-xs font-medium text-textLight">{new Date(m.fecha).toLocaleDateString()}</div>
         <div className="text-[11px] text-textMuted">{new Date(m.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      </td>
      <td className="px-4 py-3 align-top">
         <div className="flex items-center">
            {getTipoIcon(m.tipo)}
            <span className="ml-2 font-medium capitalize text-xs">{m.tipo}</span>
         </div>
      </td>
      <td className="px-4 py-3 align-top min-w-[160px]">
         <div className="font-semibold text-textLight text-sm truncate max-w-[220px]" title={m.producto?.nombre}>{m.producto?.nombre}</div>
         <div className="text-[11px] text-textMuted font-mono mt-0.5">{m.producto?.sku}</div>
      </td>
      <td className="px-3 py-3 text-center align-top">
           <span className={`inline-block min-w-[3ch] font-bold text-sm ${esEntrada ? 'text-emerald-400' : 'text-danger'}`}>
              {esEntrada ? '+' : '-'}{formatStock(m.cantidad)}
           </span>
       </td>
       <td className="px-3 py-3 text-center align-top">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs whitespace-nowrap">
             <span className="text-textMuted line-through opacity-50">{formatStock(m.stockAnterior)}</span>
             <span className="text-white/20">→</span>
             <span className="font-bold text-textLight">{formatStock(m.stockNuevo)}</span>
          </div>
       </td>
      <td className="px-4 py-3 text-textMuted text-xs max-w-[180px] truncate align-top" title={m.motivo || ''}>{m.motivo || '-'}</td>
      <td className="px-4 py-3 align-top">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center text-[10px] font-bold shrink-0">
               {m.usuario?.nombre?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="truncate max-w-[90px] text-xs">{m.usuario?.nombre}</span>
         </div>
      </td>
    </tr>
  );
});

const Stock = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bajoStock, setBajoStock] = useState([]);
  const [loadingBajoStock, setLoadingBajoStock] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tipo, setTipo] = useState('');
  const debouncedStartDate = useDebounce(startDate, 400);
  const debouncedEndDate = useDebounce(endDate, 400);
  const debouncedTipo = useDebounce(tipo, 300);

  // Productos que están en o por debajo del stock mínimo
  const fetchBajoStock = useCallback(async () => {
    setLoadingBajoStock(true);
    try {
      const res = await api.get('/products/low-stock');
      setBajoStock(res.data || []);
    } catch {
      // No bloquea la lista de movimientos
    } finally {
      setLoadingBajoStock(false);
    }
  }, []);

  useEffect(() => {
    fetchBajoStock();
  }, [fetchBajoStock]);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/stock-movements?';
      if (debouncedStartDate) url += `startDate=${debouncedStartDate}&`;
      if (debouncedEndDate) url += `endDate=${debouncedEndDate}&`;
      if (debouncedTipo) url += `tipo=${debouncedTipo}`;
      
      const res = await api.get(url);
      setMovements(res.data);
    } catch {
      toast.error('Error al obtener movimientos');
    } finally {
      setLoading(false);
    }
  }, [debouncedStartDate, debouncedEndDate, debouncedTipo]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-textLight">Movimientos de Stock</h2>
          <p className="text-textMuted text-sm mt-1">Historial de entradas, salidas y ajustes</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <select 
             value={tipo}
             onChange={e => setTipo(e.target.value)}
             className="bg-surface border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-primary"
           >
             <option value="">Todos los tipos</option>
             <option value="entrada">Entrada</option>
             <option value="salida">Salida</option>
             <option value="ajuste">Ajuste</option>
             <option value="venta">Venta</option>
           </select>
           <input 
             type="date" 
             value={startDate}
             onChange={e => setStartDate(e.target.value)}
             className="bg-surface border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-primary"
           />
           <span className="text-textMuted flex items-center">-</span>
           <input 
             type="date" 
             value={endDate}
             onChange={e => setEndDate(e.target.value)}
             className="bg-surface border border-stone-700 rounded-lg px-3 py-2 text-sm text-textLight focus:outline-none focus:border-primary"
           />
        </div>
      </div>

      <div className="bg-surface border border-stone-800 rounded-xl overflow-hidden shrink-0">
        <div className="px-5 py-3 border-b border-stone-800 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-textLight flex items-center gap-2">
              <Package size={16} className="text-warning" /> Necesitan reposición
            </h3>
            <p className="text-[11px] text-textMuted mt-0.5">Productos con stock igual o por debajo del mínimo</p>
          </div>
          <span className="text-[10px] font-bold uppercase text-warning bg-warning/15 border border-warning/30 px-2 py-1 rounded-full whitespace-nowrap">{bajoStock.length}</span>
        </div>
        <div className="p-3 max-h-52 overflow-y-auto custom-scrollbar">
          {loadingBajoStock ? (
            <div className="flex justify-center py-6"><div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : bajoStock.length === 0 ? (
            <p className="text-center py-6 text-textMuted text-sm">Todos los productos están por encima del stock mínimo.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {bajoStock.map((p) => {
                const stock = Number(p.stock) || 0;
                const minimo = Number(p.stockMinimo) || 0;
                const faltante = Math.max(0, minimo - stock);
                const pct = minimo > 0 ? Math.min(100, (stock / minimo) * 100) : 100;
                const barColor = stock <= 0 ? 'bg-danger' : pct < 50 ? 'bg-warning' : 'bg-emerald-500';
                const estado = stock <= 0 ? 'Agotado' : `Faltan ${formatStock(faltante)}`;
                return (
                  <div key={p._id} className="bg-background border border-stone-800 rounded-lg px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-textLight text-xs leading-tight truncate" title={p.nombre}>{p.nombre}</p>
                      <span className={`text-[10px] font-bold shrink-0 ${stock <= 0 ? 'text-danger' : 'text-warning'}`}>{estado}</span>
                    </div>
                    <p className="text-[10px] text-textMuted mt-1">
                      Stock {formatStock(stock)} · Mín {formatStock(minimo)} {p.unidadMedida || 'unidad'}
                    </p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-surface border border-stone-800 rounded-xl overflow-hidden flex flex-col min-h-0">
        <div className="px-5 py-3 border-b border-stone-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-textLight flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-primary" /> Historial de movimientos
          </h3>
          <span className="text-[10px] font-bold uppercase text-textMuted bg-stone-800 px-2 py-1 rounded-full">{movements.length}</span>
        </div>
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm text-textLight">
            <thead className="text-[11px] text-textMuted uppercase bg-stone-900 border-b border-stone-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-3 py-3 text-center font-semibold">Cant.</th>
                <th className="px-3 py-3 text-center font-semibold">Variación</th>
                <th className="px-4 py-3 font-semibold">Motivo</th>
                <th className="px-4 py-3 font-semibold">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-textMuted">No se encontraron movimientos registrados.</td></tr>
              ) : (
                movements.map((m) => (
                  <StockRow key={m._id} m={m} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stock;
