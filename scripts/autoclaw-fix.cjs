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
  /* ---- 1) DATA_DIR ben vung ---- */
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

  /* ---- 2) Supabase: chen helper truoc loadDataStore ---- */
  [
`function loadDataStore() {`,
`// ===== SUPABASE: luu tru BEN VUNG cho du lieu quan trong (bai dang, khach hang, user) =====
// Cau hinh bang env tren Render:
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (service role key)
//   SUPABASE_TABLE=app_state            (tuy chon, mac dinh: app_state)
const SUPABASE_URL = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\\/+$/, "");
const SUPABASE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
const SUPABASE_TABLE = String(process.env.SUPABASE_TABLE || "app_state").trim();
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_KEY);
const SUPABASE_ROW_ID = "main";

function supabaseHeaders(extra: any) {
  const h: any = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
  };
  if (extra) {
    Object.keys(extra).forEach(function (k) { h[k] = extra[k]; });
  }
  return h;
}

async function loadFromSupabase() {
  if (!SUPABASE_ENABLED) {
    console.log("[Supabase] Chua cau hinh (thieu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) -> dung file local.");
    return;
  }
  try {
    const url = SUPABASE_URL + "/rest/v1/" + SUPABASE_TABLE + "?id=eq." + SUPABASE_ROW_ID + "&select=data,updated_at";
    const res = await fetch(url, { headers: supabaseHeaders(null) });
    if (!res.ok) {
      console.warn("[Supabase] Load that bai:", res.status, String(await res.text()).slice(0, 200));
      return;
    }
    const rows: any = await res.json();
    if (!Array.isArray(rows) || rows.length === 0 || !rows[0] || !rows[0].data) {
      console.warn("[Supabase] Chua co du lieu tren Supabase -> se day trang thai hien tai len (lan luu ke tiep).");
      try { saveDataStore(); } catch (e) { /* ignore */ }
      return;
    }
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(rows[0].data, null, 2), "utf-8");
    loadDataStore();
    console.log("[Supabase] Da nap du lieu tu Supabase (updated_at: " + (rows[0].updated_at || "?") + ")");
  } catch (err) {
    console.warn("[Supabase] Load loi:", err);
  }
}

let supabaseSaveTimer: any = null;
let supabasePending = "";
function scheduleSupabaseSave(jsonStr: string) {
  if (!SUPABASE_ENABLED) return;
  supabasePending = jsonStr;
  if (supabaseSaveTimer) return;
  supabaseSaveTimer = setTimeout(async function () {
    supabaseSaveTimer = null;
    const payload = supabasePending;
    supabasePending = "";
    if (!payload) return;
    try {
      const url = SUPABASE_URL + "/rest/v1/" + SUPABASE_TABLE;
      const res = await fetch(url, {
        method: "POST",
        headers: supabaseHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify([{ id: SUPABASE_ROW_ID, data: JSON.parse(payload), updated_at: new Date().toISOString() }])
      });
      if (!res.ok) {
        console.warn("[Supabase] Save that bai:", res.status, String(await res.text()).slice(0, 200));
      }
    } catch (err) {
      console.warn("[Supabase] Save loi:", err);
    }
  }, 1500);
}

function loadDataStore() {`,
    '1b) Supabase helpers'
  ],

  /* ---- 3) tombstone prune ---- */
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

  /* ---- 4) saveDataStore: workspace + day len Supabase ---- */
  [
`      deletedIds,
      savedAt: new Date().toISOString()`,
`      deletedIds,
      workspaceConfig: workspaceConfigStore,
      savedAt: new Date().toISOString()`,
    '3) saveDataStore workspaceConfig'
  ],
  [
`    fs.writeFileSync(DATA_STORE_BACKUP_PATH, jsonStr, "utf-8");`,
`    fs.writeFileSync(DATA_STORE_BACKUP_PATH, jsonStr, "utf-8");
    // FIX: day du lieu len SUPABASE (luu tru ben vung)
    scheduleSupabaseSave(jsonStr);`,
    '4) saveDataStore -> Supabase'
  ],

  /* ---- 5) goi load Supabase khi khoi dong ---- */
  [
`// Initial load on server start
loadDataStore();`,
`// Initial load on server start
loadDataStore();

// FIX: sau khi load file, thu nap them du lieu BEN VUNG tu Supabase (neu da cau hinh)
loadFromSupabase();`,
    '5) loadFromSupabase khi start'
  ],

  /* ---- 6) recruitment apply alias ---- */
  [
`app.post(["/api/recruitment/applications", "/api/recruitment/applicants/apply"], (req, res) => {`,
`app.post(["/api/recruitment/applications", "/api/recruitment/applicants/apply", "/api/recruitment/apply"], (req, res) => {`,
    '6) recruitment/apply alias'
  ],

  /* ---- 7) cac API con thieu ---- */
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

// 4) Trang thai luu tru (kiem tra Supabase)
app.get("/api/system/storage-status", (req, res) => {
  res.json({
    supabaseEnabled: SUPABASE_ENABLED,
    supabaseTable: SUPABASE_TABLE,
    dataFile: DATA_STORE_PATH,
    hasSupabaseUrl: Boolean(SUPABASE_URL)
  });
});

// Property POST (Submit new listing)`,
    '7) missing APIs + storage-status'
  ],
]);

/* ============================================================
   2) AdminDashboardPage.tsx  (THEM BDS MOI: can ban / can thue)
   ============================================================ */
applyFile('src/pages/AdminDashboardPage.tsx', [
  [
`import { AdminRecruitmentManager } from '../components/AdminRecruitmentManager';`,
`import { AdminRecruitmentManager } from '../components/AdminRecruitmentManager';
import { AdminOverviewStats } from '../components/AdminOverviewStats';`,
    'A0) import AdminOverviewStats'
  ],
  [
`          <div className="lg:hidden bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-between gap-2">`,
`          {/* THONG KE TOAN HE THONG - dem tat ca hang muc hien thi tren web */}
          <AdminOverviewStats />

          <div className="lg:hidden bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-between gap-2">`,
    'A0b) render AdminOverviewStats'
  ],
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
