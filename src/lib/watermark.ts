/**
 * Utility to apply automatic watermark and copyright stamp (Chợ Cư Dân 24h) to uploaded images.
 * Uses HTML5 Canvas to burn the watermark into the image data.
 */

export async function addWatermarkToImage(source: File | string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof source === 'string' ? source : URL.createObjectURL(source));
          return;
        }

        // Set canvas dimensions to match image
        canvas.width = img.naturalWidth || img.width || 1200;
        canvas.height = img.naturalHeight || img.height || 800;

        const width = canvas.width;
        const height = canvas.height;

        // 1. Draw original image
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Draw subtle repeating diagonal text watermark
        ctx.save();
        ctx.rotate((-25 * Math.PI) / 180);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        
        const watermarkText = 'CHỢ CƯ DÂN 24H • chocudan24h.com';
        const fontSize = Math.max(16, Math.floor(width / 32));
        ctx.font = `bold ${fontSize}px sans-serif`;

        const stepX = Math.max(250, width / 3);
        const stepY = Math.max(120, height / 5);

        for (let x = -width; x < width * 2; x += stepX) {
          for (let y = -height; y < height * 2; y += stepY) {
            ctx.fillText(watermarkText, x, y);
          }
        }
        ctx.restore();

        // 3. Draw prominent corner brand badge (Stamp) at bottom-right
        const stampPadding = Math.max(10, Math.floor(width * 0.015));
        const badgeHeight = Math.max(36, Math.floor(height * 0.06));
        const badgeFontSize = Math.max(13, Math.floor(badgeHeight * 0.42));
        
        ctx.save();
        ctx.font = `black ${badgeFontSize}px sans-serif`;
        const textMain = '🏘️ CHỢ CƯ DÂN 24H';
        const textSub = 'chocudan24h.com';
        
        const textWidth1 = ctx.measureText(textMain).width;
        ctx.font = `bold ${Math.max(11, Math.floor(badgeFontSize * 0.85))}px sans-serif`;
        const textWidth2 = ctx.measureText(textSub).width;
        
        const contentWidth = textWidth1 + textWidth2 + stampPadding * 3;
        const badgeWidth = contentWidth + stampPadding * 2;
        
        const badgeX = width - badgeWidth - stampPadding * 1.5;
        const badgeY = height - badgeHeight - stampPadding * 1.5;

        // Draw pill background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)'; // Dark slate navy
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)'; // Amber gold border
        ctx.lineWidth = Math.max(2, Math.floor(width / 600));

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
        ctx.font = `bold ${Math.max(11, Math.floor(badgeFontSize * 0.85))}px sans-serif`;
        ctx.fillText(textSub, badgeX + stampPadding * 1.5 + textWidth1 + stampPadding, textY);

        ctx.restore();

        // Convert canvas back to base64 Data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch (err) {
        console.error('Watermark canvas error:', err);
        // Fallback to original
        if (typeof source === 'string') resolve(source);
        else {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(source);
        }
      }
    };

    img.onerror = () => {
      if (typeof source === 'string') resolve(source);
      else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(source);
      }
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(source);
    }
  });
}
