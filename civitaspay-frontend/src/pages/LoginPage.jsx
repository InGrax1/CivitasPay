import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const login    = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-cyan-400">

      {/* Texto gigante de fondo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <span className="text-white/20 font-black leading-none text-[20vw]">
          Civitas
        </span>
        <span className="text-white/20 font-black leading-none text-[20vw]">
          Pay
        </span>
      </div>

      {/* Card central con glassmorphism */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 rounded-3xl p-8 md:p-10"
        style={{
          background: 'rgba(30, 60, 120, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        {/* Título */}
        <h2 className="text-white text-2xl md:text-3xl font-bold text-center mb-6">
          Inicia Sesión
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email */}
          <div className="flex items-center bg-white/90 rounded-xl overflow-hidden">
            <div className="px-3 py-3 text-gray-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Ej: correo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 py-3 pr-4 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-white/90 rounded-xl overflow-hidden">
            <div className="px-3 py-3 text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 py-3 pr-4 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-300 text-xs text-center bg-red-500/20 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          {/* Botón continuar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 bg-civitas-blue text-white rounded-xl text-sm font-semibold hover:bg-civitas-blue-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Continuar'}
          </button>
        </form>

        {/* Divisor */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/50 text-xs">O inicia sesión con</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Botones sociales — decorativos por ahora */}
        <div className="flex justify-center gap-4">
          {/* Google */}
          <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>

          {/* Apple */}
          <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </button>

          {/* Facebook */}
          <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

        {/* Link recuperar contraseña */}
        <p className="text-center mt-5 text-xs text-white/50">
          ¿Tienes problemas para acceder?{' '}
          <button className="text-white/80 underline hover:text-white transition-colors">
            Reiniciar Contraseña
          </button>
        </p>

        {/* Texto de privacidad */}
        <p className="text-center mt-4 text-xs text-white/30 leading-relaxed">
          Al iniciar sesión, aceptas nuestros Términos de Servicio y Política de Privacidad.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;