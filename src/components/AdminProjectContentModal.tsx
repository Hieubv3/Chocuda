import React, { useState } from 'react';
import { X, Save, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { AmenityArticle, ProjectSubdivision } from '../types';
import { compressImageFile } from '../lib/imageUtils';
import { isBase64DataUrl, uploadBase64DataUrl } from '../lib/uploadService';

type ArticleValue = ProjectSubdivision | AmenityArticle;
interface Props {
  kind: 'subdivision' | 'amenity';
  value: ArticleValue | null;
  onClose: () => void;
  onSave: (value: ArticleValue) => void;
}

const emptyValue = (kind: Props['kind']): ArticleValue => ({
  id: `${kind}-${Date.now()}`,
  name: '',
  title: '',
  summary: '',
  content: '',
  author: 'Chuyên gia BĐS Chợ Cư Dân 24H',
  status: 'published',
  publishedAt: new Date().toISOString().slice(0, 10),
  description: '',
  images: [],
  streets: kind === 'subdivision' ? [] : undefined
} as ArticleValue);

export const AdminProjectContentModal: React.FC<Props> = ({ kind, value, onClose, onSave }) => {
  const [form, setForm] = useState<ArticleValue>({ ...(value || emptyValue(kind)) });
  const [busy, setBusy] = useState(false);
  const isSubdivision = kind === 'subdivision';
  const set = (key: string, next: any) => setForm(prev => ({ ...prev, [key]: next }));
  const images = Array.isArray(form.images) ? form.images : [];

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 8)) {
        if (file.size > 15 * 1024 * 1024) continue;
        const compressed = await compressImageFile(file, 1600, 1100, 0.82);
        if (!compressed) continue;
        const url = isBase64DataUrl(compressed) ? await uploadBase64DataUrl(compressed, 'project-content') : compressed;
        if (url) uploaded.push(url);
      }
      set('images', [...images, ...uploaded]);
    } catch (error) {
      console.error(error);
      alert('Không thể upload ảnh. Vui lòng thử lại.');
    } finally { setBusy(false); }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.title?.trim() || !form.summary?.trim() || !form.content?.trim()) {
      alert('Vui lòng nhập tên, tiêu đề, tóm tắt và nội dung bài viết.');
      return;
    }
    if (!images.length) {
      alert('Vui lòng thêm ít nhất 1 ảnh đại diện cho bài viết.');
      return;
    }
    onSave({
      ...form,
      name: form.name.trim(),
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.content.trim(),
      description: form.summary.trim(),
      images,
      status: form.status || 'published',
      publishedAt: form.publishedAt || new Date().toISOString().slice(0, 10)
    });
  };

  return <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
    <div className="w-full max-w-4xl my-6 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3 p-5 bg-slate-900 text-white">
        <div><h2 className="text-base font-black text-amber-400">{value ? 'CHỈNH SỬA' : 'THÊM'} BÀI VIẾT {isSubdivision ? 'PHÂN KHU' : 'TIỆN ÍCH'}</h2><p className="text-[11px] text-slate-300 mt-1">Chuẩn bài chuyên gia bất động sản · ảnh đại diện · tóm tắt · nội dung chi tiết</p></div>
        <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={submit} className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1"><span className="font-bold text-slate-700 dark:text-slate-300">Tên {isSubdivision ? 'phân khu' : 'tiện ích'} *</span><input required value={form.name} onChange={e => set('name', e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white" /></label>
          <label className="space-y-1"><span className="font-bold text-slate-700 dark:text-slate-300">Tiêu đề bài viết chuẩn SEO *</span><input required value={form.title || ''} onChange={e => set('title', e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 font-bold text-slate-900 dark:text-white" /></label>
          <label className="space-y-1"><span className="font-bold text-slate-700 dark:text-slate-300">Tác giả / chuyên gia</span><input value={form.author || ''} onChange={e => set('author', e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white" /></label>
          <label className="space-y-1"><span className="font-bold text-slate-700 dark:text-slate-300">Trạng thái xuất bản</span><select value={form.status || 'published'} onChange={e => set('status', e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white"><option value="published">Đã xuất bản công khai</option><option value="draft">Bản nháp</option></select></label>
        </div>
        <label className="block space-y-1"><span className="font-bold text-slate-700 dark:text-slate-300">Tóm tắt hiển thị trên thẻ bài viết *</span><textarea required rows={3} value={form.summary || ''} onChange={e => set('summary', e.target.value)} placeholder="Khoảng 2–3 câu nêu vị trí, điểm mạnh và giá trị của phân khu/tiện ích..." className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-slate-900 dark:text-white" /></label>
        <label className="block space-y-1"><span className="font-bold text-slate-700 dark:text-slate-300">Nội dung bài viết chuyên sâu *</span><textarea required rows={12} value={form.content || ''} onChange={e => set('content', e.target.value)} placeholder="Dùng Markdown nhẹ: ## Tiêu đề mục, - danh sách, **từ khóa quan trọng**..." className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 font-mono leading-relaxed text-slate-900 dark:text-white" /></label>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2"><div><h3 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-amber-500" /> Ảnh bài viết *</h3><p className="text-[10px] text-slate-500 mt-1">Ảnh đầu tiên là ảnh đại diện, tối đa 8 ảnh.</p></div><label className="cursor-pointer px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center gap-1.5">{busy ? 'Đang tải...' : <><Upload className="w-4 h-4" /> Thêm ảnh</>}<input disabled={busy} type="file" accept="image/*" multiple onChange={e => uploadFiles(e.target.files)} className="hidden" /></label></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{images.map((img, i) => <div key={`${img}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"><img src={img} alt={`${form.name} ${i + 1}`} className="w-full h-full object-cover" /><button type="button" onClick={() => set('images', images.filter((_, index) => index !== i))} className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white"><Trash2 className="w-3.5 h-3.5" /></button>{i === 0 && <span className="absolute bottom-1 left-1 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-bold text-white">Ảnh đại diện</span>}</div>)}</div>
          <div className="flex gap-2"><input placeholder="Hoặc dán URL ảnh https://..." className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const input = e.currentTarget; if (input.value.trim()) { set('images', [...images, input.value.trim()]); input.value = ''; } } }} /><span className="self-center text-[10px] text-slate-500">Nhấn Enter để thêm</span></div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 pt-4"><button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">Hủy</button><button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-1.5"><Save className="w-4 h-4" /> Lưu & hiển thị trên web</button></div>
      </form>
    </div>
  </div>;
};
