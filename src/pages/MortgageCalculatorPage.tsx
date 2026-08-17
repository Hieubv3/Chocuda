import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Calculator, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { MortgageCalculator } from '../components/MortgageCalculator';

export const MortgageCalculatorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title="Công Cụ Tính Lãi Suất Vay Mua Nhà Vinhomes 2026"
        description="Bảng tính lãi suất vay mua nhà Vinhomes Ocean Park, tính tiền gốc và lãi trả hàng tháng theo dư nợ giảm dần hoặc niên kim cố định."
        url={window.location.href}
      />

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold truncate">
              Tính Lãi Suất Vay Ngân Hàng
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Công Cụ Dự Tính Lãi Suất Vay Ngân Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Hỗ trợ cư dân & nhà đầu tư tính toán chính xác số tiền gốc, tiền lãi và tổng chi phí phải trả hàng tháng khi mua căn hộ, shophouse, liền kề Vinhomes.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          <MortgageCalculator initialPrice={3500000000} />
        </div>
      </div>
    </div>
  );
};
