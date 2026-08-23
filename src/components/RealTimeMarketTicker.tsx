import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Coins, DollarSign, Award, Building2 } from 'lucide-react';

interface MarketItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isUp: boolean;
  unit: string;
}

export const RealTimeMarketTicker: React.FC = () => {
  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');

  // Initial Market Data (Stocks, Crypto, Gold, Vinhomes Index)
  const [marketData, setMarketData] = useState<MarketItem[]>([
    { symbol: 'VN-INDEX', name: 'VN-Index', value: '1,285.60', change: '+12.40 (+0.97%)', isUp: true, unit: 'điểm' },
    { symbol: 'VN30', name: 'VN30-Index', value: '1,328.15', change: '+15.20 (+1.16%)', isUp: true, unit: 'điểm' },
    { symbol: 'BTC/USD', name: 'Bitcoin', value: '$67,850.00', change: '+2.45%', isUp: true, unit: 'USD' },
    { symbol: 'ETH/USD', name: 'Ethereum', value: '$3,520.40', change: '-0.35%', isUp: false, unit: 'USD' },
    { symbol: 'SJC-GOLD', name: 'Vàng SJC (Bán)', value: '88.50', change: '+0.50 (+0.57%)', isUp: true, unit: 'Tr/lượng' },
    { symbol: 'DOJI-GOLD', name: 'Vàng DOJI (Bán)', value: '88.45', change: '+0.45 (+0.51%)', isUp: true, unit: 'Tr/lượng' },
    { symbol: 'OP2-PRICE', name: 'Giao dịch OCP2 TB', value: '115.5', change: '+1.2 Tr/m²', isUp: true, unit: 'Tr/m²' },
    { symbol: 'OP3-PRICE', name: 'Giao dịch OCP3 TB', value: '128.0', change: '+2.0 Tr/m²', isUp: true, unit: 'Tr/m²' }
  ]);

  // Realtime Clock & Small price fluctuation simulator for live feel
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateString(now.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }));
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Dynamic price updates every 4 seconds
    const marketInterval = setInterval(() => {
      setMarketData(prev =>
        prev.map(item => {
          if (Math.random() > 0.4) {
            const rawVal = parseFloat(item.value.replace(/[^0-9.]/g, ''));
            const delta = (Math.random() - 0.48) * (rawVal * 0.002);
            const newVal = Math.max(1, rawVal + delta);
            const isUp = delta >= 0;

            let formattedVal = item.value;
            if (item.symbol.includes('BTC') || item.symbol.includes('ETH')) {
              formattedVal = `$${newVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else if (item.symbol.includes('INDEX')) {
              formattedVal = newVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else {
              formattedVal = newVal.toFixed(2);
            }

            return {
              ...item,
              value: formattedVal,
              isUp: isUp,
              change: `${isUp ? '+' : ''}${(Math.abs(delta)).toFixed(2)} (${isUp ? '+' : '-'}${(Math.abs(delta / rawVal) * 100).toFixed(2)}%)`
            };
          }
          return item;
        })
      );
    }, 4000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(marketInterval);
    };
  }, []);

  return (
    <div className="bg-slate-950 text-slate-200 border-b border-slate-800 text-[11px] select-none overflow-hidden py-1.5 px-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* Realtime Clock & Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/40 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeString || '00:00:00'}</span>
            <span className="text-[10px] text-slate-400 font-normal border-l border-emerald-500/30 pl-1.5 hidden sm:inline">{dateString}</span>
          </span>

          <span className="text-slate-400 font-bold hidden lg:flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Tỷ Giá Realtime (Chứng Khoán • Coin • Vàng SJC • BĐS Vinhomes):</span>
          </span>
        </div>

        {/* Scrolling Ticker Line */}
        <div className="w-full overflow-x-auto no-scrollbar flex items-center space-x-4 py-0.5">
          {marketData.map((item) => (
            <div
              key={item.symbol}
              className="flex items-center space-x-1.5 shrink-0 bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg transition"
            >
              <span className="font-extrabold text-slate-300">{item.symbol}:</span>
              <span className="font-mono font-bold text-white">{item.value}</span>
              <span className="text-[10px] text-slate-400">{item.unit}</span>
              <span
                className={`flex items-center font-mono font-bold text-[10px] px-1 rounded ${
                  item.isUp ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                }`}
              >
                {item.isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {item.change}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
