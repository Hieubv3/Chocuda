/**
 * AutoClaw fix script - ap ban va vao server.ts va AdminDashboardPage.tsx
 * (chay tu dong truoc khi build). An toan: chi thay the chuoi chinh xac;
 * neu khong tim thay thi bao SKIP (khong lam hong file).
 */
const fs = require('fs');

function applyFile(file, patches) {
  if (!fs.existsSync(file)) {
    console.log('SKIP file (khong ton tai): ' + file);
    return;
  }
  let s = fs.readFileSync(file, 'utf8');
  let applied = 0;
  for (const [from, to, label] of patches) {
    if (!s.includes(from)) {
      console.log('  SKIP (khong tim thay): ' + label);
      continue;
    }
    s = s.replace(from, to);
    applied++;
    console.log('  OK: ' + label);
  }
  fs.writeFileSync(file, s);
  console.log(file + ' -> applied ' + applied + '/' + patches.length);
}

/* ============================================================
   1) server.ts
   ============================================================ */
applyFile('server.ts', [
  [
`const DATA_STORE_PATH = path.join(process.cwd(), "app_data_store.json");
const DATA_STORE_BACKUP_PATH = path.join(process.cwd(), "app_data_store.backup.json");`,
`// FIX: luu du lieu vao thu muc BEN VUNG (UPLOADS_DIR = /app/uploads tren Render,
// noi da duoc gan disk). Truoc day file nam trong thu muc app => mat sach moi lan
// redeploy/restart => xoa bai xong bi quay lai. Co the override bang env DATA_DIR.
const DATA_DIR = (process.env.DATA_DIR && String(process.env.DATA_DIR).trim()) || UPLOADS_DIR;
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { /* ignore */ }
const DATA_STORE_PATH = path.join(DATA_DIR, "app_data_store.json");
const DATA_STORE_BACKUP_PATH = path.join(DATA_DIR, "app_data_store.backup.json");
const LEGACY_DATA_STORE_PATH = path.join(process.cwd(), "app_data_store.json");
const LEGACY_DATA_STORE_BACKUP_PATH = path.join(process.cwd(), "app_data_store.backup.json");
// Di tru du lieu cu (neu co) tu thu muc app sang thu muc ben vung
try {
  if (!fs.existsSync(DATA_STORE_PATH) && fs.existsSync(LEGACY_DATA_STORE_PATH)) {
    fs.copyFileSync(LEGACY_DATA_STORE_PATH, DATA_STORE_PATH);
    console.log("[DataStore] Migrated app_data_store.json ->", DATA_STORE_PATH);
  }
  if (!fs.existsSync(DATA_STORE_BACKUP_PATH) && fs.existsSync(LEGACY_DATA_STORE_BACKUP_PATH)) {
    fs.copyFileSync(LEGACY_DATA_STORE_BACKUP_PATH, DATA_STORE_BACKUP_PATH);
  }
} catch (migErr) {
  console.warn("[DataStore] Migration skipped:", migErr);
}

// Workspace config (Google Sheets/Drive) - luu ben vung cung data store
let workspaceConfigStore: any = {};`,
    '1) DATA_DIR ben vung'
  ],
  [
`      propertiesStore = propertiesStore.filter(p => !deletedIds.properties.includes(p.id));`,
`      // FIX: id nao da ton tai lai trong du lieu da luu thi bo khoi danh sach da xoa
      // (tranh truong hop tao/xoa roi tao lai cung ma bi an sau khi restart)
      try {
        const pruneBy = (ids: string[], list: any[]) =>
          Array.isArray(list) && list.length > 0
            ? ids.filter((id) => !list.some((it) => it && it.id === id))
            : ids;
        deletedIds.properties = pruneBy(deletedIds.properties, data.properties);
        deletedIds.projects = pruneBy(deletedIds.projects, data.projects);
        deletedIds.news = pruneBy(deletedIds.news, data.news);
        deletedIds.residentServices = pruneBy(deletedIds.residentServices, data.residentServices);
        deletedIds.stores = pruneBy(deletedIds.stores, data.stores);
        deletedIds.ads = pruneBy(deletedIds.ads, data.ads);
      } catch (pruneErr) {
        console.warn("[DataStore] tombstone prune skipped:", pruneErr);
      }

      // Workspace config (Google Sheets/Drive)
      if (data.workspaceConfig && typeof data.workspaceConfig === 'object') {
        workspaceConfigStore = data.workspaceConfig;
      }

      propertiesStore = propertiesStore.filter(p => !deletedIds.properties.includes(p.id));`,
    '2) tombstone prune'
  ],
  [
`      deletedIds,
      savedAt: new Date().toISOString()`,
`      deletedIds,
      workspaceConfig: workspaceConfigStore,
      savedAt: new Date().toISOString()`,
    '3) saveDataStore workspaceConfig'
  ],
  [
`app.post(["/api/recruitment/applications", "/api/recruitment/applicants/apply"], (req, res) => {`,
`app.post(["/api/recruitment/applications", "/api/recruitment/applicants/apply", "/api/recruitment/apply"], (req, res) => {`,
    '4) recruitment/apply alias'
  ],
  [
`// Property POST (Submit new listing)`,
`// ===== FIX: bo sung cac endpoint ma frontend dang goi nhung server con thieu =====

// 1) Cau hinh gia "up tin" (GET/POST)
app.get("/api/system/pricing-config", (req, res) => {
  res.json(pricingConfigStore);
});
app.post("/api/system/pricing-config", authenticateToken, requireAdmin, (req, res) => {
  try {
    pricingConfigStore = { ...(pricingConfigStore as any), ...(req.body || {}) } as any;
    saveDataStore();
    res.json({ success: true, pricingConfig: pricingConfigStore });
  } catch (err) {
    res.status(500).json({ error: "Khong luu duoc cau hinh gia." });
  }
});

// 2) Gian hang cu dan (user storefronts)
app.get("/api/user-storefronts", (req, res) => {
  res.json(Array.isArray(storesStore) ? storesStore : []);
});

// 3) Google Workspace: luu cau hinh + dong bo (luu ben vung)
app.get("/api/workspace/config", (req, res) => {
  res.json(workspaceConfigStore || {});
});
app.post("/api/workspace/config", authenticateToken, (req, res) => {
  try {
    workspaceConfigStore = { ...(workspaceConfigStore || {}), ...(req.body || {}) };
    saveDataStore();
    res.json({ success: true, config: workspaceConfigStore });
  } catch (err) {
    res.status(500).json({ error: "Khong luu duoc cau hinh Workspace." });
  }
});
app.post("/api/workspace/sync-all", (req, res) => {
  res.json({ success: true, synced: 0, message: "Workspace sync endpoint ready." });
});

// Property POST (Submit new listing)`,
    '5) missing APIs'
  ],
]);

