import React, { useState, useEffect } from 'react';
import { ZaloGroup } from '../types';
import { MessageCircle, Plus, Edit3, Trash2, ExternalLink, CheckCircle2, ShieldCheck, Users, Sparkles, Search, RefreshCw, QrCode, ToggleLeft, ToggleRight, Copy, Share2 } from 'lucide-react';

export const DEFAULT_ZALO_GROUPS: ZaloGroup[] = [
  {
    id: 'zg-1',
    name: 'Group Chợ Cư Dân Vinhomes Ocean Park 1 (Chuyển Nhượng - Cho Thuê Free)',
    linkUrl: 'https://zalo.me/g/chocudan_vhop1',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://zalo.me/g/chocudan_vhop1',
    category: 'BĐS & Căn Hộ',
    memberCount: 980,
    description: 'Mua bán, chuyển nhượng, cho thuê căn hộ Vinhomes Ocean Park 1 chính chủ không qua trung gian.',
    isActive: true,
    isFeatured: true,
    clicksCount: 1420,
    createdAt: '2026-07-01'
  },
  {
    id: 'zg-2',
    name: 'Group Ẩm Thực & Nhà Hàng Cư Dân (Giao Đồ Ăn Đêm & Đặt Cỗ Tận Căn Hộ)',
    linkUrl: 'https://zalo.me/g/amthuc_nhahang_vhop',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://zalo.me/g/amthuc_nhahang_vhop',
    category: 'Nhà Hàng & Ẩm Thực',
    memberCount: 1450,
    description: 'Chuyên quảng cáo món ăn ngon, cơm văn phòng, hải sản, nướng lẩu ship tận cửa căn hộ 24/7.',
    isActive: true,
    isFeatured: true,
    clicksCount: 3120,
    createdAt: '2026-07-03'
  },
  {
    id: 'zg-3',
    name: 'Group Cafe, Trà Sữa & Đồ Uống Cư Dân Vinhomes (Ship Tận Căn Hộ 15p)',
    linkUrl: 'https://zalo.me/g/cafe_trasua_vhop',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://zalo.me/g/cafe_trasua_vhop',
    category: 'Cafe & Trà Sữa',
    memberCount: 890,
    description: 'Hội quán trà sữa, cafe muối, nước ép nguyên chất giao tận nhà cho cư dân Vinhomes.',
    isActive: true,
    isFeatured: true,
    clicksCount: 1840,
    createdAt: '2026-07-05'
  },
  {
    id: 'zg-4',
    name: 'Group Quảng Cáo Dịch Vụ Cư Dân (Sửa Điện Nước, Giúp Việc, Nội Thất)',
    linkUrl: 'https://zalo.me/g/dichvu_cudan_24h',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://zalo.me/g/dichvu_cudan_24h',
    category: 'Quảng Cáo & Dịch Vụ',
    memberCount: 1120,
    description: 'Đăng quảng cáo dịch vụ sửa chữa gia dụng, làm sạch sofa, giúp việc theo giờ, bảo trì điều hòa free.',
    isActive: true,
    isFeatured: true,
    clicksCount: 2210,
    createdAt: '2026-07-10'
  },
  {
    id: 'zg-5',
    name: 'Group Taxi & Xe Tiện Chuyến Cư Dân Vinhomes (Hà Nội - Nội Bài - Ocean Park)',
    linkUrl: 'https://zalo.me/g/xetienchuyen_vhop',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://zalo.me/g/xetienchuyen_vhop',
    category: 'Taxi & Xe Tiện Chuyến',
    memberCount: 760,
    description: 'Ghép xe, đưa đón sân bay Nội Bài, taxi cư dân giá rẻ chặng Hà Nội - Ocean Park 1, 2, 3.',
    isActive: true,
    isFeatured: true,
    clicksCount: 1540,
    createdAt: '2026-07-15'
  },
  {
    id: 'zg-6',
    name: 'Group Chợ Cư Dân Ocean Park 2 & 3 (Chuyển Nhượng Shophouse, Biệt Thự)',
    linkUrl: 'https://zalo.me/g/chocudan_vhop23',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://zalo.me/g/chocudan_vhop23',
    category: 'BĐS & Căn Hộ',
    memberCount: 1340,
    description: 'Cộng đồng mua bán biệt thự, liền kề, shophouse thương mại Ocean Park 2 & 3.',
    isActive: true,
    isFeatured: false,
    clicksCount: 2890,
    createdAt: '2026-07-18'
  }
];

