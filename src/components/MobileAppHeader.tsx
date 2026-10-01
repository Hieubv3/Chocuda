import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ShieldCheck, UserRound, Home, Building2, BriefcaseBusiness } from 'lucide-react';

interface MobileAppHeaderProps {
  currentUser: any;
  onOpenAuth: () => void;
}

/**
 * MOBILE APP HEADER — thanh trên cùng kiểu "app" cho mobile (<768px),
 * hiển thị trên MỌI trang (trang chính + trang phụ). Desktop giữ Header cũ.
 * Không thay đổi chức năng: tìm kiếm, tài khoản đăng nhập, về trang chủ.
 */
export const MobileAppHeader: React.FC<MobileAppHeaderProps> = ({ currentUser, onOpenAuth }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = currentUser?.displayName || currentUser?.name || 'C';
  const initials = String(name).trim().charAt(0).toUpperCase() || 'C';
  const avatar = (currentUser as any)?.avatar;
  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="mapp-only mapp-header">
      <button className="mapp-logo" onClick={() => navigate('/')} aria-label="Trang chủ">
        <span className="mapp-logo-mark">C</span>
        <span className="mapp-logo-text">
          <strong>Chợ Cư Dân</strong>
          <span>24H · VINHOMES</span>
        </span>
      </button>

      <div className="mapp-header-search">
        <span style={{ color: '#12a150', fontSize: 13 }}>⌕</span>
        <input
          placeholder="Tìm căn hộ, dịch vụ..."
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/mua-ban'); }}
        />
      </div>

      <button
        className="mapp-header-avatar"
        onClick={() => (currentUser ? navigate('/tai-khoan') : onOpenAuth())}
        aria-label="Tài khoản"
      >
        {avatar ? <img src={avatar} alt="" /> : initials}
      </button>

      <button
        className="mapp-header-menu"
        onClick={() => setMenuOpen(value => !value)}
        aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {menuOpen && (
        <div className="mapp-header-drawer" role="menu">
          <button onClick={() => go('/')}><Home className="w-4 h-4" /> Trang chủ</button>
          <button onClick={() => go('/mua-ban')}><Building2 className="w-4 h-4" /> Bất động sản</button>
          <button onClick={() => go('/tuyen-dung')}><BriefcaseBusiness className="w-4 h-4" /> Việc làm</button>
          <button onClick={() => { setMenuOpen(false); currentUser ? navigate('/tai-khoan') : onOpenAuth(); }}><UserRound className="w-4 h-4" /> Tài khoản</button>
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <button className="mapp-header-admin-link" onClick={() => go('/admin')}>
              <ShieldCheck className="w-4 h-4" /> Bảng quản trị
            </button>
          )}
        </div>
      )}
    </div>
  );
};