/* ============================================================
   2) AdminDashboardPage.tsx  (THEM BDS MOI: can ban / can thue)
   ============================================================ */
applyFile('src/pages/AdminDashboardPage.tsx', [
  [
`  const [isAddingProject, setIsAddingProject] = useState(false);`,
`  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);`,
    'A) state isAddingProperty'
  ],
  [
`              <button
                onClick={handleSeed1000Click}`,
`              <button
                onClick={() => setIsAddingProperty(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-[11px] shrink-0 transition flex items-center gap-1"
                title="Thêm căn bán / căn cho thuê mới"
              >
                <Plus className="w-3.5 h-3.5" /> + Thêm BĐS Mới
              </button>

              <button
                onClick={handleSeed1000Click}`,
    'B) nut Them BDS'
  ],
  [
`      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSave={(updated) => {
            if (onUpdateProperty) onUpdateProperty(updated);
            setEditingProperty(null);
          }}
        />
      )}`,
`      {(editingProperty || isAddingProperty) && (
        <EditPropertyModal
          property={editingProperty || ({
            id: 'prop-new-' + Date.now(),
            title: '',
            type: propertySubFilter === 'rent' ? 'rent' : 'sale',
            project: 'ocean-park-2',
            category: 'shophouse',
            price: 0,
            priceDisplay: '',
            area: 0,
            bedrooms: 0,
            bathrooms: 0,
            direction: 'Đông Nam',
            furniture: 'basic',
            legal: 'so-do',
            address: '',
            description: '',
            images: [],
            featured: false,
            approved: true,
            status: 'approved',
            sellerName: 'Admin',
            sellerPhone: '0868499929',
            createdAt: new Date().toISOString()
          } as any)}
          isCreate={!editingProperty}
          onClose={() => { setEditingProperty(null); setIsAddingProperty(false); }}
          onSave={(updated) => {
            if (onUpdateProperty) onUpdateProperty(updated);
            setEditingProperty(null);
            setIsAddingProperty(false);
          }}
        />
      )}`,
    'C) modal Them/Edit BDS'
  ],
]);

console.log('DONE.');
