with open('src/pages/AdminDashboardPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

dup_block = """      {/* ==================== MẢNG 2: TAB QUẢN TRỊ TUYỂN DỤNG & VIỆC LÀM ==================== */}
      {activeTab === 'recruitment_mgmt' && (
        <AdminRecruitmentManager onRefresh={onRefreshData} />
      )}"""

if dup_block in text:
    text = text.replace(dup_block, "")
    print("Removed duplicate recruitment render block!")

with open('src/pages/AdminDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
