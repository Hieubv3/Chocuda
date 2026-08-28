import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { CheckCircle2, XCircle, Eye, FileText, Clock, ShieldCheck, AlertTriangle, Calendar, User } from 'lucide-react';

interface NewsReviewCenterProps {
  news: NewsArticle[];
  onUpdateNews?: (article: NewsArticle) => void;
  onDeleteNews?: (id: string) => void;
}

// ---- Markdown → HTML đơn giản (an toàn: escape trước, render sau) ----
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inUl = false, inOl = false, inTable = false, inQuote = false;
  let tableRows: string[] = [];

  const closeLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };
  const closeQuote = () => { if (inQuote) { out.push('</blockquote>'); inQuote = false; } };
  const closeTable = () => {
    if (inTable) {
      out.push('<table>');
      let first = true;
      for (const row of tableRows) {
        const cells = row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        const tag = first ? 'th' : 'td';
        out.push('<tr>' + cells.map(c => `<${tag}>${inlineMd(c)}</${tag}>`).join('') + '</tr>');
        first = false;
      }
      out.push('</table>');
      inTable = false; tableRows = [];
    }
  };

  const inlineMd = (t: string): string => {
    let s = escapeHtml(t);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/`(.+?)`/g, '<code>$1</code>');
    return s;
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (/^\|/.test(trimmed)) {
      if (!inTable) { closeLists(); closeQuote(); inTable = true; tableRows = []; }
      if (/^\|[\s\-:|]+\|?$/.test(trimmed) && !/[a-zA-Z0-9À-ỹ]/.test(trimmed)) continue;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) closeTable();

    let m;
    if ((m = trimmed.match(/^###\s+(.+)$/))) { closeLists(); closeQuote(); out.push(`<h3>${inlineMd(m[1])}</h3>`); continue; }
    if ((m = trimmed.match(/^##\s+(.+)$/))) { closeLists(); closeQuote(); out.push(`<h2>${inlineMd(m[1])}</h2>`); continue; }
    if ((m = trimmed.match(/^#\s+(.+)$/))) { closeLists(); closeQuote(); out.push(`<h1>${inlineMd(m[1])}</h1>`); continue; }
    if (/^---+\s*$/.test(trimmed)) { closeLists(); closeQuote(); out.push('<hr/>'); continue; }
    if ((m = trimmed.match(/^>\s?(.*)$/))) {
      if (!inQuote) { closeLists(); inQuote = true; out.push('<blockquote>'); }
      out.push(inlineMd(m[1]));
      continue;
    } else closeQuote();
    if ((m = trimmed.match(/^[-•]\s+(.+)$/))) {
      if (!inUl) { if (inOl) { out.push('</ol>'); inOl = false; } inUl = true; out.push('<ul>'); }
      out.push(`<li>${inlineMd(m[1])}</li>`);
      continue;
    } else if (inUl) closeLists();
    if ((m = trimmed.match(/^\d+[\.\)]\s+(.+)$/))) {
      if (!inOl) { if (inUl) { out.push('</ul>'); inUl = false; } inOl = true; out.push('<ol>'); }
      out.push(`<li>${inlineMd(m[1])}</li>`);
      continue;
    } else if (inOl) closeLists();
    if (trimmed === '') continue;
    out.push(`<p>${inlineMd(trimmed)}</p>`);
  }
  closeLists(); closeQuote(); closeTable();
  return out.join('\n');
}

const CAT_LABEL: Record<string, string> = {
  'vinhomes': 'Tin Vinhomes',
  'quy-hoach': 'Quy Hoạch',
  'thi-truong': 'Thị Trường',
  'nhan-dinh': 'Nhận Định',
  'kinh-nghiem': 'Kinh Nghiệm',
};

export const NewsReviewCenter: React.FC<NewsReviewCenterProps> = ({ news, onUpdateNews, onDeleteNews }) => {
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);

  // Bài chờ duyệt = draft (chưa xuất bản public)
  const pending = news.filter(n => n.status === 'draft');
  const publishedCount = news.length - pending.length;

  const handleApprove = (art: NewsArticle) => {
    if (!onUpdateNews) return;
    if (confirm(`✅ Duyệt bài viết "${art.title}"?\n\nSau khi duyệt, bài sẽ được XUẤT BẢN CÔNG KHAI trên website.`)) {
      onUpdateNews({ ...art, status: 'published' });
    }
  };

  const handleReject = (art: NewsArticle) => {
    if (!onDeleteNews) return;
    if (confirm(`❌ Từ chối bài viết "${art.title}"?\n\nBài viết sẽ bị XÓA khỏi hệ thống.`)) {
      onDeleteNews(art.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">
                📋 CHƯƠNG TRÌNH DUYỆT BÀI VIẾT
              </span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] rounded">
                {pending.length} Bài Chờ Duyệt
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] rounded">
                {publishedCount} Bài Đã Xuất Bản
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>KIỂM DUYỆT TRƯỚC KHI XUẤT BẢN CÔNG KHAI</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Bài viết mới (draft) sẽ <strong className="text-amber-300">KHÔNG hiển thị công khai</strong> cho tới khi bạn bấm <strong className="text-emerald-300">✅ Duyệt</strong>. Bạn có thể xem trước nội dung đầy đủ trước khi quyết định.
            </p>
          </div>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="font-black text-slate-900 dark:text-white">Không có bài viết nào chờ duyệt</p>
          <p className="text-xs text-slate-500 mt-1">Tất cả bài viết đã được xuất bản hoặc không tồn tại bài draft.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(art => (
            <div
              key={art.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-300/60 dark:border-amber-700/60 shadow-sm overflow-hidden hover:border-amber-500 transition"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="sm:w-48 shrink-0 relative aspect-video sm:aspect-auto bg-slate-100 dark:bg-slate-800">
                  <img
                    src={art.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                    alt={art.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md shadow uppercase">
                    {CAT_LABEL[art.category] || art.category || 'Tin Tức'}
                  </span>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-amber-300 font-mono text-[10px] rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" /> CHỜ DUYỆT
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {art.summary || art.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {art.author || 'Ban Quản Trị'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {art.publishedAt || 'Chưa đặt ngày'}</span>
                      <span className="font-mono text-amber-500 font-bold">🆔 {art.id}</span>
                      <span className="font-mono text-slate-500">📄 {art.content?.length || 0} ký tự</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewArticle(art)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem Trước Nội Dung
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(art)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> ✅ Duyệt & Xuất Bản
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(art)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-rose-200 dark:border-rose-800/60 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> ❌ Từ Chối
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewArticle(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-black text-xs text-slate-900 dark:text-white truncate">
                  XEM TRƯỚC BÀI VIẾT — {CAT_LABEL[previewArticle.category] || 'Tin Tức'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body — render như trang công khai */}
            <div className="p-5 sm:p-7 overflow-y-auto">
              <div className="mb-4">
                <span className="inline-block px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded uppercase mb-2">
                  {CAT_LABEL[previewArticle.category] || 'Tin Tức'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {previewArticle.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-2">
                  <span>✍️ {previewArticle.author || 'Ban Quản Trị'}</span>
                  <span>📅 {previewArticle.publishedAt || 'Chưa đặt ngày'}</span>
                  <span className="font-mono">🆔 {previewArticle.id}</span>
                  <span className="px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 font-bold rounded">
                    ⏳ CHỜ DUYỆT — CHƯA XUẤT BẢN
                  </span>
                </div>
              </div>

              <div
                className="news-preview-body text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(previewArticle.content || '') }}
              />

              {/* Warning */}
              <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Lưu ý:</strong> Đây là bản xem trước nội bộ. Bài viết <strong>chưa hiển thị công khai</strong> cho tới khi bạn bấm <strong>✅ Duyệt & Xuất Bản</strong>.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => { handleReject(previewArticle); setPreviewArticle(null); }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition border border-rose-200 dark:border-rose-800/60 cursor-pointer"
              >
                ❌ Từ Chối
              </button>
              <button
                type="button"
                onClick={() => { handleApprove(previewArticle); setPreviewArticle(null); }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition shadow cursor-pointer"
              >
                ✅ Duyệt & Xuất Bản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview body styles */}
      <style>{`
        .news-preview-body h1 { font-size: 1.4rem; font-weight: 800; color: #f59e0b; margin: 1rem 0 0.5rem; }
        .news-preview-body h2 { font-size: 1.15rem; font-weight: 800; color: #f59e0b; margin: 1.2rem 0 0.5rem; padding-left: 0.6rem; border-left: 4px solid #f59e0b; }
        .news-preview-body h3 { font-size: 1rem; font-weight: 700; margin: 1rem 0 0.4rem; }
        .news-preview-body p { margin-bottom: 0.6rem; }
        .news-preview-body strong { font-weight: 700; }
        .news-preview-body ul, .news-preview-body ol { margin: 0.4rem 0 0.8rem 1.4rem; }
        .news-preview-body li { margin-bottom: 0.3rem; }
        .news-preview-body table { width: 100%; border-collapse: collapse; margin: 0.8rem 0; font-size: 0.8rem; }
        .news-preview-body th { background: #f1f5f9; color: #0f172a; text-align: left; padding: 0.5rem 0.6rem; font-weight: 700; }
        .dark .news-preview-body th { background: #1e293b; color: #fbbf24; }
        .news-preview-body td { padding: 0.5rem 0.6rem; border-top: 1px solid #e2e8f0; }
        .dark .news-preview-body td { border-top-color: #334155; }
        .news-preview-body blockquote { border-left: 4px solid #10b981; background: #f0fdf4; padding: 0.6rem 0.9rem; border-radius: 0 0.6rem 0.6rem 0; margin: 0.8rem 0; color: #475569; font-size: 0.85rem; }
        .dark .news-preview-body blockquote { background: #052e16; color: #94a3b8; }
        .news-preview-body hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.2rem 0; }
        .dark .news-preview-body hr { border-top-color: #334155; }
        .news-preview-body code { background: #f1f5f9; padding: 0.1rem 0.35rem; border-radius: 0.3rem; color: #d97706; font-size: 0.8rem; }
        .dark .news-preview-body code { background: #1e293b; color: #fbbf24; }
      `}</style>
    </div>
  );
};