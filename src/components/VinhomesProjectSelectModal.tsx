import React, { useState } from 'react';
import { Building2, Search, X, MapPin, Check, Sparkles } from 'lucide-react';
import { ProjectCategory } from '../types';
import { VIN_MAJOR_PROJECTS } from '../data/residentServicesData';

interface VinhomesProjectSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: ProjectCategory | 'all';
  onSelectProject: (projectId: ProjectCategory | 'all') => void;
  title?: string;
  propertyCounts?: Record<string, number>;
}

export const VinhomesProjectSelectModal: React.FC<VinhomesProjectSelectModalProps> = ({
  isOpen,
  onClose,
  selectedProject,
  onSelectProject,
  title = "CHỌN DỰ ÁN VINHOMES",
  propertyCounts
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredProjects = VIN_MAJOR_PROJECTS.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q);
  });

  const quickChips = [
    { name: 'Ocean Park 1', id: 'ocean-park-1' },
    { name: 'Ocean Park 2', id: 'ocean-park-2' },
    { name: 'Ocean Park 3', id: 'ocean-park-3' },
    { name: 'Smart City', id: 'smart-city' },
    { name: 'Grand Park', id: 'grand-park' },
    { name: 'Riverside', id: 'riverside' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-ink-200 dark:border-ink-800 flex items-center justify-between bg-ink-50 dark:bg-ink-850">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-ink-900 dark:text-white uppercase tracking-tight">
                {title}
              </h3>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 font-medium">
                Tra cứu danh sách đại đô thị Vinhomes trên toàn quốc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-white hover:bg-ink-200 dark:hover:bg-ink-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Gõ tên dự án, vị trí, thành phố..."
              className="w-full pl-10 pr-4 py-2.5 bg-ink-50 dark:bg-ink-800 border-2 border-brand-500/30 focus:border-brand-500 text-ink-900 dark:text-white rounded-2xl text-xs font-bold outline-none transition"
              autoFocus
            />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickChips.map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  onSelectProject(chip.id as ProjectCategory);
                  onClose();
                }}
                className={`px-3 py-1 font-bold text-xs rounded-xl border transition cursor-pointer ${
                  selectedProject === chip.id
                    ? 'bg-brand-500 text-ink-950 border-brand-400 font-black shadow-sm'
                    : 'bg-ink-100 dark:bg-ink-800 hover:bg-brand-500 hover:text-white text-ink-700 dark:text-ink-300 border-ink-200 dark:border-ink-700'
                }`}
              >
                {chip.name}
              </button>
            ))}
          </div>

          {/* Option: Select All Projects */}
          <button
            onClick={() => {
              onSelectProject('all');
              onClose();
            }}
            className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
              selectedProject === 'all'
                ? 'bg-brand-600 text-white border-brand-500 font-black shadow-md'
                : 'bg-ink-100 dark:bg-ink-800/80 hover:bg-brand-500/10 text-ink-900 dark:text-white border-ink-200 dark:border-ink-700'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className={`p-2 rounded-xl ${selectedProject === 'all' ? 'bg-white/20' : 'bg-brand-500/10 text-brand-500'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xs sm:text-sm block">
                   Tất Cả Dự Án Vinhomes (Toàn Quốc)
                </span>
                <span className={`text-[10px] ${selectedProject === 'all' ? 'text-brand-100' : 'text-ink-500 dark:text-ink-400'}`}>
                  Hiển thị tổng hợp quỹ căn từ Hà Nội, Hưng Yên, TP.HCM, Hải Phòng...
                </span>
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-lg font-black ${selectedProject === 'all' ? 'bg-white text-brand-700' : 'bg-brand-500/20 text-brand-500'}`}>
              14 đại đô thị
            </span>
          </button>

          {/* Project List */}
          <div className="space-y-2 pt-1">
            {filteredProjects.map(proj => {
              const isSelected = selectedProject === proj.id;
              const count = propertyCounts ? propertyCounts[proj.id] : null;

              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj.id);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-brand-500/10 dark:bg-brand-500/20 border-brand-500 ring-2 ring-brand-500/50'
                      : 'bg-white dark:bg-ink-800/60 hover:bg-ink-50 dark:hover:bg-ink-800 border-ink-200 dark:border-ink-700'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isSelected ? 'bg-brand-500 text-white' : 'bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-400 group-hover:text-brand-500'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-black text-xs sm:text-sm truncate ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-ink-900 dark:text-white'}`}>
                          {proj.name}
                        </span>
                        {count !== null && count !== undefined && (
                          <span className="text-[10px] font-bold px-2 py-0.2 bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 rounded-full shrink-0">
                            {count} tin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-ink-500 dark:text-ink-400">
                        <span className="flex items-center gap-1 font-medium">
                           {proj.location}
                        </span>
                        <span className="bg-ink-200 dark:bg-ink-700 text-ink-700 dark:text-ink-300 px-1.5 py-0.2 rounded text-[10px] font-extrabold">
                          {proj.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-1 bg-brand-500 text-white rounded-full shrink-0 ml-2">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-ink-500 dark:text-ink-400 text-xs">
                Không tìm thấy dự án phù hợp với từ khóa "{searchTerm}".
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
