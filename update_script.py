import sys

# Read AdminDashboardPage.tsx
with open('src/pages/AdminDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update import to include AddPropertyAdminModal
old_import = "import { EditPropertyModal, EditProjectModal, EditNewsModal } from '../components/AdminAssetManagerModals';"
new_import = "import { EditPropertyModal, EditProjectModal, EditNewsModal, AddPropertyAdminModal } from '../components/AdminAssetManagerModals';"

if old_import in content:
    content = content.replace(old_import, new_import)
    print("Updated imports successfully")
else:
    print("Could not find old_import")

# 2. Add isAddingProperty state next to editingProperty
old_state = "const [editingProperty, setEditingProperty] = useState<Property | null>(null);"
new_state = """const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAddingProperty, setIsAddingProperty] = useState<boolean>(false);
  const [expandedNavSections, setExpandedNavSections] = useState<Record<string, boolean>>({
    bds: true,
    resident_market: true,
    users_leads: true,
    tools: true
  });
  const toggleNavSection = (section: string) => {
    setExpandedNavSections(prev => ({ ...prev, [section]: !prev[section] }));
  };"""

if old_state in content:
    content = content.replace(old_state, new_state)
    print("Added isAddingProperty and expandedNavSections states")

# 3. Add "+ ĐĂNG TIN BĐS MỚI" button into Properties tab header
target_header_btn = """<button
                onClick={handleSeed1000Click}"""
replacement_header_btn = """<button
                onClick={() => setIsAddingProperty(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-[11px] shrink-0 transition flex items-center gap-1.5 shadow-md border border-emerald-400/40 cursor-pointer"
                title="Thêm bài đăng BĐS mới và tải ảnh lên Supabase Storage"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ ĐĂNG TIN BĐS MỚI</span>
              </button>
              <button
                onClick={handleSeed1000Click}"""

if target_header_btn in content:
    content = content.replace(target_header_btn, replacement_header_btn, 1)
    print("Added + ĐĂNG TIN BĐS MỚI button to header")

# 4. Render AddPropertyAdminModal
target_modal = """{/* Edit Property Modal */}
      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSave={(updated) => {
            if (onUpdateProperty) onUpdateProperty(updated);
            setEditingProperty(null);
          }}
        />
      )}"""

replacement_modal = """{/* Add New Property Modal for Admin */}
      {isAddingProperty && (
        <AddPropertyAdminModal
          projects={projects}
          onClose={() => setIsAddingProperty(false)}
          onSave={(newProp) => {
            if (onApproveProperty) {
              onApproveProperty(newProp);
            } else if (onUpdateProperty) {
              onUpdateProperty(newProp);
            }
            setIsAddingProperty(false);
          }}
        />
      )}

      {/* Edit Property Modal */}
      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSave={(updated) => {
            if (onUpdateProperty) onUpdateProperty(updated);
            setEditingProperty(null);
          }}
        />
      )}"""

if target_modal in content:
    content = content.replace(target_modal, replacement_modal)
    print("Rendered AddPropertyAdminModal successfully")

with open('src/pages/AdminDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved AdminDashboardPage.tsx")
