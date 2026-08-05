import React, { useState } from 'react';
import { NewsArticle, Language, User } from '../types';
import { Newspaper, Clock, Sparkles, Share2, X, ChevronRight, Check } from 'lucide-react';
import { ProjectFaqHub } from '../components/ProjectFaqHub';
import { SocialShareModal } from '../components/SocialShareModal';
import { getTranslation } from '../lib/i18n';

interface NewsPageProps {
  news: NewsArticle[];
  language: Language;
  currentUser?: User | null;
}

export const NewsPage: React.FC<NewsPageProps> = ({ news, language, currentUser }) => {
  const t = getTranslation(language);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [showShareModalFor, setShowShareModalFor] = useState<NewsArticle | null>(null);

  const filteredNews = selectedCat === 'all'
    ? news
    : news.filter(n => n.category === selectedCat);

  const handleShare = (article: NewsArticle) => {
    setShowShareModalFor(article);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
            TIN TỨC BĐS & PHÂN TÍCH THỊ TRƯỜNG
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            BẢN TIN THỊ TRƯỜNG VINHOMES 24/7
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đồng bộ bài viết tự động từ webhook n8n & Phân tích chuyên sâu từ Gemini AI
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto shrink-0">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCat === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Tất Cả Tin
          </button>
          <button
            onClick={() => setSelectedCat('vinhomes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCat === 'vinhomes' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Tin Vinhomes
          </button>
          <button
            onClick={() => setSelectedCat('thi-truong')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCat === 'thi-truong' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Thị Trường
          </button>
          <button
            onClick={() => setSelectedCat('quy-hoach')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCat === 'quy-hoach' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Quy Hoạch
          </button>
        </div>
      </div>

      {/* n8n Integration Banner Explanation - ONLY VISIBLE TO ADMIN */}
      {currentUser?.role === 'admin' && (
        <div className="p-4 bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 border border-blue-500/30 rounded-2xl text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl font-black text-xs shrink-0">
              n8n
            </div>
            <div>
              <span className="font-extrabold text-blue-300 block">Tích hợp Webhook Đồng Bộ Tin Tức Tự Động (n8n Workflow) [Quản Trị Admin]</span>
              <span className="text-[11px] text-slate-400">Endpoint API: <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded">POST /api/webhooks/n8n-news</code></span>
            </div>
          </div>
          <a
            href="https://n8n.io"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] transition shrink-0"
          >
            Tài Liệu n8n Webhook
          </a>
        </div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredNews.map((article) => (
          <div
            key={article.id}
            onClick={() => setSelectedNews(article)}
            className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                {article.source === 'n8n' && (
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow">
                    n8n Sync
                  </span>
                )}
                {article.source === 'ai' && (
                  <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow">
                    Gemini AI
                  </span>
                )}
                <span className="bg-slate-950/80 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur">
                  {article.category.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center text-[11px] text-slate-400 space-x-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{article.publishedAt}</span>
                  <span>•</span>
                  <span>{article.author}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-500 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {article.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>Đọc bài phân tích</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareModalFor(article);
                    }}
                    className="p-1.5 hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 rounded-lg transition"
                    title="Chia sẻ lên Group Facebook & Zalo"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in duration-200 space-y-6">
            
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs text-amber-500 font-bold">
                <span className="uppercase">{selectedNews.category}</span>
                <span>•</span>
                <span>{selectedNews.publishedAt}</span>
                <span>•</span>
                <span>Bởi: {selectedNews.author}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black leading-snug">{selectedNews.title}</h2>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[16/9] max-h-[360px]">
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 italic">
              "{selectedNews.summary}"
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
              {selectedNews.content}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3 text-xs">
              <button
                onClick={() => setShowShareModalFor(selectedNews)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl flex items-center space-x-2 transition shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Chia Sẻ Lên Group Facebook & Zalo</span>
              </button>

              <a
                href="https://zalo.me/0868499929"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition shadow"
              >
                Thảo luận thêm qua Zalo
              </a>
            </div>

          </div>
        </div>
      )}

      {showShareModalFor && (
        <SocialShareModal
          title={showShareModalFor.title}
          summary={showShareModalFor.summary}
          url={window.location.href}
          onClose={() => setShowShareModalFor(null)}
        />
      )}

      {/* Q&A Knowledge Base Section */}
      <section className="pt-6">
        <ProjectFaqHub />
      </section>

    </div>
  );
};
