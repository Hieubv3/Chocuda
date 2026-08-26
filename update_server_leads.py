with open('server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target_block = """app.post("/api/contacts", (req, res) => {
  const { fullName, phone, email, projectInterest, propertyId, propertyTitle, sellerName, sellerPhone, note, preferredTime, type } = req.body;
  
  if (!fullName || !phone) {
    return res.status(400).json({ error: "Vui lòng nhập Họ tên và Số điện thoại." });
  }

  const newLead: LeadContact = {
    id: `lead-${Date.now()}`,
    fullName,
    phone,
    email: email || "",
    projectInterest: projectInterest || "Vinhomes Ocean Park 2",
    propertyId,
    propertyTitle,
    sellerName: sellerName || "",
    sellerPhone: sellerPhone || "",
    note: note || "",
    preferredTime: preferredTime || "Giờ hành chính",
    type: type || "consultation",
    status: "new",
    createdAt: new Date().toISOString()
  };

  contactsStore.unshift(newLead);
  res.status(201).json({ message: "Đặt lịch tư vấn thành công! Khách hàng sẽ kết nối trực tiếp với người đăng tin.", lead: newLead });
});

app.get("/api/contacts", (req, res) => {
  res.json(contactsStore);
});

app.patch("/api/contacts/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const lead = contactsStore.find(c => c.id === id);
  if (!lead) {
    return res.status(404).json({ error: "Không tìm thấy yêu cầu" });
  }
  if (status) lead.status = status;
  res.json({ message: "Cập nhật trạng thái thành công", lead });
});

app.delete("/api/contacts/:id", (req, res) => {
  const { id } = req.params;
  contactsStore = contactsStore.filter(c => c.id !== id);
  res.json({ message: "Xóa yêu cầu thành công" });
});"""

replacement_block = """// ==================== LEADS & CUSTOMER CRM (User Private CRM & Admin Supervised) ====================
// Get leads (Filtered by User for personal CRM, or full list for Admin)
app.get(["/api/leads", "/api/contacts"], (req, res) => {
  const { userId, phone, sellerPhone, status, search, isAdmin, source } = req.query as Record<string, string>;
  let result = [...contactsStore];

  // If specific user requested, return only their customer leads
  if (userId || sellerPhone || phone) {
    result = result.filter(c => {
      const matchUser = userId && (c.userId === userId || c.assignedStaffId === userId);
      const matchPhone = (sellerPhone && c.sellerPhone === sellerPhone) || (phone && (c.sellerPhone === phone || c.phone === phone));
      return matchUser || matchPhone;
    });
  }

  // Filter by status if provided
  if (status && status !== 'all') {
    result = result.filter(c => c.status === status);
  }

  // Filter by source if provided
  if (source && source !== 'all') {
    result = result.filter(c => c.source === source);
  }

  // Search filter
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(c => 
      c.fullName.toLowerCase().includes(s) ||
      c.phone.includes(s) ||
      (c.projectInterest && c.projectInterest.toLowerCase().includes(s)) ||
      (c.propertyTitle && c.propertyTitle.toLowerCase().includes(s)) ||
      (c.note && c.note.toLowerCase().includes(s))
    );
  }

  res.json(result);
});

