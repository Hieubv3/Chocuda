with open('src/pages/AdminDashboardPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace left sidebar with stable, smooth accordion that stays fixed in place
old_sidebar_start = code.find('{/* === CỘT TAB QUẢN TRỊ BÊN TRÁI (PERSISTENT LEFT SIDEBAR FOR DESKTOP ONLY) === */}')
old_sidebar_end = code.find('{/* === CỘT NỘI DUNG CHÍNH (MAIN WORKSPACE AREA) === */}')

if old_sidebar_start != -1 and old_sidebar_end != -1:
    print("Found sidebar boundaries:", old_sidebar_start, old_sidebar_end)
    
    new_sidebar = """{/* === CỘT TAB QUẢN TRỊ BÊN TRÁI (PERSISTENT LEFT SIDEBAR FOR DESKTOP ONLY) === */}
        <aside className="hidden lg:block lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-3 bg-slate-900 text-white border border-slate-800 rounded-2xl p-3 shadow-xl space-y-3 lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80 pb-2">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              MENU QUẢN TRỊ (7)
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
              v3.8
            </span>
          </div>

          <nav className="space-y-1.5 text-xs" aria-label="Admin Navigation">
            {/* 1. Bất Động Sản */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('bds');
                    setActiveTab('properties');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'bds'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-4 h-4 ${effectiveMainTab === 'bds' ? 'text-white' : 'text-emerald-400'}`} />
                    <span className="text-[12px] font-extrabold">1. Bất Động Sản</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-mono font-bold">
                    {properties.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('bds');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'bds' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.bds ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.bds ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Sub-items for BDS */}
              {expandedNavSections.bds && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('all'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'properties' && propertySubFilter === 'all'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Tất Cả BĐS</span>
                    <span className="font-mono text-[10px]">{properties.length}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('sale'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'properties' && propertySubFilter === 'sale'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Mua Bán</span>
                    <span className="font-mono text-[10px]">{saleProperties.length}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('rent'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'properties' && propertySubFilter === 'rent'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Cho Thuê</span>
                    <span className="font-mono text-[10px]">{rentProperties.length}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('pending'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'properties' && propertySubFilter === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Chờ Duyệt</span>
                    <span className="font-mono text-[10px] text-amber-400 font-bold">{pendingProperties.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'projects'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Dự Án & Mặt Bằng</span>
                    <span className="font-mono text-[10px]">{projects.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('news')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'news'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Tin Tức & Bài Viết</span>
                    <span className="font-mono text-[10px]">{news.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('pricing')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'pricing'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Bảng Giá Dịch Vụ
                  </button>

                  <button
                    onClick={() => setActiveTab('affiliate_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'affiliate_mgmt'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Đối Tác & Hoa Hồng
                  </button>
                </div>
              )}
            </div>

            {/* 2. Thợ Dịch Vụ & Kỹ Thuật */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('technicians');
                  setActiveTab('resident_services_mgmt');
                }}
                className={`w-full p-2.5 font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'technicians'
                    ? 'bg-orange-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className={`w-4 h-4 ${effectiveMainTab === 'technicians' ? 'text-slate-950' : 'text-orange-400'}`} />
                  <span className="text-[12px] font-extrabold">2. Thợ & Dịch Vụ</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-mono font-bold">
                  {adminResidentServices.length}
                </span>
              </button>
            </div>

            {/* 3. Tuyển Dụng & Việc Làm */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('recruitment');
                  setActiveTab('recruitment_mgmt');
                }}
                className={`w-full p-2.5 font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'recruitment'
                    ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className={`w-4 h-4 ${effectiveMainTab === 'recruitment' ? 'text-slate-950' : 'text-teal-400'}`} />
                  <span className="text-[12px] font-extrabold">3. Tuyển Dụng & CV</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-bold">
                  Việc làm
                </span>
              </button>
            </div>

            {/* 4. Chợ Cư Dân */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('resident_market');
                    setActiveTab('stores_mgmt');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'resident_market'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Store className={`w-4 h-4 ${effectiveMainTab === 'resident_market' ? 'text-slate-950' : 'text-amber-400'}`} />
                    <span className="text-[12px] font-extrabold">4. Chợ Cư Dân</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-mono font-bold">
                    {adminStores.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('resident_market');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'resident_market' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.resident_market ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.resident_market ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedNavSections.resident_market && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => setActiveTab('stores_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'stores_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Gian Hàng & Shop</span>
                    <span className="font-mono text-[10px]">{adminStores.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'orders_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Quản Lý Đơn Hàng</span>
                    <span className="font-mono text-[10px]">{adminStoreOrders.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('package_orders_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'package_orders_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Gói Tiện Ích Cư Dân</span>
                    <span className="font-mono text-[10px]">{adminPackageOrders.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('resident_finance')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'resident_finance'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Doanh Thu & Quyết Toán
                  </button>

                  <button
                    onClick={() => setActiveTab('partners_reputation')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'partners_reputation'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Đánh Giá Uy Tín</span>
                    <span className="font-mono text-[10px]">{adminReputationPosts.length}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Thành Viên & Khách Hàng */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('users_leads');
                    setActiveTab('users');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'users_leads'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-4 h-4 ${effectiveMainTab === 'users_leads' ? 'text-white' : 'text-blue-400'}`} />
                    <span className="text-[12px] font-extrabold">5. Thành Viên & Khách</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-mono font-bold">
                    {registeredUsers.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('users_leads');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'users_leads' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.users_leads ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.users_leads ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedNavSections.users_leads && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-blue-500/20 text-blue-300 font-extrabold border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Danh Sách Thành Viên</span>
                    <span className="font-mono text-[10px]">{registeredUsers.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('leads')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'leads'
                        ? 'bg-blue-500/20 text-blue-300 font-extrabold border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Khách Hẹn Xem Nhà</span>
                    <span className="font-mono text-[10px]">{contacts.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('enterprise_core')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'enterprise_core'
                        ? 'bg-blue-500/20 text-blue-300 font-extrabold border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Phân Quyền & Quản Trị
                  </button>
                </div>
              )}
            </div>

            {/* 6. Banner & Quảng Cáo */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('ads');
                  setActiveTab('ads');
                }}
                className={`w-full p-2.5 font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'ads'
                    ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${effectiveMainTab === 'ads' ? 'text-white' : 'text-rose-400'}`} />
                  <span className="text-[12px] font-extrabold">6. Quảng Cáo Banner</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-mono font-bold">
                  {adsList.length}
                </span>
              </button>
            </div>

            {/* 7. Công Cụ & Bot Hệ Thống */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('tools');
                    setActiveTab('analytics');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'tools'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className={`w-4 h-4 ${effectiveMainTab === 'tools' ? 'text-white' : 'text-indigo-400'}`} />
                    <span className="text-[12px] font-extrabold">7. Công Cụ & Bot</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-bold">
                    SEO
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('tools');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'tools' ? 'bg-indigo-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.tools ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.tools ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedNavSections.tools && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Thống Kê Truy Cập
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'seo'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Tối Ưu SEO
                  </button>
                  <button
                    onClick={() => setActiveTab('marketing')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'marketing'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Truyền Thông & Social
                  </button>
                  <button
                    onClick={() => setActiveTab('zalo')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'zalo'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Cộng Đồng Zalo
                  </button>
                  <button
                    onClick={() => setActiveTab('workspace_sync')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'workspace_sync'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Google Workspace
                  </button>
                  <button
                    onClick={() => setActiveTab('n8n')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'n8n'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Tự Động Hóa n8n
                  </button>
                </div>
              )}
            </div>
          </nav>
        </aside>
        """
    code = code[:old_sidebar_start] + new_sidebar + code[old_sidebar_end:]
    with open('src/pages/AdminDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed Admin Sidebar successfully!")
else:
    print("Failed to find sidebar boundaries")
