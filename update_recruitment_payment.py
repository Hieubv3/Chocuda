with open('src/components/RecruitmentCenterPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_action_bar = """            {/* QR Scan Code Preview */}
            <div className="text-center space-y-2">
              <div className="inline-block p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <img
                  src={`https://img.vietqr.io/image/MSB-3028031988-compact2.png?amount=${candidateToUnlock.unlockPriceVnd || 50000}&addInfo=${encodeURIComponent(`MOKHOA CV ${candidateToUnlock.id}`)}&accountName=BUI%20VAN%20HIEU`}
                  alt="VietQR Mở Khóa CV"
                  className="w-40 h-40 mx-auto object-contain"
                />
              </div>
              <div className="text-[11px] text-slate-400">Quét mã VietQR bằng bất kỳ App Ngân Hàng hoặc nhấn Xác Nhận bên dưới</div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleUnlockCandidate}
                disabled={isUnlocking}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isUnlocking ? 'Đang Mở Khóa...' : 'Xác Nhận Đã Chuyển Khoản & Mở Khóa'}</span>
              </button>
            </div>"""

new_action_bar = """            {/* QR Scan Code Preview */}
            <div className="text-center space-y-3">
              <div className="inline-block p-2 bg-white rounded-2xl border border-slate-200 shadow-md">
                <img
                  src={`https://img.vietqr.io/image/MSB-3028031988-compact2.png?amount=${candidateToUnlock.unlockPriceVnd || 50000}&addInfo=${encodeURIComponent(`MOKHOA CV ${candidateToUnlock.id}`)}&accountName=BUI%20VAN%20HIEU`}
                  alt="VietQR Mở Khóa CV"
                  className="w-44 h-44 mx-auto object-contain"
                />
              </div>
              
              {/* Direct Open Banking App Link */}
              <a
                href={`https://dl.vietqr.io/pay?bank=MSB&account=3028031988&amount=${candidateToUnlock.unlockPriceVnd || 50000}&memo=${encodeURIComponent(`MOKHOA CV ${candidateToUnlock.id}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>Mở App Ngân Hàng Chuyển Khoản</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Automated Real-time Detection Status */}
              <div className="p-3 bg-emerald-950/10 dark:bg-emerald-950/30 rounded-xl border border-dashed border-emerald-500/50 text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                    Đang chờ Webhook trung gian xác nhận tự động...
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Hồ sơ sẽ tự động mở khóa ngay sau khi tiền vào tài khoản (Không cần bấm nút).
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
              
              {/* Simulation Test Button */}
              <button
                type="button"
                onClick={handleUnlockCandidate}
                disabled={isUnlocking}
                className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-[11px] font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1"
                title="Mô phỏng Webhook trung gian gửi thông báo thành công"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Mô Phỏng Webhook Khớp Lệnh</span>
              </button>
            </div>"""

if old_action_bar in text:
    text = text.replace(old_action_bar, new_action_bar)
    print("Replaced unlock action bar in RecruitmentCenterPage.tsx")
else:
    print("Could not find old_action_bar in RecruitmentCenterPage.tsx")

with open('src/components/RecruitmentCenterPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

