import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, ArrowLeft, Globe, RefreshCw, AlertTriangle, Scale, Lock, UserCheck, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface TermsOfServicePageProps {
  language?: Language;
  onBackToHome?: () => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation back */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-500 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trang Chủ Chợ Cư Dân 24h</span>
          </button>
        )}

        {/* Header Hero Banner */}
        <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 border border-slate-800 rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-xs font-black uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Quy Định & Điều Khoản Sử Dụng Dịch Vụ</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              ĐIỀU KHOẢN DỊCH VỤ VÀ THỎA THUẬN NGƯỜI DÙNG (TERMS OF SERVICE)
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Chào mừng bạn đến với <strong>Chợ Cư Dân 24H (chocudan24h.com)</strong>. Khi truy cập, đăng ký tài khoản hoặc sử dụng dịch vụ trên nền tảng, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản dưới đây.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Website: <strong>chocudan24h.com</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Cập nhật lần cuối: <strong>06/08/2026</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Hiệu lực: <strong>Đã ban hành</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-amber-500 font-black text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">
                1
              </div>
              <h2>Quy Định Đăng Ký Tài Khoản & Bảo Mật</h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 pl-11">
              Để truy cập đầy đủ các tính năng nâng cao (đăng tin bất động sản, quản lý gian hàng cư dân, lưu bất động sản yêu thích), người dùng cần đăng ký tài khoản trên hệ thống:
            </p>
            <ul className="list-disc pl-16 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
              <li><strong>Chính sách 1 tài khoản duy nhất:</strong> Mỗi cá nhân/cư dân chỉ được đăng ký tối đa 1 tài khoản duy nhất gắn liền với 1 Email, 1 Số điện thoại và 1 Họ tên chính chủ.</li>
              <li><strong>Xác thực tài khoản (OTP):</strong> Hệ thống gửi mã OTP bảo mật qua Email hoặc Google/Facebook OAuth để xác minh danh tính chính chủ.</li>
              <li><strong>Trách nhiệm bảo mật:</strong> Người dùng có trách nhiệm tự bảo quản thông tin đăng nhập. Hệ thống không chịu trách nhiệm với bất kỳ tổn thất nào phát sinh do người dùng tự tiết lộ thông tin tài khoản cho bên thứ ba.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-amber-500 font-black text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">
                2
              </div>
              <h2>Quy Định Đăng Tin Bất Động Sản & Sản Phẩm</h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 pl-11">
              Người dùng sử dụng dịch vụ đăng tin đăng bán/cho thuê căn hộ, shophouse, đất nền hoặc dịch vụ cư dân phải tuân thủ nghiêm ngặt các quy chuẩn nội dung:
            </p>
            <ul className="list-disc pl-16 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
              <li><strong>Tính trung thực:</strong> Thông tin về diện tích, giá bán/cho thuê, mã căn, hình ảnh thực tế và giấy tờ pháp lý phải chính xác 100%. Nghiêm cấm đăng tin ảo, tin sai giá để câu view.</li>
              <li><strong>Nội dung cấm:</strong> Không đăng các thông tin vi phạm pháp luật Việt Nam, ngôn từ xúc phạm, đồi trụy, chia rẽ hoặc quảng cáo sản phẩm dịch vụ bị cấm lưu hành.</li>
              <li><strong>Duyệt tin & Kiểm duyệt AI:</strong> Mọi tin đăng đều trải qua hệ thống kiểm duyệt AI tự động kết hợp Ban quản trị. Tin vi phạm sẽ bị hạ hoặc khóa tài khoản mà không cần báo trước.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-amber-500 font-black text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">
                3
              </div>
              <h2>Thỏa Thuận Giao Dịch & Giới Hạn Trách Nhiệm</h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 pl-11">
              Chợ Cư Dân 24H đóng vai trò là sàn thương mại điện tử / kênh kết nối thông tin giữa Bên Bán/Bên Cho Thuê và Bên Mua/Bên Thuê:
            </p>
            <ul className="list-disc pl-16 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
              <li><strong>Thỏa thuận trực tiếp:</strong> Các bên tự thỏa thuận điều khoản đặt cọc, hợp đồng mua bán, thuê nhà. Chợ Cư Dân 24H không can thiệp trực tiếp vào giao dịch tài chính cá nhân giữa các bên trừ khi sử dụng dịch vụ môi giới chính thức.</li>
              <li><strong>Khuyến cáo an toàn:</strong> Khuyến khích kiểm tra kỹ giấy tờ pháp lý, hợp đồng mua bán và gặp trực tiếp chính chủ trước khi chuyển tiền đặt cọc.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-amber-500 font-black text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">
                4
              </div>
              <h2>Quyền Sở Hữu Trí Tuệ & Thương Hiệu</h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 pl-11">
              Toàn bộ giao diện, mã nguồn, hình ảnh thiết kế, logo thương hiệu <strong>Chợ Cư Dân 24H</strong> thuộc quyền sở hữu trí tuệ của chocudan24h.com. Nghiêm cấm mọi hành vi sao chép, thu thập dữ liệu tự động (scraping) hoặc sử dụng trái phép khi chưa có sự đồng ý bằng văn bản.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-amber-500 font-black text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">
                5
              </div>
              <h2>Thay Đổi Điều Khoản & Liên Hệ Hỗ Trợ</h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 pl-11">
              Ban quản trị Chợ Cư Dân 24H có quyền điều chỉnh, bổ sung các điều khoản này bất kỳ lúc nào để phù hợp với pháp luật và thực tế vận hành. Mọi thắc mắc vui lòng liên hệ:
            </p>
            <div className="mt-4 p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 text-xs sm:text-sm">
              <p><strong>Ban Quản Trị Chợ Cư Dân 24H</strong></p>
              <p>📍 Email tiếp nhận phản hồi: <a href="mailto:chocudan24h@gmail.com" className="text-amber-600 dark:text-amber-400 font-bold underline">chocudan24h@gmail.com</a></p>
              <p>📞 Hotline hỗ trợ 24/7: <span className="font-bold text-slate-900 dark:text-white">090 999 8888</span></p>
              <p>🌐 Website: <a href="https://chocudan24h.com" target="_blank" rel="noreferrer" className="text-amber-600 dark:text-amber-400 font-bold underline">https://chocudan24h.com</a></p>
            </div>
          </section>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 pt-4">
          <p>© 2026 Chợ Cư Dân 24H (chocudan24h.com). Tất cả các quyền được bảo lưu.</p>
        </div>

      </div>
    </div>
  );
};
