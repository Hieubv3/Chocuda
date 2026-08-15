/**
 * Utility to apply ultra-fast automatic watermark, compression and copyright stamp (Chợ Cư Dân 24h) to uploaded images.
 * Uses hardware-accelerated ObjectURLs / HTML5 Canvas to instantly compress heavy images (up to 10MB) into lightweight web assets (~150KB-250KB).
 */

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

/**
 * Validates if file is within 10MB limit
 */
export function validateImageSize(file: File): { valid: boolean; message?: string } {
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      message: `Ảnh "${file.name}" dung lượng ${sizeMb}MB vượt quá giới hạn 10MB. Vui lòng chọn ảnh nhẹ hơn.`
    };
  }
  return { valid: true };
}

/**
 * Creates an instant preview URL (0ms latency) for immediate UI rendering
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
 * Compresses and applies subtle official watermark to an image with minimal memory & CPU usage
 */
export async function addWatermarkToImage(source: File | string): Promise<string> {
  return new Promise((resolve) => {
    // If it's a file, validate size limit first
    if (typeof source !== 'string' && source.size > MAX_IMAGE_FILE_SIZE) {
      console.warn(`File exceeds 10MB limit (${(source.size / (1024 * 1024)).toFixed(1)}MB)`);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrlToRevoke: string | null = null;

    const cleanup = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
        objectUrlToRevoke = null;
      }
    };

    const handleLoad = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
        if (!ctx) {
          cleanup();
          resolve(typeof source === 'string' ? source : URL.createObjectURL(source));
          return;
        }

        // Target maximum dimension (1200px) - ideal for sharp retina display while keeping payload ~120KB-250KB
        const MAX_DIM = 1200;
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

        // 1. Draw original image with high quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Draw subtle repeating diagonal text watermark
        ctx.save();
        ctx.rotate((-25 * Math.PI) / 180);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 3;
        
        const watermarkText = 'CHỢ CƯ DÂN 24H • chocudan24h.com';
        const fontSize = Math.max(15, Math.floor(width / 34));
        ctx.font = `bold ${fontSize}px sans-serif`;

        const stepX = Math.max(260, width / 3);
        const stepY = Math.max(130, height / 5);

        for (let x = -width; x < width * 2; x += stepX) {
          for (let y = -height; y < height * 2; y += stepY) {
            ctx.fillText(watermarkText, x, y);
          }
        }
        ctx.restore();

        // 3. Draw prominent corner brand badge (Stamp) at bottom-right
        const stampPadding = Math.max(8, Math.floor(width * 0.012));
        const badgeHeight = Math.max(32, Math.floor(height * 0.055));
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

        // Draw pill background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.lineWidth = Math.max(1.5, Math.floor(width / 700));

        // Rounded rect for badge
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

        // Draw badge text
        const textY = badgeY + badgeHeight / 2 + badgeFontSize / 3;
        
        // Main text in Amber / Gold
        ctx.fillStyle = '#F59E0B';
        ctx.font = `bold ${badgeFontSize}px sans-serif`;
        ctx.fillText(textMain, badgeX + stampPadding * 1.5, textY);

        // Sub text in White
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(10, Math.floor(badgeFontSize * 0.85))}px sans-serif`;
        ctx.fillText(textSub, badgeX + stampPadding * 1.5 + textWidth1 + stampPadding, textY);

        ctx.restore();

        // Convert canvas to base64 Data URL (0.80 JPEG quality for optimal ~150KB size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        console.error('Watermark canvas error:', err);
        cleanup();
        // Fast fallback
        if (typeof source === 'string') resolve(source);
        else {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(source);
        }
      }
    };

    img.onerror = () => {
      cleanup();
      if (typeof source === 'string') resolve(source);
      else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(source);
      }
    };

    // Use fast Object URL instead of slow base64 FileReader
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
  });
}

/**
 * Fast parallel batch compression with automatic size checking and background conversion
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
