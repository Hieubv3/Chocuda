import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Download, Calculator, CheckCircle2, 
  Building2, AlertTriangle, RefreshCw, Send, DollarSign, Settings, X, Search, Filter
} from 'lucide-react';

interface AdminTaxManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminTaxManagementModal: React.FC<AdminTaxManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'declaration' | 'config'>('ledger');
  const [loading, setLoading] = useState<boolean>(false);
  const [taxData, setTaxData] = useState<{
    config: any;
    totalTaxCollected: number;
    totalRevenueManaged: number;
    records: any[];
  }>({
    config: {
      autoWithholdEnabled: true,
      pitRateServices: 1.5,
      vatRateServices: 3.5,
      minAnnualRevenueThreshold: 100000000,
      taxAuthorityUnit: 'Chi Cục Thuế Huyện Văn Giang - Tỉnh Hưng Yên',
      taxCodePlatform: '0109888999-001'
    },
    totalTaxCollected: 197500,
    totalRevenueManaged: 3950000,
    records: []
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [quarterPeriod, setQuarterPeriod] = useState<string>('Q3/2026');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Tax Config form
  const [pitRateServices, setPitRateServices] = useState<number>(1.5);
  const [vatRateServices, setVatRateServices] = useState<number>(3.5);
  const [taxAuthorityUnit, setTaxAuthorityUnit] = useState<string>('Chi Cục Thuế Huyện Văn Giang - Tỉnh Hưng Yên');
  const [taxCodePlatform, setTaxCodePlatform] = useState<string>('0109888999-001');

  const fetchTaxLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tax-ledger');
      if (res.ok) {
        const data = await res.json();
        setTaxData(data);
        if (data.config) {
          setPitRateServices(data.config.pitRateServices || 1.5);
          setVatRateServices(data.config.vatRateServices || 3.5);
          setTaxAuthorityUnit(data.config.taxAuthorityUnit || '');
          setTaxCodePlatform(data.config.taxCodePlatform || '');
        }
      }
    } catch (err) {
      console.error("Error fetching tax ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTaxLedger();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Save Tax Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tax-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitRateServices,
          vatRateServices,
          taxAuthorityUnit,
          taxCodePlatform
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchTaxLedger();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi cập nhật cấu hình thuế' });
    }
  };

  // Submit Declaration to GDT
  const handleDeclareGDT = async () => {
    try {
      const res = await fetch('/api/admin/tax-declare-gdt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: quarterPeriod })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchTaxLedger();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi kết xuất báo cáo thuế Tổng Cục Thuế' });
    }
  };

  const filteredRecords = taxData.records.filter(r => 
    r.taxpayerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.taxpayerPhone?.includes(searchTerm) ||
    r.taxCodeCCCD?.includes(searchTerm) ||
    r.orderCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Quản Lý Khấu Trừ &amp; Khai Báo Thuế TMĐT Quốc Gia
                </h3>
                <span className="bg-indigo-500/30 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full border border-indigo-400/30 font-medium">
                  Nghị định 91/2022/NĐ-CP
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Chợ Cư Dân 24H &mdash; Khấu trừ tại nguồn 5% (1.5% TNCN + 3.5% GTGT) &amp; Kết xuất báo cáo gửi gdt.gov.vn
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-3 text-xs font-semibold flex items-center justify-between ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] text-slate-500 font-semibold block">Tổng Doanh Thu Phát Sinh Trên Sàn</span>
            <span className="text-lg font-black text-slate-900">
              {taxData.totalRevenueManaged.toLocaleString('vi-VN')} <span className="text-xs font-normal">đ</span>
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-sm">
            <span className="text-[11px] text-indigo-600 font-bold block">Tổng Thuế Giữ Hộ Đã Khấu Trừ (5%)</span>
            <span className="text-lg font-black text-indigo-700">
              {taxData.totalTaxCollected.toLocaleString('vi-VN')} <span className="text-xs font-normal">đ</span>
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm">
            <span className="text-[11px] text-emerald-700 font-bold block">Cơ Quan Thuế Quản Lý Trực Tiếp</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-1">
              {taxData.config.taxAuthorityUnit}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sổ Theo Dõi Khấu Trừ Thuế ({filteredRecords.length})
              </button>

              <button
                onClick={() => setActiveTab('declaration')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'declaration' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Khai Báo Cổng TMĐT (gdt.gov.vn)
              </button>

              <button
                onClick={() => setActiveTab('config')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'config' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cấu Hình Thuế Suất
              </button>
            </div>

            <button 
              onClick={fetchTaxLedger}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Cập nhật</span>
            </button>
          </div>

          {/* TAB 1: TAX LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên thợ, số điện thoại, MST/CCCD, mã đơn..."
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                        <th className="p-3">Họ Tên Thợ / Đối Tác</th>
                        <th className="p-3">Mã Số Thuế / CCCD</th>
                        <th className="p-3">Mã Đơn</th>
                        <th className="p-3">Doanh Thu Gốc</th>
                        <th className="p-3 text-indigo-700">Thuế TNCN (1.5%)</th>
                        <th className="p-3 text-indigo-700">Thuế GTGT (3.5%)</th>
                        <th className="p-3 font-extrabold text-indigo-900">Tổng Thuế Giữ Hộ</th>
                        <th className="p-3 text-emerald-700">Thợ Thực Nhận</th>
                        <th className="p-3">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 font-medium">
                          <td className="p-3 text-slate-900 font-bold">
                            {r.taxpayerName}
                            <span className="block text-[10px] text-slate-400 font-normal">{r.taxpayerPhone}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-700">{r.taxCodeCCCD}</td>
                          <td className="p-3 font-mono text-slate-600 font-bold">{r.orderCode}</td>
                          <td className="p-3 font-bold text-slate-900">{r.grossRevenue.toLocaleString('vi-VN')}đ</td>
                          <td className="p-3 text-indigo-600 font-semibold">{r.pitWithheld.toLocaleString('vi-VN')}đ</td>
                          <td className="p-3 text-indigo-600 font-semibold">{r.vatWithheld.toLocaleString('vi-VN')}đ</td>
                          <td className="p-3 font-black text-indigo-800">{r.totalTaxWithheld.toLocaleString('vi-VN')}đ</td>
                          <td className="p-3 font-bold text-emerald-700">{r.netPayout.toLocaleString('vi-VN')}đ</td>
                          <td className="p-3">
                            {r.status === 'declared_gdt' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Đã Khai Báo GDT
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Quỹ Thuế Giữ Hộ
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DECLARATION TO GENERAL DEPARTMENT OF TAXATION */}
          {activeTab === 'declaration' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  Nộp Báo Cáo Cung Cấp Thông Tin TMĐT Cho Cơ Quan Thuế (Nghị định 91/2022/NĐ-CP)
                </h4>
                <p className="text-slate-500 mt-1">
                  Cổng Thông Tin Thương Mại Điện Tử &mdash; Tổng Cục Thuế (https://commerce.gdt.gov.vn)
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kỳ Khai Báo Thuế:</label>
                  <select 
                    value={quarterPeriod} 
                    onChange={(e) => setQuarterPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Q3/2026">Kỳ Báo Cáo Quý 3 / 2026</option>
                    <option value="Q4/2026">Kỳ Báo Cáo Quý 4 / 2026</option>
                    <option value="Q1/2027">Kỳ Báo Cáo Quý 1 / 2027</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">Thông Tin Tổ Chức Khai Báo:</span>
                  <p>• Mã số thuế Sàn TMĐT: <strong>{taxData.config.taxCodePlatform}</strong></p>
                  <p>• Đơn vị nhận báo cáo: <strong>{taxData.config.taxAuthorityUnit}</strong></p>
                  <p>• Số lượng bản ghi phát sinh doanh thu: <strong>{taxData.records.length} hồ sơ thợ / cá nhân</strong></p>
                  <p>• Tổng thuế TNCN &amp; GTGT đã khấu trừ giữ hộ: <strong className="text-indigo-700">{taxData.totalTaxCollected.toLocaleString('vi-VN')}đ</strong></p>
                </div>

                <button
                  onClick={handleDeclareGDT}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>KẾT XUẤT HỒ SƠ &amp; TRUYỀN DỮ LIỆU TỚI CỔNG TỔNG CỤC THUẾ</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TAX RATES CONFIG */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Cấu Hình Thuế Suất Khấu Trừ Tại Nguồn (Thông tư 40/2021/TT-BTC)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thuế TNCN Dịch Vụ (%):</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={pitRateServices}
                    onChange={(e) => setPitRateServices(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thuế GTGT Dịch Vụ (%):</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={vatRateServices}
                    onChange={(e) => setVatRateServices(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chi Cục Thuế Quản Lý Trực Tiếp:</label>
                <input 
                  type="text"
                  value={taxAuthorityUnit}
                  onChange={(e) => setTaxAuthorityUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Số Thuế Doanh Nghiệp Của Sàn:</label>
                <input 
                  type="text"
                  value={taxCodePlatform}
                  onChange={(e) => setTaxCodePlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>LƯU CẤU HÌNH THUẾ SUẤT SÀN TMĐT</span>
              </button>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Tuân thủ Luật Quản lý Thuế &amp; Nghị định 91/2022/NĐ-CP Thương mại Điện tử</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
