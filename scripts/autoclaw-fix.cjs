/**
 * AutoClaw fix script — chay truoc khi build (`node scripts/autoclaw-fix.cjs`).
 * AN TOAN: moi thay doi deu co GUARD — neu da co san thi BO QUA (khong trung khai bao,
 * khong lam fail build). Neu khong tim thay moc thi bao SKIP.
 */
const fs = require('fs');

function applyFile(file, patches) {
  if (!fs.existsSync(file)) {
    console.log('SKIP file (khong ton tai): ' + file);
    return;
  }
  let s = fs.readFileSync(file, 'utf8');
  let applied = 0;
  for (const p of patches) {
    const from = p[0], to = p[1], label = p[2], guard = p[3];
    if (guard && s.indexOf(guard) !== -1) {
      console.log('  BO QUA (da co san): ' + label);
      continue;
    }
    if (s.indexOf(from) === -1) {
      console.log('  SKIP (khong tim thay moc): ' + label);
      continue;
    }
    s = s.replace(from, to);
    applied++;
    console.log('  OK: ' + label);
  }
  fs.writeFileSync(file, s);
  console.log(file + ' -> ap dung ' + applied + '/' + patches.length);
}

/* ============================================================
   1) server.ts
   ============================================================ */
applyFile('server.ts', [
  [
`const DATA_STORE_PATH = path.join(process.cwd(), "app_data_store.json");
const DATA_STORE_BACKUP_PATH = path.join(process.cwd(), "app_data_store.backup.json");`,
`// FIX: luu du lieu vao thu muc BEN VUNG (UPLOADS_DIR = /app/uploads tren Render)
const DATA_DIR = (process.env.DATA_DIR && String(process.env.DATA_DIR).trim()) || UPLOADS_DIR;
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { /* ignore */ }
const DATA_STORE_PATH = path.join(DATA_DIR, "app_data_store.json");
const DATA_STORE_BACKUP_PATH = path.join(DATA_DIR, "app_data_store.backup.json");
const LEGACY_DATA_STORE_PATH = path.join(process.cwd(), "app_data_store.json");
const LEGACY_DATA_STORE_BACKUP_PATH = path.join(process.cwd(), "app_data_store.backup.json");
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
`,
    '1) DATA_DIR ben vung',
    'const DATA_DIR ='
  ],
  [
`function loadDataStore() {`,
`// ===== SUPABASE: luu tru ben vung (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY hoac VITE_*) =====
const SUPABASE_URL = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\\/+$/, "");
const SUPABASE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
const SUPABASE_TABLE = String(process.env.SUPABASE_TABLE || "app_state").trim();
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_KEY);
const SUPABASE_ROW_ID = "main";

function supabaseHeaders(extra) {
  const h = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
  };
  if (extra) Object.keys(extra).forEach(function (k) { h[k] = extra[k]; });
  return h;
}

async function loadFromSupabase() {
  if (!SUPABASE_ENABLED) {
    console.log("[Supabase] Chua cau hinh -> dung file local.");
    return;
  }
  try {
    const url = SUPABASE_URL + "/rest/v1/" + SUPABASE_TABLE + "?id=eq." + SUPABASE_ROW_ID + "&select=data,updated_at";
    const res = await fetch(url, { headers: supabaseHeaders(null) });
    if (!res.ok) {
      console.warn("[Supabase] Load that bai:", res.status, String(await res.text()).slice(0, 200));
      return;
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0 || !rows[0] || !rows[0].data) {
      console.warn("[Supabase] Chua co du lieu -> se day trang thai hien tai len.");
      try { saveDataStore(); } catch (e) { /* ignore */ }
      return;
    }
    // CHI phuc hoi tu Supabase khi: file local KHONG CON, HOAC du lieu Supabase DAY DU HON
    // (tranh ghi de nguoc lam mat du lieu; dong thoi tu phuc hoi neu local bi reset ve seed).
    const __aggCount = function (d) {
      if (!d || typeof d !== 'object') return 0;
      const keys = ['properties','projects','news','residentServices','stores','users','recruitmentJobs','candidateProfiles','walletTransactions','paymentOrders','messages','trash'];
      let n = 0;
      keys.forEach(function (k) { n += Array.isArray(d[k]) ? d[k].length : 0; });
      return n;
    };
    let __localAgg = -1;
    try {
      if (fs.existsSync(DATA_STORE_PATH)) {
        __localAgg = __aggCount(JSON.parse(fs.readFileSync(DATA_STORE_PATH, "utf-8")));
      }
    } catch (e) { __localAgg = -1; }
    const __supaAgg = __aggCount(rows[0].data);
    if (__localAgg === -1 || (__supaAgg > __localAgg && __supaAgg > 0)) {
      fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(rows[0].data, null, 2), "utf-8");
      loadDataStore();
      console.log("[Supabase] Phuc hoi du lieu tu Supabase (localAgg=" + __localAgg + ", supaAgg=" + __supaAgg + ").");
    } else {
      console.log("[Supabase] File local day du -> giu nguyen, day len Supabase de dong bo.");
      try { saveDataStore(); } catch (e) { /* ignore */ }
    }
  } catch (err) {
    console.warn("[Supabase] Load loi:", err);
  }
}

let supabaseSaveTimer = null;
let supabasePending = "";
function scheduleSupabaseSave(jsonStr) {
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
      if (!res.ok) console.warn("[Supabase] Save that bai:", res.status, String(await res.text()).slice(0, 200));
    } catch (err) {
      console.warn("[Supabase] Save loi:", err);
    }
  }, 1500);
}

function loadDataStore() {`,
    '1b) Supabase helpers',
    'const SUPABASE_ENABLED ='
  ],
  [
`      propertiesStore = propertiesStore.filter(p => !deletedIds.properties.includes(p.id));`,
`      try {
        const pruneBy = (ids, list) =>
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

      propertiesStore = propertiesStore.filter(p => !deletedIds.properties.includes(p.id));`,
    '2) tombstone prune',
    'const pruneBy ='
  ],
  [
`    fs.writeFileSync(DATA_STORE_BACKUP_PATH, jsonStr, "utf-8");`,
`    fs.writeFileSync(DATA_STORE_BACKUP_PATH, jsonStr, "utf-8");
    scheduleSupabaseSave(jsonStr);`,
    '3) day len Supabase sau khi luu',
    'scheduleSupabaseSave(jsonStr);'
  ],
  [
`// Initial load on server start
loadDataStore();`,
`// Initial load on server start
loadDataStore();

loadFromSupabase();`,
    '4) load tu Supabase khi start',
    'loadFromSupabase();'
  ],
  [
`app.post(["/api/recruitment/applications", "/api/recruitment/applicants/apply"], (req, res) => {`,
`app.post(["/api/recruitment/applications", "/api/recruitment/applicants/apply", "/api/recruitment/apply"], (req, res) => {`,
    '5) recruitment/apply alias',
    '"/api/recruitment/apply"'
  ],
  [
`// Property POST (Submit new listing)`,
`// ===== Bo sung API con thieu =====
app.get("/api/system/pricing-config", (req, res) => {
  res.json(pricingConfigStore);
});
app.post("/api/system/pricing-config", authenticateToken, requireAdmin, (req, res) => {
  try {
    pricingConfigStore = { ...(pricingConfigStore || {}), ...(req.body || {}) };
    saveDataStore();
    res.json({ success: true, pricingConfig: pricingConfigStore });
  } catch (err) {
    res.status(500).json({ error: "Khong luu duoc cau hinh gia." });
  }
});

app.get("/api/user-storefronts", (req, res) => {
  res.json(Array.isArray(storesStore) ? storesStore : []);
});

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

app.get("/api/system/storage-status", (req, res) => {
  res.json({
    supabaseEnabled: SUPABASE_ENABLED,
    supabaseTable: SUPABASE_TABLE,
    dataFile: DATA_STORE_PATH,
    hasSupabaseUrl: Boolean(SUPABASE_URL)
  });
});

// Property POST (Submit new listing)`,
    '6) API con thieu + storage-status',
    '/api/system/storage-status'
  ],
]);

