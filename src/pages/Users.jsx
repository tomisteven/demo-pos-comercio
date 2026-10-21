import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, Edit2, Trash2, X, ShieldAlert, ShieldCheck, RotateCcw, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const { user: me } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', rol: 'empleado', activo: true });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      toast.error('Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'empleado', activo: true });
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingId(u._id);
    setFormData({ nombre: u.nombre, email: u.email, password: '', rol: u.rol, activo: u.activo });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // el backend lo ignora si está vacío

      if (editingId) {
        await api.put(`/users/${editingId}`, payload);
        toast.success('Usuario actualizado');
      } else {
        if (!payload.password) return toast.error('Debe ingresar una contraseña');
        await api.post('/users', payload);
        toast.success('Usuario creado');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleToggleActivo = async (u) => {
    // Activar / desactivar con protección contra auto-desactivación
    if (u.activo && me && u._id === me._id) {
      return toast.error('No podés desactivar tu propia cuenta');
    }
    const accion = u.activo ? 'desactivar' : 'reactivar';
    if (!window.confirm(`¿${u.activo ? 'Desactivar' : 'Reactivar'} a ${u.nombre}?${u.activo ? ' Ya no podrá ingresar al sistema.' : ''}`)) return;
    try {
      await api.put(`/users/${u._id}`, { activo: !u.activo });
      toast.success(`Usuario ${accion === 'desactivar' ? 'desactivado' : 'reactivado'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || `Error al ${accion}`);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-textLight">Usuarios</h2>
          <p className="text-textMuted text-sm mt-1">Administración de cuentas</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg transition-colors flex items-center shadow-lg shadow-primary/20"
        >
          <PlusCircle size={18} className="mr-2" />
          Nuevo Usuario
        </button>
      </div>

      <div className="flex-1 bg-surface border border-stone-800 rounded-xl overflow-hidden flex flex-col min-h-0">
        <div className="px-5 py-3 border-b border-stone-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-textLight flex items-center gap-2">
            <UsersIcon size={16} className="text-primary" /> Cuentas
          </h3>
          <span className="text-[10px] font-bold uppercase text-textMuted bg-stone-800 px-2 py-1 rounded-full">{users.length}</span>
        </div>
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm text-textLight">
            <thead className="text-[11px] text-textMuted uppercase bg-stone-900 border-b border-stone-800 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 font-semibold">Usuario</th>
                <th className="px-5 py-3 font-semibold">Rol</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Creación</th>
                <th className="px-5 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-textMuted">No hay usuarios registrados.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className={`hover:bg-stone-800/60 transition-colors odd:bg-stone-900/30 ${!u.activo ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-xs font-bold shrink-0">
                             {u.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                             <div className="font-semibold text-textLight truncate">{u.nombre}{me && u._id === me._id && <span className="ml-1.5 text-[10px] text-primary">(vos)</span>}</div>
                             <div className="text-xs text-textMuted truncate">{u.email}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-5 py-3">
                       <div className="flex items-center text-xs font-semibold uppercase">
                          {u.rol === 'admin' ? <ShieldCheck size={14} className="text-primary mr-1" /> : <ShieldAlert size={14} className="text-stone-400 mr-1" />}
                          <span className={u.rol === 'admin' ? 'text-primary' : 'text-stone-400'}>{u.rol}</span>
                       </div>
                    </td>
                    <td className="px-5 py-3">
                       <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${u.activo ? 'bg-emerald-500/20 text-emerald-500' : 'bg-stone-700 text-stone-400'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                       </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-textMuted whitespace-nowrap">
                       {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-3">
                       <div className="flex items-center justify-center space-x-3">
                          <button onClick={() => openEditModal(u)} title="Editar" className="text-primary hover:text-primary/80 transition-colors"><Edit2 size={16} /></button>
                          {u.activo ? (
                             <button
                                onClick={() => handleToggleActivo(u)}
                                disabled={me && u._id === me._id}
                                title={me && u._id === me._id ? 'No podés desactivarte a vos mismo' : 'Desactivar'}
                                className={`transition-colors ${me && u._id === me._id ? 'text-stone-600 cursor-not-allowed' : 'text-danger hover:text-red-400'}`}
                             >
                                <Trash2 size={16} />
                             </button>
                          ) : (
                             <button onClick={() => handleToggleActivo(u)} title="Reactivar" className="text-emerald-400 hover:text-emerald-300 transition-colors"><RotateCcw size={16} /></button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl border border-stone-700 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-stone-800">
              <h3 className="text-xl font-bold text-textLight">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textMuted hover:text-textLight"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Nombre Completo</label>
                  <input required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} type="text" className="w-full bg-background border border-stone-700 rounded-lg px-4 py-3 text-textLight focus:ring-1 focus:ring-primary focus:outline-none" />
               </div>

               <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Email</label>
                  <input required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" className="w-full bg-background border border-stone-700 rounded-lg px-4 py-3 text-textLight focus:ring-1 focus:ring-primary focus:outline-none" />
               </div>

               <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Contraseña {editingId && <span className="text-xs font-normal opacity-50">(Dejar en blanco para no cambiar)</span>}</label>
                  <input value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} type="password" placeholder={editingId ? '••••••••' : ''} className="w-full bg-background border border-stone-700 rounded-lg px-4 py-3 text-textLight focus:ring-1 focus:ring-primary focus:outline-none" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-textMuted mb-2">Rol</label>
                     <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})} className="w-full bg-background border border-stone-700 rounded-lg px-4 py-3 text-textLight focus:ring-1 focus:ring-primary focus:outline-none">
                        <option value="empleado">Empleado</option>
                        <option value="admin">Administrador</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-textMuted mb-2">Estado</label>
                     <select value={formData.activo} onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})} className="w-full bg-background border border-stone-700 rounded-lg px-4 py-3 text-textLight focus:ring-1 focus:ring-primary focus:outline-none">
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                     </select>
                  </div>
               </div>

               <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-lg border border-stone-700 text-textLight hover:bg-stone-800 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 rounded-lg bg-primary hover:bg-primaryDark text-white font-semibold transition-colors shadow-lg shadow-primary/20">Guardar</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
