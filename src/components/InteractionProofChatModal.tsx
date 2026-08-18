import React, { useState } from 'react';
import { 
  X, Send, ThumbsUp, MessageCircle, Share2, Star, CheckCircle2, 
  Sparkles, ShieldCheck, MessageSquare, Bell, Image as ImageIcon 
} from 'lucide-react';
import { playMessageRingtone } from '../lib/audioRingtone';

interface InteractionProofChatModalProps {
  user: any;
  onClose: () => void;
  onGrantPoints: (points: number, activityName: string) => void;
}

export const InteractionProofChatModal: React.FC<InteractionProofChatModalProps> = ({
  user,
  onClose,
  onGrantPoints
}) => {
  const [selectedActivity, setSelectedActivity] = useState<string>('like');
  const [proofNote, setProofNote] = useState<string>('');
  const [proofImage, setProofImage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

  const activities = [
    {
      id: 'like',
      icon: ThumbsUp,
      title: '👍 Like & Yêu Thích Bài Đăng Trang Chính',
      desc: 'Thả tim hoặc bấm Yêu thích 5 bài đăng BĐS/Gian hàng trên Chợ Cư Dân',
      points: 5,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    },
    {
      id: 'comment',
      icon: MessageCircle,
      title: '💬 Bình Luận Tích Cực & Đánh Giá Văn Minh',
      desc: 'Để lại bình luận hỏi hàng, tư vấn lịch sự hoặc feedback tốt cho gian hàng',
      points: 10,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'share',
      icon: Share2,
      title: '🔄 Chia Sẻ Link Chợ Cư Dân Lên MXH & Group',
      desc: 'Share link bài đăng hoặc Chợ Cư Dân 24h lên Facebook, Zalo, TikTok',
      points: 15,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'review',
      icon: Star,
      title: '🌟 Đánh Giá 5 Sao Gian Hàng Cư Dân',
      desc: 'Viết nhận xét 5 sao giúp gian hàng nội khu tăng uy tín',
      points: 10,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    }
  ];

  const currentAct = activities.find(a => a.id === selectedActivity) || activities[0];

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofNote.trim()) {
      alert('Vui lòng nhập ghi chú hoặc link bằng chứng tương tác!');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      // Play sound chime for admin chat confirmation
      playMessageRingtone();

      setIsSending(false);
      setSentSuccess(true);
      setEarnedPoints(currentAct.points);

      // Save into admin support log localStorage
      const proofLog = {
        id: `proof-${Date.now()}`,
        userId: user.id || 'usr-guest',
        userName: user.name || 'Cư Dân',
        userPhone: user.phone || '0868.499.929',
        activityTitle: currentAct.title,
        points: currentAct.points,
        note: proofNote,
        imageUrl: proofImage || null,
        status: 'approved',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
      };

      const existingLogs = JSON.parse(localStorage.getItem('admin_proof_logs') || '[]');
      existingLogs.unshift(proofLog);
      localStorage.setItem('admin_proof_logs', JSON.stringify(existingLogs));

      // Grant points to user immediately
      onGrantPoints(currentAct.points, currentAct.title);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] rounded uppercase">
                CHAT APP ADMIN • ĐỔI LƯỢT UP BÀI
              </span>
              <h2 className="text-sm font-black text-white">
                Gửi Bằng Chứng Tương Tác Đổi Lượt Up Tin
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {sentSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-amber-300">
                  🎉 ĐÃ GỬI BẰNG CHỨNG THÀNH CÔNG TỚI ADMIN CHAT!
                </h3>
                <p className="text-slate-300 text-xs">
                  Hệ thống đã tự động xác nhận và **CỘNG NGAY +{earnedPoints} LƯỢT UP TIN** vào tài khoản của cư dân <strong className="text-white">{user?.name || 'Cư Dân'}</strong>!
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-left space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Hoạt động:</span>
                  <span className="font-bold text-amber-400">{currentAct.title}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Trạng thái Admin Chat:</span>
                  <span className="font-bold text-emerald-400">🟢 Đã Duyệt Tự Động (+{earnedPoints} Up)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase transition shadow-lg text-xs"
              >
                ĐÃ HIỂU - DÙNG LƯỢT UP TIN NGAY
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitProof} className="space-y-4">
              
              {/* Select Activity */}
              <div>
                <label className="block font-extrabold text-amber-300 mb-2">
                  1. Chọn hoạt động tương tác bạn đã thực hiện trên Chợ Cư Dân:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {activities.map(act => {
                    const IconComp = act.icon;
                    const isSelected = selectedActivity === act.id;
                    return (
                      <div
                        key={act.id}
                        onClick={() => setSelectedActivity(act.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-xl border shrink-0 ${act.color}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs truncate">{act.title}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{act.desc}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[11px] rounded-xl shrink-0 shadow-xs">
                          +{act.points} Up
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proof Details Form */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    2. Mô tả bằng chứng tương tác hoặc Link bài đăng (*):
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    placeholder="Ví dụ: Đã thả tim 5 bài đăng BĐS S2.01 & để lại bình luận tích cực gian hàng cơm tấm Căn 12.08..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    3. Link Ảnh chụp màn hình (Không bắt buộc):
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={proofImage}
                      onChange={(e) => setProofImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl uppercase tracking-wider transition shadow-lg text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isSending ? (
                  <span>Đang Gửi Tin Nhắn Tới Admin Chat...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>💬 GỬI TỚI CHAT APP ADMIN ĐỔI +{currentAct.points} UP TIN</span>
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