/* ============================================================
   2) AdminDashboardPage.tsx (them BDS) - co GUARD
   ============================================================ */
applyFile('src/pages/AdminDashboardPage.tsx', [
  [
`import { AdminRecruitmentManager } from '../components/AdminRecruitmentManager';`,
`import { AdminRecruitmentManager } from '../components/AdminRecruitmentManager';
import { AdminOverviewStats } from '../components/AdminOverviewStats';`,
    'A0) import AdminOverviewStats',
    'AdminOverviewStats'
  ],
  [
`          <div className="lg:hidden bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-between gap-2">`,
`          <AdminOverviewStats />

          <div className="lg:hidden bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-between gap-2">`,
    'A0b) render AdminOverviewStats',
    '<AdminOverviewStats />'
  ],
  [
`  const [isAddingProject, setIsAddingProject] = useState(false);`,
`  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);`,
    'A) state isAddingProperty',
    'isAddingProperty'
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
    'B) nut Them BDS',
    'Thêm BĐS Mới'
  ],

  [
`{isSubNavDropdownOpen && (
            <div className="lg:hidden bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-xl grid grid-cols-2 gap-1.5 text-xs animate-in fade-in duration-150">
              <button
                onClick={() => { handleSelectMainTab('bds'); setActiveTab('properties'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-emerald-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4" /> 1. BĐS ({properties.length})
              </button>
              <button
                onClick={() => { handleSelectMainTab('developer_units'); setActiveTab('developer_units'); setDevSubTab('matbang'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-violet-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4" /> 2. Bảng Hàng CĐT
              </button>
              <button
                onClick={() => { handleSelectMainTab('technicians'); setActiveTab('resident_services_mgmt'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-orange-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" /> 3. Thợ ({adminResidentServices.length})
              </button>
              <button
                onClick={() => { handleSelectMainTab('recruitment'); setActiveTab('recruitment_mgmt'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-teal-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Briefcase className="w-4 h-4" /> 4. Tuyển Dụng
              </button>
              <button
                onClick={() => { handleSelectMainTab('resident_market'); setActiveTab('stores_mgmt'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Store className="w-4 h-4" /> 5. Chợ ({adminStores.length})
              </button>
              <button
                onClick={() => { handleSelectMainTab('users_leads'); setActiveTab('users'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-blue-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" /> 6. Thành Viên
              </button>
              <button
                onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-rose-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> 7. Quảng Cáo
              </button>
              <button
                onClick={() => { handleSelectMainTab('tools'); setActiveTab('analytics'); setIsSubNavDropdownOpen(false); }}
                className="col-span-2 p-2 bg-slate-900 text-indigo-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Settings className="w-4 h-4" /> 8. Công Cụ & Bot Hệ Thống
              </button>
            </div>
          )}`,
`          {/* ADMIN_ICON_MENU_4x2 — menu chinh dang luoi icon, thu gon/mo rong */}
          {isSubNavDropdownOpen && (
            <div className="lg:hidden bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-xl grid grid-cols-4 gap-1.5 animate-in fade-in duration-150">
              <button
                onClick={() => { handleSelectMainTab('bds'); setActiveTab('properties'); setIsSubNavDropdownOpen(false); }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 active:scale-95 transition"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[9px] font-black leading-tight text-center">1. BĐS</span>
              </button>
              <button
                onClick={() => { handleSelectMainTab('developer_units'); setActiveTab('developer_units'); setIsSubNavDropdownOpen(false); }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-slate-900 border border-slate-800 text-violet-400 active:scale-95 transition"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-[9px] font-black leading-tight text-center">2. Bảng CĐT</span>
              </button>
              <button
                onClick={() => { handleSelectMainTab('technicians'); setActiveTab('resident_services_mgmt'); setIsSubNavDropdownOpen(false); }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-slate-900 border border-slate-800 text-orange-400 active:scale-95 transition"
              >
                <Wrench className="w-4 h-4" />
                <span className="text-[9px] font-black leading-tight text-center">3. Thợ</span>
              </button>
              <button
                onClick={() => { handleSelectMainTab('recruitment'); setActiveTab('recruitment_mgmt'); setIsSubNavDropdownOpen(false); }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-slate-900 border border-slate-800 text-teal-400 active:scale-95 transition"
              >
                <Briefcase className="w-4 h-4" />
                <span className="text-[9px] font-black leading-tight text-center">4. Tuyển Dụng</span>
              </button>
              <button
                onClick={() => { handleSelectMainTab('resident_market'); setActiveTab('stores_mgmt'); setIsSubNavDropdownOpen(false); }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 active:scale-95 transition"
              >
                <Store className="w-4 h-4" />
                <span className="text-[9px] font-black leading-tight text-center">5. Chợ Cư Dân</span>
              </button>
              <button
                onClick={() => { handleSelectMainTab('users_leads'); setActiveTab('users'); setIsSubNavDropdownOpen(false); }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 active:scale-95 transition"
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-[9px] font-black leading-tight text-center">6. Thành Viên</span>
              </button>
              <button
                onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads'); setIsSubNavDropdownOpen(false); }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[9px] font-black leading-tight text-center">7. Quảng Cáo</span>
              </button>
              <button
                onClick={() => { handleSelectMainTab('tools'); setActiveTab('analytics'); setIsSubNavDropdownOpen(false); }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 active:scale-95 transition"
              >
                <Settings className="w-4 h-4" />
                <span className="text-[9px] font-black leading-tight text-center">8. Công Cụ</span>
              </button>
            </div>
          )}`,
    'D) menu mobile = luoi 4x2 icon (kieu B)',
    'ADMIN_ICON_MENU_4x2'
  ],

  [
`{isSubNavDropdownOpen ? 'Đóng Menu ▲' : 'Chọn Phân Hệ ▼'}`,
`{isSubNavDropdownOpen ? 'Thu gọn ▲' : 'Mở menu ▼'}`,
    'D2) doi chu nut thu gon/mo rong',
    'Thu gọn ▲'
  ],
]);

