import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Bot, Sparkles, Phone, Building2, CheckCircle2, 
  ChevronRight, RefreshCw, ShoppingBag, Utensils, Car, Wrench, Package, 
  Plus, Minus, Clock, MapPin, AlertCircle, Trash2, ArrowRight
} from 'lucide-react';
import { Property, Project, NewsArticle } from '../types';

export interface ChatOrderItem {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  unit: string;
  category: string;
  image?: string;
}

export interface PlacedChatOrder {
  id: string;
  orderCode: string;
  itemType: 'food_drink' | 'physical_goods' | 'transport' | 'technical_service';
  orderCategory: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    priceDisplay: string;
  }>;
  totalAmount: number;
  totalDisplay: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  project: string;
  note: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed';
  sellerName: string;
  sellerPhone: string;
  createdAt: string;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: string[];
  orderCard?: PlacedChatOrder;
  orderWidgetType?: 'food' | 'goods' | 'transport' | 'repair';
}

interface StraightLineAiChatbotProps {
  properties: Property[];
  projects: Project[];
  news: NewsArticle[];
  onOpenConsultation?: () => void;
  onOpenUpTin?: () => void;
  currentUser?: any;
}

const DEFAULT_FOOD_CATALOG: ChatOrderItem[] = [
  { id: 'f-1', name: 'Cơm Sườn Nướng Mật Ong S2.12', price: 45000, priceDisplay: '45.000đ', unit: 'suất', category: 'Cơm & Món Chính', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80' },
  { id: 'f-2', name: 'Bún Bò Huế Chả Cua Cư Dân OCP2', price: 50000, priceDisplay: '50.000đ', unit: 'bát', category: 'Bún & Phở', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=200&q=80' },
  { id: 'f-3', name: 'Trà Sữa Trân Châu Đường Đen', price: 35000, priceDisplay: '35.000đ', unit: 'cốc', category: 'Cafe & Trà Sữa', image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=200&q=80' },
  { id: 'f-4', name: 'Trà Đào Cam Sả Tươi Tự Nấu', price: 30000, priceDisplay: '30.000đ', unit: 'cốc', category: 'Cafe & Trà Sữa', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80' },
  { id: 'f-5', name: 'Cà Phê Muối / Bạc Xỉu Kem Béo', price: 28000, priceDisplay: '28.000đ', unit: 'cốc', category: 'Cafe & Trà Sữa', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80' },
  { id: 'f-6', name: 'Pizza Hải Sản Phô Mai Tươi', price: 120000, priceDisplay: '120.000đ', unit: 'chiếc', category: 'Ăn Vặt & Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80' }
];

const DEFAULT_GOODS_CATALOG: ChatOrderItem[] = [
  { id: 'g-1', name: 'Gạo ST25 Sóc Trăng Thượng Hạng (Túi 5kg)', price: 185000, priceDisplay: '185.000đ', unit: 'bao 5kg', category: 'Thực Phẩm & Bách Hóa', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
  { id: 'g-2', name: 'Trứng Gà Ta Thả Vườn Cư Dân (Vỉ 10 quả)', price: 45000, priceDisplay: '45.000đ', unit: 'vỉ', category: 'Thực Phẩm & Bách Hóa', image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=200&q=80' },
  { id: 'g-3', name: 'Thùng Nước Khoáng Lavie 24 chai x 500ml', price: 95000, priceDisplay: '95.000đ', unit: 'thùng', category: 'Bách Hóa & Đồ Uống', image: 'https://images.unsplash.com/photo-1559839914-ba2c58908866?auto=format&fit=crop&w=200&q=80' },
  { id: 'g-4', name: 'Khăn Giấy Ướt Cao Cấp Cho Bé (Gói 100 tờ)', price: 25000, priceDisplay: '25.000đ', unit: 'gói', category: 'Gia Dụng & Mẹ Bé', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=80' }
];

const DEFAULT_TRANSPORT_CATALOG: ChatOrderItem[] = [
  { id: 't-1', name: '⚡ Xe Điện Buggy Nội Khu (Đưa đón sảnh/Vincom)', price: 20000, priceDisplay: '20.000đ', unit: 'lượt', category: 'Vận Tải Nội Khu' },
  { id: 't-2', name: '✈️ Taxi Sân Bay Nội Bài (Trọn gói 1 chiều)', price: 280000, priceDisplay: '280.000đ', unit: 'chuyến', category: 'Vận Tải Ngoại Khu' },
  { id: 't-3', name: '🚗 Taxi Điện VF8 Đi Tỉnh / Khứ Hồi', price: 450000, priceDisplay: '450.000đ', unit: 'chuyến', category: 'Vận Tải Ngoại Khu' },
  { id: 't-4', name: '📦 Xe Ba Bánh Chuyển Đồ Cồng Kềnh Nội Khu', price: 100000, priceDisplay: '100.000đ', unit: 'chuyến', category: 'Vận Tải Nội Khu' }
];

const DEFAULT_REPAIR_CATALOG: ChatOrderItem[] = [
  { id: 'r-1', name: '⚡ Sửa Chữa Điện Nước & Aptomat Khẩn Cấp 24/7', price: 150000, priceDisplay: '150.000đ', unit: 'lần', category: 'Điện Nước' },
  { id: 'r-2', name: '🛗 Kiểm Tra & Bảo Trì Thang Máy Gia Đình Homelift', price: 350000, priceDisplay: '350.000đ', unit: 'lần', category: 'Thang Máy' },
  { id: 'r-3', name: '💻 Cài Đặt Win / Sửa Máy Tính & Wi-Fi Mesh Tận Nhà', price: 150000, priceDisplay: '150.000đ', unit: 'máy', category: 'Máy Tính & Mạng' },
  { id: 'r-4', name: '🔐 Lắp Đặt & Mở Khóa Cửa Vân Tay Thông Minh', price: 200000, priceDisplay: '200.000đ', unit: 'bộ', category: 'Khóa Cửa' }
];

export const StraightLineAiChatbot: React.FC<StraightLineAiChatbotProps> = ({
  properties,
  projects,
  news,
  onOpenConsultation,
  onOpenUpTin,
  currentUser: propUser
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'order_food' | 'order_goods' | 'order_transport' | 'order_repair' | 'my_orders'>('chat');
  const [role, setRole] = useState<'buyer' | 'owner' | 'sale'>('buyer');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // User details
  const [userProfile, setUserProfile] = useState<any>(() => {
    if (propUser) return propUser;
    try {
      const saved = localStorage.getItem('hb_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Chat Order Cart State
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: { item: ChatOrderItem; quantity: number } }>({});
  const [customItemText, setCustomItemText] = useState('');
  const [orderCustomerName, setOrderCustomerName] = useState(userProfile?.displayName || userProfile?.name || '');
  const [orderCustomerPhone, setOrderCustomerPhone] = useState(userProfile?.phone || '');
  const [orderCustomerAddress, setOrderCustomerAddress] = useState(userProfile?.address || 'Tòa S2.12 Ocean Park 1');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // My Placed Orders
  const [myOrders, setMyOrders] = useState<PlacedChatOrder[]>(() => {
    try {
      const saved = localStorage.getItem('hb_chat_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initial Welcome Messages
  const getInitialMessages = (): Message[] => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: 'welcome-1',
        sender: 'bot',
        text: `Dạ em chào Anh/Chị! Em là Trợ Lý AI Chợ Cư Dân 24H (Hotline/Zalo: 0868.499.929).\n\nEm hỗ trợ Anh/Chị:\n1. 🍲 Đặt Cơm, Cafe, Trà sữa & Đồ ăn vặt (Giao tận cửa 15-20 phút)\n2. 📦 Đặt Hàng Vật Lý, Bách hóa & Nông sản sạch từ Gian Hàng Cư Dân\n3. 🚗 Đặt Xe Buggy / Taxi Sân Bay 24/7\n4. 🛠️ Gọi Thợ Sửa Điện Nước, Máy Tính, Thang Máy\n5. 🏠 Mua bán & Cho thuê BĐS Vinhomes chính chủ\n\nAnh/Chị muốn đặt dịch vụ nào hoặc cần em hỗ trợ gì ạ?`,
        timestamp: time,
        options: [
          '🍲 Đặt Đồ Ăn & Cafe',
          '📦 Đặt Hàng Vật Lý',
          '🚗 Đặt Xe Cư Dân 24/7',
          '🛠️ Gọi Thợ Sửa Chữa',
          '🔍 Lọc Căn Ocean Park 2'
        ]
      }
    ];
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping, activeTab]);

  // Load orders from API
  useEffect(() => {
    fetch('/api/chat-orders')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.orders)) {
          setMyOrders(data.orders);
          localStorage.setItem('hb_chat_orders', JSON.stringify(data.orders));
        }
      })
      .catch(() => {});
  }, []);

  // Cart helper functions
  const addItemToCart = (item: ChatOrderItem) => {
    setSelectedItems(prev => {
      const currentQty = prev[item.id]?.quantity || 0;
      return {
        ...prev,
        [item.id]: { item, quantity: currentQty + 1 }
      };
    });
  };

  const removeItemFromCart = (itemId: string) => {
    setSelectedItems(prev => {
      const current = prev[itemId];
      if (!current) return prev;
      if (current.quantity <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { ...current, quantity: current.quantity - 1 }
      };
    });
  };

  const clearCart = () => setSelectedItems({});

  const calculateTotal = () => {
    return Object.values(selectedItems).reduce((sum: number, entry: { item: ChatOrderItem; quantity: number }) => {
      return sum + entry.item.price * entry.quantity;
    }, 0);
  };

  // Submit Order directly from In-Chat Widget
  const handleConfirmOrder = async (orderCategoryTitle: string, itemType: 'food_drink' | 'physical_goods' | 'transport' | 'technical_service') => {
    const itemsList = Object.values(selectedItems).map((e: { item: ChatOrderItem; quantity: number }) => ({
      name: e.item.name,
      quantity: e.quantity,
      price: e.item.price,
      priceDisplay: e.item.priceDisplay
    }));

    if (customItemText.trim()) {
      itemsList.push({
        name: customItemText.trim(),
        quantity: 1,
        price: 50000,
        priceDisplay: '50.000đ (Tạm tính)'
      });
    }

    if (itemsList.length === 0) {
      alert('Vui lòng chọn ít nhất 1 món/sản phẩm hoặc nhập yêu cầu món của bạn.');
      return;
    }

    if (!orderCustomerName.trim() || !orderCustomerPhone.trim()) {
      alert('Vui lòng điền Họ tên và Số điện thoại liên hệ nhận hàng.');
      return;
    }

    setIsSubmittingOrder(true);

    const payload = {
      itemType,
      orderCategory: orderCategoryTitle,
      items: itemsList,
      customerName: orderCustomerName.trim(),
      customerPhone: orderCustomerPhone.trim(),
      customerAddress: orderCustomerAddress.trim() || 'Nội khu Vinhomes',
      note: orderNote.trim(),
      userId: userProfile?.id,
      sellerName: itemType === 'food_drink' ? 'Bếp Cư Dân S2.12 & Trà Sữa Tươi' : (itemType === 'transport' ? 'Đội Xe Buggy & Taxi Cư Dân 24/7' : 'Gian Hàng Cư Dân & Đội Thợ Kỹ Thuật'),
      sellerPhone: '0868.499.929'
    };

    try {
      const res = await fetch('/api/chat-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data && data.order) {
        const placedOrder: PlacedChatOrder = data.order;
        
        // Add to local state
        setMyOrders(prev => [placedOrder, ...prev]);
        localStorage.setItem('hb_chat_orders', JSON.stringify([placedOrder, ...myOrders]));

        // Post confirmation message to chat feed
        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const confirmMsg: Message = {
          id: `ord-msg-${Date.now()}`,
          sender: 'bot',
          text: `🎉 ĐẶT HÀNG QUA CHAT THÀNH CÔNG!\n\nMã đơn: #${placedOrder.orderCode}\nDanh mục: ${placedOrder.orderCategory}\nTổng thanh toán: ${placedOrder.totalDisplay}\nĐịa chỉ nhận: ${placedOrder.customerAddress}\n\n👉 Cửa hàng & Shipper nội khu đang chuẩn bị đơn và sẽ giao tới trong 15-20 phút. Anh/Chị có thể bấm Chat Zalo bên dưới để trao đổi trực tiếp!`,
          timestamp: time,
          orderCard: placedOrder,
          options: ['📋 Xem Đơn Của Tôi', '🍲 Đặt Thêm Món Khác', '📞 Hotline 0868.499.929']
        };

        setMessages(prev => [...prev, confirmMsg]);
        clearCart();
        setCustomItemText('');
        setOrderNote('');
        setActiveTab('chat');
      } else {
        alert(data.error || 'Có lỗi khi tạo đơn hàng.');
      }
    } catch (err) {
      alert('Đã gửi đơn hàng! Hotline/Zalo 0868.499.929 sẽ gọi lại xác nhận ngay.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Chat message sending logic
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Handle Quick Action Clicks
    if (query === '🍲 Đặt Đồ Ăn & Cafe' || query === '🍲 Chọn món & Đặt ngay' || query === '🍲 Đặt Cơm/Cafe' || query === '🍲 Đặt Cơm & Cafe Giao Nhanh') {
      setActiveTab('order_food');
      return;
    }
    if (query === '📦 Đặt Hàng Vật Lý' || query === '🛒 Đặt Hàng Vật Lý') {
      setActiveTab('order_goods');
      return;
    }
    if (query === '🚗 Đặt Xe Cư Dân 24/7' || query === '🚗 Đặt Xe 24/7' || query === '🚗 Đặt Xe Nội / Ngoại Khu 24/7') {
      setActiveTab('order_transport');
      return;
    }
    if (query === '🛠️ Gọi Thợ Sửa Chữa' || query === '🔧 Gọi Thợ Cư Dân' || query === '🔧 Gọi Thợ Sửa Chữa Khẩn Cấp') {
      setActiveTab('order_repair');
      return;
    }
    if (query === '📋 Xem Đơn Của Tôi') {
      setActiveTab('my_orders');
      return;
    }

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
          options: data.suggestedOptions,
          orderWidgetType: data.orderAction
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Fallback logic');
      }
    } catch {
      setTimeout(() => {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Dạ em đã ghi nhận thông tin từ Anh/Chị! Anh/Chị có thể đặt món ăn, đồ uống, xe di chuyển hoặc gọi thợ ngay bằng các nút bên dưới ạ.`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          options: ['🍲 Đặt Đồ Ăn & Cafe', '📦 Đặt Hàng Vật Lý', '🚗 Đặt Xe Cư Dân 24/7', '🛠️ Gọi Thợ Sửa Chữa']
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/30 group cursor-pointer"
          title="Trợ lý AI BĐS & Đặt Dịch Vụ Cư Dân 24/7"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
          </div>
          <span className="font-extrabold text-xs tracking-tight">Tư Vấn &amp; Đặt Hàng AI</span>
          {myOrders.length > 0 && (
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
              {myOrders.length}
            </span>
          )}
        </button>
      )}

      {/* Chatbot Window Modal */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 sm:top-auto sm:bottom-6 sm:left-6 sm:right-auto sm:h-[640px] w-full sm:w-[440px] z-50 bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative p-2 bg-emerald-600 rounded-2xl shadow-inner">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-emerald-400 tracking-wide flex items-center gap-1">
                  CHỢ CƯ DÂN 24H AI
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-300">Đặt món ăn, cafe, gọi xe &amp; thợ sửa 24/7</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {myOrders.length > 0 && (
                <button
                  onClick={() => setActiveTab(activeTab === 'my_orders' ? 'chat' : 'my_orders')}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-emerald-500/30"
                >
                  <Package className="w-3 h-3 text-amber-300" />
                  <span>Đơn: {myOrders.length}</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Service Ordering Tabs */}
          <div className="bg-slate-100 dark:bg-slate-950 p-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none text-[10px] font-bold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2.5 py-1.5 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>💬 Chat AI</span>
            </button>

            <button
              onClick={() => setActiveTab('order_food')}
              className={`px-2.5 py-1.5 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'order_food'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Utensils className="w-3 h-3 text-amber-500" />
              <span>🍲 Cơm &amp; Cafe</span>
            </button>

            <button
              onClick={() => setActiveTab('order_goods')}
              className={`px-2.5 py-1.5 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'order_goods'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>📦 Hàng Vật Lý</span>
            </button>

            <button
              onClick={() => setActiveTab('order_transport')}
              className={`px-2.5 py-1.5 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'order_transport'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Car className="w-3 h-3" />
              <span>🚗 Đặt Xe 24/7</span>
            </button>

            <button
              onClick={() => setActiveTab('order_repair')}
              className={`px-2.5 py-1.5 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'order_repair'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span>🛠️ Gọi Thợ</span>
            </button>
          </div>

          {/* TAB 1: REGULAR CHAT MESSAGES BODY */}
          {activeTab === 'chat' && (
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50 dark:bg-slate-900/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[92%]">
                    {msg.sender === 'bot' && (
                      <div className="p-1 bg-emerald-600 text-white rounded-lg shrink-0 mb-1">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white font-medium rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}

                      {/* Render Order Confirmation Receipt Card if present */}
                      {msg.orderCard && (
                        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl space-y-2 text-slate-900 dark:text-emerald-100">
                          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-1.5 font-bold text-[11px]">
                            <span className="text-emerald-700 dark:text-emerald-300">🧾 ĐƠN HÀNG #{msg.orderCard.orderCode}</span>
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black uppercase">
                              {msg.orderCard.status === 'confirmed' ? 'Đã Nhận Đơn' : 'Đang Chuẩn Bị'}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            {msg.orderCard.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                                <span>• {it.name} (x{it.quantity})</span>
                                <span className="font-bold">{it.priceDisplay}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between font-black text-xs pt-1 border-t border-emerald-200 dark:border-emerald-800">
                            <span>Tổng Tiền:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 text-sm">{msg.orderCard.totalDisplay}</span>
                          </div>

                          <div className="pt-1.5 flex gap-2">
                            <a
                              href={`https://zalo.me/${msg.orderCard.sellerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Chat Zalo Quán ({msg.orderCard.sellerPhone})</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

                  {/* Suggested Options Chips */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(opt)}
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-xl transition text-left flex items-center gap-1 active:scale-95 cursor-pointer"
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
          )}

          {/* TAB 2, 3, 4, 5: IN-CHAT ORDERING CATALOGS & FORMS */}
          {activeTab !== 'chat' && activeTab !== 'my_orders' && (
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/50 text-xs">
              {/* Category Intro Header */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    {activeTab === 'order_food' && <>🍲 ĐẶT ĐỒ ĂN &amp; CAFE CƯ DÂN</>}
                    {activeTab === 'order_goods' && <>📦 ĐẶT HÀNG VẬT LÝ &amp; BÁCH HÓA</>}
                    {activeTab === 'order_transport' && <>🚗 ĐẶT XE CƯ DÂN 24/7</>}
                    {activeTab === 'order_repair' && <>🛠️ GỌI THỢ KỸ THUẬT CƯ DÂN</>}
                  </h4>
                  <p className="text-[10px] text-slate-500">Phục vụ nội khu trong 15-20 phút • Phí sàn 0%</p>
                </div>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold"
                >
                  Quay lại Chat
                </button>
              </div>

              {/* Product / Menu Catalog Cards */}
              <div className="space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] flex items-center justify-between">
                  <span>Chọn món / dịch vụ muốn đặt:</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold">
                    Đã chọn {Object.values(selectedItems).reduce((s: number, i: { item: ChatOrderItem; quantity: number }) => s + i.quantity, 0)} món
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {(activeTab === 'order_food' ? DEFAULT_FOOD_CATALOG :
                    activeTab === 'order_goods' ? DEFAULT_GOODS_CATALOG :
                    activeTab === 'order_transport' ? DEFAULT_TRANSPORT_CATALOG :
                    DEFAULT_REPAIR_CATALOG
                  ).map((item) => {
                    const inCart = selectedItems[item.id];
                    const qty = inCart?.quantity || 0;
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-2xl border transition flex items-center justify-between gap-2.5 ${
                          qty > 0
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                        }`}
                      >
                        {item.image && (
                          <img loading="lazy" src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">{item.name}</h5>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                            {item.priceDisplay} <span className="text-slate-400 font-normal">/ {item.unit}</span>
                          </span>
                        </div>

                        {/* Quantity Counter Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {qty > 0 ? (
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                              <button
                                type="button"
                                onClick={() => removeItemFromCart(item.id)}
                                className="w-6 h-6 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-200 hover:text-rose-600 rounded-lg flex items-center justify-center font-black cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-black text-xs text-slate-900 dark:text-white">{qty}</span>
                              <button
                                type="button"
                                onClick={() => addItemToCart(item)}
                                className="w-6 h-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center font-black cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addItemToCart(item)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Chọn</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Item Request Text input */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  Hoặc tự gõ món / sản phẩm khác theo ý muốn:
                </label>
                <input
                  type="text"
                  value={customItemText}
                  onChange={(e) => setCustomItemText(e.target.value)}
                  placeholder="VD: 2 suất bún chả + 1 lon coca lạnh..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {/* Recipient Information Form */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Thông tin nhận hàng &amp; Giao tận căn:</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={orderCustomerName}
                    onChange={(e) => setOrderCustomerName(e.target.value)}
                    placeholder="Họ tên người nhận (*)"
                    className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                  <input
                    type="tel"
                    required
                    value={orderCustomerPhone}
                    onChange={(e) => setOrderCustomerPhone(e.target.value)}
                    placeholder="Số ĐT / Zalo (*)"
                    className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>

                <input
                  type="text"
                  required
                  value={orderCustomerAddress}
                  onChange={(e) => setOrderCustomerAddress(e.target.value)}
                  placeholder="Căn hộ / Tòa nhà (VD: Tòa S2.12 - Căn 1806 Ocean Park 1)"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />

                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Ghi chú giao (VD: ít cay, giao trước 12h, gọi trước khi lên...)"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {/* Total & Submit Button */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-2 pb-1 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-black text-xs px-1">
                  <span className="text-slate-600 dark:text-slate-400">Tạm tính:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                    {calculateTotal().toLocaleString()}đ
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isSubmittingOrder}
                  onClick={() => {
                    const catName = activeTab === 'order_food' ? 'Ẩm Thực & Cơm Cư Dân' :
                      activeTab === 'order_goods' ? 'Hàng Hóa & Bách Hóa Cư Dân' :
                      activeTab === 'order_transport' ? 'Vận Tải & Taxi Cư Dân 24/7' :
                      'Dịch Vụ Sửa Chữa & Thợ Kỹ Thuật';
                    const itemType = activeTab === 'order_food' ? 'food_drink' :
                      activeTab === 'order_goods' ? 'physical_goods' :
                      activeTab === 'order_transport' ? 'transport' :
                      'technical_service';
                    handleConfirmOrder(catName, itemType);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingOrder ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>🚀 XÁC NHẬN ĐẶT HÀNG QUA CHAT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: MY ACTIVE & PREVIOUS ORDERS */}
          {activeTab === 'my_orders' && (
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/50 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-500" />
                  <span>DANH SÁCH ĐƠN HÀNG CỦA TÔI</span>
                </h4>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  Quay lại Chat
                </button>
              </div>

              {myOrders.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Chưa có đơn hàng nào</p>
                  <p className="text-[11px] text-slate-400">Hãy chọn tab Đồ ăn, Hàng vật lý hoặc Đặt xe để đặt nhanh qua Chat nhé!</p>
                  <button
                    onClick={() => setActiveTab('order_food')}
                    className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                  >
                    🍲 Đặt món ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                        <div>
                          <span className="font-black text-slate-900 dark:text-white text-xs">#{ord.orderCode}</span>
                          <span className="text-[10px] text-slate-400 block">{ord.createdAt}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 rounded-full font-black text-[10px] uppercase">
                          {ord.status === 'confirmed' ? 'Đã Nhận Đơn' : ord.status === 'preparing' ? 'Đang Chuẩn Bị' : 'Hoàn Tất'}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span>• {it.name} (x{it.quantity})</span>
                            <span className="font-bold">{it.priceDisplay}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs font-black pt-1.5 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Tổng thanh toán:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-sm">{ord.totalDisplay}</span>
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{ord.customerAddress}</span>
                      </div>

                      <div className="pt-1 flex gap-2">
                        <a
                          href={`https://zalo.me/${ord.sellerPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat Zalo Người Bán ({ord.sellerPhone})</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Contact Hotline Bar */}
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
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

          {/* Input Footer (Active in regular chat tab) */}
          {activeTab === 'chat' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Nhắn tin đặt đồ ăn, cafe, gọi xe hoặc hỏi BĐS..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl transition flex items-center justify-center shadow-md shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      )}
    </>
  );
};
