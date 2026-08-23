import React, { useRef, useState, useEffect } from 'react';
import { Eye, EyeOff, RotateCcw, Check, Sparkles, Image as ImageIcon, Droplets, Sliders, Shield } from 'lucide-react';

interface SoDoCensorEditorProps {
  originalImageUrl?: string;
  onSaveRedacted: (redactedDataUrl: string) => void;
  onCancel?: () => void;
}

export const SoDoCensorEditor: React.FC<SoDoCensorEditorProps> = ({
  originalImageUrl,
  onSaveRedacted,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string>(originalImageUrl || '');
  const [mistIntensity, setMistIntensity] = useState<'medium' | 'deep'>('medium');
  const [boxes, setBoxes] = useState<Array<{ x: number; y: number; w: number; h: number; intensity: 'medium' | 'deep' }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Default sample Sổ Đỏ if none uploaded
  const defaultSoDoSample = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80';

  useEffect(() => {
    const srcToUse = imageSrc || defaultSoDoSample;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = srcToUse;
    img.onload = () => {
      setImgObj(img);
    };
  }, [imageSrc]);

  // Apply ultra-smooth Frosted Mist blur (Sương Mờ - KHÔNG VIẾT CHỮ)
  const applyFrostedMistBlur = (
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    bw: number,
    bh: number,
    intensity: 'medium' | 'deep'
  ) => {
    if (bw <= 0 || bh <= 0) return;
    const x = Math.max(0, Math.floor(bx));
    const y = Math.max(0, Math.floor(by));
    const w = Math.min(ctx.canvas.width - x, Math.floor(bw));
    const h = Math.min(ctx.canvas.height - y, Math.floor(bh));
    if (w <= 0 || h <= 0) return;

    // 1. Multi-pass downscale & upscale interpolation for authentic Gaussian mist blur
    const passes = intensity === 'deep' ? 4 : 3;
    const shrinkFactor = intensity === 'deep' ? 0.08 : 0.12;

    const tempCanvas = document.createElement('canvas');
    const tempW = Math.max(2, Math.floor(w * shrinkFactor));
    const tempH = Math.max(2, Math.floor(h * shrinkFactor));
    tempCanvas.width = tempW;
    tempCanvas.height = tempH;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';

      // Draw downscaled patch
      tempCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, tempW, tempH);

      // Perform iterative box-blur passes on tiny canvas
      for (let p = 0; p < passes; p++) {
        tempCtx.drawImage(tempCanvas, 0, 0, tempW, tempH);
      }

      // Draw back upscaled with high smoothing
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tempCanvas, 0, 0, tempW, tempH, x, y, w, h);

      // 2. Add realistic Frosted Glass Mist layer (Sương mờ trong suốt)
      ctx.fillStyle = intensity === 'deep' ? 'rgba(248, 250, 252, 0.28)' : 'rgba(255, 255, 255, 0.20)';
      ctx.fillRect(x, y, w, h);

      // Subtle soft border around mist zone for aesthetic finish
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      ctx.restore();
    }
  };

  // Draw platform watermark on canvas
  const drawBrandingWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    // Bottom-right watermark pill
    const stampH = Math.max(26, Math.floor(height * 0.045));
    const stampFontSize = Math.max(11, Math.floor(stampH * 0.42));
    ctx.font = `bold ${stampFontSize}px sans-serif`;
    
    const textMain = '🏘️ CHỢ CƯ DÂN 24H';
    const textSub = 'chocudan24h.com';
    const textW1 = ctx.measureText(textMain).width;
    const textW2 = ctx.measureText(textSub).width;
    const pillW = textW1 + textW2 + 28;
    const pillX = width - pillW - 12;
    const pillY = height - stampH - 12;

    // Pill background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const r = stampH / 2;
    ctx.moveTo(pillX + r, pillY);
    ctx.lineTo(pillX + pillW - r, pillY);
    ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
    ctx.lineTo(pillX + pillW, pillY + stampH - r);
    ctx.quadraticCurveTo(pillX + pillW, pillY + stampH, pillX + pillW - r, pillY + stampH);
    ctx.lineTo(pillX + r, pillY + stampH);
    ctx.quadraticCurveTo(pillX, pillY + stampH, pillX, pillY + stampH - r);
    ctx.lineTo(pillX, pillY + r);
    ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text inside pill
    ctx.fillStyle = '#F59E0B';
    ctx.fillText(textMain, pillX + 10, pillY + stampH / 2 + stampFontSize / 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(textSub, pillX + 10 + textW1 + 8, pillY + stampH / 2 + stampFontSize / 3);

    ctx.restore();
  };

  // Redraw canvas whenever imgObj, boxes, or currentBox change
  useEffect(() => {
    if (!imgObj || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imgObj.width || 800;
    canvas.height = imgObj.height || 600;

    // Draw base image
    ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

    // Draw all saved frosted mist censor boxes (KHÔNG VIẾT CHỮ)
    boxes.forEach((box) => {
      applyFrostedMistBlur(ctx, box.x, box.y, box.w, box.h, box.intensity);
    });

    // Always stamp the platform watermark
    drawBrandingWatermark(ctx, canvas.width, canvas.height);

    // Draw active drawing box preview
    if (currentBox) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
    }
  }, [imgObj, boxes, currentBox]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setBoxes([]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (previewMode) return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const coords = getCanvasCoords(e);
    const x = Math.min(startPos.x, coords.x);
    const y = Math.min(startPos.y, coords.y);
    const w = Math.abs(coords.x - startPos.x);
    const h = Math.abs(coords.y - startPos.y);
    setCurrentBox({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox && currentBox.w > 8 && currentBox.h > 8) {
      setBoxes([...boxes, { ...currentBox, intensity: mistIntensity }]);
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentBox(null);
  };

  const handleUndo = () => {
    setBoxes(boxes.slice(0, -1));
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    onSaveRedacted(dataUrl);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-400" />
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              CÔNG CỤ CHE SƯƠNG MỜ BẢO MẬT & ĐÓNG DẤU WATERMARK
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kéo chuột khoanh vùng để <span className="text-sky-400 font-bold">tạo lớp sương mờ tự nhiên (không chèn chữ)</span> che số sổ đỏ, thông tin nhạy cảm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition border border-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Tải Ảnh Khác</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-sky-400" /> Cấp độ sương mờ:
          </span>
          <button
            type="button"
            onClick={() => setMistIntensity('medium')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              mistIntensity === 'medium'
                ? 'bg-sky-500 text-slate-950 font-black shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Sương Mờ Vừa</span>
          </button>

          <button
            type="button"
            onClick={() => setMistIntensity('deep')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              mistIntensity === 'deep'
                ? 'bg-sky-500 text-slate-950 font-black shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Sương Mờ Dày (Bảo Mật Cao)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={handleUndo}
            disabled={boxes.length === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hoàn Tác ({boxes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
              previewMode ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {previewMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{previewMode ? 'Xem Thực Tế' : 'Đang Chỉnh Sửa'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[340px] p-2">
        {!imgObj && (
          <div className="text-center p-8 text-slate-500 text-xs">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
            <p className="font-bold">Đang tải hình ảnh...</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="max-w-full max-h-[500px] object-contain cursor-crosshair rounded-xl shadow-lg"
        />
      </div>

      {/* Quick Tips */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-3 text-[11px] text-sky-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 shrink-0 text-sky-400" />
        <p>
          <strong>Chế độ Sương Mờ Chuẩn:</strong> Toàn bộ vùng được khoanh sẽ được làm mờ quang học tự nhiên, không in đè chữ hay khối màu đen. Hệ thống tự động đóng dấu <strong>Watermark Chợ Cư Dân 24H</strong> chính chủ bảo vệ bản quyền.
        </p>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition shadow-lg flex items-center gap-1.5 uppercase tracking-wider cursor-pointer active:scale-[0.99]"
        >
          <Check className="w-4 h-4" />
          <span>LƯU ẢNH SƯƠNG MỜ & ĐÓNG WATERMARK</span>
        </button>
      </div>
    </div>
  );
};

