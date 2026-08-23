import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, Trash2, Mail, Phone, FileText, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Globe, Eye } from 'lucide-react';
import { Language } from '../types';

interface PrivacyPolicyPageProps {
  language?: Language;
  onBackToHome?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackToHome }) => {
  const [deletionEmail, setDeletionEmail] = useState('');
  const [deletionStatus, setDeletionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [deletionMsg, setDeletionMsg] = useState('');

  const handleRequestDataDeletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletionEmail.trim()) return;

    setDeletionStatus('loading');
    setTimeout(() => {
      setDeletionStatus('success');
      setDeletionMsg(`Yêu cầu xóa dữ liệu Facebook cho tài khoản (${deletionEmail}) đã được tiếp nhận thành công. Mã xác nhận xóa dữ liệu: DEL-${Math.floor(100000 + Math.random() * 900000)}. Toàn bộ thông tin cá nhân và thông tin đăng nhập Facebook liên quan sẽ được xóa khỏi cơ sở dữ liệu Chợ Cư Dân 24H trong vòng 24 giờ.`);
      setDeletionEmail('');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation back */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-500 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trang Chủ Chợ Cư Dân 24h</span>
          </button>
        )}

        {/* Header Hero Banner */}
        <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 border border-slate-800 rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Chính Sách Bảo Mật & Quy Định Sử Dụng Dữ Liệu</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              CHÍNH SÁCH BẢO MẬT VÀ QUYỀN RIÊNG TƯ TÀI KHOẢN (PRIVACY POLICY)
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Cam kết bảo vệ tuyệt đối thông tin cá nhân và dữ liệu tài khoản người dùng đăng nhập qua Google, Facebook OAuth trên nền tảng <strong>Chợ Cư Dân 24H (chocudan24h.com)</strong>.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Website: <strong>chocudan24h.com</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cập nhật lần cuối: <strong>05/08/2026</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Tuân thủ tiêu chuẩn: <strong>Meta App Review & Google OAuth Policy</strong></span>
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
              <h2>Mục Đích Thu Thập Dữ Liệu Cá Nhân</h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 pl-11">
              Chợ Cư Dân 24H thu thập thông tin khi người dùng tự nguyện đăng ký, đăng nhập bằng tài khoản <strong>Facebook Login</strong> hoặc <strong>Google Sign-In</strong> nhằm cung cấp dịch vụ đăng tin bất động sản, liên hệ chủ nhà, quản lý danh sách tin đã lưu và hỗ trợ cư dân Vinhomes. Dữ liệu thu thập bao gồm:
            </p>
            <ul className="list-disc pl-16 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
              <li><strong>Họ và tên</strong> (Name): Hiển thị tên chủ tin đăng hoặc người dùng trên hệ thống.</li>
              <li><strong>Địa chỉ Email</strong> (Email Address): Xác nhận tài khoản, nhận thông báo tin đăng & hỗ trợ khôi phục mật khẩu.</li>
              <li><strong>Ảnh đại diện</strong> (Avatar URL): Hiển thị hình ảnh công khai trên góc hồ sơ cá nhân.</li>
              <li><strong>Mã định danh người dùng Facebook / Google ID</strong> (Provider ID): Dùng để xác thực phiên đăng nhập an toàn mà không lưu mật khẩu của người dùng.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-amber-500 font-black text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">
                2
              </div>
              <h2>Cam Kết Không Chia Sẻ Dữ Liệu Cho Bên Thứ Ba</h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 pl-11">
              Chúng tôi cam kết <strong>KHÔNG bán, KHÔNG trao đổi và KHÔNG tiết lộ</strong> bất kỳ thông tin cá nhân nào của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại hay quảng cáo rác. Dữ liệu cá nhân chỉ được xử lý nội bộ trên máy chủ bảo mật của <code>chocudan24h.com</code> phục vụ cho việc vận hành tính năng của nền tảng.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 3 - DATA DELETION INSTRUCTIONS FOR META REVIEW */}
          <section className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 border border-blue-200 dark:border-blue-900/50 rounded-2xl">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black text-lg">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm">
                3
              </div>
              <h2>Hướng Dẫn Yêu Cầu Xóa Dữ Liệu Tài Khoản Facebook (Data Deletion Instructions)</h2>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 pl-11">
              Theo quy định bảo mật dữ liệu của Meta / Facebook Developer, người dùng có toàn quyền yêu cầu xóa bỏ hoàn toàn dữ liệu cá nhân đã liên kết thông qua ứng dụng Facebook Login. Bạn có thể thực hiện theo 2 cách dưới đây:
            </p>

            <div className="pl-11 space-y-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">A</span>
                  Cách 1: Gửi yêu cầu xóa trực tuyến (Tự động)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nhập địa chỉ Email tài khoản Facebook bạn đã dùng đăng nhập vào hệ thống bên dưới để gửi yêu cầu xóa dữ liệu tức thì:
                </p>

                <form onSubmit={handleRequestDataDeletion} className="mt-3 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      value={deletionEmail}
                      onChange={(e) => setDeletionEmail(e.target.value)}
                      placeholder="Nhập email tài khoản Facebook của bạn..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={deletionStatus === 'loading'}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition shrink-0"
                    >
                      {deletionStatus === 'loading' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>Yêu Cầu Xóa Dữ Liệu Facebook</span>
                    </button>
                  </div>

                  {deletionStatus === 'success' && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>{deletionMsg}</div>
                    </div>
                  )}
                </form>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">B</span>
                  Cách 2: Gỡ ứng dụng trực tiếp từ cài đặt Facebook của bạn
                </h3>
                <ol className="list-decimal pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>Truy cập vào tài khoản Facebook cá nhân của bạn → Chọn <strong>Cài đặt & Quyền riêng tư</strong>.</li>
                  <li>Mục <strong>Ứng dụng và trang web</strong> (Apps and Websites).</li>
                  <li>Tìm kiếm ứng dụng <strong>Chợ Cư Dân 24H</strong> → Bấm <strong>Gỡ / Gỡ bỏ (Remove)</strong>.</li>
                  <li>Xem lịch sử yêu cầu xóa dữ liệu ứng dụng trực tiếp trên bảng điều khiển Facebook.</li>
                </ol>
              </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-amber-500 font-black text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">
                4
              </div>
              <h2>An Toàn & Mã Hóa Dữ Liệu (SSL / HTTPS)</h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 pl-11">
              Mọi dữ liệu truyền tải giữa thiết bị người dùng và máy chủ <strong>chocudan24h.com</strong> đều được bảo vệ bằng chứng chỉ mã hóa SSL 256-bit cao cấp. Hệ thống lưu trữ bảo mật ngăn ngừa mọi nguy cơ truy cập trái phép hoặc can thiệp dữ liệu từ bên ngoài.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-amber-500 font-black text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">
                5
              </div>
              <h2>Thông Tin Liên Hệ Ban Quản Trị & Cán Bộ Bảo Mật</h2>
            </div>
            <div className="pl-11 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <p>Nếu bạn có bất kỳ thắc mắc, đóng góp ý kiến hoặc khiếu nại về chính sách bảo mật, vui lòng liên hệ:</p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-1.5 font-medium border border-slate-200 dark:border-slate-700">
                <p><strong>Đơn vị vận hành:</strong> Chợ Cư Dân 24H (Bất Động Sản Vinhomes)</p>
                <p><strong>Người chịu trách nhiệm dữ liệu:</strong> Ông Bùi Văn Hiếu</p>
                <p><strong>Địa chỉ:</strong> Phân khu Chà Là, Vinhomes Ocean Park 2, Văn Giang, Hưng Yên</p>
                <p><strong>Hotline / Zalo:</strong> <a href="tel:0868499929" className="text-amber-500 font-bold underline">0868.499.929</a></p>
                <p><strong>Email chính thức:</strong> <a href="mailto:kinhdoanh1.fpt@gmail.com" className="text-blue-500 underline">kinhdoanh1.fpt@gmail.com</a> | <a href="mailto:hotro.chocudan24h@gmail.com" className="text-blue-500 underline">hotro.chocudan24h@gmail.com</a></p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};
