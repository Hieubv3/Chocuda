import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  const name = currentUser?.displayName || currentUser?.name || 'C';
  const initials = String(name).trim().charAt(0).toUpperCase() || 'C';
  const avatar = (currentUser as any)?.avatar;

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
    </div>
  );
};