/* ============================================================
   3) ResidentServicesPage.tsx — o danh muc gon (co GUARD tung muc)
   ============================================================ */
(function () {
 try {
  const f = 'src/components/ResidentServicesPage.tsx';
  if (!fs.existsSync(f)) { console.log('SKIP file: ' + f); return; }
  applyFile(f, [
    ['gap-1.5 py-2.5 px-1.5 min-h-[92px]', 'gap-1 py-1 px-1 min-h-[60px]', 'o nho 92->60px', 'min-h-[60px]'],
    ['text-[11px] font-bold leading-tight line-clamp-2', 'text-[10px] font-bold leading-tight line-clamp-2', 'chu 11->10px', 'text-[10px] font-bold leading-tight line-clamp-2'],
    ['grid grid-cols-4 gap-1.5 sm:gap-2', 'grid grid-cols-4 lg:grid-cols-5 gap-0.5 sm:gap-1 rounded-2xl border border-ink-700/50 bg-[#141f38] p-1.5 sm:p-2', 'MOT KHUNG + 5 cot PC', 'bg-[#141f38]'],
    ["'bg-[#1c2945] text-white border-ink-700/60 hover:bg-[#25375d] hover:border-brand-400/60'", "'bg-transparent text-white border-transparent hover:bg-[#25375d]/70'", 'o thuong bo khung', 'bg-transparent text-white border-transparent'],
    ['border border-ink-700/60 bg-[#1c2945] text-white hover:bg-[#25375d] hover:border-brand-400/60', 'border border-transparent bg-transparent text-white hover:bg-[#25375d]/70', 'o Gian Hang bo khung', 'border border-transparent bg-transparent text-white'],
    ['>{cat.name}</div>', " title={cat.name}>{cat.name.split(',')[0].split('(')[0].trim()}</div>", 'ten ngan + hover day du', 'cat.name.split'],
    ['{RESIDENT_SERVICE_CATEGORIES.map(cat => {', '{(services.length === 0 ? RESIDENT_SERVICE_CATEGORIES : RESIDENT_SERVICE_CATEGORIES.filter(c => services.some(s => s.categoryId === c.id))).map(cat => {', 'an nhom trong', 'services.length === 0 ? RESIDENT_SERVICE_CATEGORIES'],
    ['  Compass, Navigation, Hammer, Wallet, Lock, BedSingle', '  Compass, Navigation, Hammer, Wallet, Lock, BedSingle,\n  Zap, Scale, Landmark, Camera', 'import icon moi', 'Zap, Scale, Landmark, Camera'],
    ["      case 'BedSingle': return <BedSingle className={className} />;", "      case 'BedSingle': return <BedSingle className={className} />;\n      case 'Zap': return <Zap className={className} />;\n      case 'Scale': return <Scale className={className} />;\n      case 'Landmark': return <Landmark className={className} />;\n      case 'Camera': return <Camera className={className} />;", 'case icon moi', "case 'Zap'"],
    ['w-10 h-10 rounded-xl border border-brand-500/40 bg-gradient-to-br from-brand-500/20 to-teal-500/20', 'w-7 h-7 rounded-lg border border-brand-500/30 bg-gradient-to-br from-brand-500/15 to-teal-500/15', 'khung icon TatCa', 'w-7 h-7 rounded-lg border border-brand-500/30'],
    ['w-10 h-10 rounded-xl border border-brand-500/40 bg-gradient-to-br from-brand-500/20 to-orange-500/20', 'w-7 h-7 rounded-lg border border-brand-500/30 bg-gradient-to-br from-brand-500/15 to-orange-500/15', 'khung icon GianHang', 'to-orange-500/15'],
    ['w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform', 'w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform', 'khung icon DanhMuc', 'w-7 h-7 rounded-lg border flex'],
    ['<Wrench className="w-5 h-5" />', '<Wrench className="w-3.5 h-3.5" />', 'icon Wrench nho', 'w-3.5 h-3.5" />'],
    ['<ShoppingBag className="w-5 h-5" />', '<ShoppingBag className="w-3.5 h-3.5" />', 'icon ShoppingBag nho', 'ShoppingBag className="w-3.5 h-3.5"'],
    ['renderCategoryIcon(cat.iconName, "w-5 h-5")', 'renderCategoryIcon(cat.iconName, "w-3.5 h-3.5")', 'icon danh muc nho', 'renderCategoryIcon(cat.iconName, "w-3.5 h-3.5")'],
  ]);
 } catch (e) { console.log('  WARN: bo qua va ResidentServicesPage: ' + e); }
})();

