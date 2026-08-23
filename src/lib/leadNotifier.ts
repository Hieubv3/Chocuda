// src/lib/leadNotifier.ts
export interface CustomerLeadPayload {
  sourceType: 'taxi_transport' | 'property_inquiry' | 'property_viewing' | 'post_property' | 'resident_service' | 'store_order' | 'general_consultation';
  title: string; // e.g. "Đặt Xe Vận Tải Ngoại Khu - Taxi Sân Bay Nội Bài"
  customerName: string;
  customerPhone: string;
  project?: string;
  subdivision?: string;
  note?: string;
  transportType?: 'noi_khu' | 'ngoai_khu' | 'duong_dai' | 'chuyen_nha';
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string;
  details?: Record<string, string | number | boolean | undefined>;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  zaloWebhookUrl?: string;
  groupName?: string;
}

const TELEGRAM_CONFIG_KEY = 'chocudan24h_telegram_config';

export function getStoredTelegramConfig(): TelegramConfig {
  try {
    const saved = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse telegram config:', e);
  }
  return {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
    chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
    enabled: true,
    zaloWebhookUrl: 'https://zalo.me/0868499929',
    groupName: 'Nhóm Tiết Nhận Đơn Cư Dân 24/7'
  };
}

export function saveTelegramConfig(config: TelegramConfig): void {
  localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Dispatch customer lead payload to Telegram Bot / Zalo Webhook & Local Lead Store
 */
export async function dispatchCustomerLead(lead: CustomerLeadPayload): Promise<{ success: boolean; message: string; telegramSent: boolean }> {
  // 1. Store lead locally in chocudan24h_local_contacts for Admin Dashboard
  try {
    const contactsRaw = localStorage.getItem('chocudan24h_local_contacts') || '[]';
    const contacts = JSON.parse(contactsRaw);
    const newLead = {
      id: `lead-${Date.now()}`,
      fullName: lead.customerName,
      phone: lead.customerPhone,
      email: '',
      project: lead.project || 'vinhomes-general',
      message: `[${lead.title}] ${lead.transportType ? `[Loại: ${lead.transportType.toUpperCase()}] ` : ''}${lead.note || ''}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      sellerPhone: '0868499929',
      details: {
        ...lead.details,
        pickupLocation: lead.pickupLocation,
        dropoffLocation: lead.dropoffLocation,
        pickupTime: lead.pickupTime,
        transportType: lead.transportType
      }
    };
    contacts.unshift(newLead);
    localStorage.setItem('chocudan24h_local_contacts', JSON.stringify(contacts));
  } catch (err) {
    console.warn('Failed to store lead locally:', err);
  }

  // 2. Dispatch to Telegram Group Bot API if configured
  const config = getStoredTelegramConfig();
  let telegramSent = false;
  const formattedTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  // Build clean, professional HTML message
  let transportDetailsStr = '';
  if (lead.pickupLocation || lead.dropoffLocation || lead.pickupTime) {
    transportDetailsStr = `\n🚗 <b>Điểm đón:</b> ${lead.pickupLocation || 'N/A'}\n🏁 <b>Điểm đến:</b> ${lead.dropoffLocation || 'N/A'}\n⏰ <b>Thời gian đi:</b> ${lead.pickupTime || 'Ngay lập tức'}`;
  }

  const messageText = `
🚨 <b>ĐƠN YÊU CẦU MỚI (CHỌ CƯ DÂN 24H)</b> 🚨
----------------------------------------
🏷️ <b>Nhu cầu:</b> ${lead.title}
👤 <b>Khách hàng:</b> ${lead.customerName}
📞 <b>SĐT / Zalo:</b> <code>${lead.customerPhone}</code>
📍 <b>Khu vực/Dự án:</b> ${lead.project || 'Vinhomes'} ${lead.subdivision ? `(${lead.subdivision})` : ''}${transportDetailsStr}
📝 <b>Ghi chú:</b> ${lead.note || 'Không có'}
🕒 <b>Thời gian gửi:</b> ${formattedTime}
🌐 <b>Kênh:</b> CHOCUDAN24H.COM
----------------------------------------
📲 <i>Bấm chat Zalo với khách: https://zalo.me/${lead.customerPhone.replace(/\D/g, '')}</i>
  `.trim();

  if (config.enabled && config.botToken && config.chatId) {
    try {
      const tgUrl = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      const res = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: messageText,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      if (res.ok) {
        telegramSent = true;
      }
    } catch (err) {
      console.warn('Telegram API send error:', err);
    }
  }

  // 3. Optional Zalo Webhook Ping
  if (config.zaloWebhookUrl && config.zaloWebhookUrl.startsWith('http') && !config.zaloWebhookUrl.includes('zalo.me/0868499929')) {
    try {
      fetch(config.zaloWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageText,
          lead
        })
      }).catch(() => {});
    } catch (e) {}
  }

  return {
    success: true,
    telegramSent,
    message: telegramSent
      ? 'Dữ liệu nhu cầu của bạn đã được gửi thành công trực tiếp tới nhóm Telegram/Zalo tiếp nhận đơn 24/7!'
      : 'Đã nhận thành công thông tin nhu cầu! Đội ngũ tư vấn & Tài xế cư dân sẽ liên hệ lại qua SĐT/Zalo trong 3-5 phút.'
  };
}
