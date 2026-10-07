import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types/finance';
import { PAYMENT_METHODS } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { 
  X, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Clock, 
  FileText, 
  Tag, 
  Plus,
  Check
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  categories: Category[];
  editingTransaction?: Transaction | null;
  onAddCategoryClick: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingTransaction,
  onAddCategoryClick,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(editingTransaction.amount.toString());
        setCategoryId(editingTransaction.categoryId);
        setDate(editingTransaction.date);
        setTime(editingTransaction.time || '12:00');
        setNote(editingTransaction.note || '');
        setPaymentMethod(editingTransaction.paymentMethod);
        setTags(editingTransaction.tags || []);
      } else {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        setType('expense');
        setAmount('');
        setDate(todayStr);
        setTime(`${hours}:${minutes}`);
        setNote('');
        setPaymentMethod('promptpay');
        setTags([]);

        // Pick first expense category
        const firstExpense = categories.find((c) => c.type === 'expense');
        if (firstExpense) {
          setCategoryId(firstExpense.id);
        }
      }
    }
  }, [isOpen, editingTransaction, categories]);

  // Keep category valid when switching type
  useEffect(() => {
    if (!isOpen) return;
    const currentCat = categories.find((c) => c.id === categoryId);
    if (!currentCat || currentCat.type !== type) {
      const match = categories.find((c) => c.type === type);
      if (match) setCategoryId(match.id);
    }
  }, [type, categories, isOpen, categoryId]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleQuickAddAmount = (add: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + add).toString());
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return;
    }

    if (!selectedCategory) {
      return;
    }

    onSave({
      id: editingTransaction?.id,
      type,
      amount: parsedAmount,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '12:00',
      note: note.trim(),
      paymentMethod,
      tags,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Type Selector */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/60 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              รายรับ (Income)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className={`w-full pl-12 pr-4 py-3.5 text-2xl font-bold rounded-2xl border ${
                  type === 'expense'
                    ? 'border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 text-rose-600'
                    : 'border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-emerald-600'
                } outline-none transition-all`}
              />
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[50, 100, 500, 1000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => handleQuickAddAmount(quick)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                >
                  +{quick}฿
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                หมวดหมู่ *
              </label>
              <button
                type="button"
                onClick={onAddCategoryClick}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มหมวดหมู่ใหม่
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-600'
                        : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันที่
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                เวลา
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              ช่องทางการชำระ / รับเงิน
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              บันทึกช่วยจำ (หมายเหตุ)
            </label>
            <input
              type="text"
              placeholder="เช่น อาหารกลางวันกับทีม, ซื้อของเข้าบ้าน..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              ป้ายกำกับ (Tags)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="พิมพ์แท็กแล้วกด เพิ่ม..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
              >
                เพิ่ม
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
              }`}
            >
              <Check className="w-4 h-4" />
              {editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
