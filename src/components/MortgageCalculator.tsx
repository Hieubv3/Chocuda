import React, { useState } from 'react';
import { Calculator, DollarSign, Calendar, Percent, Landmark, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../lib/i18n';

interface MortgageCalculatorProps {
  language: Language;
  initialPrice?: number;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ language, initialPrice = 8.5 }) => {
  const t = getTranslation(language);

  // States
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice); // in Billions
  const [loanRatio, setLoanRatio] = useState<number>(70); // % loan
  const [loanYears, setLoanYears] = useState<number>(25); // Years
  const [interestRate, setInterestRate] = useState<number>(7.5); // % per year

  // Calculations
  const loanAmountBillion = propertyPrice * (loanRatio / 100);
  const downPaymentBillion = propertyPrice - loanAmountBillion;

  const totalMonths = loanYears * 12;
  const monthlyPrincipal = (loanAmountBillion * 1000) / totalMonths; // in Millions VNĐ

  // First Month Interest (in Millions)
  const monthlyInterestRate = interestRate / 100 / 12;
  const firstMonthInterest = loanAmountBillion * 1000 * monthlyInterestRate;
  const firstMonthTotal = monthlyPrincipal + firstMonthInterest;

  // Approx total interest (declining balance)
  const totalInterestMillion = ((loanAmountBillion * 1000 * monthlyInterestRate * (totalMonths + 1)) / 2);

  return (
    <div className="bg-white dark:bg-ink-800 rounded-3xl p-6 sm:p-8 border border-ink-200 dark:border-ink-700 shadow-xl space-y-6">
      
      {/* Title */}
      <div className="flex items-center space-x-3 border-b border-ink-100 dark:border-ink-700 pb-4">
        <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-ink-950 font-extrabold shadow-md">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-ink-900 dark:text-white">
            CÔNG CỤ TÍNH VAY NGÂN HÀNG BĐS VINHOMES
          </h2>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            Dự toán chính xác số tiền cần chuẩn bị & số tiền trả góp hàng tháng khi mua nhà tại Vinhomes Ocean Park 2, 3 & Hạ Long Xanh.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Parameters Controls */}
        <div className="lg:col-span-6 space-y-5 text-xs font-bold text-ink-700 dark:text-ink-300">
          
          {/* Property Price Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label>Giá trị bất động sản (Tỷ VNĐ)</label>
              <span className="text-brand-600 dark:text-brand-400 text-sm font-black">{propertyPrice.toFixed(2)} Tỷ</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="0.1"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(parseFloat(e.target.value))}
              className="w-full h-2 bg-ink-200 dark:bg-ink-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-ink-400 mt-1">
              <span>1 Tỷ</span>
              <span>25 Tỷ</span>
              <span>50 Tỷ</span>
            </div>
          </div>

          {/* Loan Ratio Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label>Tỷ lệ vay vốn ngân hàng (%)</label>
              <span className="text-brand-600 dark:text-brand-400 text-sm font-black">{loanRatio}% ({loanAmountBillion.toFixed(2)} Tỷ)</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={loanRatio}
              onChange={(e) => setLoanRatio(parseInt(e.target.value))}
              className="w-full h-2 bg-ink-200 dark:bg-ink-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-ink-400 mt-1">
              <span>Vay 30%</span>
              <span>Vay 50%</span>
              <span>Vay 70%</span>
              <span>Vay 80%</span>
            </div>
          </div>

          {/* Loan Duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label>Thời hạn vay (Năm)</label>
              <span className="text-brand-600 dark:text-brand-400 text-sm font-black">{loanYears} Năm ({totalMonths} Tháng)</span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              step="1"
              value={loanYears}
              onChange={(e) => setLoanYears(parseInt(e.target.value))}
              className="w-full h-2 bg-ink-200 dark:bg-ink-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label>Lãi suất vay ưu đãi (%/năm)</label>
              <span className="text-brand-600 dark:text-brand-400 text-sm font-black">{interestRate}% / năm</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-xl text-ink-900 dark:text-white"
            />
          </div>

        </div>

        {/* Output Calculation Cards */}
        <div className="lg:col-span-6 bg-ink-950 text-white rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xl border border-ink-800">
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-brand-400 uppercase tracking-widest border-b border-ink-800 pb-2">
              KẾT QUẢ DỰ TOÁN BẢO AN BÀN GIAO
            </h3>

            {/* Down Payment Required */}
            <div className="p-3 bg-ink-900 rounded-xl border border-ink-800 flex justify-between items-center">
              <div>
                <span className="text-ink-400 text-xs block">Vốn tự có cần chuẩn bị ({(100 - loanRatio)}%)</span>
                <span className="text-xs text-brand-300 font-semibold">Để ký Hợp đồng mua bán</span>
              </div>
              <span className="text-xl font-black text-brand-400">
                {downPaymentBillion.toFixed(2)} Tỷ VNĐ
              </span>
            </div>

            {/* Total Loan Amount */}
            <div className="p-3 bg-ink-900 rounded-xl border border-ink-800 flex justify-between items-center">
              <div>
                <span className="text-ink-400 text-xs block">Số tiền ngân hàng giải ngân ({loanRatio}%)</span>
                <span className="text-xs text-ink-400">Ân hạn gốc/lãi theo chính sách CDT</span>
              </div>
              <span className="text-xl font-black text-brand-400">
                {loanAmountBillion.toFixed(2)} Tỷ VNĐ
              </span>
            </div>

            {/* Monthly First Payment */}
            <div className="p-4 bg-gradient-to-r from-brand-500/20 to-brand-600/10 rounded-2xl border border-brand-500/40 text-center">
              <span className="text-xs text-brand-300 font-bold block uppercase tracking-wide">
                TRẢ GÓP THÁNG ĐẦU TIÊN (GỐC + LÃI)
              </span>
              <span className="text-2xl sm:text-3xl font-black text-brand-400 my-1 block">
                ~ {firstMonthTotal.toFixed(1)} Triệu VNĐ / tháng
              </span>
              <p className="text-[11px] text-ink-300">
                Trong đó: Gốc ~ {monthlyPrincipal.toFixed(1)} tr/tháng • Lãi tháng đầu ~ {firstMonthInterest.toFixed(1)} tr/tháng
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-ink-800 text-[11px] text-ink-400 space-y-1">
            <p className="flex items-center text-brand-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-brand-400 shrink-0" />
              Lợi thế: Hỗ trợ gói vay ngân hàng Techcombank, MB, Vietcombank 0% lãi suất lên tới 24 tháng.
            </p>
            <p>Liên hệ Nhà đẹp Vinhomes qua Hotline/Zalo: <strong className="text-white">0868.499.929</strong> để nhận phương án dòng tiền chi tiết!</p>
          </div>

        </div>

      </div>

    </div>
  );
};
