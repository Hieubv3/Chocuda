/**
 * Upload Service - Chuẩn hóa toàn bộ luồng upload ảnh trên Chợ Cư Dân 24h.
 *
 * Vấn đề cũ: Ảnh được nén thành base64 data URL rồi lưu vào localStorage.
 *   -> localStorage giới hạn ~5-10MB -> đầy -> ảnh mất, có ảnh hiển thị có ảnh không.
 *
 * Giải pháp mới: Ảnh được upload lên server (lưu file vật lý trong /uploads),
 *   trả về URL public (/uploads/xxx.jpg). Chỉ URL được lưu trong dữ liệu.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB — ảnh lớn hơn sẽ được tự động nén xuống mức này
const HARD_LIMIT = 50 * 1024 * 1024; // 50MB — giới hạn cứng tương ứng server, trên mức này mới từ chối

/** Kiểm tra một chuỗi có phải base64 data URL không */
export function isBase64DataUrl(value: string): boolean {
  return typeof value === 'string' && value.startsWith('data:image/');
}

/** Kiểm tra một chuỗi có phải URL ảnh đã upload lên server không */
export function isUploadedUrl(value: string): boolean {
  return typeof value === 'string' && value.startsWith('/uploads/');
}

/** Kiểm tra một chuỗi có phải URL tuyệt đối (http/https) không */
export function isAbsoluteUrl(value: string): boolean {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

/** Kiểm tra một chuỗi có phải URL ảnh hợp lệ (bất kỳ loại nào) không */
export function isValidImageRef(value: string | null | undefined): boolean {
  if (!value) return false;
  return isBase64DataUrl(value) || isUploadedUrl(value) || isAbsoluteUrl(value);
}

// ============================================================
// TỰ ĐỘNG NÉN ẢNH > 10MB XUỐNG ≤ 10MB (canvas, không cần thư viện)
// ============================================================

/** Đọc File thành HTMLImageElement (giải phóng object URL sau khi load) */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh')); };
    img.src = url;
  });
}

/** Đọc base64 data URL thành HTMLImageElement */
function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không đọc được ảnh'));
    img.src = dataUrl;
  });
}

/** canvas.toBlob dạng Promise */
function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
}

/**
 * Nén File ảnh xuống ≤ maxBytes bằng canvas.
 * Chiến lược: giảm dần chất lượng JPEG (0.85 → 0.35), nếu vẫn chưa đủ thì giảm kích thước (×0.7 mỗi vòng).
 * Nếu không nén được (ảnh lỗi, SVG...) trả về file gốc — server vẫn nhận (giới hạn 50MB).
 */
async function compressFileToLimit(file: File, maxBytes = MAX_FILE_SIZE): Promise<File> {
  if (file.size <= maxBytes) return file;
  try {
    const img = await loadImage(file);
    let quality = 0.85;
    let scale = 1;
    let blob: Blob | null = null;
    for (let i = 0; i < 14; i++) {
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      blob = await canvasToBlob(canvas, quality);
      if (blob && blob.size <= maxBytes) break;
      if (quality > 0.35) quality -= 0.15;
      else scale *= 0.7;
    }
    if (blob && blob.size <= maxBytes) {
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
      return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
    }
  } catch (err) {
    console.warn('[UploadService] compressFileToLimit failed:', err);
  }
  return file; // fallback: gửi nguyên file
}

/**
 * Nén base64 data URL xuống ≤ maxBytes (dùng cho ảnh cũ trong localStorage
 * hoặc ảnh chưa qua nén). Trả về data URL mới, hoặc nguyên bản nếu không nén được.
 */
async function compressDataUrlToLimit(dataUrl: string, maxBytes = MAX_FILE_SIZE): Promise<string> {
  try {
    const img = await loadImageFromDataUrl(dataUrl);
    let quality = 0.85;
    let scale = 1;
    for (let i = 0; i < 14; i++) {
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      const out = canvas.toDataURL('image/jpeg', quality);
      if (Math.floor(out.length * 0.75) <= maxBytes) return out;
      if (quality > 0.35) quality -= 0.15;
      else scale *= 0.7;
    }
  } catch (err) {
    console.warn('[UploadService] compressDataUrlToLimit failed:', err);
  }
  return dataUrl;
}

/**
 * Upload một hoặc nhiều File lên server.
 * Ảnh > 10MB được tự động nén xuống ≤ 10MB trước khi gửi (không còn từ chối).
 * @returns Mảng URL public (vd: ["/uploads/123-abc.jpg"])
 */
