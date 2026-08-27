// ==========================================
// PAYMENT GATEWAY SERVICE
// Hỗ trợ: VNPay, ZaloPay, MoMo
// ==========================================

import crypto from 'crypto';
import querystring from 'querystring';

// Payment Configuration
const config = {
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE || '',
    hashSecret: process.env.VNPAY_HASH_SECRET || '',
    url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay/callback',
  },
  zalopay: {
    appId: process.env.ZALOPAY_APP_ID || '',
    key1: process.env.ZALOPAY_KEY1 || '',
    key2: process.env.ZALOPAY_KEY2 || '',
    endpoint: process.env.ZALOPAY_ENDPOINT || 'https://sandbox.zalopay.vn/api/v2/create',
  },
  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE || '',
    accessKey: process.env.MOMO_ACCESS_KEY || '',
    secretKey: process.env.MOMO_SECRET_KEY || '',
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  },
  mode: process.env.PAYMENT_MODE || 'sandbox',
};

// ==========================================
// VNPAY
// ==========================================

export interface VnpayCreateParams {
  amount: number;
  orderId: string;
  orderInfo: string;
  ipAddress: string;
  locale?: string;
}

export function createVnpayPaymentUrl(params: VnpayCreateParams): string {
  const date = new Date();
  const createDate = formatVnpayDate(date);
  const expireDate = formatVnpayDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 minutes

  const vnpParams: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.vnpay.tmnCode,
    vnp_Locale: params.locale || 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: params.amount * 100, // VNPay uses amount * 100
    vnp_ReturnUrl: config.vnpay.returnUrl,
    vnp_IpAddr: params.ipAddress,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  // Sort params
  const sortedKeys = Object.keys(vnpParams).sort();
  const sortedParams: Record<string, string> = {};
  sortedKeys.forEach(key => {
    sortedParams[key] = vnpParams[key];
  });

  // Create query string
  const queryString = querystring.stringify(sortedParams);
  
  // Create HMAC SHA512
  const hmac = crypto.createHmac('sha512', config.vnpay.hashSecret);
  const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

  // Append secure hash
  return `${config.vnpay.url}?${queryString}&vnp_SecureHash=${signed}`;
}

export function verifyVnpayReturn(query: Record<string, string>): {
  isValid: boolean;
  responseCode: string;
  transactionNo: string;
  orderId: string;
  amount: number;
} {
  const secureHash = query.vnp_SecureHash;
  
  // Remove hash from params
  const verifyParams = { ...query };
  delete verifyParams.vnp_SecureHash;
  delete verifyParams.vnp_SecureHashType;

  // Sort and create query string
  const sortedKeys = Object.keys(verifyParams).sort();
  const sortedParams: Record<string, string> = {};
  sortedKeys.forEach(key => {
    sortedParams[key] = verifyParams[key];
  });

  const queryString = querystring.stringify(sortedParams);
  
  // Verify HMAC
  const hmac = crypto.createHmac('sha512', config.vnpay.hashSecret);
  const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

  return {
    isValid: secureHash === signed,
    responseCode: query.vnp_ResponseCode || '',
    transactionNo: query.vnp_TransactionNo || '',
    orderId: query.vnp_TxnRef || '',
    amount: parseInt(query.vnp_Amount || '0') / 100,
  };
}

function formatVnpayDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

// ==========================================
// ZALOPAY
// ==========================================

export interface ZalopayCreateParams {
  amount: number;
  orderId: string;
  orderInfo: string;
  returnUrl: string;
}

export async function createZalopayPayment(params: ZalopayCreateParams): Promise<{
  success: boolean;
  paymentUrl?: string;
  token?: string;
  error?: string;
}> {
  const embedData = {
    redirecturl: params.returnUrl,
  };

  const items: any[] = [];
  
  const order = {
    app_id: config.zalopay.appId,
    app_trans_id: params.orderId,
    app_user: 'user_' + params.orderId,
    app_time: Date.now(),
    amount: params.amount,
    item: JSON.stringify(items),
    description: params.orderInfo,
    embed_data: JSON.stringify(embedData),
    bank_code: '',
  };

  // Create HMAC SHA256
  const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.description}|${order.embed_data}`;
  order['mac'] = crypto.createHmac('sha256', config.zalopay.key1).update(data).digest('hex');

  try {
    const response = await fetch(config.zalopay.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    const result = await response.json();
    
    if (result.return_code === 1) {
      return {
        success: true,
        paymentUrl: result.order_url,
        token: result.zp_trans_token,
      };
    } else {
      return {
        success: false,
        error: result.return_message || 'ZaloPay payment creation failed',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to ZaloPay',
    };
  }
}

export function verifyZalopayCallback(data: string, mac: string): boolean {
  const calculatedMac = crypto.createHmac('sha256', config.zalopay.key2).update(data).digest('hex');
  return calculatedMac === mac;
}

// ==========================================
// MOMO
// ==========================================

export interface MomoCreateParams {
  amount: number;
  orderId: string;
  orderInfo: string;
  returnUrl: string;
  notifyUrl: string;
}

export async function createMomoPayment(params: MomoCreateParams): Promise<{
  success: boolean;
  paymentUrl?: string;
  deeplink?: string;
  error?: string;
}> {
  const rawSignature = `accessKey=${config.momo.accessKey}&amount=${params.amount}&extraData=&ipnUrl=${params.notifyUrl}&orderId=${params.orderId}&orderInfo=${params.orderInfo}&partnerCode=${config.momo.partnerCode}&redirectUrl=${params.returnUrl}&requestId=${params.orderId}&requestType=payWithMethod`;

  const signature = crypto.createHmac('sha256', config.momo.secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode: config.momo.partnerCode,
    partnerName: 'Chợ Cư Dân 24h',
    storeId: 'Chocudan24h',
    requestId: params.orderId,
    amount: params.amount,
    orderId: params.orderId,
    orderInfo: params.orderInfo,
    redirectUrl: params.returnUrl,
    ipnUrl: params.notifyUrl,
    lang: 'vi',
    requestType: 'payWithMethod',
    autoCapture: true,
    extraData: '',
    signature,
  };

  try {
    const response = await fetch(config.momo.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    
    if (result.resultCode === 0) {
      return {
        success: true,
        paymentUrl: result.payUrl,
        deeplink: result.deeplink,
      };
    } else {
      return {
        success: false,
        error: result.message || 'MoMo payment creation failed',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to MoMo',
    };
  }
}

export function verifyMomoCallback(body: any): boolean {
  const rawSignature = `accessKey=${config.momo.accessKey}&amount=${body.amount}&extraData=${body.extraData}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
  
  const signature = crypto.createHmac('sha256', config.momo.secretKey).update(rawSignature).digest('hex');
  return signature === body.signature;
}

// ==========================================
// PAYMENT STATUS HANDLER
// ==========================================

export type PaymentGateway = 'vnpay' | 'zalopay' | 'momo';

export function getPaymentStatusFromGateway(
  gateway: PaymentGateway,
  responseData: any
): 'success' | 'pending' | 'failed' | 'cancelled' {
  switch (gateway) {
    case 'vnpay':
      return responseData.responseCode === '00' ? 'success' : 
             responseData.responseCode === '07' ? 'failed' : 'pending';
    case 'zalopay':
      return responseData.return_code === 1 ? 'success' : 'failed';
    case 'momo':
      return responseData.resultCode === 0 ? 'success' : 'failed';
    default:
      return 'pending';
  }
}
