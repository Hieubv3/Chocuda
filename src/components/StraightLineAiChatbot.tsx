import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Phone, HelpCircle, Building2, UserCheck, CheckCircle2, ChevronRight, Zap, RefreshCw, Layers } from 'lucide-react';
import { Property, Project, NewsArticle } from '../types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: string[];
}

interface StraightLineAiChatbotProps {
  properties: Property[];
  projects: Project[];
  news: NewsArticle[];
  onOpenConsultation?: () => void;
  onOpenUpTin?: () => void;
}

export const StraightLineAiChatbot: React.FC<StraightLineAiChatbotProps> = ({
  properties,
  projects,
  news,
  onOpenConsultation,
  onOpenUpTin
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<'buyer' | 'owner' | 'sale'>('buyer');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Welcome Messages for each role
  const getInitialMessages = (selectedRole: 'buyer' | 'owner' | 'sale'): Message[] => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (selectedRole === 'buyer') {
      return [
        {
          id: 'welcome-1',
          sender: 'bot',
          text: `Dạ em chào Anh/Chị! Em là Trợ lý AI BĐS Vinhomes của Chợ Cư Dân 24H (Hotline/Zalo: 0868.499.929).\n\nRất hân hạnh được đồng hành cùng Anh/Chị. Dựa trên dữ liệu thực tế tại website chocudan24h.com, em có thể hỗ trợ Anh/Chị:\n1. Tìm kiếm & lọc quỹ căn độc quyền giá tốt nhất (Ocean Park 1, 2, 3, Hạ Long Xanh...)\n2. Bảng tính dòng tiền vay vốn ngân hàng lãi suất ưu đãi 0%\n3. So sánh pháp lý & diện tích giữa các phân khu.\n\nĐể em phục vụ Anh/Chị chính xác nhất, Anh/Chị đang quan tâm mua/thuê ở phân khu nào và khoảng tài chính dự kiến là bao nhiêu tỷ ạ?`,
          timestamp: time,
          options: [
            '🔍 Lọc căn Vinhomes Ocean Park 2',
            '🌊 Tìm biệt thự Ocean Park 3',
            '📐 Tính vay ngân hàng lãi suất 0%',
            '📱 Hướng dẫn dùng website chi tiết'
          ]
        }
      ];
    } else if (selectedRole === 'owner') {
      return [
        {
          id: 'welcome-2',
          sender: 'bot',
          text: `Dạ em kính chào Anh/Chị Chủ Nhà! Em rất vui được hỗ trợ Anh/Chị thanh khoản căn hộ/biệt thự Vinhomes nhanh nhất.\n\nWebsite chocudan24h.com nhận đăng tin chính chủ MIỄN PHÍ 100% & đẩy tin VIP phủ sóng Zalo/Google.\n• Đội ngũ Chợ Cư Dân 24H hỗ trợ tư vấn, chụp ảnh căn thực tế.\n\nAnh/Chị cần hướng dẫn cách Đăng tin chính chủ hay muốn nâng cấp gói Tin VIP lên Top 1 Google ạ?`,
          timestamp: time,
          options: [
            '✍️ Hướng dẫn Đăng Tin Bán chính chủ',
            '🚀 Cách nâng cấp Up-Tin VIP',
            '📞 Nhờ Chuyên Viên định giá & hỗ trợ bán'
          ]
        }
      ];
    } else {
      return [
        {
          id: 'welcome-3',
          sender: 'bot',
          text: `Em chào Anh/Chị Sale BĐS đối tác! Rất vui được hợp tác cùng Anh/Chị trong mạng lưới phân phối BĐS Vinhomes.\n\nWebsite chocudan24h.com cung cấp các tính năng đỉnh cao cho Anh/Chị Sale:\n1. Đăng tin chào hàng miễn phí tới hàng ngàn khách hàng tiềm năng.\n2. Tích hợp AI Studio tự động viết bài SEO chuẩn Top Google.\n3. Đồng bộ Webhook n8n nhận tin tự động.\n\nAnh/Chị muốn tìm hiểu cách Đăng tin bán hàng hay muốn khai thác công cụ AI viết bài SEO BĐS ạ?`,
          timestamp: time,
          options: [
            '💼 Hướng dẫn Sale Đăng Căn chào hàng',
            '✨ Dùng AI Studio viết bài BĐS SEO',
            '🔗 Kết nối Webhook n8n Automation'
          ]
        }
      ];
    }
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages('buyer'));

  useEffect(() => {
    setMessages(getInitialMessages(role));
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Response Logic (Straight Line Selling + Grounded Data)
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // User Message
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: time
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      // Call Backend Chat API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, role })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          options: data.suggestedOptions
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Fallback logic');
      }
    } catch (e) {
      // Offline / Fallback Straight-Line Sales Reply Generator
      setTimeout(() => {
        let replyText = '';
        let options: string[] = [];

        const lowerQ = query.toLowerCase();

        if (lowerQ.includes('hướng dẫn') || lowerQ.includes('dùng website') || lowerQ.includes('sử dụng')) {
          if (role === 'buyer') {
            replyText = `Dạ, để tìm được căn ưng ý nhất trên website chocudan24h.com, Anh/Chị thực hiện 3 bước đơn giản:\n1. BƯỚC 1: Chọn tab "MUA BÁN" hoặc "CHO THUÊ" trên thanh menu chính.\n2. BƯỚC 2: Sử dụng bộ lọc thông minh (Lọc theo Dự án: Ocean Park 2/3, Mức giá, Số phòng ngủ, Hướng nhà, Nội thất).\n3. BƯỚC 3: Bấm nút "Bảng Tính Vay" để tính dòng tiền hoặc bấm "Liên Hệ Zalo" tới Hotline 0868.499.929 để xem nhà thực tế.\n\nAnh/Chị muốn em hỗ trợ tìm căn theo khoảng giá bao nhiêu Tỷ ạ?`;
            options = ['Lọc căn 3-5 Tỷ', 'Lọc căn 5-10 Tỷ', 'Lọc biệt thự > 10 Tỷ'];
          } else if (role === 'owner') {
            replyText = `Dạ kính gửi Anh/Chị Chủ Nhà, quy trình đăng tin & đẩy VIP trên website rất tiện lợi:\n1. BƯỚC 1: Bấm nút "ĐĂNG TIN" ở góc trên cùng bên phải màn hình.\n2. BƯỚC 2: Điền tiêu đề, chọn phân khu, mức giá mong muốn và tải ảnh căn hộ/biệt thự chính chủ (có hỗ trợ AI đọc ảnh điền form).\n3. BƯỚC 3: Chọn gói "Up Tin VIP" để tin đăng lên Top 1 Google tức thì.\n\nAnh/Chị cần em hỗ trợ đăng hộ tin hay muốn chọn gói Tin VIP ạ?`;
            options = ['🚀 Hướng dẫn gói Up-Tin VIP', '📞 Gọi Hotline 0868.499.929 hỗ trợ'];
          } else {
            replyText = `Dạ Anh/Chị Sale BĐS thân mến, các bước khai thác tối đa website dành cho Sale:\n1. BƯỚC 1: Đăng ký/Đăng nhập tài khoản Sale để quản lý danh mục hàng chào bán.\n2. BƯỚC 2: Đăng tin chào bán kèm thông tin liên hệ cá nhân của Anh/Chị.\n3. BƯỚC 3: Mở mục "AI Studio" (ở góc màn hình) để AI sinh tự động bài viết giới thiệu căn chuẩn SEO trong 5 giây.\n\nAnh/Chị có muốn trải nghiệm công cụ AI Studio sáng tạo bài viết SEO ngay không ạ?`;
            options = ['✨ Mở công cụ AI Studio', '📋 Xem quy trình Webhook n8n'];
          }
        } else if (lowerQ.includes('ocean park 2') || lowerQ.includes('chà là') || lowerQ.includes('san hô') || lowerQ.includes('phố biển')) {
          replyText = `Dạ Vinhomes Ocean Park 2 (The Empire) đang có quỹ căn siêu hot giá chủ nhà gửi bán độc quyền:\n• Shophouse Chà Là 70m²: từ 7.2 - 8.5 Tỷ (Đã có sổ đỏ, đang cho thuê kinh doanh tốt).\n• Biệt thự Song Lập San Hô: từ 13.5 Tỷ.\n\nAnh/Chị đang tìm căn để mua ở ngay hay đầu tư tích sản cho thuê ạ?`;
          options = ['Xem căn Shophouse Chà Là', 'Xem biệt thự San Hô', 'Tính lãi suất vay ngân hàng'];
        } else {
          replyText = `Dạ em hiểu nguyện vọng của Anh/Chị! Tất cả thông tin trên website chocudan24h.com đều được thẩm định trực tiếp bởi Chợ Cư Dân 24H (Hotline 0868.499.929).\n\nĐể hỗ trợ Anh/Chị chuẩn xác nhất, Anh/Chị có thể bấm chọn dịch vụ bên dưới hoặc cho em xin số điện thoại/Zalo để em gửi Bảng Báo Giá chi tiết qua Zalo cho Anh/Chị nhé?`;
          options = ['📱 Gửi thông tin qua Zalo 0868.499.929', '🏠 Hướng dẫn dùng website', '🚀 Xem gói Up Tin VIP'];
        }

        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          options
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 600);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Chatbot Launcher Button - Positioned on Bottom Left to avoid covering Zalo on Right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/30 group"
          title="Trợ lý AI BĐS 24/7"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
          </div>
          <span className="font-extrabold text-xs tracking-tight">Tư vấn AI 24/7</span>
        </button>
      )}

      {/* Chatbot Window Modal - Opens on Bottom Left */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 sm:top-auto sm:bottom-6 sm:left-6 sm:right-auto sm:h-[620px] w-full sm:w-[420px] z-50 bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative p-2 bg-emerald-600 rounded-2xl shadow-inner">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-emerald-400 tracking-wide flex items-center gap-1.5">
                  TRỢ LÝ AI CHỢ CƯ DÂN 24H
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-300">Hotline: 0868.499.929 • Chuyên Vinhomes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Switcher */}
          <div className="bg-slate-100 dark:bg-slate-950 p-2 border-b border-slate-200 dark:border-slate-800 flex justify-between gap-1 text-[11px] font-bold">
            <button
              onClick={() => setRole('buyer')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 ${
                role === 'buyer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              🎯 Khách Mua/Thuê
            </button>
            <button
              onClick={() => setRole('owner')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 ${
                role === 'owner'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              🏠 Chủ Nhà Gửi Bán
            </button>
            <button
              onClick={() => setRole('sale')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 ${
                role === 'sale'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              💼 Sale BĐS
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-1.5 max-w-[88%]">
                  {msg.sender === 'bot' && (
                    <div className="p-1 bg-emerald-600 text-white rounded-lg shrink-0 mb-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white font-medium rounded-br-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

                {/* Suggested Quick Options */}
                {msg.options && msg.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(opt)}
                        className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl transition text-left flex items-center gap-1 active:scale-95"
                      >
                        <ChevronRight className="w-3 h-3 shrink-0 text-emerald-500" />
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs italic p-2 bg-white dark:bg-slate-800 rounded-xl w-32 border border-slate-200 dark:border-slate-700">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span>AI đang soạn...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Contact Bar */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Building2 className="w-3 h-3 text-emerald-500" /> Chợ Cư Dân 24H Vinhomes
            </span>
            <a
              href="tel:0868499929"
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline"
            >
              <Phone className="w-3 h-3" /> 0868.499.929
            </a>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                role === 'buyer'
                  ? 'Hỏi về căn hộ, giá, vay vốn...'
                  : role === 'owner'
                  ? 'Hỏi cách đăng tin, nâng gói VIP...'
                  : 'Hỏi cách Sale chào hàng, AI Studio...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl transition flex items-center justify-center shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