export async function uploadFiles(files: File[]): Promise<string[]> {
  const validFiles = files.filter(f => f && f.type.startsWith('image/'));
  if (validFiles.length === 0) return [];

  // Tự động nén ảnh > 10MB xuống ≤ 10MB
  const prepared: File[] = [];
  for (const f of validFiles) {
    if (f.size > MAX_FILE_SIZE) {
      const compressed = await compressFileToLimit(f);
      if (compressed.size > MAX_FILE_SIZE && f.size > HARD_LIMIT) {
        const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
        alert(`Ảnh "${f.name}" (${sizeMb}MB) quá lớn, hệ thống không thể nén xuống dưới 10MB. Vui lòng chọn ảnh khác!`);
        continue;
      }
      prepared.push(compressed);
    } else {
      prepared.push(f);
    }
  }
  if (prepared.length === 0) return [];

  const formData = new FormData();
  prepared.forEach(f => formData.append('images', f));

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error('[UploadService] Upload failed:', data.error);
      alert(data.error || 'Upload ảnh thất bại. Vui lòng thử lại!');
      return [];
    }
    return data.urls as string[];
  } catch (err) {
    console.error('[UploadService] Upload error:', err);
    alert('Không thể kết nối máy chủ để upload ảnh. Vui lòng kiểm tra kết nối!');
    return [];
  }
}

/**
 * Upload một File duy nhất, trả về URL hoặc chuỗi rỗng nếu thất bại.
 */
export async function uploadSingleFile(file: File): Promise<string> {
  const urls = await uploadFiles([file]);
  return urls[0] || '';
}

/**
 * Upload một base64 data URL lên server, trả về URL public.
 * Dùng cho ảnh đã được nén/watermark ở client (canvas.toDataURL).
 * Base64 > 10MB được tự động nén xuống ≤ 10MB trước khi gửi.
 */
export async function uploadBase64DataUrl(dataUrl: string, folder?: string): Promise<string> {
  if (!isBase64DataUrl(dataUrl)) return dataUrl; // Không phải base64 thì trả nguyên
  try {
    let finalDataUrl = dataUrl;
    const approxBytes = Math.floor(dataUrl.length * 0.75); // base64 ≈ 4/3 dung lượng thật
    if (approxBytes > MAX_FILE_SIZE) {
      finalDataUrl = await compressDataUrlToLimit(dataUrl);
    }
    const res = await fetch('/api/upload/base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: finalDataUrl, folder })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error('[UploadService] base64 upload failed:', data.error);
      return '';
    }
    return data.url as string;
  } catch (err) {
    console.error('[UploadService] base64 upload error:', err);
    return '';
  }
}

/**
 * Upload một mảng base64 data URLs, trả về mảng URL public.
 * Giữ nguyên các URL đã là /uploads/ hoặc http(s).
 */
export async function normalizeImageRefs(refs: (string | null | undefined)[]): Promise<string[]> {
  const result: string[] = [];
  for (const ref of refs) {
    if (!ref) continue;
    if (isBase64DataUrl(ref)) {
      const url = await uploadBase64DataUrl(ref);
      if (url) result.push(url);
    } else {
      result.push(ref);
    }
  }
  return result;
}

/**
 * Xóa một ảnh đã upload trên server (dọn dẹp khi xóa tin).
 * Chỉ xóa ảnh thuộc /uploads/ của chính server.
 */
export async function deleteUploadedImage(url: string): Promise<void> {
  if (!isUploadedUrl(url)) return;
  try {
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
  } catch (err) {
    console.warn('[UploadService] Delete image failed:', err);
  }
}

/**
 * Xóa nhiều ảnh đã upload.
 */
export async function deleteUploadedImages(urls: (string | null | undefined)[]): Promise<void> {
  const tasks = (urls || []).filter(isUploadedUrl).map(u => deleteUploadedImage(u));
  await Promise.allSettled(tasks);
}

/**
 * Hàm tiện ích: nén ảnh client-side rồi upload lên server.
 * Trả về URL public. Giữ watermark nếu có.
 */
export async function compressAndUpload(
  file: File,
  options?: { maxDim?: number; quality?: number; skipWatermark?: boolean; folder?: string }
): Promise<string> {
  // Nén + watermark ở client (tái sử dụng engine hiện có)
  const { addWatermarkToImage } = await import('./watermark');
  const compressed = await addWatermarkToImage(file, options);
  if (!compressed) return '';
  if (isBase64DataUrl(compressed)) {
    return uploadBase64DataUrl(compressed, options?.folder);
  }
  return compressed;
}