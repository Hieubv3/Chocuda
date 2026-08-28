/**
 * Utility to apply ultra-fast automatic watermark, background compression, and copyright stamp (Chợ Cư Dân 24h) to uploaded images.
 * Uses hardware-accelerated background decoding (createImageBitmap) and async Canvas to instantly display images (0ms)
 * while silently converting heavy files (up to 10MB) into ultra-light web assets (~120KB-200KB) to save memory & prevent lag.
 */

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB — ảnh lớn hơn sẽ được tự động nén
const HARD_LIMIT = 50 * 1024 * 1024; // 50MB — giới hạn cứng, trên mức này mới từ chối

/**
 * Kiểm tra kích thước ảnh.
 * Ảnh 10-50MB vẫn HỢP LỆ (valid: true) — hệ thống sẽ tự động nén xuống dưới 10MB.
 * Chỉ từ chối ảnh > 50MB (quá lớn để nén an toàn trên trình duyệt).
 */
export function validateImageSize(file: File): { valid: boolean; message?: string } {
  if (file.size > HARD_LIMIT) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      message: `Ảnh "${file.name}" (${sizeMb}MB) quá lớn. Hệ thống chỉ nhận ảnh dưới 50MB.`
    };
  }
  return { valid: true };
}

/**
 * Creates an instant preview URL (0ms latency) for immediate UI rendering without freezing
 */
export function createInstantPreview(source: File | string): string {
  if (typeof source === 'string') return source;
  try {
    return URL.createObjectURL(source);
  } catch {
    return '';
  }
}

/**
 * Non-blocking asynchronous background compression & watermarking engine.
 * Converts heavy images (up to 10MB) to lightweight web JPEG (~120KB-220KB) in background thread.
 */
export async function addWatermarkToImage(
  source: File | string,
  options?: { maxDim?: number; quality?: number; skipWatermark?: boolean }
): Promise<string> {
  const MAX_DIM = options?.maxDim || 1200;
  const QUALITY = options?.quality || 0.78;
  const skipWatermark = options?.skipWatermark || false;

  return new Promise(async (resolve) => {
    // 1. Try modern hardware-accelerated createImageBitmap if source is a File/Blob (runs off main thread)
    if (typeof source !== 'string' && typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(source);
        let width = bitmap.width;
        let height = bitmap.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width >= height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(bitmap, 0, 0, width, height);
          bitmap.close();

          if (!skipWatermark) {
            applyWatermarkLayers(ctx, width, height);
          }

          const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
          resolve(dataUrl);
          return;
        }
      } catch (err) {
        console.warn('createImageBitmap fallback to HTMLImageElement:', err);
      }
    }

    // 2. Fallback using Image element with asynchronous execution yield (setTimeout 0)
    setTimeout(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let objectUrlToRevoke: string | null = null;

      const cleanup = () => {
        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
          objectUrlToRevoke = null;
        }
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width || 1200;
          let height = img.naturalHeight || img.height || 800;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width >= height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { alpha: false });

          if (!ctx) {
            cleanup();
            resolve(typeof source === 'string' ? source : URL.createObjectURL(source));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, 0, 0, width, height);

          if (!skipWatermark) {
            applyWatermarkLayers(ctx, width, height);
          }

          const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
          cleanup();
          resolve(dataUrl);
        } catch (e) {
          cleanup();
          resolve(typeof source === 'string' ? source : URL.createObjectURL(source));
        }
      };

      img.onerror = () => {
        cleanup();
        resolve(typeof source === 'string' ? source : '');
      };

      if (typeof source === 'string') {
        img.src = source;
      } else {
        try {
          objectUrlToRevoke = URL.createObjectURL(source);
          img.src = objectUrlToRevoke;
        } catch {
          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(source);
        }
      }
    }, 0);
  });
}

/**
 * Draws crisp, professional branding & watermarks on the canvas
 */
function applyWatermarkLayers(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // 1. Diagonal subtle repeating watermark
  ctx.save();
  ctx.rotate((-25 * Math.PI) / 180);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 3;
  
  const watermarkText = 'CHỢ CƯ DÂN 24H • chocudan24h.com';
  const fontSize = Math.max(14, Math.floor(width / 35));
  ctx.font = `bold ${fontSize}px sans-serif`;

  const stepX = Math.max(260, width / 3);
  const stepY = Math.max(130, height / 5);

  for (let x = -width; x < width * 2; x += stepX) {
    for (let y = -height; y < height * 2; y += stepY) {
      ctx.fillText(watermarkText, x, y);
    }
  }
  ctx.restore();

  // 2. Corner badge stamp at bottom-right
  const stampPadding = Math.max(8, Math.floor(width * 0.012));
  const badgeHeight = Math.max(30, Math.floor(height * 0.052));
  const badgeFontSize = Math.max(12, Math.floor(badgeHeight * 0.42));
  
  ctx.save();
  ctx.font = `black ${badgeFontSize}px sans-serif`;
  const textMain = '🏘️ CHỢ CƯ DÂN 24H';
  const textSub = 'chocudan24h.com';
  
  const textWidth1 = ctx.measureText(textMain).width;
  ctx.font = `bold ${Math.max(10, Math.floor(badgeFontSize * 0.85))}px sans-serif`;
  const textWidth2 = ctx.measureText(textSub).width;
  
  const contentWidth = textWidth1 + textWidth2 + stampPadding * 2.5;
  const badgeWidth = contentWidth + stampPadding * 2;
  
  const badgeX = width - badgeWidth - stampPadding * 1.5;
  const badgeY = height - badgeHeight - stampPadding * 1.5;

  // Draw pill
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.lineWidth = Math.max(1.5, Math.floor(width / 700));

  const radius = badgeHeight / 2;
  ctx.beginPath();
  ctx.moveTo(badgeX + radius, badgeY);
  ctx.lineTo(badgeX + badgeWidth - radius, badgeY);
  ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + radius);
  ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - radius);
  ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - radius, badgeY + badgeHeight);
  ctx.lineTo(badgeX + radius, badgeY + badgeHeight);
  ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - radius);
  ctx.lineTo(badgeX, badgeY + radius);
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Text inside badge
  const textY = badgeY + badgeHeight / 2 + badgeFontSize / 3;
  ctx.fillStyle = '#F59E0B';
  ctx.font = `bold ${badgeFontSize}px sans-serif`;
  ctx.fillText(textMain, badgeX + stampPadding * 1.5, textY);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.max(10, Math.floor(badgeFontSize * 0.85))}px sans-serif`;
  ctx.fillText(textSub, badgeX + stampPadding * 1.5 + textWidth1 + stampPadding, textY);

  ctx.restore();
}

/**
 * Fast asynchronous batch compression with non-blocking concurrency
 */
export async function compressAndWatermarkImagesParallel(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const check = validateImageSize(file);
    if (!check.valid) {
      errors.push(check.message || 'Ảnh quá 10MB');
    } else {
      validFiles.push(file);
    }
  }

  if (errors.length > 0) {
    alert(errors.join('\n'));
  }

  if (validFiles.length === 0) return [];

  let completed = 0;
  const total = validFiles.length;

  const tasks = validFiles.map(async (file) => {
    try {
      const result = await addWatermarkToImage(file);
      completed++;
      if (onProgress) onProgress(completed, total);
      return result;
    } catch (e) {
      console.error('Error in batch compression:', e);
      completed++;
      if (onProgress) onProgress(completed, total);
      return '';
    }
  });

  const results = await Promise.all(tasks);
  return results.filter(r => Boolean(r));
}
