import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle2, ChevronRight, ChevronLeft, X, ShieldCheck, Clock, FileText, Store, Wrench, Briefcase } from 'lucide-react';
import { BusinessTier } from '../types';

/**
 * Đăng ký tài khoản doanh nghiệp (G1) — người dùng gửi hồ sơ, admin duyệt ở tab "Quản Lý Doanh Nghiệp".
 * Spec: docs/de-xuat-tai-khoan-doanh-nghiep.md
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  language?: string;
}

interface TierInfo {
  code: BusinessTier;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  usersMax: number;
  quotaListings: number;
  quotaJobs: number;
  popular?: boolean;
  features: string[];
}

const TYPE_OPTIONS: { code: string; label: string; desc: string; Icon: any }[] = [
  { code: 'real_estate', label: 'Doanh nghiệp BĐS', desc: 'Sàn, môi giới, phân phối dự án', Icon: Building2 },
  { code: 'resident_service', label: 'Dịch vụ cư dân', desc: 'Thợ, sửa chữa, tiện ích nội khu', Icon: Wrench },
  { code: 'fnb', label: 'F&B / Bán lẻ', desc: 'Quán ăn, tạp hoá, shophouse', Icon: Store },
  { code: 'other', label: 'Ngành khác', desc: 'Giáo dục, tài chính, dịch vụ khác', Icon: Briefcase },
];

const fmt = (v: number) => v === 0 ? '0đ' : v.toLocaleString('vi-VN') + 'đ';

export const BusinessRegistrationModal: React.FC<Props> = ({ isOpen, onClose, currentUser }) => {
  const [step, setStep] = useState(1);
  const [tiers, setTiers] = useState<TierInfo[]>([]);
  const [existing, setExisting] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    type: 'resident_service',
    name: '',
    brandName: '',
    taxCode: '',
    address: '',
    project: '',
    businessLicenseNo: '',
    licenseFileUrl: '',
    legalRepName: '',
    legalRepPhone: '',
    contactEmail: '',
    industryNote: '',
    tierCode: 'verified' as BusinessTier,
  });
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (!isOpen) { setStep(1); setMsg(''); setDone(false); return; }
    (async () => {
      try {
        const r = await fetch('/api/business-packages');
        if (r.ok) setTiers(await r.json());
      } catch { /* ignore */ }
      if (currentUser) {
        try {
          const r2 = await fetch('/api/business/mine');
          if (r2.ok) {
            const mine = await r2.json();
            if (mine && mine.id) {
              setExisting(mine);
              setForm(f => ({ ...f, ...mine, tierCode: mine.tierCode || 'verified' }));
              if (mine.status === 'pending' || mine.status === 'verified') setDone(true);
            }
          }
        } catch { /* ignore */ }
      }
    })();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const canNext1 = form.name.trim().length >= 3;
  const canNext2 = form.legalRepName.trim().length >= 2 && form.legalRepPhone.trim().length >= 8;
  const canSubmit = agree && form.name.trim().length >= 3;

  const submit = async () => {
    setLoading(true); setMsg('');
    try {
      const r = await fetch('/api/business/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok || !data?.account?.id) throw new Error(data?.error || ('HTTP ' + r.status));
      const r2 = await fetch('/api/business/' + data.account.id + '/submit', { method: 'POST' });
      if (!r2.ok) throw new Error('Không gửi được hồ sơ (HTTP ' + r2.status + ')');
      setExisting(data.account);
      setDone(true);
    } catch (e: any) {
      setMsg('Lỗi: ' + (e?.message || 'không xác định'));
    } finally { setLoading(false); }
  };

  const StepDot = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-center gap-1.5">
      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${step >= n ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-500'}`}>{n}</span>
      <span className={`text-[10px] font-bold ${step >= n ? 'text-ink-900 dark:text-white' : 'text-ink-400'}`}>{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-ink-900 rounded-3xl border border-ink-200 dark:border-ink-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-ink-900 dark:text-white truncate">Đăng ký tài khoản doanh nghiệp</h2>
              <p className="text-[10px] text-ink-500 dark:text-ink-400">Hồ sơ doanh nghiệp · pháp lý · gói dịch vụ</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm shrink-0"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Không đăng nhập */}
          {!currentUser && (
            <div className="card24 p-4 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-brand-600 mx-auto" />
              <p className="text-xs font-bold text-ink-900 dark:text-white">Vui lòng đăng nhập tài khoản trước</p>
              <p className="text-[11px] text-ink-500">Bạn cần đăng nhập để gửi hồ sơ doanh nghiệp và theo dõi trạng thái duyệt.</p>
            </div>
          )}

          {/* Đã gửi / đã xác thực */}
          {currentUser && done && existing && (
            <div className="space-y-3">
              <div className="card24 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {existing.status === 'verified'
                    ? <CheckCircle2 className="w-5 h-5 text-brand-600" />
                    : <Clock className="w-5 h-5 text-amber-500" />}
                  <span className="text-sm font-black text-ink-900 dark:text-white">
                    {existing.status === 'verified' ? 'Doanh nghiệp đã được xác thực' : 'Hồ sơ đang chờ duyệt'}
                  </span>
                </div>
                <div className="text-[11px] text-ink-600 dark:text-ink-300 space-y-0.5">
                  <div>Tên doanh nghiệp: <b>{existing.name}</b></div>
                  <div>Loại hình: <b>{TYPE_OPTIONS.find(t => t.code === existing.type)?.label || existing.type}</b></div>
                  <div>Gói đăng ký: <b>{tiers.find(t => t.code === existing.tierCode)?.name || existing.tierCode || '—'}</b></div>
                  {existing.taxCode && <div>MST: <b>{existing.taxCode}</b></div>}
                  {existing.adminNote && <div>Ghi chú từ admin: <b>{existing.adminNote}</b></div>}
                </div>
                <p className="text-[11px] text-ink-500">
                  {existing.status === 'verified'
                    ? 'Bạn có thể đăng tin/gian hàng theo quyền lợi của gói. Một số hạn mức (quota) sẽ bật ở giai đoạn tiếp theo.'
                    : 'Bộ phận vận hành sẽ kiểm tra hồ sơ và phản hồi trong 24–48 giờ làm việc.'}
                </p>
              </div>
              <button onClick={onClose} className="btn btn-primary btn-block">Đóng</button>
            </div>
          )}

          {/* Wizard */}
          {currentUser && !done && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <StepDot n={1} label="Doanh nghiệp" />
                <ChevronRight className="w-3 h-3 text-ink-300" />
                <StepDot n={2} label="Pháp lý" />
                <ChevronRight className="w-3 h-3 text-ink-300" />
                <StepDot n={3} label="Chọn gói" />
              </div>

              {step === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-black text-ink-900 dark:text-white">Loại hình doanh nghiệp *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                      {TYPE_OPTIONS.map(o => (
                        <button key={o.code} type="button" onClick={() => set('type', o.code)}
                          className={`card24 p-3 text-left flex items-start gap-2 ${form.type === o.code ? 'ring-2 ring-brand-500' : ''}`}>
                          <o.Icon className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                          <span className="min-w-0">
                            <span className="block text-xs font-black text-ink-900 dark:text-white">{o.label}</span>
                            <span className="block text-[10px] text-ink-500 dark:text-ink-400">{o.desc}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Tên doanh nghiệp *</label>
                      <input className="cd-input w-full mt-1" value={form.name} onChange={e => set('name', e.target.value)} placeholder="VD: Công ty TNHH BĐS Vinhomes Land" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Thương hiệu / tên gọi khác</label>
                      <input className="cd-input w-full mt-1" value={form.brandName} onChange={e => set('brandName', e.target.value)} placeholder="VD: Sen Vàng OCP2" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Mã số thuế</label>
                      <input className="cd-input w-full mt-1" value={form.taxCode} onChange={e => set('taxCode', e.target.value)} placeholder="VD: 0108998899" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Khu đô thị / dự án</label>
                      <input className="cd-input w-full mt-1" value={form.project} onChange={e => set('project', e.target.value)} placeholder="VD: Vinhomes Ocean Park 2" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Địa chỉ kinh doanh</label>
                      <input className="cd-input w-full mt-1" value={form.address} onChange={e => set('address', e.target.value)} placeholder="VD: Shophouse SH2-18, Phân khu San Hô, OCP2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] text-ink-400">Bước 1/3</span>
                    <button type="button" disabled={!canNext1} onClick={() => setStep(2)} className="btn btn-primary disabled:opacity-50">
                      Tiếp tục <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Số giấy phép kinh doanh</label>
                      <input className="cd-input w-full mt-1" value={form.businessLicenseNo} onChange={e => set('businessLicenseNo', e.target.value)} placeholder="VD: 0108998899" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Link file pháp lý (GPKD/CCCD)</label>
                      <input className="cd-input w-full mt-1" value={form.licenseFileUrl} onChange={e => set('licenseFileUrl', e.target.value)} placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Người đại diện *</label>
                      <input className="cd-input w-full mt-1" value={form.legalRepName} onChange={e => set('legalRepName', e.target.value)} placeholder="VD: Nguyễn Thị Lan" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">SĐT người đại diện *</label>
                      <input className="cd-input w-full mt-1" value={form.legalRepPhone} onChange={e => set('legalRepPhone', e.target.value)} placeholder="VD: 0988123456" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Email nhận thông báo</label>
                      <input className="cd-input w-full mt-1" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="ketoan@domain.com" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-ink-900 dark:text-white">Ghi chú ngành nghề</label>
                      <input className="cd-input w-full mt-1" value={form.industryNote} onChange={e => set('industryNote', e.target.value)} placeholder="VD: Kinh doanh nội thất & thi công" />
                    </div>
                  </div>

                  {(form.type === 'real_estate') && (
                    <div className="card24 p-3 text-[11px] text-ink-600 dark:text-ink-300 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Doanh nghiệp BĐS: khi đăng tin cần bổ sung chứng chỉ hành nghề môi giới của nhân sự đăng tin (theo Luật Kinh doanh BĐS 2023). Admin sẽ yêu cầu bổ sung khi thẩm định.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary"><ChevronLeft className="w-3.5 h-3.5" /> Quay lại</button>
                    <button type="button" disabled={!canNext2} onClick={() => setStep(3)} className="btn btn-primary disabled:opacity-50">
                      Tiếp tục <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tiers.map(t => (
                      <button key={t.code} type="button" onClick={() => set('tierCode', t.code)}
                        className={`card24 p-3 text-left space-y-1.5 ${form.tierCode === t.code ? 'ring-2 ring-brand-500' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-ink-900 dark:text-white">{t.name}</span>
                          {t.popular && <span className="badge badge-soft">Phổ biến</span>}
                        </div>
                        <div className="price24">{fmt(t.priceMonthly)}<small>/tháng</small></div>
                        <div className="spec24">{fmt(t.priceYearly)}/năm · {t.usersMax >= 999 ? 'không giới hạn' : t.usersMax} người dùng · {t.quotaListings} tin BĐS · {t.quotaJobs} tin tuyển dụng</div>
                        <ul className="text-[10px] text-ink-500 dark:text-ink-400 space-y-0.5">
                          {t.features.slice(0, 4).map((f, i) => <li key={i}>• {f}</li>)}
                        </ul>
                      </button>
                    ))}
                  </div>

                  <label className="flex items-start gap-2 text-[11px] text-ink-600 dark:text-ink-300">
                    <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5" />
                    <span>Tôi xác nhận thông tin doanh nghiệp là chính xác, đồng ý điều khoản dành cho doanh nghiệp và chính sách xử lý dữ liệu của Chợ Cư Dân 24h.</span>
                  </label>

                  {msg && <p className="text-[11px] font-bold text-rose-600">{msg}</p>}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button type="button" onClick={() => setStep(2)} className="btn btn-secondary"><ChevronLeft className="w-3.5 h-3.5" /> Quay lại</button>
                    <button type="button" disabled={!canSubmit || loading} onClick={submit} className="btn btn-primary disabled:opacity-50">
                      {loading ? 'Đang gửi...' : 'Gửi hồ sơ đăng ký'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
