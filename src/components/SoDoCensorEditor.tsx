import React, { useRef, useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, RotateCcw, Check, Sparkles, Image as ImageIcon, Lock } from 'lucide-react';

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
  const [censorType, setCensorType] = useState<'black' | 'blur'>('black');
  const [boxes, setBoxes] = useState<Array<{ x: number; y: number; w: number; h: number; type: 'black' | 'blur' }>>([]);
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

    // Draw all saved censor boxes
    boxes.forEach((box) => {
      if (box.type === 'black') {
        ctx.fillStyle = '#0f172a'; // Deep slate slate-900 bôi đen
        ctx.fillRect(box.x, box.y, box.w, box.h);
        
        // Add watermark label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('🔒 [ĐÃ CHE BẢO MẬT]', box.x + 6, box.y + box.h / 2 + 4);
      } else {
        // Pixelate / Blur
        const sampleSize = 10;
        for (let y = box.y; y < box.y + box.h; y += sampleSize) {
          for (let x = box.x; x < box.x + box.w; x += sampleSize) {
            const p = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            ctx.fillStyle = `rgba(${p[0]},${p[1]},${p[2]},0.9)`;
            ctx.fillRect(x, y, sampleSize, sampleSize);
          }
        }
      }
    });

    // Draw currently drawing box
    if (currentBox) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
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
    if (isDrawing && currentBox && currentBox.w > 10 && currentBox.h > 10) {
      setBoxes([...boxes, { ...currentBox, type: censorType }]);
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
    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              CÔNG CỤ CHE THÔNG TIN SỔ ĐỎ BẢO MẬT
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chủ nhà kéo chuột khoanh vùng để <span className="text-amber-400 font-bold">bôi đen che số sổ đỏ, tên chủ cũ, số giấy tờ</span> nhạy cảm trước khi công khai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition border border-slate-700 flex items-center gap-1">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Tải Ảnh Sổ Khác</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-slate-400 mr-1">Chế độ che:</span>
          <button
            type="button"
            onClick={() => setCensorType('black')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              censorType === 'black'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bôi Đen BẢO MẬT</span>
          </button>

          <button
            type="button"
            onClick={() => setCensorType('blur')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              censorType === 'blur'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Làm Mờ Pixel</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={handleUndo}
            disabled={boxes.length === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hoàn Tác ({boxes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
              previewMode ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {previewMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{previewMode ? 'Xem Thực Tế' : 'Đang Chỉnh Sửa'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[350px] p-2">
        {!imgObj && (
          <div className="text-center p-8 text-slate-500 text-xs">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
            <p className="font-bold">Đang tải hình ảnh Sổ Đỏ...</p>
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
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-[11px] text-amber-300 flex items-center gap-2">
        <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
        <p>
          <strong>Mẹo cho Chủ Nhà:</strong> Hãy kéo chuột khoanh chữ nhật đè lên <strong>Số hiệu Sổ đỏ, Tên cá nhân cũ, Số CMND/CCCD cũ</strong>. Sau khi lưu, ảnh đã che sẽ tự động đính kèm vào tin đăng công khai.
        </p>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            Hủy Bỏ
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition shadow-lg flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Check className="w-4 h-4" />
          <span>LƯU CẤU HÌNH & DÙNG ẢNH SỔ NÀY</span>
        </button>
      </div>
    </div>
  );
};
