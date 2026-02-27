import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Lock, Diamond, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(password);
    if (!success) {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] font-display text-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary rounded-full blur-[80px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-500 rounded-full blur-[80px] opacity-40 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 border border-white/10">
            <Diamond className="text-primary" size={36} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">DecorationOS</h1>
          <p className="text-slate-400 mt-2 text-sm">Event Management & Financial Intelligence</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-lg pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="Enter Admin Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-lg bg-gradient-to-r from-primary to-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              <span>Sign In</span>
              <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </motion.div>
    </div>
  );
};
