import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Bell, BellOff, Volume2, VolumeX, MessageSquare, Phone, 
  Store, ShoppingBag, CheckCheck, Sparkles, Image as ImageIcon, ShieldCheck, MapPin
} from 'lucide-react';
import { UserStorefront, StoreProduct } from '../types';
import { playMessageRingtone, playSoundToggleTestChime } from '../lib/audioRingtone';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'seller';
  senderName: string;
  text: string;
  timestamp: string;
  product?: StoreProduct;
  imageUrl?: string;
}

interface InAppStorefrontChatModalProps {
  store: UserStorefront;
  currentUser?: any;
  initialProduct?: StoreProduct | null;
  onClose: () => void;
}

export const InAppStorefrontChatModal: React.FC<InAppStorefrontChatModalProps> = ({
  store,
  currentUser,
  initialProduct,
  onClose
}) => {
  // Sound Enabled State (default true, synced with localStorage)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('storefront_chat_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [soundToast, setSoundToast] = useState<string | null>(null);

  // Storage key for chat history per store & user
  const currentUserId = currentUser?.id || 'guest-visitor';
  const currentUserName = currentUser?.name || 'Cư Dân Khách';
  const storageKey = `chat_history_${store.id}_${currentUserId}`;

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallthrough
      }
    }
    // Default initial greeting message from seller
    const initialMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'seller',
      senderName: store.ownerName || store.storeName,
      text: `Xin chào ${currentUserName}! Cửa hàng ${store.storeName} rất hân hạnh được phục vụ cư dân. Bạn cần tư vấn món ăn hay dịch vụ gì ạ?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    return [initialMsg];
  });

  const [inputMsg, setInputMsg] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(initialProduct || null);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  // Toggle Sound Ringtone
  const handleToggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    localStorage.setItem('storefront_chat_sound_enabled', String(nextSound));

    if (nextSound) {
      playSoundToggleTestChime();
      setSoundToast('🔊 ĐÃ BẬT CHUÔNG BÁO TIN NHẮN IB');
    } else {
      setSoundToast('🔇 ĐÃ TẮT CHUÔNG BÁO TIN NHẮN IB');
    }

    setTimeout(() => {
      setSoundToast(null);
    }, 2500);
  };

  // Quick Suggestion Chips
  const quickSuggestions = [
    'Món này còn sẵn không ạ?',
    'Cho em xin thời gian giao sang căn hộ?',
    'Phí ship về tòa nhà em bao nhiêu ạ?',
    'Tư vấn giúp em suất ăn cho gia đình'
  ];

  // Send Message Handler
  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputMsg.trim();
    if (!textToSend && !selectedProduct) return;

    const userMessage: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      senderName: currentUserName,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      product: selectedProduct || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setSelectedProduct(null); // Reset product context after attaching once
    setIsReplying(true);

    // Trigger simulated seller reply after 1.2s to test real-time incoming ringtone!
    setTimeout(() => {
      let replyText = `Cảm ơn ${currentUserName} đã nhắn tin IB cho ${store.storeName}! Dạ bên em luôn sẵn sàng giao hàng ngay tới căn hộ của bạn ạ.`;

      if (textToSend.toLowerCase().includes('món này còn') || textToSend.toLowerCase().includes('còn sẵn')) {
        replyText = `Dạ món này bên em luôn còn tươi nóng trong bếp ạ! Bạn chốt lượng bao nhiêu suất để em chuẩn bị luôn ạ?`;
      } else if (textToSend.toLowerCase().includes('giao') || textToSend.toLowerCase().includes('ship')) {
        replyText = `Dạ bên em freeship tận cửa cho cư dân nội khu Vinhomes ạ! Thời gian ship từ 10 - 15 phút.`;
      } else if (textToSend.toLowerCase().includes('giá') || textToSend.toLowerCase().includes('tư vấn')) {
        replyText = `Dạ sản phẩm niêm yết chuẩn giá cư dân ạ. Bạn nhắn giúp em số căn hộ và SĐT để em soạn đơn liền nhé!`;
      }

      const sellerReply: ChatMessage = {
        id: `msg-s-${Date.now()}`,
        sender: 'seller',
        senderName: store.ownerName || store.storeName,
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, sellerReply]);
      setIsReplying(false);

      // 🔔 PLAY SOUND RINGTONE WHEN INCOMING MESSAGE ARRIVES!
      if (soundEnabled) {
        playMessageRingtone();
      }
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-[85vh] sm:h-[680px] my-auto">
        
        {/* Sound Toast Overlay */}
        {soundToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[90] px-4 py-2 bg-slate-950 text-amber-300 border border-amber-500/50 rounded-full font-black text-xs shadow-2xl animate-bounce flex items-center gap-2">
            <span>{soundToast}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img loading="lazy" 
                src={store.logoUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=150&q=80'} 
                alt={store.storeName}
                className="w-11 h-11 rounded-2xl border border-amber-400 object-cover shadow-md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-amber-300 truncate">
                  {store.storeName}
                </h3>
                {store.verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Đã xác thực chính chủ" />
                )}
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                <span>Chủ shop: {store.ownerName}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">🟢 Online Phản Hồi Ngay</span>
              </p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 🔔 Ringtone Sound Toggle Switch */}
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title={soundEnabled ? 'Chuông báo tin nhắn đang BẬT. Bấm để TẮT' : 'Chuông báo tin nhắn đang TẮT. Bấm để BẬT'}
            >
              {soundEnabled ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">Chuông: BẬT</span>
                  <span className="sm:hidden">🔔</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Chuông: TẮT</span>
                  <span className="sm:hidden">🔕</span>
                </>
              )}
            </button>

            {/* Direct Call Link */}
            <a
              href={`tel:${store.ownerPhone}`}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow"
              title="Gọi điện trực tiếp chủ shop"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
              title="Đóng Chat IB"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Attached Product Context Bar (if chatting about a specific product) */}
        {selectedProduct && (
          <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/30 p-2.5 px-4 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <img loading="lazy" 
                src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'} 
                alt={selectedProduct.name}
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-amber-500/40"
              />
              <div className="min-w-0">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block uppercase tracking-wider">
                  MÓN ĐANG ĐƯỢC ĐỀ CẬP:
                </span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">
                  {selectedProduct.name}
                </span>
                <span className="font-black text-amber-600 dark:text-amber-400">
                  {selectedProduct.price.toLocaleString('vi-VN')}đ {selectedProduct.unit ? `/ ${selectedProduct.unit}` : ''}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedProduct(null)}
              className="p-1 text-slate-400 hover:text-rose-500 transition"
              title="Bỏ đính kèm món này"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold px-1">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  {/* Attached Product inside Message */}
                  {msg.product && (
                    <div className="mb-2 p-2 bg-slate-900/10 dark:bg-slate-950/40 rounded-xl border border-slate-900/20 dark:border-slate-700 flex items-center gap-2 text-[11px]">
                      <img loading="lazy" 
                        src={msg.product.images[0]} 
                        alt={msg.product.name}
                        className="w-8 h-8 rounded object-cover shrink-0" 
                      />
                      <div className="min-w-0">
                        <span className="font-bold truncate block">{msg.product.name}</span>
                        <span className="font-black text-amber-700 dark:text-amber-400">
                          {msg.product.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isReplying && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold italic py-1 animate-pulse">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
              <span>{store.storeName} đang soạn tin nhắn phản hồi...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-2 scrollbar-none shrink-0">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 pl-2">Gợi ý tin nhắn:</span>
          {quickSuggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold text-[11px] rounded-xl transition whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Input Footer */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={`Nhắn tin IB với ${store.ownerName || store.storeName}...`}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />

          <button
            type="submit"
            disabled={!inputMsg.trim() && !selectedProduct}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs transition flex items-center gap-1 shadow-md"
          >
            <span>GỬI IB</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
