import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Home, ChevronRight, Calendar, User, Eye, Share2, 
  Sparkles, ArrowLeft, Tag, MessageSquare, ShieldCheck
} from 'lucide-react';
import { NewsArticle, Language } from '../types';
import { SEOHead } from '../components/SEOHead';
import { SocialShareModal } from '../components/SocialShareModal';
import { slugify } from '../lib/slugs';

interface NewsArticleDetailPageProps {
  news: NewsArticle[];
  language: Language;
}

export const NewsArticleDetailPage: React.FC<NewsArticleDetailPageProps> = ({ news, language }) => {
  const { postSlug, categorySlug } = useParams<{ postSlug?: string; categorySlug?: string }>();
  const [showShareModal, setShowShareModal] = useState(false);

  // Match article by id or slugified title or url param
  const article = news.find(n => 
    n.id === postSlug || 
    n.id === decodeURIComponent(postSlug || '') ||
    slugify(n.title) === postSlug ||
    n.id === categorySlug
  );

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Không tìm thấy bài viết
        </h1>
        <p className="text-xs text-slate-500">
          Bài viết có thể đã được gỡ xuống hoặc chuyển sang chuyên mục khác.
        </p>
        <Link
          to="/tin-tuc"
          className="inline-block px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md"
        >
          Xem Chuyên Mục Tin Tức & Cẩm Nang
        </Link>
      </div>
    );
  }

  const categoryName = 
    article.category === 'vinhomes' ? 'Thị Trường Vinhomes' :
    article.category === 'planning' ? 'Quy Hoạch & Hạ Tầng' :
    article.category === 'policy' ? 'Chính Sách & Lãi Suất' :
    article.category === 'guide' ? 'Cẩm Nang Cư Dân' : 'Tin Tức BĐS';

  const relatedArticles = news
    .filter(n => n.id !== article.id && (n.category === article.category || !article.category))
    .slice(0, 3);

  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={article.title}
        description={article.summary || article.content.substring(0, 160)}
        image={article.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
        url={shareUrl}
        type="article"
        keywords={`${article.title}, tin tức vinhomes, ${categoryName}`}
      />

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to="/tin-tuc" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Tin Tức & Cẩm Nang
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to={`/tin-tuc/${article.category || 'chung'}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
              {categoryName}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Reader Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-black rounded-full uppercase tracking-wider">
              {categoryName}
            </span>
            {article.source === 'ai' && (
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Tổng Hợp</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            {article.title}
          </h1>

          {/* Author & Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>{article.author || 'Ban Biên Tập Chợ Cư Dân 24H'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{article.publishedAt || 'Hôm nay'}</span>
              </div>
              {article.views && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.views} lượt xem</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ bài viết</span>
            </button>
          </div>
        </div>

        {/* Lead / Summary Callout */}
        {article.summary && (
          <div className="p-5 bg-slate-100 dark:bg-slate-900 border-l-4 border-emerald-500 rounded-r-2xl text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed">
            {article.summary}
          </div>
        )}

        {/* Featured Image */}
        {article.image && (
          <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-xl bg-slate-950">
            <img loading="lazy"
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
          {article.content}
        </div>

        {/* Share & Source Banner */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Thấy bài viết hữu ích? Chia sẻ ngay!
            </span>
            <p className="text-xs text-slate-500">
              Gửi thông tin này cho cư dân, bạn bè hoặc khách hàng quan tâm BĐS Vinhomes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia Sẻ Link Zalo / Facebook</span>
            </button>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Bài Viết Cùng Chuyên Mục
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map(rel => (
                <Link
                  key={rel.id}
                  to={`/tin-tuc/${rel.category || 'chung'}/${rel.id}`}
                  className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-sm hover:shadow-lg transition space-y-2 p-3"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-950">
                    <img loading="lazy"
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {rel.title}
                  </h3>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{rel.publishedAt || 'Gần đây'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          title={article.title}
          url={shareUrl}
          price="Tin Tức Chợ Cư Dân 24H"
          location="Hệ Thống Vinhomes"
          imageUrl={article.image}
          onClose={() => setShowShareModal(false)}
        />
      )}

    </div>
  );
};
