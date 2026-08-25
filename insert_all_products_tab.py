with open('src/pages/AdminDashboardPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find("{activeTab === 'stores_mgmt' && (() => {")
if idx == -1:
    print("Could not find stores_mgmt render point!")
    exit(1)

all_products_code = """      {/* ==================== TAB TẤT CẢ SẢN PHẨM & MÓN ĂN TOÀN HỆ THỐNG ==================== */}
      {activeTab === 'all_products_mgmt' && (() => {
        // Collect all products with their parent store metadata
        const allProductsList: Array<StoreProduct & { storeId: string; storeName: string; ownerName?: string; ownerPhone?: string; project?: string }> = [];
        adminStores.forEach(st => {
          (st.products || []).forEach(p => {
            allProductsList.push({
              ...p,
              storeId: st.id,
              storeName: st.storeName,
              ownerName: st.ownerName,
              ownerPhone: st.ownerPhone || (st as any).phone,
              project: st.project
            });
          });
        });

        const pendingCount = allProductsList.filter(p => p.status === 'pending').length;
        const approvedCount = allProductsList.filter(p => p.status === 'approved' || p.status === undefined).length;

        // Filter products
        const filteredProducts = allProductsList.filter(p => {
          if (storeProjectFilter !== 'all' && p.project !== storeProjectFilter) return false;
          if (storeModerationFilter === 'pending' && p.status !== 'pending') return false;
          if (storeModerationFilter === 'approved' && p.status === 'pending') return false;
          if (storeSearchQuery.trim()) {
            const q = storeSearchQuery.toLowerCase().trim();
            const matchName = (p.name || '').toLowerCase().includes(q);
            const matchStore = (p.storeName || '').toLowerCase().includes(q);
            const matchCat = (p.category || '').toLowerCase().includes(q);
            const matchOwner = (p.ownerName || '').toLowerCase().includes(q);
            const matchPhone = (p.ownerPhone || '').includes(q);
            if (!matchName && !matchStore && !matchCat && !matchOwner && !matchPhone) return false;
          }
          return true;
        });

        const toggleSingleProductStatus = async (item: typeof allProductsList[0]) => {
          const newStatus = (item.status === 'approved' || item.status === undefined) ? 'pending' : 'approved';
          const targetStore = adminStores.find(s => s.id === item.storeId);
          if (!targetStore) return;

          const updatedProducts = (targetStore.products || []).map(p => 
            p.id === item.id ? { ...p, status: newStatus as any } : p
          );

          const updatedStore = { ...targetStore, products: updatedProducts };
          setAdminStores(prev => prev.map(s => s.id === targetStore.id ? updatedStore : s));

          try {
            await fetch(`/api/stores/${targetStore.id}/products/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            });
          } catch (e) {
            console.error('Error toggling product status:', e);
          }
        };

        const deleteSingleProduct = async (item: typeof allProductsList[0]) => {
          if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${item.name}" khỏi gian hàng "${item.storeName}"?`)) return;
          const targetStore = adminStores.find(s => s.id === item.storeId);
          if (!targetStore) return;

          const updatedProducts = (targetStore.products || []).filter(p => p.id !== item.id);
          const updatedStore = { ...targetStore, products: updatedProducts };
          setAdminStores(prev => prev.map(s => s.id === targetStore.id ? updatedStore : s));

          try {
            await fetch(`/api/stores/${targetStore.id}/products/${item.id}`, {
              method: 'DELETE'
            });
          } catch (e) {
            console.error('Error deleting product:', e);
          }
        };

        const approveAllPendingProducts = async () => {
          if (!confirm(`Duyệt hiển thị tất cả ${pendingCount} sản phẩm đang chờ lên website?`)) return;
          for (const st of adminStores) {
            const hasPending = (st.products || []).some(p => p.status === 'pending');
            if (hasPending) {
              const updatedProds = (st.products || []).map(p => ({ ...p, status: 'approved' as const }));
              const updatedSt = { ...st, products: updatedProds };
              setAdminStores(prev => prev.map(s => s.id === st.id ? updatedSt : s));
              try {
                await fetch(`/api/stores/${st.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedSt)
                });
              } catch (e) {}
            }
          }
          alert('✓ Đã phê duyệt toàn bộ sản phẩm thành công!');
        };

        return (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 p-5 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    QUẢN LÝ TẤT CẢ SẢN PHẨM & MÓN ĂN CƯ DÂN
                  </span>
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] rounded-full">
                    TOÀN BỘ GIAN HÀNG ({allProductsList.length} SẢN PHẨM)
                  </span>
                  {pendingCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-full animate-pulse flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {pendingCount} SẢN PHẨM CHỜ DUYỆT
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-amber-400 mt-1.5 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-amber-400" />
                  <span>DANH MỤC TOÀN BỘ SẢN PHẨM, MÓN ĂN & HÀNG HÓA CƯ DÂN</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Kiểm duyệt, chỉnh sửa giá, phân loại hoặc xóa nhanh mọi mặt hàng từ tất cả các gian hàng trong toàn bộ hệ thống đô thị Vinhomes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {pendingCount > 0 && (
                  <button
                    onClick={approveAllPendingProducts}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer border border-emerald-400/40"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ DUYỆT NHANH TẤT CẢ ({pendingCount})</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (adminStores.length > 0) {
                      setSelectedAdminStore(adminStores[0]);
                      handleOpenAddProduct(adminStores[0].id);
                    } else {
                      alert('Vui lòng tạo ít nhất 1 gian hàng trước khi thêm sản phẩm!');
                    }
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>➕ Thêm Món / Sản Phẩm Mới</span>
                </button>
              </div>
            </div>

            {/* Quick Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm, gian hàng, chủ shop, số điện thoại..."
                    value={storeSearchQuery}
                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {storeSearchQuery && (
                    <button
                      onClick={() => setStoreSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="w-full md:w-56 shrink-0">
                  <select
                    value={storeProjectFilter}
                    onChange={(e) => setStoreProjectFilter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="all">🏢 Tất Cả Dự Án Vinhomes</option>
                    <option value="ocean-park-1">Ocean Park 1 (Gia Lâm)</option>
                    <option value="ocean-park-2">Ocean Park 2 (The Empire)</option>
                    <option value="ocean-park-3">Ocean Park 3 (The Crown)</option>
                    <option value="smart-city">Smart City (Tây Mỗ)</option>
                    <option value="grand-park">Grand Park (TP. Thủ Đức)</option>
                  </select>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Trạng thái:
                </span>
                <button
                  onClick={() => setStoreModerationFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    storeModerationFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({allProductsList.length})
                </button>
                <button
                  onClick={() => setStoreModerationFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                    storeModerationFilter === 'pending'
                      ? 'bg-rose-500 text-white shadow'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Chờ duyệt ({pendingCount})</span>
                </button>
                <button
                  onClick={() => setStoreModerationFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                    storeModerationFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đang hiển thị Web ({approvedCount})</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5">Hình ảnh & Tên Sản Phẩm</th>
                      <th className="p-3.5">Gian Hàng / Chủ Shop</th>
                      <th className="p-3.5">Danh Mục</th>
                      <th className="p-3.5">Giá Bán</th>
                      <th className="p-3.5">Trạng Thái</th>
                      <th className="p-3.5 text-right">Thao Tác Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400">
                          <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                          <p className="font-bold">Không tìm thấy sản phẩm nào phù hợp bộ lọc.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => {
                        const isApproved = prod.status === 'approved' || prod.status === undefined;
                        const parentStore = adminStores.find(s => s.id === prod.storeId);

                        return (
                          <tr key={`${prod.storeId}-${prod.id}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            {/* Image & Title */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.images && prod.images.length > 0 ? prod.images[0] : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="font-extrabold text-slate-900 dark:text-white block truncate max-w-xs sm:max-w-md">
                                    {prod.name}
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    <span className="font-mono">{prod.code || 'SKU-Auto'}</span>
                                    {prod.stockQuantity !== undefined && (
                                      <span>• Kho: <strong>{prod.stockQuantity} {prod.unit || 'món'}</strong></span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Store Name & Owner */}
                            <td className="p-3.5">
                              <div className="text-xs">
                                <span className="font-black text-emerald-600 dark:text-emerald-400 block truncate max-w-[180px]">
                                  🏪 {prod.storeName}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                  👤 {prod.ownerName || 'Cư dân'} {prod.ownerPhone && `• ${prod.ownerPhone}`}
                                </span>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-3.5">
                              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg border border-slate-200 dark:border-slate-700">
                                {prod.category || 'Món Ăn & Đồ Uống'}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="p-3.5">
                              <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                                {Number(prod.price || 0).toLocaleString('vi-VN')} đ
                              </span>
                              {prod.unit && <span className="text-[10px] text-slate-400 block">/{prod.unit}</span>}
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              <button
                                onClick={() => toggleSingleProductStatus(prod)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition flex items-center gap-1 ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-200'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 hover:bg-rose-200 animate-pulse'
                                }`}
                              >
                                {isApproved ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span>✓ Đã Duyệt Web</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-rose-500" />
                                    <span>⏳ Chờ Duyệt (Click để duyệt)</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Action Buttons */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    if (parentStore) {
                                      setSelectedAdminStore(parentStore);
                                      handleOpenEditProduct(prod);
                                    }
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition cursor-pointer"
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteSingleProduct(prod)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg transition cursor-pointer"
                                  title="Xóa sản phẩm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

"""

new_text = text[:idx] + all_products_code + text[idx:]

with open('src/pages/AdminDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Inserted all_products_mgmt view cleanly!")
