import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getPropertyDetailUrl } from '../lib/slugs';

interface MobileAppHomeProps {
  properties?: any[];
  news?: any[];
  services?: any[];
}

/**
 * MOBILE APP HOME — khối trang chủ kiểu "app" cho mobile (<768px).
 *  - Hero + tìm kiếm + lưới icon chức năng (phong cách Chợ Cư Dân App)
 *  - Dải "Tin mua bán mới" + "Dịch vụ cư dân" + "Tin tức" lấy dữ liệu THẬT
 *  - Mọi mục điều hướng tới các trang HIỆN CÓ của web (không bỏ tính năng nào)
 * Desktop không bị ảnh hưởng (ẩn qua .mapp-only).
 */
export const MobileAppHome: React.FC<MobileAppHomeProps> = ({ properties = [], news = [], services = [] }) => {
  const navigate = useNavigate();
  const featured = (properties || []).slice(0, 6);
  const topServices = (services || []).slice(0, 6);
  const topNews = (news || []).slice(0, 3);

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
            <span className="mapp-eyebrow2">Bất động sản</span>
            <div className="mapp-title2">Tin mua bán mới</div>
          </div>
          <button style={{ fontSize: 12, fontWeight: 800, color: '#12a150', background: 'none', border: 0, cursor: 'pointer' }} onClick={() => navigate('/mua-ban')}>
            Xem tất cả →
          </button>
        </div>
        <div className="mapp-strip">
          {featured.length === 0 && (
            <div className="mapp-strip-card" onClick={() => navigate('/mua-ban')}>
              <div className="mapp-strip-img">🏙</div>
              <strong>Khám phá quỹ căn Vinhomes</strong>
              <em>Xem tin mua bán →</em>
            </div>
          )}
          {featured.map((p: any) => (
            <div key={p.id} className="mapp-strip-card" onClick={() => navigate(getPropertyDetailUrl(p))}>
              <div className="mapp-strip-img" style={p.images && p.images[0] ? { backgroundImage: `url(${p.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                {!(p.images && p.images[0]) ? '🏙' : ''}
              </div>
              <strong>{p.title || 'Tin bất động sản'}</strong>
              <b>{p.priceDisplay || (p.price ? p.price + ' Tỷ' : 'Liên hệ')}</b>
              <em>{p.area ? p.area + 'm²' : ''}{(p.bedrooms ? ' · ' + p.bedrooms + 'PN' : '')}</em>
            </div>
          ))}
        </div>

        <div className="mapp-section-head">
          <div>
            <span className="mapp-eyebrow2">Tiện ích</span>
            <div className="mapp-title2">Dịch vụ cư dân</div>
          </div>
          <button style={{ fontSize: 12, fontWeight: 800, color: '#12a150', background: 'none', border: 0, cursor: 'pointer' }} onClick={() => navigate('/dich-vu-cu-dan')}>
            Xem tất cả →
          </button>
        </div>
        <div className="mapp-strip">
          {topServices.length === 0 && (
            <div className="mapp-strip-card" onClick={() => navigate('/dich-vu-cu-dan')}>
              <div className="mapp-strip-img">🛠</div>
              <strong>Khám phá dịch vụ cư dân</strong>
              <em>Xem dịch vụ →</em>
            </div>
          )}
          {topServices.map((s: any, i: number) => (
            <div key={s.id || i} className="mapp-strip-card" onClick={() => navigate('/dich-vu-cu-dan')}>
              <div className="mapp-strip-img" style={s.images && s.images[0] ? { backgroundImage: `url(${s.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                {!(s.images && s.images[0]) ? '🛠' : ''}
              </div>
              <strong>{s.title || 'Dịch vụ cư dân'}</strong>
              <em>{s.providerName || ''}</em>
            </div>
          ))}
        </div>

        <div className="mapp-section-head">
          <div>
            <span className="mapp-eyebrow2">Cập nhật</span>
            <div className="mapp-title2">Tin tức mới</div>
          </div>
          <button style={{ fontSize: 12, fontWeight: 800, color: '#12a150', background: 'none', border: 0, cursor: 'pointer' }} onClick={() => navigate('/tin-tuc')}>
            Xem tất cả →
          </button>
        </div>
        {topNews.map((n: any, i: number) => (
          <button key={n.id || i} className="news" onClick={() => navigate('/tin-tuc')} style={{ width: '100%' }}>
            <div className="news-image" style={n.image ? { backgroundImage: `url(${n.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {!n.image ? '📰' : ''}
            </div>
            <div className="news-body">
              <div className="news-title">{n.title || 'Bài viết'}</div>
              <div className="news-meta">{n.date || ''}</div>
            </div>
          </button>
        ))}

        <div className="mapp-section-head">
          <div>
            <span className="mapp-eyebrow2">Tất cả chức năng</span>
            <div className="mapp-title2">Danh mục chính</div>
          </div>
          <button style={{ fontSize: 12, fontWeight: 800, color: '#12a150', background: 'none', border: 0, cursor: 'pointer' }} onClick={() => navigate('/sitemap')}>
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
