import React, { useState } from 'react';
import { X, Sparkles, Send, Copy, Check, FileText, Globe } from 'lucide-react';
import { Language, NewsArticle } from '../types';

interface AiWriterModalProps {
  onClose: () => void;
  onPublishNews: (news: Partial<NewsArticle>) => void;
}

export const AiWriterModal: React.FC<AiWriterModalProps> = ({ onClose, onPublishNews }) => {
  const [topic, setTopic] = useState('Đánh giá tiềm năng tăng giá Shophouse Chà Là Vinhomes Ocean Park 2 năm 2026');
  const [category, setCategory] = useState<'vinhomes' | 'quy-hoach' | 'thi-truong' | 'kinh-nghiem'>('vinhomes');
  const [language, setLanguage] = useState<'Tiếng Việt' | 'English' | 'Chinese'>('Tiếng Việt');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title?: string; summary?: string; content?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    setResult(null);
    setPublished(false);

    try {
      const res = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          category,
          language,
          promptType: 'article'
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result);
      } else {
        alert(data.error || 'Lỗi khi gọi Gemini AI.');
      }
    } catch (err: any) {
      alert('Không thể kết nối đến máy chủ AI: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const fullText = `${result.title}\n\n${result.summary}\n\n${result.content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = () => {
    if (!result) return;
    onPublishNews({
      title: result.title || topic,
      summary: result.summary || 'Bài viết phân tích bởi Gemini AI Assistant',
      content: result.content || 'Nội dung bài viết',
      category: category,
      author: 'Gemini AI Assistant',
      source: 'ai',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    });
    setPublished(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white my-auto animate-in fade-in zoom-in duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 rounded-xl flex items-center justify-center font-black shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black flex items-center">
              AI WRITER STUDIO (GEMINI 3.6 FLASH)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trợ lý AI viết bài chuẩn SEO BĐS Vinhomes Ocean Park 2, 3 & Hạ Long Xanh
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Chủ đề bài viết / Tên bất động sản
            </label>
            <textarea
              required
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập chủ đề (Ví dụ: Phân tích tiềm năng cho thuê căn hộ Ocean Park 3...)"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chuyên mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
              >
                <option value="vinhomes">Tin Vinhomes</option>
                <option value="thi-truong">Thị Trường & Báo Cáo</option>
                <option value="quy-hoach">Quy Hoạch & Hạ Tầng</option>
                <option value="kinh-nghiem">Kinh Nghiệm Đầu Tư</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngôn ngữ bài viết</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
              >
                <option value="Tiếng Việt">🇻🇳 Tiếng Việt</option>
                <option value="English">🇬🇧 English</option>
                <option value="Chinese">🇨🇳 中文</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Đang sinh bài viết với Gemini AI...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Bắt Đầu Tạo Bài Viết Tự Động</span>
              </>
            )}
          </button>
        </form>

        {/* Output Result */}
        {result && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-500 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Kết quả sinh bởi Gemini AI
              </span>

              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? 'Đã chép' : 'Sao chép'}
                </button>

                <button
                  onClick={handlePublish}
                  disabled={published}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                >
                  {published ? 'Đã Xuất Bản!' : 'Đăng Lên Tin Tức Web'}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-3 max-h-60 overflow-y-auto">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{result.title}</h3>
              <p className="font-semibold text-amber-600 dark:text-amber-400 italic">{result.summary}</p>
              <div className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {result.content}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
