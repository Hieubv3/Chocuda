with open('src/components/TechnicalServiceEscrowModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_deposit_btn = """                  <button
                    onClick={handleDeposit}
                    disabled={isDepositing}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isDepositing ? 'Đang xác nhận...' : 'Xác Nhận Đã Chuyển Khoản Nạp Tiền'}</span>
                  </button>"""

new_deposit_btn = """                  {/* Direct Mobile Banking Launcher */}
                  <a
                    href={`https://dl.vietqr.io/pay?bank=MSB&account=3028031988&amount=${depositAmount || 50000}&memo=${encodeURIComponent(`NAP TIEN VI ${userId}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 transition"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mở App Ngân Hàng Nạp Tiền Tự Động</span>
                  </a>

                  {/* Real-time Webhook Radar Detection */}
                  <div className="p-2.5 bg-emerald-950/10 rounded-xl border border-dashed border-emerald-500/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800">Tự động cộng số dư khi nhận Webhook</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeposit}
                      disabled={isDepositing}
                      className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md border border-emerald-300"
                    >
                      {isDepositing ? 'Đang xử lý...' : '⚡ Mô Phỏng Webhook'}
                    </button>
                  </div>"""

if old_deposit_btn in text:
    text = text.replace(old_deposit_btn, new_deposit_btn)
    print("Replaced deposit button in TechnicalServiceEscrowModal.tsx")
else:
    print("Could not find old_deposit_btn")

with open('src/components/TechnicalServiceEscrowModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

