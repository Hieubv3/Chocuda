import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * MOBILE APP HOME — khối trang chủ kiểu "app" cho mobile (<768px).
 * Giai đoạn 1 của lộ trình "giao diện app" cho chocudan24h.com:
 *  - Hero + tìm kiếm + lưới icon chức năng (phong cách Chợ Cư Dân App)
 *  - Mọi mục điều hướng tới các trang HIỆN CÓ của web (không bỏ tính năng nào)
 * Desktop không bị ảnh hưởng (ẩn qua .mapp-only).
 */
export const MobileAppHome: React.FC = () => {
  const navigate = useNavigate();

  const cells: { icon: string; label: string; tag?: string; to: string }[] = [
    { icon: '👥', label: 'Cộng đồng', to: '/cong-dong' },
    { icon: '🏠', label: 'Mua bán', to: '/mua-ban' },
    { icon: '🔑', label: 'Cho thuê', to: '/cho-thue' },
    { icon: '🏢', label: 'Dự án', to: '/du-an' },
    { icon: '🛠', label: 'Dịch vụ cư dân', to: '/dich-vu-cu-dan' },
    { icon: '🛒', label: 'Chợ cư dân', to: '/cho-cu-dan' },
    { icon: '💼', label: 'Tuyển dụng', to: '/tuyen-dung' },
    { icon: '📰', label: 'Tin tức', to: '/tin-tuc' },
    { icon: '🧮', label: 'Tính lãi vay', to: '/tinh-lai-vay' },
    { icon: '💰', label: 'Ví & Nạp tiền', tag: 'NẠP', to: '/tai-khoan' },
    { icon: '🗺', label: 'Về chúng tôi', to: '/ve-chung-toi' },
    { icon: '📌', label: 'Sơ đồ web', to: '/sitemap' },
  ];

  return (
    <div className="mapp-only">
      <div className="mapp-wrap">
        <div className="mapp-hero">
          <span className="mapp-eyebrow">Cộng đồng cư dân Vinhomes</span>
          <h2>Kết nối cư dân.<br />Giá trị lan tỏa.</h2>
          <p>Mua bán · Cho thuê · Dịch vụ cư dân · Chợ cư dân · Tuyển dụng — tất cả trong một ứng dụng.</p>
          <button className="mapp-hero-btn" onClick={() => navigate('/cong-dong')}>
            Khám phá cộng đồng →
          </button>
        </div>

        <div className="mapp-search">
          <span>⌕</span>
          <input
            placeholder="Bạn đang tìm gì? Căn hộ, dịch vụ, tin tức..."
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/mua-ban'); }}
          />
          <button aria-label="Tìm kiếm" onClick={() => navigate('/mua-ban')}>⌕</button>
        </div>

        <div className="mapp-quick">
          <button className="mapp-qchip green" onClick={() => navigate('/dang-tin')}>＋ Đăng tin</button>
          <button className="mapp-qchip gold" onClick={() => navigate('/tai-khoan')}>💰 Nạp tiền</button>
          <button className="mapp-qchip" onClick={() => navigate('/tai-khoan')}>💬 Chat nội bộ</button>
          <button className="mapp-qchip" onClick={() => navigate('/tinh-lai-vay')}>🧮 Lãi vay</button>
          <button className="mapp-qchip" onClick={() => navigate('/tuyen-dung')}>💼 Việc làm</button>
        </div>

        <div className="mapp-section-head">
          <div>
            <span className="mapp-eyebrow2">Tất cả chức năng</span>
            <div className="mapp-title2">Danh mục chính</div>
          </div>
          <button style={{ fontSize: 12, fontWeight: 800, color: '#0f6a41', background: 'none', border: 0, cursor: 'pointer' }} onClick={() => navigate('/sitemap')}>
            Xem tất cả →
          </button>
        </div>

        <div className="mapp-grid">
          {cells.map((c) => (
            <button key={c.label} className="mapp-cell" onClick={() => navigate(c.to)}>
              <span className="mapp-cell-ic">{c.icon}</span>
              <span>{c.label}</span>
              {c.tag ? <em>{c.tag}</em> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