/* ============================================================
   4) TAT CAC LUONG THU TIEN NGOAI GOI (nghiep vu: chi thu tien GOI)
   ============================================================ */
applyFile('src/pages/ResidentProductDetailPage.tsx', [
  [
`      await fetch('/api/store-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          storeName: store.storeName,
          customerId: currentUser?.id || \`guest-\${Date.now()}\`,
          customerName,
          customerPhone,
          customerAddress,
          note: orderNote,
          items: [
            {
              productId: product.id,
              productName: product.name,
              price: product.price,
              quantity: orderQty,
              unit: product.unit
            }
          ],
          totalAmount: product.price * orderQty,
          paymentMethod,
          paymentStatus: 'pending',
          orderStatus: 'delivering'
        })
      }).catch(() => {});`,
`      // STORE_ORDER_DISABLED: nen tang chi thu tien GOI, khong ban hang qua web
      window.open('https://zalo.me/' + String(store.ownerZalo || store.ownerPhone || '').replace(/\\D/g, ''), '_blank');`,
    'P1) tat dat hang san pham',
    'STORE_ORDER_DISABLED'
  ],
  [
`<span>Xác Nhận Đặt Hàng`,
`<span>Liên Hệ Người Bán`,
    'P2) doi nut thanh Lien he',
    'Liên Hệ Người Bán'
  ],
  [
`<span>Đang gửi đơn hàng...</span>`,
`<span>Đang mở liên hệ...</span>`,
    'P3) doi chu dang gui',
    'Đang mở liên hệ'
  ],
  [
`đã nhận được yêu cầu đặt món`,
`sẽ liên hệ bạn trực tiếp (đặt món)`,
    'P4) doi cau xac nhan',
    'sẽ liên hệ bạn trực tiếp'
  ],
]);
applyFile('src/components/UserWalletSection.tsx', [
  [
`  onQuickExchangeAffiliate,
  onOpenEscrowModal
}) => {
`,
`  onQuickExchangeAffiliate,
  onOpenEscrowModal
}) => {
  // WALLET_DISABLED: nen tang khong thu tien / khong vi dien tu
  return null;
`,
    'W1) tat khoi vi dien tu',
    'WALLET_DISABLED'
  ],
]);
applyFile('src/components/TechnicalServiceEscrowModal.tsx', [
  [
`  currentUser,
  onOpenAuth
}) => {
`,
`  currentUser,
  onOpenAuth
}) => {
  // ESCROW_DISABLED: khong ky quy qua nen tang
  return null;
`,
    'E1) tat ky quy dich vu',
    'ESCROW_DISABLED'
  ],
]);
applyFile('src/components/StraightLineAiChatbot.tsx', [
  [
`      const res = await fetch('/api/chat-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });`,
`      // CHAT_ORDER_DISABLED: khong dat hang qua nen tang
      const res: any = { ok: false, json: async () => ({}) };`,
    'C1) tat dat hang qua chat',
    'CHAT_ORDER_DISABLED'
  ],
]);

console.log('DONE.');
