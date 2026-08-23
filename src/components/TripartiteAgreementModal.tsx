import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Users, Handshake, Scale, X, AlertTriangle, Building, Check, ArrowRight, Lock, FileSpreadsheet } from 'lucide-react';

interface TripartiteAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  userRole?: 'resident' | 'partner' | 'guest';
}

export const TripartiteAgreementModal: React.FC<TripartiteAgreementModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  userRole = 'resident'
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'full' | 'faq'>('summary');
  const [hasAgreed, setHasAgreed] = useState(false);

  if (!isOpen) return null;

  const handleConfirmAccept = () => {
    setHasAgreed(true);
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 sm:p-6 relative border-b border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 p-2 rounded-full transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" /> Thỏa thuận Pháp lý Ba Bên
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-semibold">
              chocudan24h.com
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            VĂN BẢN THỎA THUẬN QUY CHẾ HOẠT ĐỘNG & ĐIỀU KHOẢN NỀN TẢNG BA BÊN
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mô hình kết nối minh bạch giữa <strong className="text-amber-400">Cư dân/Khách hàng (Bên A)</strong> — <strong className="text-amber-400">Đối tác/Nhà cung cấp (Bên B)</strong> — <strong className="text-amber-400">Nền tảng chocudan24h.com (Bên C)</strong>.
          </p>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Handshake className="w-3.5 h-3.5" /> Nguyên Tắc Cốt Lõi (Tóm tắt)
            </button>
            <button
              onClick={() => setActiveTab('full')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'full'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Văn Bản Toàn Văn
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Q&A Giải Quyết Tranh Chấp
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          
          {activeTab === 'summary' && (
            <div className="space-y-6">
              
              {/* Highlight Core Rule Banner */}
              <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 flex items-start space-x-4">
                <div className="p-3 bg-amber-500 rounded-xl text-slate-950 flex-shrink-0 mt-0.5">
                  <Handshake className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-amber-700 dark:text-amber-400 text-base uppercase tracking-wide">
                    NGUYÊN TẮC VÀNG: TỰ DO THỎA THUẬN - KHÔNG CAN THIỆP GIAO DỊCH
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Nền tảng <strong>chocudan24h.com</strong> đóng vai trò thuần túy là <strong>Đơn vị Cung cấp Hạ tầng Công nghệ & Khởi tạo Kết nối</strong> dựa trên nhu cầu tự nguyện của hai bên. Nền tảng <strong>KHÔNG CAN THIỆP</strong> vào thương lượng giá cả, điều khoản thanh toán, hợp đồng dịch vụ hay giao dịch tài chính trực tiếp giữa Cư dân và Đối tác.
                  </p>
                </div>
              </div>

              {/* 3 Parties Role Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Party A */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-wider mb-2">
                      <Users className="w-4 h-4" /> BÊN A: CƯ DÂN / KHÁCH HÀNG
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Tự do lựa chọn Đối tác / Đơn vị cung cấp dịch vụ phù hợp.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Trực tiếp thương lượng giá cả, tiến độ, nghiệm thu với Bên B.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Gửi đánh giá Rating, phản ánh sự cố trực tiếp lên hệ thống.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500">
                    Quyền hạn: Tự quyết & Khảo giá tự do
                  </div>
                </div>

                {/* Party B */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider mb-2">
                      <Building className="w-4 h-4" /> BÊN B: ĐỐI TÁC / NHÀ CUNG CẤP
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Tự niêm yết báo giá, phạm vi công việc & dịch vụ.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Chịu trách nhiệm 100% chất lượng, bảo hành & cam kết với Bên A.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Xác thực danh tính KYC để nhận Tích Xanh Uy Tín.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500">
                    Trách nhiệm: Đảm bảo chất lượng dịch vụ
                  </div>
                </div>

                {/* Party C */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-4 h-4" /> BÊN C: NỀN TẢNG KẾT NỐI
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Cung cấp công cụ đăng tin, khớp nối nhu cầu, phòng chat, lịch sử.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Xử lý báo cáo gian lận, hạ uy tín / khóa tài khoản vi phạm.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Trích xuất nhật ký dữ liệu làm bằng chứng khi có yêu cầu.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500">
                    Vai trò: Hạ tầng trung gian & Trọng tài
                  </div>
                </div>

              </div>

              {/* Data Logging & Export Statement */}
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      Nhật ký Giao dịch & Kết nối được lưu trữ bảo mật
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mọi tương tác đăng ký, yêu cầu báo giá và lịch sử kết nối được sao lưu trực tiếp vào cơ sở dữ liệu & Google Sheet phục vụ công tác đối soát minh bạch.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'full' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 leading-relaxed max-h-[400px] overflow-y-auto">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase font-sans">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br />
                Độc lập - Tự do - Hạnh phúc
              </h3>
              <p className="text-center font-bold text-slate-800 dark:text-slate-200 py-2 font-sans">
                QUY CHẾ HOẠT ĐỘNG & THỎA THUẬN SỬ DỤNG DỊCH VỤ NỀN TẢNG BẤT ĐỘNG SẢN & DỊCH VỤ CƯ DÂN
              </p>

              <div className="space-y-3 font-sans">
                <div>
                  <strong className="text-slate-900 dark:text-white">CĂN CỨ PHÁP LÝ:</strong>
                  <p>- Bộ Luật Dân sự năm 2015;</p>
                  <p>- Luật Giao dịch Điện tử năm 2023;</p>
                  <p>- Luật Thương mại năm 2005 & Các Nghị định hướng dẫn về Thương mại Điện tử.</p>
                </div>

                <div>
                  <strong className="text-slate-900 dark:text-white">ĐIỀU 1: ĐỊNH NGHĨA CÁC BÊN THAM GIA</strong>
                  <p>1.1. <strong>Bên A (Khách hàng/Cư dân):</strong> Là cá nhân hoặc tổ chức sử dụng tài khoản trên chocudan24h.com để tìm kiếm thông tin bất động sản, đặt mua, thuê hoặc đăng ký các dịch vụ cư dân.</p>
                  <p>1.2. <strong>Bên B (Đối tác/Nhà cung cấp/Môi giới):</strong> Là cá nhân hoặc doanh nghiệp đăng ký tài khoản kinh doanh, niêm yết sản phẩm, dịch vụ sửa chữa, dọn dẹp, vận chuyển, pháp lý trên nền tảng.</p>
                  <p>1.3. <strong>Bên C (Nền tảng chocudan24h.com):</strong> Là đơn vị quản trị và vận hành hệ thống công nghệ thông tin cung cấp môi trường số hóa để Bên A và Bên B tìm kiếm và kết nối.</p>
                </div>

                <div>
                  <strong className="text-slate-900 dark:text-white">ĐIỀU 2: NGUYÊN TẮC GIAO DỊCH VÀ PHẠM VI TỰ DO THỎA THUẬN</strong>
                  <p>2.1. Nền tảng Bên C hoạt động theo cơ chế sàn giao dịch thương mại điện tử kết nối. Bên C <strong>KHÔNG</strong> tham gia vào việc quyết định giá cả, định giá dịch vụ, thương lượng hợp đồng hay thu phí hoa hồng giao dịch trực tiếp giữa Bên A và Bên B trừ khi có văn bản ủy quyền riêng.</p>
                  <p>2.2. Bên A và Bên B hoàn toàn tự do thỏa thuận về mức giá, tiến độ thanh toán, thời gian thi công, phương thức giao nhận và chế độ bảo hành sản phẩm/dịch vụ.</p>
                  <p>2.3. Mọi hợp đồng mua bán, thuê bất động sản hoặc hợp đồng thuê dịch vụ phát sinh từ việc kết nối trên chocudan24h.com là quan hệ pháp lý song phương trực tiếp giữa Bên A và Bên B.</p>
                </div>

                <div>
                  <strong className="text-slate-900 dark:text-white">ĐIỀU 3: MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ CỦA NỀN TẢNG (BÊN C)</strong>
                  <p>3.1. Bên C không chịu trách nhiệm về bất kỳ tổn thất, thiệt hại tài chính, đền bù hợp đồng hay tai nạn phát sinh trong quá trình Bên B thực hiện dịch vụ cho Bên A.</p>
                  <p>3.2. Bên C không bảo đảm 100% tính chính xác tuyệt đối của mọi tin đăng do Bên B tự nhập, tuy nhiên Bên C cam kết áp dụng các biện pháp xác thực KYC, kiểm duyệt và xếp hạng uy tín công khai để hỗ trợ Bên A đánh giá rủi ro.</p>
                </div>

                <div>
                  <strong className="text-slate-900 dark:text-white">ĐIỀU 4: VAI TRÒ GIÁM SÁT VÀ XỬ LÝ SỰ CỐ CỦA BÊN C</strong>
                  <p>4.1. Tiếp nhận phản ánh, khiếu nại từ Bên A hoặc Bên B thông qua Trung Tâm Xử Lý Sự Cố Khách Hàng.</p>
                  <p>4.2. Khóa vĩnh viễn tài khoản Bên B nếu phát hiện hành vi gian lận, lừa đảo, báo giá sai sự thật, bỏ dở công trình hoặc vi phạm pháp luật.</p>
                  <p>4.3. Cung cấp dữ liệu lịch sử kết nối, nhật ký tin nhắn và thông tin đăng ký cho cơ quan quản lý nhà nước có thẩm quyền khi được yêu cầu theo quy định pháp luật.</p>
                </div>

                <div>
                  <strong className="text-slate-900 dark:text-white">ĐIỀU 5: HIỆU LỰC RÀNG BUỘC KHI ĐĂNG KÝ / ĐẶT DỊCH VỤ</strong>
                  <p>Việc người dùng tích chọn <em>"Tôi đồng ý với Điều khoản Thỏa thuận Ba bên"</em> khi đăng ký tài khoản hoặc gửi yêu cầu đặt dịch vụ có giá trị pháp lý khởi tạo cam kết điện tử ràng buộc nghĩa vụ của các bên kể từ thời điểm thao tác thành công.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle className="w-4 h-4" /> Nếu Bên B (Đối tác) làm hư hỏng đồ đạc hoặc không đúng cam kết thì xử lý ra sao?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Vì hợp đồng dịch vụ do 2 bên tự do thỏa thuận, Bên A có quyền yêu cầu Bên B đền bù trực tiếp theo thỏa thuận. Đồng thời, Bên A gửi báo cáo sự cố kèm hình ảnh/bằng chứng lên <strong>Trung Tâm Xử Lý Sự Cố chocudan24h.com</strong>. Ban quản trị sẽ thẩm tra, hạ Tích Xanh Uy Tín, trừ điểm tín nhiệm hoặc khóa vĩnh viễn tài khoản của Bên B trên toàn hệ thống.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle className="w-4 h-4" /> Nền tảng có thu phí hay can thiệp vào giá dịch vụ không?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Hoàn toàn <strong>KHÔNG</strong>. Nền tảng không can thiệp hay áp đặt giá cả. Cư dân và Đối tác tự do thương lượng, khảo giá và lựa chọn mức phí phù hợp nhất dựa trên cơ chế thị trường cạnh tranh tự do.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle className="w-4 h-4" /> Dữ liệu đăng ký và lịch sử kết nối có được xuất file báo cáo không?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Có. Mọi lịch sử kết nối, yêu cầu báo giá và phản ánh sự cố đều được tự động lưu vào hệ thống và đồng bộ trực tiếp lên <strong>Google Sheet của Ban quản trị</strong>. Admin có thể xuất dữ liệu báo cáo sang Excel/CSV bất kỳ lúc nào để làm việc với các cơ quan chức năng hoặc giải quyết tranh chấp.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Cam kết minh bạch theo Luật Giao dịch Điện tử Việt Nam</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition w-1/2 sm:w-auto"
            >
              Đóng & Xem Sau
            </button>
            <button
              onClick={handleConfirmAccept}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5 w-1/2 sm:w-auto"
            >
              <CheckCircle2 className="w-4 h-4" /> TÔI ĐÃ ĐỌC VÀ ĐỒNG Ý
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