export const AdminZaloGroupCenter: React.FC = () => {
  const [groups, setGroups] = useState<ZaloGroup[]>(() => {
    try {
      const saved = localStorage.getItem('chocudan24h_zalo_groups');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ZALO_GROUPS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ZaloGroup | null>(null);

  // Form States
  const [formName, setFormName] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formCategory, setFormCategory] = useState('Vinhomes Ocean Park 1');
  const [formMemberCount, setFormMemberCount] = useState(500);
  const [formDesc, setFormDesc] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(true);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('chocudan24h_zalo_groups', JSON.stringify(groups));
  }, [groups]);

  const handleOpenAddModal = () => {
    setFormName('');
    setFormLink('');
    setFormCategory('BĐS & Căn Hộ');
    setFormMemberCount(500);
    setFormDesc('');
    setFormIsFeatured(true);
    setEditingGroup(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (group: ZaloGroup) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormLink(group.linkUrl);
    setFormCategory(group.category);
    setFormMemberCount(group.memberCount || 100);
    setFormDesc(group.description || '');
    setFormIsFeatured(!!group.isFeatured);
    setShowAddModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLink.trim()) {
      alert('Vui lòng điền tên nhóm Zalo và đường dẫn liên kết.');
      return;
    }

    const cleanLink = formLink.trim();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(cleanLink)}`;

    if (editingGroup) {
      // Update
      const updated = groups.map(g => g.id === editingGroup.id ? {
        ...g,
        name: formName.trim(),
        linkUrl: cleanLink,
        qrUrl: qrCodeUrl,
        category: formCategory,
        memberCount: Number(formMemberCount),
        description: formDesc.trim(),
        isFeatured: formIsFeatured
      } : g);
      setGroups(updated);
      alert('✓ Đã cập nhật thông tin nhóm Zalo thành công!');
    } else {
      // Add
      const newGroup: ZaloGroup = {
        id: `zg-${Date.now()}`,
        name: formName.trim(),
        linkUrl: cleanLink,
        qrUrl: qrCodeUrl,
        category: formCategory,
        memberCount: Number(formMemberCount) || 100,
        description: formDesc.trim() || 'Nhóm Zalo hỗ trợ tương tác cư dân.',
        isActive: true,
        isFeatured: formIsFeatured,
        clicksCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setGroups([newGroup, ...groups]);
      alert('✓ Đã thêm nhóm Zalo mới vào hệ thống thành công!');
    }

    setShowAddModal(false);
  };

  const handleToggleActive = (id: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g));
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhóm Zalo này khỏi danh sách?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('✓ Đã sao chép đường dẫn Zalo vào bộ nhớ tạm!');
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = !searchQuery || 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalMembers = groups.reduce((acc, g) => acc + (g.memberCount || 0), 0);
  const totalClicks = groups.reduce((acc, g) => acc + (g.clicksCount || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xl text-xs">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            HỆ THỐNG ZALO COMMUNITY & QUẢNG CÁO FREE
          </span>
          <h3 className="font-black text-lg text-slate-900 dark:text-white mt-0.5">
            QUẢN LÝ NHÓM ZALO CƯ DÂN & ĐIỂM TƯƠNG TÁC
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tạo các nhóm Zalo phân loại theo dự án/khu vực để cư dân giao lưu, rao vặt free & tăng traffic website.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-blue-900/30 shrink-0 transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Thêm Nhóm Zalo Mới</span>
        </button>
      </div>

      {/* Quick Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-0.5">
          <span className="text-blue-600 dark:text-blue-400 font-bold block">Tổng Số Nhóm Zalo</span>
          <span className="text-xl font-black text-slate-900 dark:text-white block">{groups.length} Nhóm</span>
        </div>

        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-0.5">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold block">Cư Dân Trong Nhóm</span>
          <span className="text-xl font-black text-slate-900 dark:text-white block">~{totalMembers.toLocaleString('vi-VN')} Thành Viên</span>
        </div>

        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-0.5">
          <span className="text-amber-600 dark:text-amber-400 font-bold block">Tổng Lượt Click Tham Gia</span>
          <span className="text-xl font-black text-slate-900 dark:text-white block">{totalClicks.toLocaleString('vi-VN')} Lượt</span>
        </div>

        <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-0.5">
          <span className="text-purple-600 dark:text-purple-400 font-bold block">Đang Khai Thác</span>
          <span className="text-xl font-black text-slate-900 dark:text-white block">{groups.filter(g => g.isActive).length} Nhóm Đang Mở</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên nhóm, mô tả, từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-slate-500 font-bold shrink-0">Lọc theo:</span>
          {['all', 'BĐS & Căn Hộ', 'Nhà Hàng & Ẩm Thực', 'Cafe & Trà Sữa', 'Quảng Cáo & Dịch Vụ', 'Taxi & Xe Tiện Chuyến'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Groups List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">Tên Nhóm Zalo Cư Dân</th>
              <th className="py-3 px-3">Phân Loại / Dự Án</th>
              <th className="py-3 px-3">Số Thành Viên</th>
              <th className="py-3 px-3">Lượt Nhấp Join</th>
              <th className="py-3 px-3">Nổi Bật</th>
              <th className="py-3 px-3">Trạng Thái</th>
              <th className="py-3 px-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Không tìm thấy nhóm Zalo nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredGroups.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black shrink-0 border border-blue-500/30">
                        Z
                      </div>
                      <div>
                        <a
                          href={g.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-extrabold text-slate-900 dark:text-white hover:text-blue-500 transition line-clamp-1 flex items-center gap-1"
                        >
                          <span>{g.name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {g.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px]">
                      {g.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>{g.memberCount ? g.memberCount.toLocaleString('vi-VN') : 100} cư dân</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 font-black text-amber-500">
                    {g.clicksCount || 0} lượt
                  </td>

                  <td className="py-3 px-3">
                    {g.isFeatured ? (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-lg border border-amber-500/30 text-[10px] inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Nổi Bật
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Thường</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleActive(g.id)}
                      className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] transition flex items-center gap-1 ${
                        g.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {g.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                      <span>{g.isActive ? 'Đang Mở' : 'Đã Ẩn'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCopyLink(g.linkUrl)}
                        title="Sao chép link Zalo"
                        className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(g)}
                        title="Chỉnh sửa thông tin"
                        className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteGroup(g.id)}
                        title="Xóa nhóm"
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {editingGroup ? 'Chỉnh Sửa Nhóm Zalo Cư Dân' : 'Thêm Nhóm Zalo Cư Dân Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-red-500 font-bold text-xl rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Đóng cửa sổ này"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Tên Nhóm Zalo (*):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Group Chợ Cư Dân Ocean Park 1 - Chuyển Nhượng & Rao Vặt Free"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Đường dẫn Liên Kết Zalo (Link Zalo Group / QR link) (*):
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://zalo.me/g/..."
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phân Loại / Khu Vực:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BĐS & Căn Hộ">🏢 BĐS & Căn Hộ</option>
                    <option value="Nhà Hàng & Ẩm Thực">🍽️ Nhà Hàng & Ẩm Thực</option>
                    <option value="Cafe & Trà Sữa">☕ Cafe & Trà Sữa</option>
                    <option value="Quảng Cáo & Dịch Vụ">🛠️ Quảng Cáo & Dịch Vụ</option>
                    <option value="Taxi & Xe Tiện Chuyến">🚖 Taxi & Xe Tiện Chuyến</option>
                    <option value="Vinhomes Ocean Park 1">Vinhomes Ocean Park 1</option>
                    <option value="Vinhomes Ocean Park 2 & 3">Vinhomes Ocean Park 2 & 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Số Lượng Cư Dân Ước Tính:</label>
                  <input
                    type="number"
                    value={formMemberCount}
                    onChange={(e) => setFormMemberCount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Mô tả mục đích nhóm:</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nhóm giúp cư dân dễ dàng nhận biết và tham gia..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsFeatured"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="formIsFeatured" className="text-slate-800 dark:text-slate-200 font-bold">
                  Ghim làm Nhóm Nổi Bật hiển thị đầu danh sách cho cư dân
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-900/30"
                >
                  ✓ {editingGroup ? 'Lưu Thay Đổi' : 'Thêm Nhóm Zalo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
