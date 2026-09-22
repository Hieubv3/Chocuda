import React from 'react';
import { Save, PhoneCall, Mail, MapPin, Building2, MessageCircle, Clock, Facebook, Youtube, User } from 'lucide-react';
import { SiteSettings, useSiteSettings, saveSiteSettings, DEFAULT_SITE_SETTINGS, toDialable } from '../lib/siteSettings';

/**
 * Cấu hình website: hotline, Zalo, email, địa chỉ, thông tin chân trang.
 * Quản trị viên sửa ở đây, toàn bộ web (thanh trên, chân trang, nút liên hệ) cập nhật theo.
 */
export const AdminSiteSettingsPanel: React.FC = () => {
  const saved = useSiteSettings();
  const [form, setForm] = React.useState<SiteSettings>(saved);
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => { setForm(saved); }, [saved]);

  const setField = (key: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setDone(false);
    const payload: SiteSettings = {
      ...form,
      hotlineRaw: toDialable(form.hotline),
      zalo: toDialable(form.zalo || form.hotline),
    };
    await saveSiteSettings(payload);
    setForm(payload);
    setSaving(false);
    setDone(true);
    window.setTimeout(() => setDone(false), 2500);
  };

  const handleReset = () => setForm({ ...DEFAULT_SITE_SETTINGS });

  const field = (
    label: string,
    key: keyof SiteSettings,
    placeholder: string,
    Icon: React.ComponentType<{ className?: string }>,
    hint?: string
  ) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
        <Icon className="w-3.5 h-3.5 text-emerald-500" />
        {label}
      </label>
      <input
        value={form[key]}
        onChange={(e) => setField(key, e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
      />
      {hint && <p className="text-[10.5px] text-slate-400">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Cấu hình website</span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              Hotline &amp; thông tin chân trang
            </h2>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1">
              Sửa ở đây là toàn bộ web đổi theo: thanh trên cùng, chân trang, nút gọi và Zalo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              Khôi phục mặc định
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>

        {done && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-2 text-[12px] font-bold text-emerald-700 dark:text-emerald-300">
            Đã lưu. Toàn bộ web đã cập nhật theo cấu hình mới.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {field('Hotline hiển thị', 'hotline', '0868.499.929', PhoneCall, 'Số hiển thị trên web, ví dụ 0868.499.929')}
          {field('Số Zalo', 'zalo', '0868499929', MessageCircle, 'Chỉ nhập số, không dấu chấm')}
          {field('Email liên hệ', 'email', 'hotro.chocudan24h@gmail.com', Mail)}
          {field('Địa chỉ văn phòng', 'address', 'Phân khu Chà Là, Vinhomes Ocean Park 2', MapPin)}
          {field('Tên đơn vị', 'company', 'Chợ Cư Dân 24H Vinhomes', Building2)}
          {field('Mã số thuế / ĐKKD', 'taxId', '0109882341', User)}
          {field('Giờ làm việc', 'workingHours', 'Trực tuyến 24/7', Clock)}
          {field('Dòng giới thiệu chân trang', 'footerNote', 'Nền tảng kết nối cư dân Vinhomes', User)}
          {field('Facebook', 'facebook', 'https://facebook.com/...', Facebook)}
          {field('YouTube', 'youtube', 'https://youtube.com/@...', Youtube)}
          {field('TikTok', 'tiktok', 'https://tiktok.com/@...', User)}
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-[11.5px] text-slate-600 dark:text-slate-300">
          Xem trước: <b>{form.hotline}</b> · Zalo <b>{form.zalo}</b> · {form.email} · {form.address}
        </div>
      </div>
    </div>
  );
};

export default AdminSiteSettingsPanel;
