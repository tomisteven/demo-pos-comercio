import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import logoLight from '../assets/logo-stocka-horizontal-light.png';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Control total de tu negocio',
    desc: 'Ventas, stock y caja en tiempo real.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguro y confiable',
    desc: 'Tu información siempre protegida.',
  },
  {
    icon: Zap,
    title: 'Rápido y simple',
    desc: 'Menos pasos, más ventas cada día.',
  },
];

const Brand = ({ compact = false }) => {
  const [logoOk, setLogoOk] = useState(true);

  if (logoOk) {
    return (
      <img
        src={logoLight}
        alt="STOCKA"
        className={compact ? 'h-9 w-auto' : 'h-12 w-auto'}
        onError={() => setLogoOk(false)}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e2c063] to-[#c49a4a] flex items-center justify-center shadow-lg shadow-black/30">
        <span className="text-[#0a2a20] font-black text-xl leading-none">S</span>
      </div>
      <div className="leading-none">
        <p className={`font-extrabold tracking-tight ${compact ? 'text-lg' : 'text-xl'} text-white`}>
          STOCKA<span className="text-[#e2c063]">.</span>
        </p>
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#9fb3a8] mt-1.5">
          Inventario · POS
        </p>
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) {
      setError('No pudimos iniciar sesión. Verificá tu correo y contraseña.');
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 bg-[#f7f5f0]">
      {/* Panel de marca */}
      <div className="relative overflow-hidden bg-[#0a2a20] text-white px-8 py-10 lg:px-14 lg:py-14 flex flex-col justify-between">
        {/* Fondo decorativo */}
        <div
          className="absolute inset-0 opacity-[0.5] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#e2c063]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#1c5a44]/40 blur-3xl pointer-events-none" />

        <div className="relative">
          <Brand />
        </div>

        <div className="relative mt-12 lg:mt-0 max-w-md">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e2c063]">
            <span className="w-8 h-px bg-[#e2c063]/60" />
            Plataforma de gestión
          </span>
          <h1 className="mt-5 text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.15]">
            Tu comercio,
            <br />
            <span className="text-[#e2c063]">bajo control.</span>
          </h1>
          <p className="mt-4 text-[15px] text-[#b9c9bf] leading-relaxed">
            Todo lo que necesitás para vender, cobrar y administrar tu negocio desde un solo lugar.
          </p>

          <ul className="mt-9 space-y-4">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-[#e2c063]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{f.title}</p>
                  <p className="text-xs text-[#9fb3a8] mt-0.5">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-12 lg:mt-0 flex items-center gap-2 text-xs text-[#7f978b]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#e2c063]" />
          Acceso seguro con cifrado de extremo a extremo
        </div>
      </div>

      {/* Panel de acceso */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[26rem]">
          <div className="lg:hidden mb-10">
            <div className="bg-[#0a2a20] rounded-2xl px-5 py-4">
              <Brand compact />
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b32] mb-3">
              Bienvenido
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#12211b]">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm text-[#57655d]">
              Ingresá tus credenciales para acceder al panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#12211b] mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8a998f]" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@comercio.com"
                  className="w-full bg-white border border-[#e2ddd0] rounded-xl pl-11 pr-4 py-3.5 text-[15px] text-[#12211b] placeholder-[#a7b2aa] transition-all focus:outline-none focus:border-[#0f3b2e] focus:ring-4 focus:ring-[#0f3b2e]/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#12211b] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8a998f]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#e2ddd0] rounded-xl pl-11 pr-12 py-3.5 text-[15px] text-[#12211b] placeholder-[#a7b2aa] transition-all focus:outline-none focus:border-[#0f3b2e] focus:ring-4 focus:ring-[#0f3b2e]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8a998f] hover:text-[#0f3b2e] hover:bg-[#0f3b2e]/5 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-[#0f3b2e] hover:bg-[#0a2a20] text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-[#0f3b2e]/20 focus:outline-none focus:ring-4 focus:ring-[#0f3b2e]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar al sistema
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-[#e4dfd2]">
            <p className="text-xs text-[#7b8a81] leading-relaxed">
              Acceso restringido a personal autorizado. Si no tenés una cuenta, contactá al
              administrador de tu comercio.
            </p>
          </div>

          <p className="mt-8 text-center text-[11px] text-[#9aa69e]">
            © {new Date().getFullYear()} STOCKA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
