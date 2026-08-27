import React, { useState, useEffect } from 'react';
import { Play, Youtube, Video, ExternalLink, Sparkles, CheckCircle2, Plus, Trash2, Link as LinkIcon } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  category: string;
  duration?: string;
  views?: string;
  date?: string;
}

const DEFAULT_CHANNEL_VIDEOS: VideoItem[] = [
  {
    id: 'c1',
    title: 'Kênh Chính Thức Chợ Cư Dân 24H (@chocudan24h) - Review Vinhomes Thực Tế',
    youtubeId: 'LXb3EKWsInQ',
    category: 'Chợ Cư Dân 24H',
    duration: '12:45',
    views: 'Mới đăng',
    date: 'Chính chủ'
  },
  {
    id: 'c2',
    title: 'Phân Tích Bảng Giá Cắt Lỗ & Tiềm Năng Cho Thuê Shophouse Vinhomes',
    youtubeId: '3R103gA65K0',
    category: 'Thị Trường BĐS',
    duration: '08:30',
    views: '@chocudan24h',
    date: 'Mới đăng'
  }
];

interface RealestateVideoChannelSectionProps {
  isAdmin?: boolean;
}

export const RealestateVideoChannelSection: React.FC<RealestateVideoChannelSectionProps> = ({
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'tiktok'>('youtube');
  const [videoList, setVideoList] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('chocudan24h_custom_youtube_videos');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CHANNEL_VIDEOS;
  });

  const [activePlayingId, setActivePlayingId] = useState<string>('c1');
  
  // Custom video input modal state (Admin only)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState('Vinhomes Ocean Park');

  // Save video list to local storage
  useEffect(() => {
    localStorage.setItem('chocudan24h_custom_youtube_videos', JSON.stringify(videoList));
  }, [videoList]);

  // Helper function to extract YouTube Video ID from any link format
  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = cleanUrl.match(/[?&]v=([^&]+)/);
    if (watchMatch && watchMatch[1]) return watchMatch[1];

    // Shortened URL: https://youtu.be/VIDEO_ID
    const shortMatch = cleanUrl.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch && shortMatch[1]) return shortMatch[1];

    // Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
    const shortsMatch = cleanUrl.match(/shorts\/([^?&]+)/);
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

    // Embed URL: https://www.youtube.com/embed/VIDEO_ID
    const embedMatch = cleanUrl.match(/embed\/([^?&]+)/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    // Direct 11-char ID
    if (cleanUrl.length === 11 && !cleanUrl.includes('/')) return cleanUrl;

    return null;
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYoutubeId(newVideoUrl);
    if (!ytId) {
      alert('⚠️ Đường dẫn YouTube không hợp lệ. Vui lòng dán đường dẫn dạng:\n• https://www.youtube.com/watch?v=...\n• https://youtu.be/...\n• https://www.youtube.com/shorts/...');
      return;
    }

    const newVid: VideoItem = {
      id: 'custom_' + Date.now(),
      title: newVideoTitle.trim() || `Video Review Thực Tế Kênh @chocudan24h (${ytId})`,
      youtubeId: ytId,
      category: newVideoCategory,
      duration: 'Thực tế',
      views: 'Kênh @chocudan24h',
      date: 'Vừa thêm'
    };

    setVideoList([newVid, ...videoList]);
    setActivePlayingId(newVid.id);
    setNewVideoUrl('');
    setNewVideoTitle('');
    setShowAddModal(false);
    alert('✓ Đã cập nhật Video từ kênh YouTube của bạn lên website thành công!');
  };

  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa video này khỏi danh sách hiển thị?')) {
      const updated = videoList.filter(v => v.id !== id);
      setVideoList(updated);
      if (activePlayingId === id && updated.length > 0) {
        setActivePlayingId(updated[0].id);
      }
    }
  };

  const currentVideo = videoList.find(v => v.id === activePlayingId) || videoList[0];

  return (
    <div className="space-y-6 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Matching Screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6 relative z-10">
        <div>
          <span className="text-xs font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            KÊNH TRUYỀN THÔNG CHÍNH THỨC (@chocudan24h)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
            VIDEO NHẬN ĐỊNH THỊ TRƯỜNG THỰC TẾ & REVIEW DỰ ÁN
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hiển thị trực tiếp các video chính chủ đăng tải tại kênh YouTube & TikTok <b className="text-amber-300">@chocudan24h</b>.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg flex items-center gap-1.5 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Quản Lý Kênh (Admin)</span>
            </button>
          )}

          <a
            href="https://www.youtube.com/@chocudan24h?sub_confirmation=1"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Youtube className="w-4 h-4 fill-current" />
            <span>Kênh @chocudan24h</span>
          </a>

          <a
            href="https://www.tiktok.com/@chocudan24h"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs sm:text-sm rounded-xl transition border border-slate-700 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Video className="w-4 h-4" />
            <span>TikTok Kênh</span>
          </a>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'youtube'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4" />
            <span>YOUTUBE CHÍNH CHỦ ({videoList.length} Video)</span>
          </button>

          <button
            onClick={() => setActiveTab('tiktok')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'tiktok'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>TIKTOK @CHOCUDAN24H</span>
          </button>
        </div>

        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Xác thực chính chủ kênh: @chocudan24h</span>
        </span>
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-white text-base">Thêm Video Từ Kênh YouTube Của Bạn</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Dán đường dẫn Video YouTube của bạn (Watch / Shorts / Share link):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tiêu đề Video hiển thị:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Review Căn Hộ Cắt Lỗ Sâu Vinhomes Ocean Park 2 - Tháng 8/2026"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Phân loại BĐS / Dự án:</label>
                <select
                  value={newVideoCategory}
                  onChange={(e) => setNewVideoCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  <option value="Vinhomes Ocean Park 1, 2, 3">Vinhomes Ocean Park 1, 2, 3</option>
                  <option value="Hạ Long Xanh">Hạ Long Xanh</option>
                  <option value="Vinhomes Vũ Yên Hải Phòng">Vinhomes Vũ Yên Hải Phòng</option>
                  <option value="Nhận Định Thị Trường">Nhận Định Thị Trường</option>
                  <option value="Chợ Cư Dân 24H">Chợ Cư Dân 24H</option>
                </select>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 leading-relaxed">
                💡 <b>Mẹo:</b> Bạn có thể vào kênh <b>YouTube @chocudan24h</b> của bạn, chọn video bất kỳ, nhấn <b>Chia sẻ → Sao chép đường dẫn</b> rồi dán vào đây để hiển thị trực tiếp video phát trên website!
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  ✓ Cập Nhật Video Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Video Section Grid */}
      {activeTab === 'youtube' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Main Featured Player */}
          <div className="lg:col-span-8 space-y-3">
            {currentVideo ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=0&rel=0`}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <p className="text-xs text-slate-400">Chưa có video nào. Bấm "Thêm Video Kênh Của Tôi" để dán link YouTube!</p>
              </div>
            )}

            {/* Currently Playing Info */}
            {currentVideo && (
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">
                    {currentVideo.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">
                    {currentVideo.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>🔴 Phát trực tiếp từ kênh @chocudan24h</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">✓ Video chính chủ</span>
                  </div>
                </div>

                <a
                  href={`https://www.youtube.com/watch?v=${currentVideo.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow"
                >
                  <span>Xem trên YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Playlist Sidebar Grid */}
          <div className="lg:col-span-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                DANH SÁCH VIDEO KÊNH CHÍNH THỨC
              </h4>
              {isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm video</span>
                </button>
              )}
            </div>

            {videoList.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-700 rounded-2xl text-slate-500 text-xs">
                Hiện chưa có video nào được đăng tải từ kênh chính thức @chocudan24h.
              </div>
            ) : (
              videoList.map((vid) => {
                const isPlaying = currentVideo?.id === vid.id;
                return (
                  <div
                    key={vid.id}
                    onClick={() => setActivePlayingId(vid.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex gap-3 items-center group relative ${
                      isPlaying
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0">
                      <img loading="lazy"
                        src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className={`w-6 h-6 ${isPlaying ? 'text-amber-400 fill-amber-400' : 'text-white'}`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                        {vid.category}
                      </span>
                      <h5 className="text-xs font-bold line-clamp-2 leading-snug mt-0.5">
                        {vid.title}
                      </h5>
                    </div>

                    {/* Delete Custom Video Button (Admin only) */}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteVideo(vid.id, e)}
                        title="Xóa khỏi danh sách"
                        className="absolute right-2 top-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      ) : (
        /* TikTok Shorts Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {[
            {
              title: 'Căn Shophouse Chà Là 8Tỷ2 Vinhomes Ocean Park 2 - Kênh @chocudan24h',
              user: '@chocudan24h',
              likes: '12.4k'
            },
            {
              title: 'Cắt lỗ sâu biệt thự San Hô 15 tỷ còn 11.5 tỷ - Kênh @chocudan24h',
              user: '@chocudan24h',
              likes: '24.1k'
            },
            {
              title: 'Tiến độ xây dựng thực tế dự án Hạ Long Xanh - Kênh @chocudan24h',
              user: '@chocudan24h',
              likes: '18.9k'
            },
            {
              title: 'Khu vui chơi VinWonders & Bãi biển Ocean Park 3 - Kênh @chocudan24h',
              user: '@chocudan24h',
              likes: '31.2k'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-3 hover:border-amber-500/50 transition group"
            >
              <div className="aspect-[9/14] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-700 flex items-center justify-center">
                <img loading="lazy"
                  src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent flex flex-col justify-between p-3">
                  <div className="flex justify-between items-center">
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                      TikTok @chocudan24h
                    </span>
                    <span className="text-[10px] text-white/90 font-bold">❤️ {item.likes}</span>
                  </div>

                  <a
                    href="https://www.tiktok.com/@chocudan24h"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </a>

                  <div>
                    <p className="text-xs font-bold text-white line-clamp-2">{item.title}</p>
                    <span className="text-[10px] text-amber-300 font-semibold">{item.user}</span>
                  </div>
                </div>
              </div>

              <a
                href="https://www.tiktok.com/@chocudan24h"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <span>Mở Kênh TikTok @chocudan24h</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Info Banner */}
      <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Kênh truyền thông chính thức <b>@chocudan24h</b>: Các video review thực tế và nhận định thị trường được cập nhật định kỳ từ Ban Quản Trị.</span>
        </div>
        <a
          href="https://www.youtube.com/@chocudan24h"
          target="_blank"
          rel="noreferrer"
          className="text-amber-400 font-bold hover:underline shrink-0"
        >
          Truy cập YouTube @chocudan24h →
        </a>
      </div>

    </div>
  );
};

