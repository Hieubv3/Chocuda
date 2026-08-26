import re

# ==========================================
# 1. Update AdminDashboardPage.tsx
# ==========================================
with open('src/pages/AdminDashboardPage.tsx', 'r', encoding='utf-8') as f:
    admin_text = f.read()

# Add imports
if 'AdminFinanceHub' not in admin_text:
    import_target = "import { AdminBankWebhookCenter } from '../components/AdminBankWebhookCenter';"
    import_replacement = """import { AdminBankWebhookCenter } from '../components/AdminBankWebhookCenter';
import { AdminFinanceHub } from '../components/AdminFinanceHub';
import { NotificationBellDropdown } from '../components/NotificationBellDropdown';"""
    if import_target in admin_text:
        admin_text = admin_text.replace(import_target, import_replacement, 1)
        print("Admin imports updated successfully!")
    else:
        print("Could not find import_target in AdminDashboardPage.tsx")

# Replace activeTab === 'resident_finance' content with <AdminFinanceHub />
fin_target_start = "{/* ==================== 12. TAB TÀI CHÍNH & CHIẾT KHẤU CHỢ ==================== */}"
if fin_target_start in admin_text:
    idx1 = admin_text.find(fin_target_start)
    idx2 = admin_text.find("{/* ==================== 13. TAB ĐỐI SOÁT UY TÍN", idx1)
    if idx2 == -1:
        idx2 = admin_text.find("{/* ====================", idx1 + 100)
    
    if idx1 != -1 and idx2 != -1:
        new_fin_block = """{/* ==================== 12. TAB TÀI CHÍNH, BƠM TIỀN & SEPAY WEBHOOK ==================== */}
      {activeTab === 'resident_finance' && (
        <AdminFinanceHub users={users} onRefreshUsers={fetchUsers} />
      )}

      """
        admin_text = admin_text[:idx1] + new_fin_block + admin_text[idx2:]
        print("Admin resident_finance block updated with AdminFinanceHub!")

# Add NotificationBellDropdown in Admin Top Bar
topbar_target = '<button\n              onClick={fetchDataStoreState}'
if topbar_target in admin_text and 'NotificationBellDropdown' in admin_text:
    notif_in_topbar = '<NotificationBellDropdown userId="admin" role="admin" />\n            <button\n              onClick={fetchDataStoreState}'
    admin_text = admin_text.replace(topbar_target, notif_in_topbar, 1)
    print("NotificationBellDropdown added to Admin topbar!")

# Add quick direct button for Finance in Admin Top Bar
brand_target = '<span className="text-xl">🛡️</span>'
if brand_target in admin_text and 'Quản Lý Tài Chính & SePay' not in admin_text:
    quick_btn = """<button
              onClick={() => setActiveTab('resident_finance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeTab === 'resident_finance'
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                  : 'bg-teal-600/90 hover:bg-teal-500 text-white'
              }`}
            >
              <span>💰</span>
              <span>Cổng Nạp Rút & SePay</span>
            </button>"""
    idx_brand = admin_text.find('</div>', admin_text.find(brand_target))
    if idx_brand != -1:
        admin_text = admin_text[:idx_brand] + "\n            " + quick_btn + admin_text[idx_brand:]
        print("Quick Finance button added to Admin header!")

with open('src/pages/AdminDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(admin_text)

# ==========================================
# 2. Update UserDashboardPage.tsx
# ==========================================
with open('src/pages/UserDashboardPage.tsx', 'r', encoding='utf-8') as f:
    user_text = f.read()

# Add NotificationBellDropdown import
if 'NotificationBellDropdown' not in user_text:
    user_import_target = "import { UserWalletSection } from '../components/UserWalletSection';"
    user_import_replacement = """import { UserWalletSection } from '../components/UserWalletSection';
import { NotificationBellDropdown } from '../components/NotificationBellDropdown';"""
    if user_import_target in user_text:
        user_text = user_text.replace(user_import_target, user_import_replacement, 1)
        print("User imports updated!")

# Make Top Wallet Box always accessible for all users
top_boxes_target = "{/* Box 1: Token Cư Dân / Ví Doanh Nghiệp (Chỉ hiển thị cho tài khoản được phép kinh doanh) */}"
if top_boxes_target in user_text:
    idx_box1 = user_text.find(top_boxes_target)
    idx_box2 = user_text.find("{/* Box 2: Gian Hàng", idx_box1)
    if idx_box1 != -1 and idx_box2 != -1:
        new_wallet_box = """{/* Box 1: Ví Tài Khoản & Nạp Rút VietQR (Hiển thị cho tất cả cư dân & chủ shop) */}
          <div
            onClick={() => setActiveTab('wallet_tokens')}
            className="bg-slate-900/90 hover:bg-slate-800/90 border-2 border-amber-500/50 p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 shadow-sm group"
            title="Bấm để mở Ví & Nạp tiền tự động VietQR 24/7"
          >
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase block flex items-center gap-1">
                <span>🪙 Ví Cư Dân & Shop</span>
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded font-black">+ Nạp</span>
              </span>
              <span className="text-base font-black text-amber-300 font-mono">
                {(userState.balance || 0).toLocaleString('vi-VN')} <span className="text-[10px]">VNĐ</span>
              </span>
            </div>
            <span className="p-1.5 bg-amber-500/20 group-hover:bg-amber-500/40 text-amber-400 rounded-lg text-xs transition">
              ⚡
            </span>
          </div>

          """
        user_text = user_text[:idx_box1] + new_wallet_box + user_text[idx_box2:]
        print("User header wallet box updated for all users!")

# Update Tab Button Label
old_tab_btn = """<span>{isBusinessAllowed ? '🪙' : '🔒'}</span>
          <span>{isBusinessAllowed ? `Ví Token B2B (${(userState.balance || 0).toLocaleString('vi-VN')})` : 'Ví Kinh Doanh'}</span>"""
new_tab_btn = """<span>🪙</span>
          <span>Ví Tiền & Nạp Rút VietQR ({(userState.balance || 0).toLocaleString('vi-VN')}đ)</span>"""
if old_tab_btn in user_text:
    user_text = user_text.replace(old_tab_btn, new_tab_btn, 1)
    print("User tab button updated!")

# Add NotificationBellDropdown to User Topbar
user_topbar_target = '<button\n              onClick={handleSyncBalance}'
if user_topbar_target in user_text:
    user_notif_topbar = '<NotificationBellDropdown userId={userState.id || "me"} role={userState.role} />\n            <button\n              onClick={handleSyncBalance}'
    user_text = user_text.replace(user_topbar_target, user_notif_topbar, 1)
    print("NotificationBellDropdown added to User topbar!")

with open('src/pages/UserDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(user_text)

print("All updates to Admin and User Dashboard completed successfully!")
