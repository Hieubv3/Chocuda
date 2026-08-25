with open('src/pages/AdminDashboardPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add handleToggleServiceApproval
approval_func = """  const handleToggleServiceApproval = async (srv: ResidentServiceItem) => {
    const isApproved = srv.status === 'approved' || (srv as any).approved;
    const nextStatus = isApproved ? 'pending' : 'approved';
    const updated = { ...srv, status: nextStatus as any, approved: nextStatus === 'approved' };
    setAdminResidentServices(prev => prev.map(s => s.id === srv.id ? updated : s));
    try {
      await fetch(`/api/resident-services/${srv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      alert(nextStatus === 'approved' ? `✓ Đã phê duyệt và hiển thị dịch vụ "${srv.title}" lên website!` : `⏳ Đã tạm ẩn dịch vụ "${srv.title}".`);
    } catch (e) {
      console.error('Error toggling service approval:', e);
    }
  };

  const handleApproveAllPendingServices = async () => {
    const pendingServices = adminResidentServices.filter(s => s.status === 'pending');
    if (pendingServices.length === 0) {
      alert('Không có bài dịch vụ nào đang chờ duyệt!');
      return;
    }
    if (!confirm(`Bạn có chắc muốn duyệt tất cả ${pendingServices.length} bài dịch vụ cư dân đang chờ?`)) return;
    for (const srv of pendingServices) {
      const updated = { ...srv, status: 'approved' as const, approved: true };
      try {
        await fetch(`/api/resident-services/${srv.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (e) {}
    }
    setAdminResidentServices(prev => prev.map(s => ({ ...s, status: 'approved', approved: true })));
    alert(`✓ Đã duyệt toàn bộ ${pendingServices.length} dịch vụ cư dân thành công!`);
  };
"""

marker = "const handleToggleServiceKyc = async"
if marker in text and "handleToggleServiceApproval" not in text:
    text = text.replace(marker, approval_func + "\n  " + marker)
    print("1. Added handleToggleServiceApproval and handleApproveAllPendingServices")

# 2. Update service card controls in resident_services_mgmt to display Approval status button
old_srv_action_card = """                        <button
                          onClick={() => handleToggleServiceKyc(srv)}
                          className={`py-2.5 rounded-xl font-black text-[11px] transition flex items-center justify-center gap-1 shadow-md cursor-pointer ${
                            isVerified
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110'
                          }`}
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>{isVerified ? 'Gỡ KYC' : 'Cấp KYC'}</span>
                        </button>"""

new_srv_action_card = """                        <button
                          onClick={() => handleToggleServiceApproval(srv)}
                          className={`py-2.5 rounded-xl font-black text-[11px] transition flex items-center justify-center gap-1 shadow-md cursor-pointer ${
                            srv.status === 'approved' || (srv as any).approved
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{srv.status === 'approved' || (srv as any).approved ? '✓ Đã Duyệt Web' : '⏳ Chờ Duyệt (Duyệt)'}</span>
                        </button>
                        <button
                          onClick={() => handleToggleServiceKyc(srv)}
                          className={`py-2.5 rounded-xl font-black text-[11px] transition flex items-center justify-center gap-1 shadow-md cursor-pointer ${
                            isVerified
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110'
                          }`}
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>{isVerified ? 'Gỡ KYC' : 'Cấp KYC'}</span>
                        </button>"""

if old_srv_action_card in text:
    text = text.replace(old_srv_action_card, new_srv_action_card)
    print("2. Added Approval button in resident services cards")

with open('src/pages/AdminDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved enhance_services_admin.py successfully!")
