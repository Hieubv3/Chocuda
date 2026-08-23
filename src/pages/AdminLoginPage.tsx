import React, { useState } from 'react';
import { User, Language } from '../types';
import { ShieldCheck, Lock, User as UserIcon, KeyRound, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import logoImg from '../assets/images/chocudan24h_custom_logo_1785384117746.jpg';

interface AdminLoginPageProps {
  language: Language;
  onLoginSuccess: (user: User) => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  language,
  onLoginSuccess,
  onBackToHome
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager'>('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (password.length < 4) {
        setError('Mật khẩu không đúng. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }

      const loggedInAdmin: User = {
        id: `user-admin-${Date.now()}`,
        name: role === 'admin' ? 'Chợ Cư Dân 24h (Admin Tổng)' : 'Quản Lý Cấp Cao',
        email: 'hotro.chocudan24h@gmail.com',
        phone: '0868.499.929',
        role: role,
        avatar: logoImg,
        provider: 'local',
        balance: 10000000
      };

      setIsLoading(false);
      onLoginSuccess(loggedInAdmin);
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      
      {/* Background Decorative Elements - Mệnh Mộc Emerald Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl">
        
        {/* Back button */}
        <button
          onClick={onBackToHome}
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 mb-4 sm:mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Trang Chủ
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl p-0.5 shadow-lg shadow-emerald-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              Cổng Quản Trị Hệ Thống
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Nhà đẹp Vinhomes — Cấu Hình & Quản Lý Hệ Thống
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4">
          
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                role === 'admin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 Admin Tổng
            </button>
            <button
              type="button"
              onClick={() => setRole('manager')}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                role === 'manager'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💼 Admin Cấp Quản Lý
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Tên đăng nhập / Email Admin</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="Nhập tài khoản quản trị..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Mật khẩu bảo mật</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Đang xác thực hệ thống...</span>
            ) : (
              <>
                Đăng Nhập Quản Trị Hệ Thống
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            Dành riêng cho Ban Quản Lý & Chuyên gia Nhà đẹp Vinhomes
          </p>
        </div>

      </div>
    </div>
  );
};
