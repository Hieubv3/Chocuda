import React from 'react';
import { X, Scale, Bed, Bath, Compass, ShieldCheck, Phone, Trash2 } from 'lucide-react';
import { Property, Language } from '../types';
import { getTranslation } from '../lib/i18n';

interface CompareModalProps {
  properties: Property[];
  language: Language;
  onClose: () => void;
  onRemove: (id: string) => void;
  onSelectProperty: (property: Property) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  properties,
  language,
  onClose,
  onRemove,
  onSelectProperty
}) => {
  const t = getTranslation(language);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-slate-900 dark:text-white my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">SO SÁNH BẤT ĐỘNG SẢN ({properties.length}/3)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">So sánh thông số kỹ thuật, vị trí & mức giá giữa các căn hộ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Scale className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-500">Chưa có căn hộ nào được chọn để so sánh.</p>
            <p className="text-xs text-slate-400">Bấm biểu tượng chiếc cân trên các thẻ nhà đất để thêm vào danh sách so sánh.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold w-36 rounded-l-xl">Thông số</th>
                  {properties.map((prop) => (
                    <th key={prop.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 min-w-[220px] align-top">
                      <div className="relative group space-y-2">
                        <button
                          onClick={() => onRemove(prop.id)}
                          className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full opacity-80 hover:opacity-100 transition"
                          title="Xóa khỏi so sánh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-full h-28 object-cover rounded-xl"
                        />
                        <h4 className="font-bold line-clamp-2 text-slate-900 dark:text-white hover:text-amber-500 cursor-pointer" onClick={() => onSelectProperty(prop)}>
                          {prop.title}
                        </h4>
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400 block">
                          {prop.priceDisplay}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-bold text-slate-500">Dự án</td>
                  {properties.map(p => (
                    <td key={p.id} className="p-3 font-semibold text-amber-600 dark:text-amber-400">{p.project.toUpperCase()}</td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-500">Loại căn</td>
                  {properties.map(p => (
                    <td key={p.id} className="p-3 font-semibold">{p.category.toUpperCase()}</td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-500">Diện tích</td>
                  {properties.map(p => (
                    <td key={p.id} className="p-3 font-extrabold text-slate-900 dark:text-white">{p.area} m²</td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-500">Đơn giá / m²</td>
                  {properties.map(p => (
                    <td key={p.id} className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ~ {(p.price / (p.area || 1)).toFixed(2)} tỷ/m²
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-500">Phòng ngủ / WC</td>
                  {properties.map(p => (
                    <td key={p.id} className="p-3 font-semibold">{p.bedrooms} PN / {p.bathrooms} WC</td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-500">Hướng nhà</td>
                  {properties.map(p => (
                    <td key={p.id} className="p-3 font-semibold">{p.direction}</td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-500">Nội thất</td>
                  {properties.map(p => (
                    <td key={p.id} className="p-3 font-semibold">{t.furniture[p.furniture] || p.furniture}</td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-500">Pháp lý</td>
                  {properties.map(p => (
                    <td key={p.id} className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{t.legal[p.legal] || p.legal}</td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-500">Hành động</td>
                  {properties.map(p => (
                    <td key={p.id} className="p-3">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProperty(p);
                        }}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
                      >
                        Xem Chi Tiết
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
