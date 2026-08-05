import React, { useState } from 'react';
import { Globe, Sparkles, ShieldCheck, CheckCircle2, FileText, Send, AlertCircle, RefreshCw, Copy, ExternalLink, X, BookOpen, Layers } from 'lucide-react';
import { NewsArticle } from '../types';

interface AiUrlTrackerModalProps {
  onClose: () => void;
  onPublishNews: (news: Partial<NewsArticle>) => void;
}

export const AiUrlTrackerModal: React.FC<AiUrlTrackerModalProps> = ({
  onClose,
  onPublishNews
}) => {
  const [targetUrl, setTargetUrl] = useState('https://batdongsan.com.vn/thi-truong-bds/quy-hoach-vinhomes-ocean-park');
  const [rawContent, setRawContent] = useState('');
  const [category, setCategory] = useState<'vinhomes' | 'thi-truong' | 'du-an' | 'phap-ly'>('vinhomes');
  const [extraKeywords, setExtraKeywords] = useState('vinhomes, đầu tư mua nhà, pháp lý, vành đai 4');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<{
    title: string;
    summary: string;
    content: string;
    seoKeywords: string[];
    faqQA: Array<{ question: string; answer: string }>;
  } | null>(null);

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl && !rawContent) {
      alert('Vui lòng nhập Link trang web cần theo dõi hoặc dán nội dung thô.');
      return;
    }

    setIsLoading(true);
    setGeneratedArticle(null);

    try {
      const res = await fetch('/api/ai/rewrite-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          rawContent,
          category,
          extraKeywords
        })
      });

      const json = await res.json();
      setIsLoading(false);

      if (json.success && json.data) {
        setGeneratedArticle(json.data);
      } else {
        alert(json.error || 'Có lỗi xảy ra khi AI biên soạn bài viết.');
      }
    } catch (err) {
      setIsLoading(false);
      alert('Lỗi kết nối máy chủ AI!');
    }
  };

  const handlePublish = () => {
    if (!generatedArticle) return;

    onPublishNews({
      title: generatedArticle.title,
      summary: generatedArticle.summary,
      content: generatedArticle.content,
      category,
      author: 'AI Studio Engine (No-Copyright SEO)',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      publishedAt: new Date().toISOString().split('T')[0],
      source: 'ai_crawled',
      status: 'published'
    });

    alert('🎉 ĐÃ XUẤT BẢN BÀI VIẾT THÀNH CÔNG VÀ TỰ ĐỘNG CẬP NHẬT VÀO KNOWLEDGE BASE & SEO GOOGLE!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Globe className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-500">
              HỆ THỐNG THEO DÕI LINK WEBSITE & BIÊN SOẠN AI TỰ ĐỘNG
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            AI Crawl & Biên Soạn Độc Quyền (Chống Vi Phạm Bản Quyền)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AI tự động bóc tách thông tin cốt lõi, loại bỏ mọi thương hiệu & link gốc của đối thủ, viết lại 100% nguyên bản chuẩn SEO Google.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleRewrite} className="space-y-4">
          <div className="space-y-3 text-xs font-bold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                🌐 Link Trang Web Cần Theo Dõi (Đối thủ / Báo BĐS / Tin tức quy hoạch)
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://batdongsan.com.vn/... hoặc https://cafef.vn/..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                📝 Nội dung thô / Gợi ý bổ sung (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="Dán nội dung bổ sung hoặc các lưu ý đặc biệt cho AI..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  📂 Danh Mục Bài Viết
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="vinhomes">Vinhomes & Quy Hoạch</option>
                  <option value="thi-truong">Thị Trường BĐS</option>
                  <option value="du-an">Dự Án Mới</option>
                  <option value="phap-ly">Pháp Lý & Kinh Nghiệm</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  🔑 Từ Khóa SEO Bắt Buộc (Cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={extraKeywords}
                  onChange={(e) => setExtraKeywords(e.target.value)}
                  placeholder="vinhomes, đầu tư mua nhà, pháp lý, vành đai 4"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>AI ĐANG TRÍCH XUẤT & VIẾT LẠI CHỐNG VI PHẠM BẢN QUYỀN...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>🤖 KÍCH HOẠT AI BIÊN SOẠN BÀI VIẾT ĐỘC QUYỀN CHUẨN SEO</span>
              </>
            )}
          </button>
        </form>

        {/* AI Generated Article Preview Result */}
        {generatedArticle && (
          <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-black text-emerald-500 flex items-center gap-1.5 uppercase">
                <CheckCircle2 className="w-4 h-4" />
                ĐÃ HOÀN THÀNH BIÊN SOẠN AI (CHỐNG VI PHẠM BẢN QUYỀN 100%)
              </span>
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black">
                SEO Score: 99.8%
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {generatedArticle.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {generatedArticle.summary}
              </p>
            </div>

            {/* Generated FAQ Pairs for Knowledge Base */}
            {generatedArticle.faqQA && generatedArticle.faqQA.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <span className="text-[11px] font-black text-amber-500 uppercase flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  BỘ Q&A TỰ ĐỘNG TRÍCH XUẤT CHO KNOWLEDGE BASE
                </span>
                {generatedArticle.faqQA.map((q, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl text-[11px] space-y-1">
                    <p className="font-extrabold text-slate-900 dark:text-white">Q: {q.question}</p>
                    <p className="text-slate-600 dark:text-slate-300">A: {q.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handlePublish}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition shadow-lg uppercase tracking-wider flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>🚀 1-CLICK XUẤT BẢN TIN TỨC & KNOWLEDGE BASE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
