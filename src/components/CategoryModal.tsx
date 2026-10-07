import React, { useState } from 'react';
import { Category, TransactionType } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { X, Check } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: Category) => void;
}

const AVAILABLE_ICONS = [
  'Utensils', 'Coffee', 'Pizza', 'ShoppingBag', 'ShoppingCart', 'Car', 'Bus', 'Plane',
  'Home', 'Tv', 'Wifi', 'Smartphone', 'Zap', 'Droplets', 'HeartPulse', 'Pill',
  'GraduationCap', 'BookOpen', 'Briefcase', 'Laptop', 'PiggyBank', 'Gift', 'Smile',
  'Music', 'Gamepad2', 'Scissors', 'Shirt', 'PawPrint', 'Baby', 'Fuel'
];

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedIcon, setSelectedIcon] = useState('Utensils');
  const [selectedColor, setSelectedColor] = useState('#F97316');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: Category = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      type: type === 'income' ? 'income' : 'expense',
      icon: selectedIcon,
      color: selectedColor,
      isCustom: true,
    };

    onAddCategory(newCat);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">เพิ่มหมวดหมู่ใหม่</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg transition-all ${
                type === 'income' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              ชื่อหมวดหมู่ *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ชานมไข่มุก, สัตว์เลี้ยง..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              เลือกไอคอน
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border border-slate-100 rounded-xl">
              {AVAILABLE_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    selectedIcon === iconName
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <CategoryIcon name={iconName} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              เลือกสีประจำหมวดหมู่
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    selectedColor === col ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''
                  }`}
                  style={{ backgroundColor: col }}
                >
                  {selectedColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
            <span className="text-xs text-slate-400">ตัวอย่าง:</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: selectedColor }}
            >
              <CategoryIcon name={selectedIcon} className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              {name || 'ชื่อหมวดหมู่'}
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              บันทึกหมวดหมู่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
