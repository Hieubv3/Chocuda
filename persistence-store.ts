/**
 * persistence-store.ts
 * ---------------------------------------------------------------------------
 * Lop luu tru BEN VUNG cho chocudan24h.com / chocuda (server.ts).
 *
 * Khong them dependency npm moi:
 *   - File store dung `fs` (atomic write + backup + snapshot xoay vong)
 *   - DB ben vung dung Supabase REST qua `fetch` co san trong Node >= 18
 *
 * Muc tieu: thay the kieu `fs.writeFileSync(process.cwd()/app_data_store.json)`
 * von mat sach du lieu moi lan Render restart/redeploy hoac disk ephemeral.
 * ---------------------------------------------------------------------------
 */
import fs from "fs";
import path from "path";

export type Payload = Record<string, any>;

export interface SupabaseConfig {
  url: string;
  key: string;
  table?: string;
  rowId?: string;
}

export interface PersistenceOptions {
  /** Thu muc luu file (nen la thu muc co disk ben vung, vd /app/uploads). */
  dataDir: string;
  primaryName?: string;
  backupName?: string;
  snapshotsDirName?: string;
  /** So ban snapshot giu lai. Mac dinh 40. */
  keepSnapshots?: number;
  /** Gop cac lan ghi lien tiep trong khoang nay (ms). Mac dinh 500. */
  debounceMs?: number;
  /** Neu co -> ghi them len DB (nguon ben vung that su). */
  supabase?: SupabaseConfig | null;
  log?: (msg: string) => void;
}

export interface LoadResult {
  payload: Payload | null;
  source: "primary" | "backup" | "snapshot" | "none";
  savedAt: string | null;
}

export interface HealthInfo {
  dataDir: string;
  primaryPath: string;
  primaryExists: boolean;
  backupExists: boolean;
  primarySavedAt: string | null;
  primaryBytes: number;
  snapshotCount: number;
  dbConfigured: boolean;
  dbEnabled: boolean;
  lastSaveOkAt: string | null;
  lastSaveError: string | null;
  writes: number;
  pendingWrites: number;
}

function parseTime(v: unknown): string | null {
  if (typeof v !== "string" || !v) return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : v;
}

function newerThan(a: string | null, b: string | null): boolean {
  if (!a) return false;
  if (!b) return true;
  return Date.parse(a) > Date.parse(b);
}

