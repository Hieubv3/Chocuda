import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Send, MessageSquare, ShieldCheck, Headphones, Loader2, RefreshCw, Clock
} from 'lucide-react';

/**
 * Chat Nội Bộ Chợ Cư Dân 24h — thay thế nút Zalo trong Dịch vụ cư dân.
 * Mọi tin nhắn gửi qua /api/messages và chỉ tồn tại TRONG WEBSITE
 * (không mở Zalo/SĐT ra ngoài). Admin xem & trả lời trong trang quản trị.
 */

export interface InternalChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  read?: boolean;
}

interface ResidentServiceChatModalProps {
  open: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  providerName?: string;
  providerPhone?: string;
  currentUser: any;
}

export const ResidentServiceChatModal: React.FC<ResidentServiceChatModalProps> = ({
  open,
  onClose,
  serviceId,
  serviceName,
  providerName,
  providerPhone,
  currentUser
}) => {
  const currentUserId = currentUser?.id || 'guest-visitor';
  const currentUserName = currentUser?.displayName || currentUser?.name || 'Cư Dân';
  const threadId = `service-${serviceId}-${currentUserId}`;

  const [messages, setMessages] = useState<InternalChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pollTimer, setPollTimer] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/messages?threadId=${encodeURIComponent(threadId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      }
    } catch (err) {
      console.warn('[ResidentServiceChat] fetch error:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (!open) return;
    fetchMessages(true);
    const t = setInterval(() => fetchMessages(false), 5000);
    setPollTimer(t);
    return () => {
      if (t) clearInterval(t);
      setPollTimer(null);
    };
  }, [open, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (customText?: string) => {
    const text = (customText || inputMsg).trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          senderName: currentUserName,
          senderAvatar: currentUser?.avatar,
          receiverId: 'user-admin',
          receiverName: 'Hỗ trợ Chợ Cư Dân 24h',
          threadId,
          threadTitle: `Dịch vụ: ${serviceName}`,
          serviceId,
          serviceName,
          content: text
        })
      });
      if (res.ok) {
        setInputMsg('');
        await fetchMessages(false);
      } else {
        alert('Gửi tin nhắn thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ. Tin nhắn chưa được gửi.');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const quickSuggestions = [
    'Cho tôi hỏi dịch vụ này còn nhận không ạ?',
    'Giá báo đã bao gồm phí đi lại chưa?',
    'Tôi cần đặt lịch hôm nay được không?',
    'Cho tôi xin bảng giá chi tiết ạ.'
  ];

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-ink-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-ink-900 rounded-3xl shadow-2xl overflow-hidden border border-ink-200 dark:border-ink-800 flex flex-col h-[85vh] sm:h-[680px] my-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-teal-700 text-white p-4 flex items-center justify-between border-b border-brand-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-white/15 rounded-2xl border border-white/25 shrink-0">
              <MessageSquare className="w-5 h-5 text-brand-100" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white truncate">
                  Chat Nội Bộ — {serviceName}
                </h3>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              </div>
              <p className="text-[11px] text-brand-100 flex items-center gap-1.5 truncate">
                <Headphones className="w-3 h-3" />
                <span>Bộ phận hỗ trợ Chợ Cư Dân 24h phản hồi trong web</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchMessages(true)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
              title="Làm mới tin nhắn"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-brand-50 dark:bg-brand-950/40 border-b border-brand-200 dark:border-brand-800/60 px-4 py-2 shrink-0">
          <p className="text-[11px] text-brand-800 dark:text-brand-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            Toàn bộ hội thoại được lưu lại trong hệ thống Chợ Cư Dân 24h — an toàn, không chuyển hướng ra ứng dụng ngoài.
          </p>
        </div>

        {/* Messages body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-ink-50 dark:bg-ink-950/60">
          {loading && (
            <div className="py-10 text-center">
              <Loader2 className="w-7 h-7 text-brand-500 animate-spin mx-auto" />
              <p className="text-xs text-ink-500 mt-2 font-bold">Đang tải tin nhắn...</p>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="py-10 text-center space-y-2">
              <MessageSquare className="w-10 h-10 text-brand-400 mx-auto" />
              <p className="text-xs font-bold text-ink-700 dark:text-ink-200">Bắt đầu trò chuyện về dịch vụ này</p>
              <p className="text-[11px] text-ink-500">
                Hãy gửi câu hỏi đầu tiên — bộ phận hỗ trợ (và nhà cung cấp <strong>{providerName || serviceName}</strong>) sẽ phản hồi ngay trong web.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            const isStaff = !isMine;
            return (
              <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}>
                <div className="flex items-center gap-1.5 text-[10px] text-ink-400 font-semibold px-1">
                  <span>{isMine ? 'Bạn' : msg.senderName || 'Hỗ trợ'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {(() => { try { return new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } })()}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                    isMine
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-ink-950 font-medium rounded-tr-none'
                      : 'bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 border border-ink-200 dark:border-ink-700/80 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                  {isStaff && (
                    <span className="block mt-1.5 text-[9px] font-black uppercase tracking-wide text-brand-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Hỗ trợ Chợ Cư Dân 24h
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        <div className="p-2 bg-white dark:bg-ink-900 border-t border-ink-200 dark:border-ink-800 overflow-x-auto flex items-center gap-2 scrollbar-none shrink-0">
          <span className="text-[10px] font-bold text-ink-400 shrink-0 pl-2">Gợi ý:</span>
          {quickSuggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={sending}
              className="px-2.5 py-1 bg-ink-100 dark:bg-ink-800 hover:bg-brand-500 hover:text-ink-950 text-ink-700 dark:text-ink-300 font-bold text-[11px] rounded-xl transition whitespace-nowrap shrink-0 border border-ink-200 dark:border-ink-700 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-3 bg-white dark:bg-ink-900 border-t border-ink-200 dark:border-ink-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={`Nhắn tin nội bộ về dịch vụ ${serviceName}...`}
            className="flex-1 px-4 py-2.5 bg-ink-100 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl text-xs font-medium text-ink-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={(!inputMsg.trim() && !sending) || sending}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-ink-950 font-black rounded-2xl text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>GỬI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
