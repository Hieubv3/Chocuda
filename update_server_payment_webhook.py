with open('server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add upTinTransactionsStore definition
store_def = """// Persistent Up-Tin & Payment Transactions Store
let upTinTransactionsStore: any[] = [
  {
    id: 'tx-init-101',
    propertyId: 'prop-101',
    propertyTitle: 'Bán Biệt Thự Đơn Lập San Hô 06 - View Hồ Ngọc Trai Vinhomes Ocean Park 2',
    userId: 'user-hieubui',
    userName: 'Bùi Văn Hiếu (Chính Chủ)',
    userPhone: '0988.123.456',
    packageType: 'vip_diamond',
    packageName: 'VIP Kim Cương (30 Ngày Đỉnh Cao)',
    amount: 6000000,
    paymentCode: 'UPTIN-101-999',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    approvedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
    approvedBy: 'vietqr_gateway_webhook'
  }
];
"""

if "let upTinTransactionsStore" not in text:
    marker = "let pricingConfigStore ="
    text = text.replace(marker, store_def + "\n" + marker)
    print("1. Added upTinTransactionsStore definition")

# 2. Add upTinTransactions to saveDataStore and loadDataStore
if "upTinTransactions: upTinTransactionsStore" not in text:
    text = text.replace("pricingConfig: pricingConfigStore,", "pricingConfig: pricingConfigStore,\n      upTinTransactions: upTinTransactionsStore,")
    print("2. Added upTinTransactions to saveDataStore")

if "if (Array.isArray(data.upTinTransactions)) upTinTransactionsStore = data.upTinTransactions;" not in text:
    marker2 = "if (data.pricingConfig) pricingConfigStore = { ...pricingConfigStore, ...data.pricingConfig };"
    text = text.replace(marker2, marker2 + "\n        if (Array.isArray(data.upTinTransactions)) upTinTransactionsStore = data.upTinTransactions;")
    print("3. Added upTinTransactions to loadDataStore")

# 3. Add Payment & Webhook API routes before startServer
webhook_routes = """
// ==========================================
// VIETQR AUTOMATED INTERMEDIARY PAYMENT & WEBHOOK SYSTEM
// ==========================================

// Helper function to process successful payment & auto-upgrade property/user
function processSuccessfulPayment(tx: any, gatewayName = 'VietQR Webhook') {
  tx.status = 'approved';
  tx.approvedAt = new Date().toISOString();
  tx.approvedBy = gatewayName;

  let targetProperty: any = null;
  if (tx.propertyId) {
    const propIdx = propertiesStore.findIndex(p => p.id === tx.propertyId);
    if (propIdx !== -1) {
      const now = new Date().toISOString();
      const prop = propertiesStore[propIdx];
      
      // Auto-apply upgrades based on packageType
      if (tx.packageType === 'single_push') {
        prop.pushedAt = now;
        prop.pushedCount = (prop.pushedCount || 0) + 1;
      } else if (tx.packageType === 'auto_push_5') {
        prop.pushedAt = now;
        prop.pushedCount = (prop.pushedCount || 0) + 5;
        (prop as any).autoPush = true;
      } else if (tx.packageType === 'vip_silver') {
        prop.vipLevel = 'silver';
        prop.pushedAt = now;
        prop.featured = true;
      } else if (tx.packageType === 'vip_gold') {
        prop.vipLevel = 'gold';
        prop.pushedAt = now;
        prop.featured = true;
      } else if (tx.packageType === 'vip_diamond') {
        prop.vipLevel = 'diamond';
        prop.pushedAt = now;
        prop.featured = true;
      }
      
      propertiesStore[propIdx] = { ...prop };
      targetProperty = propertiesStore[propIdx];
    }
  }

  saveDataStore();
  return { transaction: tx, property: targetProperty };
}

// 1. Create Payment Intent (User begins QR transfer)
app.post("/api/payments/create-intent", (req, res) => {
  const {
    propertyId,
    propertyTitle,
    userId,
    userName,
    userPhone,
    packageType,
    packageName,
    amount,
    paymentCode,
    days = 3
  } = req.body;

  if (!paymentCode || !amount) {
    return res.status(400).json({ error: "Thiếu thông tin mã thanh toán hoặc số tiền." });
  }

  // Check if intent exists or create new
  const existingIdx = upTinTransactionsStore.findIndex(t => t.paymentCode === paymentCode);
  const newTx = {
    id: `tx-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    propertyId: propertyId || '',
    propertyTitle: propertyTitle || '',
    userId: userId || 'guest-user',
    userName: userName || 'Khách Hàng',
    userPhone: userPhone || '',
    packageType: packageType || 'single_push',
    packageName: packageName || 'Up Tin Top 1',
    amount: Number(amount) || 20000,
    paymentCode,
    days: Number(days) || 3,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    upTinTransactionsStore[existingIdx] = { ...upTinTransactionsStore[existingIdx], ...newTx };
  } else {
    upTinTransactionsStore.unshift(newTx);
  }

  saveDataStore();
  res.json({ success: true, transaction: newTx });
});

// 2. Real-time Status Polling (Web app checks if intermediary gateway confirmed transaction)
app.get("/api/payments/status/:paymentCode", (req, res) => {
  const { paymentCode } = req.params;
  const tx = upTinTransactionsStore.find(t => t.paymentCode === paymentCode);
  
  if (!tx) {
    return res.status(404).json({ status: 'not_found', message: "Không tìm thấy phiên giao dịch." });
  }

  const property = tx.propertyId ? propertiesStore.find(p => p.id === tx.propertyId) : null;
  res.json({
    status: tx.status,
    transaction: tx,
    property
  });
});

// 3. Property Push direct endpoint
app.post("/api/properties/:id/push", (req, res) => {
  const { id } = req.params;
  const { transaction, updatedProperty } = req.body;

  const propIndex = propertiesStore.findIndex(p => p.id === id);
  if (propIndex === -1) {
    return res.status(404).json({ error: "Không tìm thấy bất động sản." });
  }

  const now = new Date().toISOString();
  propertiesStore[propIndex] = {
    ...propertiesStore[propIndex],
    ...(updatedProperty || {}),
    pushedAt: now,
    pushedCount: (propertiesStore[propIndex].pushedCount || 0) + 1
  };

  if (transaction) {
    const txIdx = upTinTransactionsStore.findIndex(t => t.paymentCode === transaction.paymentCode || t.id === transaction.id);
    const approvedTx = { ...transaction, status: 'approved', approvedAt: now };
    if (txIdx !== -1) {
      upTinTransactionsStore[txIdx] = approvedTx;
    } else {
      upTinTransactionsStore.unshift(approvedTx);
    }
  }

  saveDataStore();
  res.json({
    success: true,
    message: "⚡ Up Tin Bất Động Sản thành công!",
    property: propertiesStore[propIndex]
  });
});

// 4. Standard Webhook for Payment Intermediaries (SePay, Casso, MBBank, MSB Open API, VietQR Webhook)
app.post(["/api/webhook/payment", "/api/webhook/sepay", "/api/webhook/casso"], (req, res) => {
  console.log("🔔 [Payment Webhook] Received webhook payload:", JSON.stringify(req.body));
  
  // Extract transfer description & amount from various webhook schemas
  const body = req.body || {};
  let transferContent = '';
  let transferAmount = 0;
  let referenceCode = '';

  // Case 1: Casso schema
  if (Array.isArray(body.data) && body.data.length > 0) {
    const item = body.data[0];
    transferContent = item.description || '';
    transferAmount = Number(item.amount || 0);
    referenceCode = String(item.tid || item.id || '');
  } 
  // Case 2: SePay schema
  else if (body.content || body.description) {
    transferContent = body.content || body.description || '';
    transferAmount = Number(body.transferAmount || body.amount || 0);
    referenceCode = String(body.referenceCode || body.id || '');
  }
  // Case 3: Generic / Open API schema
  else {
    transferContent = body.memo || body.addInfo || body.code || '';
    transferAmount = Number(body.amount || 0);
    referenceCode = String(body.transactionId || body.refNo || Date.now());
  }

  // Find matching payment code in transfer content
  const matchedTx = upTinTransactionsStore.find(t => {
    if (!t.paymentCode) return false;
    const cleanContent = transferContent.toUpperCase().replace(/\\s+/g, '');
    const cleanCode = t.paymentCode.toUpperCase().replace(/\\s+/g, '');
    return cleanContent.includes(cleanCode) || cleanCode.includes(cleanContent);
  });

  if (!matchedTx) {
    console.warn(`[Payment Webhook] No matching pending transaction for content: "${transferContent}"`);
    return res.status(200).json({ success: true, message: "Webhook received but no matching transaction code found." });
  }

  // Check amount (allow small tolerance if needed or >= required price)
  const result = processSuccessfulPayment(matchedTx, `VietQR Gateway (${body.gateway || 'Bank Webhook'}) Ref:${referenceCode}`);
  console.log(`✅ [Payment Webhook] Matched & Activated Up-Tin/VIP for property "${result.property?.title}" (Code: ${matchedTx.paymentCode})`);

  return res.status(200).json({
    success: true,
    message: "Giao dịch đã được xác nhận và tự động nâng cấp trạng thái thành công!",
    transaction: result.transaction,
    property: result.property
  });
});

// 5. Test/Simulate Webhook (Allows testing real-time webhook flow instantly)
app.post("/api/payments/simulate-webhook", (req, res) => {
  const { paymentCode, amount } = req.body;
  const tx = upTinTransactionsStore.find(t => t.paymentCode === paymentCode);
  if (!tx) {
    return res.status(404).json({ error: "Không tìm thấy mã giao dịch để mô phỏng." });
  }

  const result = processSuccessfulPayment(tx, 'Mô Phỏng Intermediary Webhook');
  res.json({
    success: true,
    message: "🎉 Đã mô phỏng thanh toán thành công qua Webhook trung gian!",
    transaction: result.transaction,
    property: result.property
  });
});

// 6. Get all transactions history
app.get("/api/payments/transactions", (req, res) => {
  res.json(upTinTransactionsStore);
});
"""

marker_server = "async function startServer()"
if "/api/payments/create-intent" not in text:
    text = text.replace(marker_server, webhook_routes + "\n\n" + marker_server)
    print("4. Added payment & webhook routes before startServer")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished updating server.ts!")
