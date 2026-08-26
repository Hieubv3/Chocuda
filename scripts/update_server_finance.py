import re

with open('server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add Entity 5 (User Topup via SePay)
find_str = 'console.log(`✅ [Payment Webhook] Matched & Funded Escrow for Tech Order #${matchedTechOrder.orderCode}`);'
idx = text.find(find_str)
if idx != -1:
    idx_end = text.find('}', idx) + 1
    idx_end2 = text.find('}', idx_end) + 1
    target_snippet = text[idx:idx_end2]
    
    entity_5_code = """console.log(`✅ [Payment Webhook] Matched & Funded Escrow for Tech Order #${matchedTechOrder.orderCode}`);
    }
  }

  // --- ENTITY 5: Nạp Tiền Ví Cư Dân / Doanh Nghiệp / Chủ Shop (User Top-up via VietQR/SePay) ---
  if (!matchedTx && matchedStatus === 'no_match') {
    // 5.1 Match by pending Deposit Intent code
    let matchedIntent = depositIntentsStore.find(intent => {
      if (intent.status !== 'pending') return false;
      const cleanIntentCode = intent.code.toUpperCase().replace(/\\s+/g, '');
      const cleanIntentId = intent.id.toUpperCase().replace(/\\s+/g, '');
      return (cleanIntentCode && cleanContent.includes(cleanIntentCode)) ||
             (cleanIntentId && cleanContent.includes(cleanIntentId)) ||
             (intent.userPhone && cleanContent.includes(intent.userPhone.replace(/\\D/g, '')));
    });

    // 5.2 Match by User Phone or ID in content (e.g. NAP 0988123456 or TOKEN 0988123456 or NAP_user123)
    let targetUser = matchedIntent ? usersStore.find(u => u.id === matchedIntent.userId) : null;
    if (!targetUser) {
      targetUser = usersStore.find(u => {
        if (!u.phone && !u.id && !u.email) return false;
        const cleanPhone = u.phone ? u.phone.replace(/\\D/g, '') : '';
        const cleanId = u.id ? u.id.toUpperCase().replace(/\\s+/g, '') : '';
        const cleanEmailPrefix = u.email ? u.email.split('@')[0].toUpperCase() : '';
        return (cleanPhone && cleanPhone.length >= 8 && cleanContent.includes(cleanPhone)) ||
               (cleanId && cleanId.length >= 5 && cleanContent.includes(cleanId)) ||
               (cleanEmailPrefix && cleanEmailPrefix.length >= 4 && cleanContent.includes(cleanEmailPrefix));
      });
    }

    if (targetUser || matchedIntent) {
      const u = targetUser || usersStore.find(user => user.id === matchedIntent?.userId);
      if (u) {
        const topupAmount = transferAmount > 0 ? transferAmount : (matchedIntent?.amount || 50000);
        u.balance = (u.balance || 0) + topupAmount;
        u.totalTopup = (u.totalTopup || 0) + topupAmount;

        const wallet = getUserWallet(u.id);
        wallet.availableBalance = (wallet.availableBalance || 0) + topupAmount;

        if (matchedIntent) {
          matchedIntent.status = 'completed';
          matchedIntent.completedAt = new Date().toISOString();
        }

        const txRef = referenceCode || matchedIntent?.code || `NAP-VQR-${Date.now()}`;
        walletTransactionsStore.unshift({
          id: `wtx-${Date.now()}`,
          userId: u.id,
          userPhone: u.phone,
          userEmail: u.email,
          type: 'deposit_vietqr',
          amount: topupAmount,
          description: `[TỰ ĐỘNG SEPAY] Nạp thành công ${topupAmount.toLocaleString('vi-VN')}đ vào Ví Tài Khoản (${gateway} Ref: ${referenceCode})`,
          status: 'success',
          createdAt: new Date().toLocaleString('vi-VN'),
          referenceCode: txRef
        });

        // Add Notification for User
        notificationsStore.unshift({
          id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          targetUserId: u.id,
          title: '🎉 Nạp Tiền Vào Ví Thành Công!',
          body: `Bạn vừa được cộng +${topupAmount.toLocaleString('vi-VN')}đ vào số dư tài khoản qua SePay VietQR (${gateway}). Số dư hiện tại: ${(u.balance).toLocaleString('vi-VN')}đ.`,
          type: 'order',
          createdAt: new Date().toISOString(),
          read: false
        });

        // Add Notification for Admin
        notificationsStore.unshift({
          id: `notif-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          targetUserId: 'admin',
          title: '💰 Biến Động Số Dư: Khách Nạp Tiền',
          body: `Khách hàng ${u.name || u.phone || u.id} vừa nạp +${topupAmount.toLocaleString('vi-VN')}đ vào ví tài khoản qua SePay.`,
          type: 'system',
          createdAt: new Date().toISOString(),
          read: false
        });

        matchedStatus = 'matched';
        matchedType = 'user_topup' as any;
        matchedTitle = `Nạp Ví Cư Dân: ${u.name || u.phone} (+${topupAmount.toLocaleString('vi-VN')}đ)`;
        saveDataStore();
        console.log(`✅ [Payment Webhook] Matched & Credited Top-up ${topupAmount}đ for User ${u.name} (${u.id})`);
      }
    }
  }"""
    text = text[:idx] + entity_5_code + text[idx_end2:]
    print("Entity 5 injected successfully!")
else:
    print("Could not find anchor for Entity 5")

# 2. Add New Wallet, Admin Finance, Notifications APIs
finance_apis = """
// ==========================================
// NEW: DYNAMIC DEPOSIT INTENTS & WALLET APIS
// ==========================================

// Create Dynamic Deposit Intent (Generates Unique Topup Code + VietQR)
app.post("/api/wallets/:userId/create-deposit-intent", (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  const topupAmount = Number(amount) || 50000;
  
  let targetUser = usersStore.find(u => u.id === userId || u.phone === userId || u.email === userId);
  const effectiveUserId = targetUser?.id || userId;
  const phoneClean = targetUser?.phone ? targetUser.phone.replace(/\\D/g, '') : '';
  
  // Format code: NAP <phone> or NAP <random 5-digit number>
  const uniqueCode = phoneClean ? `NAP ${phoneClean}` : `NAP ${Math.floor(10000 + Math.random() * 90000)}`;
  
  const intent: DepositIntent = {
    id: `dep-${Date.now()}`,
    code: uniqueCode,
    userId: effectiveUserId,
    userName: targetUser?.name || 'Cư dân',
    userPhone: targetUser?.phone,
    userEmail: targetUser?.email,
    amount: topupAmount,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  depositIntentsStore.unshift(intent);
  if (depositIntentsStore.length > 500) depositIntentsStore = depositIntentsStore.slice(0, 500);
  saveDataStore();
  
  // Dynamic VietQR generator
  const bankConfig = pricingConfigStore || {
    bankName: 'MSB (Ngân hàng Hàng Hải Việt Nam)',
    accountNumber: '3028031988',
    accountHolder: 'BUI VAN HIEU'
  };
  
  const bankShort = (bankConfig.bankName || 'MSB').split(' ')[0].replace(/[^A-Z]/g, '') || 'MSB';
  const qrCodeUrl = `https://img.vietqr.io/image/${bankShort}-${bankConfig.accountNumber}-compact2.png?amount=${topupAmount}&addInfo=${encodeURIComponent(uniqueCode)}&accountName=${encodeURIComponent(bankConfig.accountHolder)}`;
  
  res.json({
    success: true,
    intent,
    qrCodeUrl,
    bankConfig,
    transferMemo: uniqueCode
  });
});

// Check Deposit Status (Polling from UI)
app.get("/api/wallets/:userId/check-deposit-status", (req, res) => {
  const { userId } = req.params;
  const { code } = req.query;
  
  let targetUser = usersStore.find(u => u.id === userId || u.phone === userId || u.email === userId);
  const effectiveUserId = targetUser?.id || userId;
  const wallet = getUserWallet(effectiveUserId);
  
  let intent = code ? depositIntentsStore.find(i => i.code === code || i.id === code) : null;
  
  res.json({
    completed: intent ? intent.status === 'completed' : false,
    balance: targetUser?.balance || wallet.availableBalance || 0,
    wallet,
    intent
  });
});

// Admin Adjust/Pump User Balance
app.post("/api/admin/users/:userId/adjust-balance", (req, res) => {
  const { userId } = req.params;
  const { amount, actionType, fundType, reason, adminName } = req.body;
  const delta = Number(amount);
  
  if (!delta || delta <= 0) {
    return res.status(400).json({ error: "Số tiền không hợp lệ. Vui lòng nhập số tiền lớn hơn 0." });
  }
  
  let targetUser = usersStore.find(u => u.id === userId || u.phone === userId || u.email === userId);
  if (!targetUser) {
    return res.status(404).json({ error: "Không tìm thấy người dùng." });
  }
  
  const wallet = getUserWallet(targetUser.id);
  const isCredit = actionType === 'credit' || !actionType;
  const actualDelta = isCredit ? delta : -delta;
  
  if (fundType === 'tokenBalance' || fundType === 'balance' || !fundType) {
    targetUser.balance = Math.max(0, (targetUser.balance || 0) + actualDelta);
    wallet.availableBalance = Math.max(0, (wallet.availableBalance || 0) + actualDelta);
    if (isCredit) {
      targetUser.totalTokensPumped = (targetUser.totalTokensPumped || 0) + delta;
    }
  } else if (fundType === 'upTinCredits') {
    targetUser.upTinCredits = Math.max(0, (targetUser.upTinCredits || 0) + actualDelta);
  } else if (fundType === 'affiliatePoints') {
    (targetUser as any).affiliatePoints = Math.max(0, ((targetUser as any).affiliatePoints || 0) + actualDelta);
  }
  
  // Record transaction log
  const txRef = `ADMIN-${Date.now()}`;
  walletTransactionsStore.unshift({
    id: `wtx-${Date.now()}`,
    userId: targetUser.id,
    userPhone: targetUser.phone,
    userEmail: targetUser.email,
    type: isCredit ? 'deposit_vietqr' : 'commission_deduct',
    amount: delta,
    description: `[ADMIN ${isCredit ? 'BƠM TIỀN' : 'TRỪ TIỀN'}] ${isCredit ? '+' : '-'}${delta.toLocaleString('vi-VN')}đ (${reason || 'Admin điều chỉnh số dư'} - Bởi: ${adminName || 'Admin Tổng'})`,
    status: 'success',
    createdAt: new Date().toLocaleString('vi-VN'),
    referenceCode: txRef
  });
  
  // User Notification
  notificationsStore.unshift({
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    targetUserId: targetUser.id,
    title: isCredit ? '🎉 Admin Đã Cộng Tiền Vào Ví Bạn' : '⚠️ Biến Động Số Dư: Admin Điều Chỉnh',
    body: `Admin đã ${isCredit ? 'cộng' : 'trừ'} ${delta.toLocaleString('vi-VN')}đ ${isCredit ? 'vào' : 'từ'} ví của bạn. Lý do: "${reason || 'Hệ thống điều chỉnh'}". Số dư mới: ${(targetUser.balance || 0).toLocaleString('vi-VN')}đ.`,
    type: 'system',
    createdAt: new Date().toISOString(),
    read: false
  });
  
  saveDataStore();
  
  res.json({
    success: true,
    message: `Đã ${isCredit ? 'cộng' : 'trừ'} thành công ${delta.toLocaleString('vi-VN')}đ cho ${targetUser.name}!`,
    user: targetUser,
    wallet
  });
});

// Admin Finance Summary & Withdrawals
app.get("/api/admin/finance/summary", (req, res) => {
  const totalDeposit = walletTransactionsStore
    .filter(t => t.type === 'deposit_vietqr' && t.status === 'success')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
  const totalPayout = walletTransactionsStore
    .filter(t => t.type === 'payout_withdraw' && t.status === 'success')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
  const pendingWithdrawals = walletTransactionsStore.filter(t => t.type === 'payout_withdraw' && t.status === 'pending');
  const recentTransactions = walletTransactionsStore.slice(0, 50);
  
  res.json({
    totalDeposit,
    totalPayout,
    pendingWithdrawalsCount: pendingWithdrawals.length,
    pendingWithdrawals,
    recentTransactions,
    usersCount: usersStore.length
  });
});

// Admin Approve / Confirm Payout
app.post("/api/admin/finance/withdrawals/:id/approve", (req, res) => {
  const { id } = req.params;
  const { adminName, transferRef } = req.body;
  
  const tx = walletTransactionsStore.find(t => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: "Không tìm thấy giao dịch rút tiền." });
  }
  
  tx.status = 'success';
  tx.description += ` | [ĐÃ CHI TIỀN] Xác nhận bởi: ${adminName || 'Admin'} - Ref: ${transferRef || 'VietQR'}`;
  
  const targetUser = usersStore.find(u => u.id === tx.userId);
  
  // User Notification
  notificationsStore.unshift({
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    targetUserId: tx.userId,
    title: '💸 Rút Tiền Thành Công!',
    body: `Yêu cầu rút tiền ${Number(tx.amount).toLocaleString('vi-VN')}đ của bạn đã được Admin chuyển khoản thành công vào tài khoản ngân hàng của bạn.`,
    type: 'order',
    createdAt: new Date().toISOString(),
    read: false
  });
  
  saveDataStore();
  res.json({ success: true, message: "Đã duyệt và xác nhận chuyển tiền thành công!", transaction: tx });
});

// Admin Reject Payout & Refund
app.post("/api/admin/finance/withdrawals/:id/reject", (req, res) => {
  const { id } = req.params;
  const { reason, adminName } = req.body;
  
  const tx = walletTransactionsStore.find(t => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: "Không tìm thấy giao dịch rút tiền." });
  }
  
  tx.status = 'failed';
  tx.description += ` | [TỪ CHỐI] Lý do: ${reason || 'Không hợp lệ'} - Bởi: ${adminName || 'Admin'}`;
  
  // Refund balance back to user
  const refundAmount = Number(tx.amount) || 0;
  let targetUser = usersStore.find(u => u.id === tx.userId);
  if (targetUser) {
    targetUser.balance = (targetUser.balance || 0) + refundAmount;
  }
  const wallet = getUserWallet(tx.userId);
  wallet.availableBalance = (wallet.availableBalance || 0) + refundAmount;
  
  // User Notification
  notificationsStore.unshift({
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    targetUserId: tx.userId,
    title: '❌ Yêu Cầu Rút Tiền Bị Từ Chối',
    body: `Yêu cầu rút tiền ${refundAmount.toLocaleString('vi-VN')}đ bị từ chối. Lý do: "${reason || 'Thông tin ngân hàng không khớp'}". Số tiền đã được hoàn trả lại vào ví của bạn.`,
    type: 'system',
    createdAt: new Date().toISOString(),
    read: false
  });
  
  saveDataStore();
  res.json({ success: true, message: "Đã từ chối và hoàn tiền về ví thành công!", transaction: tx });
});

// Notification Endpoints
app.get("/api/notifications-feed", (req, res) => {
  const { userId } = req.query;
  if (userId) {
    const list = notificationsStore.filter(n => n.targetUserId === userId || n.targetUserId === 'ALL' || (userId === 'admin' && n.targetUserId === 'admin'));
    return res.json(list.slice(0, 50));
  }
  res.json(notificationsStore.slice(0, 50));
});

app.post("/api/notifications-feed/mark-read", (req, res) => {
  const { id, userId } = req.body;
  if (id) {
    const notif = notificationsStore.find(n => n.id === id);
    if (notif) notif.read = true;
  } else if (userId) {
    notificationsStore.forEach(n => {
      if (n.targetUserId === userId || n.targetUserId === 'ALL' || (userId === 'admin' && n.targetUserId === 'admin')) {
        n.read = true;
      }
    });
  }
  saveDataStore();
  res.json({ success: true });
});
"""

# Append finance_apis before startServer
idx_start = text.find('async function startServer()')
if idx_start != -1:
    text = text[:idx_start] + finance_apis + "\n\n" + text[idx_start:]
    print("Finance APIs inserted before startServer")
else:
    print("Could not find startServer")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("server.ts update finished successfully!")