export function createPersistence(opts: PersistenceOptions) {
  const dataDir = opts.dataDir;
  const primaryName = opts.primaryName ?? "app_data_store.json";
  const backupName = opts.backupName ?? "app_data_store.backup.json";
  const snapshotsDirName = opts.snapshotsDirName ?? "backups";
  const keepSnapshots = opts.keepSnapshots ?? 40;
  const debounceMs = opts.debounceMs ?? 500;
  const log = opts.log ?? (() => {});
  const db = opts.supabase ?? null;

  const primaryPath = path.join(dataDir, primaryName);
  const backupPath = path.join(dataDir, backupName);
  const snapshotsDir = path.join(dataDir, snapshotsDirName);

  const stats = {
    writes: 0,
    pendingWrites: 0,
    lastSaveOkAt: null as string | null,
    lastSaveError: null as string | null,
  };

  let lastKnownSavedAt: string | null = null;

  function ensureDirs() {
    for (const d of [dataDir, snapshotsDir]) {
      try {
        if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      } catch (e) {
        log(`[DataStore] khong tao duoc thu muc ${d}: ${String(e)}`);
      }
    }
  }

  /**
   * Ghi kieu atomic: ghi ra file .tmp -> fsync -> copy ban cu thanh backup ->
   * rename de thay the. Crash giua chung KHONG lam hong file that.
   */
  function atomicWrite(file: string, text: string) {
    ensureDirs();
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    const fd = fs.openSync(tmp, "w");
    try {
      fs.writeFileSync(fd, text, "utf-8");
      try { fs.fsyncSync(fd); } catch { /* fsync co the khong ho tro */ }
    } finally {
      fs.closeSync(fd);
    }
    if (fs.existsSync(file)) {
      try { fs.copyFileSync(file, backupPath); } catch { /* bo qua */ }
    }
    fs.renameSync(tmp, file); // Node rename ghi de duoc tren Windows
  }

  function writeSnapshot(text: string) {
    try {
      ensureDirs();
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const f = path.join(snapshotsDir, `app_data_store.${stamp}.json`);
      fs.writeFileSync(f, text, "utf-8");
      const files = fs
        .readdirSync(snapshotsDir)
        .filter((n) => n.startsWith("app_data_store.") && n.endsWith(".json"))
        .sort();
      const excess = files.length - keepSnapshots;
      for (let i = 0; i < excess; i++) {
        try { fs.unlinkSync(path.join(snapshotsDir, files[i])); } catch { /* bo qua */ }
      }
    } catch (e) {
      log(`[DataStore] xoay vong snapshot loi: ${String(e)}`);
    }
  }

  function readJsonFile(p: string): Payload {
    const raw = fs.readFileSync(p, "utf-8");
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") throw new Error("payload khong phai object");
    return data as Payload;
  }

  function newestSnapshot(): string | null {
    try {
      if (!fs.existsSync(snapshotsDir)) return null;
      const files = fs
        .readdirSync(snapshotsDir)
        .filter((n) => n.startsWith("app_data_store.") && n.endsWith(".json"))
        .sort();
      return files.length ? path.join(snapshotsDir, files[files.length - 1]) : null;
    } catch {
      return null;
    }
  }

  /** Doc file; tu dong roi ve backup roi snapshot neu file chinh hong/mat. */
  function loadFromFile(): LoadResult {
    const chain: Array<{ p: string; source: LoadResult["source"] }> = [
      { p: primaryPath, source: "primary" },
      { p: backupPath, source: "backup" },
    ];
    const snap = newestSnapshot();
    if (snap) chain.push({ p: snap, source: "snapshot" });

    for (const { p, source } of chain) {
      if (!fs.existsSync(p)) continue;
      try {
        const payload = readJsonFile(p);
        const savedAt = parseTime(payload.savedAt);
        if (source !== "primary") {
          log(`[DataStore] file chinh khong dung duoc -> phuc hoi tu ${source}: ${p}`);
        }
        lastKnownSavedAt = savedAt;
        return { payload, source, savedAt };
      } catch (e) {
        log(`[DataStore] doc loi ${p}: ${String(e)} -> thu nguon ke tiep`);
      }
    }
    return { payload: null, source: "none", savedAt: null };
  }

  // --- DB (Supabase REST) -------------------------------------------------
  function dbEndpoint() {
    if (!db) return null;
    const base = db.url.replace(/\/+$/, "");
    return `${base}/rest/v1/${db.table ?? "app_state"}`;
  }

  async function dbSelect(): Promise<Payload | null> {
    const ep = dbEndpoint();
    if (!ep || !db) return null;
    const rowId = db.rowId ?? "main";
    const url = `${ep}?id=eq.${encodeURIComponent(rowId)}&select=payload,saved_at&limit=1`;
    const res = await fetch(url, {
      headers: { apikey: db.key, Authorization: `Bearer ${db.key}` },
    });
    if (!res.ok) throw new Error(`Supabase select ${res.status}: ${await res.text().catch(() => "")}`);
    const rows = (await res.json()) as Array<{ payload: Payload; saved_at: string }>;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const payload = rows[0].payload;
    if (payload && typeof payload === "object" && !parseTime(payload.savedAt)) {
      (payload as Payload).savedAt = rows[0].saved_at;
    }
    return payload && typeof payload === "object" ? payload : null;
  }

  async function dbUpsert(payload: Payload): Promise<void> {
    const ep = dbEndpoint();
    if (!ep || !db) return;
    const rowId = db.rowId ?? "main";
    const res = await fetch(ep, {
      method: "POST",
      headers: {
        apikey: db.key,
        Authorization: `Bearer ${db.key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([{ id: rowId, payload, saved_at: new Date().toISOString() }]),
    });
    if (!res.ok) throw new Error(`Supabase upsert ${res.status}: ${await res.text().catch(() => "")}`);
  }

  // --- Ghi co hang doi ----------------------------------------------------
  let queue: Promise<void> = Promise.resolve();
  let pendingPayload: Payload | null = null;
  let timer: NodeJS.Timeout | null = null;

  async function writeNow(payload: Payload): Promise<void> {
    const stamped: Payload = { ...payload, savedAt: new Date().toISOString() };
    const text = JSON.stringify(stamped, null, 2);
    stats.pendingWrites++;

    // 1) DB truoc (nguon ben vung that su)
    try {
      await dbUpsert(stamped);
    } catch (e) {
      stats.lastSaveError = `db: ${String(e)}`;
      log(`[DataStore] ghi DB that bai: ${String(e)}`);
    }

    // 2) File (cache + fallback khi DB khong co)
    try {
      atomicWrite(primaryPath, text);
      writeSnapshot(text);
      stats.writes++;
      stats.lastSaveOkAt = stamped.savedAt;
      if (!stats.lastSaveError?.startsWith("db:")) stats.lastSaveError = null;
    } catch (e) {
      stats.lastSaveError = `file: ${String(e)}`;
      log(`[DataStore] ghi file that bai: ${String(e)}`);
    } finally {
      stats.pendingWrites--;
    }
    lastKnownSavedAt = stamped.savedAt;
  }

  function enqueue(payload: Payload) {
    pendingPayload = payload;
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      const p = pendingPayload;
      pendingPayload = null;
      if (p) queue = queue.then(() => writeNow(p)).catch(() => {});
    }, debounceMs);
  }

  /** Ghi ngay, cho den khi xong (dung cho shutdown / health-check). */
  async function saveNow(payload: Payload): Promise<void> {
    if (timer) { clearTimeout(timer); timer = null; }
    const p = pendingPayload ?? payload;
    pendingPayload = null;
    queue = queue.then(() => writeNow(p));
    return queue;
  }

  function flush(): Promise<void> {
    return saveNow(pendingPayload ?? {});
  }

  /**
   * Doc du lieu ben vung nhat: so sanh file vs DB theo `savedAt`,
   * tra ve ban moi hon.
   */
  async function load(): Promise<LoadResult> {
    let best = loadFromFile();
    if (!db) return best;
    try {
      const remote = await dbSelect();
      const remoteAt = remote ? parseTime(remote.savedAt) : null;
      if (remote && newerThan(remoteAt, best.savedAt)) {
        log(`[DataStore] DB moi hon file (${remoteAt} > ${best.savedAt}) -> dung DB`);
        lastKnownSavedAt = remoteAt;
        return { payload: remote, source: "primary", savedAt: remoteAt };
      }
      // File moi hon (hoac DB trong) -> day file len DB cho dong bo
      if (best.payload && newerThan(best.savedAt, remoteAt)) {
        await dbUpsert(best.payload).catch((e) => log(`[DataStore] dong bo len DB loi: ${String(e)}`));
      }
    } catch (e) {
      log(`[DataStore] doc DB that bai, dung file: ${String(e)}`);
    }
    return best;
  }

  function health(): HealthInfo {
    let primaryBytes = 0;
    let primarySavedAt: string | null = null;
    try { if (fs.existsSync(primaryPath)) primaryBytes = fs.statSync(primaryPath).size; } catch { /* bo qua */ }
    try {
      if (fs.existsSync(primaryPath)) {
        const j = JSON.parse(fs.readFileSync(primaryPath, "utf-8"));
        primarySavedAt = parseTime(j.savedAt);
      }
    } catch { /* bo qua */ }
    let snapshotCount = 0;
    try {
      if (fs.existsSync(snapshotsDir)) {
        snapshotCount = fs.readdirSync(snapshotsDir).filter((n) => n.endsWith(".json")).length;
      }
    } catch { /* bo qua */ }
    return {
      dataDir,
      primaryPath,
      primaryExists: fs.existsSync(primaryPath),
      backupExists: fs.existsSync(backupPath),
      primarySavedAt,
      primaryBytes,
      snapshotCount,
      dbConfigured: !!db,
      dbEnabled: !!db,
      lastSaveOkAt: stats.lastSaveOkAt,
      lastSaveError: stats.lastSaveError,
      writes: stats.writes,
      pendingWrites: stats.pendingWrites,
    };
  }

  function lastSavedAt(): string | null {
    return lastKnownSavedAt;
  }

  return { load, loadFromFile, save: enqueue, saveNow, flush, health, lastSavedAt, paths: { primaryPath, backupPath, snapshotsDir } };
}

export type Persistence = ReturnType<typeof createPersistence>;

/** Doc cau hinh Supabase tu bien moi truong (nhieu ten bien cho de cau hinh). */
export function supabaseFromEnv(env: NodeJS.ProcessEnv = process.env): SupabaseConfig | null {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_KEY ||
    env.SUPABASE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    "";
  if (!url || !key) return null;
  return { url, key, table: env.SUPABASE_TABLE || "app_state", rowId: env.SUPABASE_ROW_ID || "main" };
}