// Create new customer lead
app.post(["/api/leads", "/api/contacts"], (req, res) => {
  const {
    fullName, phone, email, projectInterest, propertyId, propertyTitle,
    serviceId, serviceTitle, storeId, storeName, userId, sellerName, sellerPhone,
    note, preferredTime, type, source, dealValueVnd, nextAppointment
  } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: "Vui lòng nhập Họ tên và Số điện thoại khách hàng." });
  }

  // Try to associate with property seller or store owner if not provided
  let resolvedUserId = userId;
  let resolvedSellerName = sellerName;
  let resolvedSellerPhone = sellerPhone;

  if (propertyId && !resolvedUserId) {
    const p = propertiesStore.find(item => item.id === propertyId);
    if (p) {
      resolvedUserId = p.userId;
      resolvedSellerName = resolvedSellerName || p.contactName;
      resolvedSellerPhone = resolvedSellerPhone || p.contactPhone;
    }
  }

  if (storeId && !resolvedUserId) {
    const st = storesStore.find(item => item.id === storeId);
    if (st) {
      resolvedUserId = st.ownerId;
      resolvedSellerName = resolvedSellerName || st.ownerName;
      resolvedSellerPhone = resolvedSellerPhone || st.phone;
    }
  }

  const newLead: LeadContact = {
    id: `lead-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    fullName,
    phone,
    email: email || "",
    projectInterest: projectInterest || (propertyTitle ? `Quan tâm: ${propertyTitle}` : "Vinhomes Chợ Cư Dân"),
    propertyId,
    propertyTitle,
    serviceId,
    serviceTitle,
    storeId,
    storeName,
    userId: resolvedUserId || "",
    sellerName: resolvedSellerName || "",
    sellerPhone: resolvedSellerPhone || "",
    note: note || "",
    preferredTime: preferredTime || "Giờ hành chính",
    type: type || (propertyId ? "consultation" : serviceId ? "service_booking" : storeId ? "store_order" : "general"),
    source: source || (propertyId ? "bds" : serviceId ? "technician" : storeId ? "resident_market" : "manual"),
    status: "new",
    dealValueVnd: dealValueVnd ? Number(dealValueVnd) : undefined,
    nextAppointment: nextAppointment || "",
    careLogs: [
      {
        id: `care-${Date.now()}`,
        timestamp: new Date().toISOString(),
        note: `Tiếp nhận khách hàng mới: ${fullName} (${phone}).`,
        authorName: resolvedSellerName || "Hệ Thống",
        actionType: "status_change"
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  contactsStore.unshift(newLead);
  saveDataStore();
  console.log(`✅ [CRM Lead] New lead recorded: ${fullName} (${phone}) -> Assigned: ${resolvedSellerName || 'General'}`);
  res.status(201).json({ message: "Tiếp nhận thông tin khách hàng thành công!", lead: newLead });
});

// Update lead details / status / care notes
app.put(["/api/leads/:id", "/api/contacts/:id"], (req, res) => {
  const { id } = req.params;
  const index = contactsStore.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Không tìm thấy thông tin khách hàng." });
  }

  const existing = contactsStore[index];
  const updated: LeadContact = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  // If care log passed, append cleanly
  if (req.body.newCareLog) {
    const newLog = {
      id: `care-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      note: req.body.newCareLog.note || "Đã cập nhật thông tin chăm sóc",
      authorName: req.body.newCareLog.authorName || "Người phụ trách",
      authorId: req.body.newCareLog.authorId,
      actionType: req.body.newCareLog.actionType || "note"
    };
    updated.careLogs = [newLog, ...(updated.careLogs || [])];
  }

  contactsStore[index] = updated;
  saveDataStore();
  res.json({ message: "Cập nhật dữ liệu khách hàng thành công!", lead: updated });
});

app.patch(["/api/leads/:id", "/api/contacts/:id"], (req, res) => {
  const { id } = req.params;
  const lead = contactsStore.find(c => c.id === id);
  if (!lead) {
    return res.status(404).json({ error: "Không tìm thấy yêu cầu" });
  }
  if (req.body.status) lead.status = req.body.status;
  if (req.body.note) lead.note = req.body.note;
  if (req.body.hasIncident !== undefined) lead.hasIncident = req.body.hasIncident;
  if (req.body.incidentDescription !== undefined) lead.incidentDescription = req.body.incidentDescription;
  if (req.body.adminInterventionNote !== undefined) lead.adminInterventionNote = req.body.adminInterventionNote;
  lead.updatedAt = new Date().toISOString();
  saveDataStore();
  res.json({ message: "Cập nhật trạng thái thành công", lead });
});

// Add care log to a lead
app.post("/api/leads/:id/care-logs", (req, res) => {
  const { id } = req.params;
  const lead = contactsStore.find(c => c.id === id);
  if (!lead) {
    return res.status(404).json({ error: "Không tìm thấy khách hàng." });
  }

  const { note, authorName, authorId, actionType } = req.body;
  if (!note) {
    return res.status(400).json({ error: "Vui lòng nhập nội dung ghi chú chăm sóc." });
  }

  const logEntry = {
    id: `care-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    note,
    authorName: authorName || "Người chăm sóc",
    authorId,
    actionType: actionType || "note"
  };

  lead.careLogs = [logEntry, ...(lead.careLogs || [])];
  lead.updatedAt = new Date().toISOString();
  saveDataStore();
  res.status(201).json({ message: "Đã thêm nhật ký chăm sóc!", lead, careLog: logEntry });
});

// Delete lead
app.delete(["/api/leads/:id", "/api/contacts/:id"], (req, res) => {
  const { id } = req.params;
  contactsStore = contactsStore.filter(c => c.id !== id);
  saveDataStore();
  res.json({ message: "Đã xóa khách hàng khỏi danh sách thành công." });
});"""

if target_block in text:
    text = text.replace(target_block, replacement_block, 1)
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced contacts endpoints with full CRM leads system successfully!")
else:
    print("Target block not matched exactly, checking line numbers...")
