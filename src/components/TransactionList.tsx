import React, { useMemo } from 'react';
import { Transaction, Category, FilterState } from '../types/finance';
import { formatCurrency, formatThaiDate } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Filter, 
  ArrowUpDown, 
  Receipt,
  Tag,
  Building2,
  Banknote,
  QrCode,
  CreditCard
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
}) => {
  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (filters.type !== 'all' && tx.type !== filters.type) {
          return false;
        }

        // Category filter
        if (filters.categoryId && tx.categoryId !== filters.categoryId) {
          return false;
        }

        // Search query (note, categoryName, tags)
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const noteMatch = tx.note?.toLowerCase().includes(q);
          const catMatch = tx.categoryName.toLowerCase().includes(q);
          const tagMatch = tx.tags?.some((t) => t.toLowerCase().includes(q));
          if (!noteMatch && !catMatch && !tagMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date-desc') {
          return b.date.localeCompare(a.date) || (b.createdAt - a.createdAt);
        }
        if (filters.sortBy === 'date-asc') {
          return a.date.localeCompare(b.date) || (a.createdAt - b.createdAt);
        }
        if (filters.sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (filters.sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, filters]);

  // Group by Date for visually organized daily view
  const groupedByDate = useMemo(() => {
    const map = new Map<string, { date: string; items: Transaction[]; netAmount: number }>();
    
    filteredTransactions.forEach((tx) => {
      const existing = map.get(tx.date);
      const sign = tx.type === 'income' ? tx.amount : -tx.amount;
      if (existing) {
        existing.items.push(tx);
        existing.netAmount += sign;
      } else {
        map.set(tx.date, {
          date: tx.date,
          items: [tx],
          netAmount: sign,
        });
      }
    });

    return Array.from(map.values());
  }, [filteredTransactions]);

  const renderPaymentIcon = (method: string) => {
    switch (method) {
      case 'promptpay':
        return <span title="พร้อมเพย์"><QrCode className="w-3 h-3 text-blue-500" /></span>;
      case 'bank_transfer':
        return <span title="โอนธนาคาร"><Building2 className="w-3 h-3 text-indigo-500" /></span>;
      case 'credit_card':
      case 'debit_card':
        return <span title="บัตรเครดิต/เดบิต"><CreditCard className="w-3 h-3 text-purple-500" /></span>;
      default:
        return <span title="เงินสด/อื่นๆ"><Banknote className="w-3 h-3 text-slate-400" /></span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      {/* Header and Filter Controls */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">รายการธุรกรรม</h3>
              <p className="text-xs text-slate-400">
                พบทั้งหมด {filteredTransactions.length} รายการ
              </p>
            </div>
          </div>

          {/* Quick Filter: All / Expense / Income */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => onFilterChange({ ...filters, type: 'all' })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filters.type === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, type: 'expense' })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filters.type === 'expense'
                  ? 'bg-rose-500 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, type: 'income' })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filters.type === 'income'
                  ? 'bg-emerald-500 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>
        </div>

        {/* Search & Select dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาตามบันทึก, หมวดหมู่, หรือป้ายกำกับ..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={filters.categoryId}
              onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white text-slate-700"
            >
              <option value="">หมวดหมู่ทั้งหมด</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'income' ? 'รับ' : 'จ่าย'})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white text-slate-700"
            >
              <option value="date-desc">วันที่ (ล่าสุดก่อน)</option>
              <option value="date-asc">วันที่ (เก่าสุดก่อน)</option>
              <option value="amount-desc">จำนวนเงิน (มากไปน้อย)</option>
              <option value="amount-asc">จำนวนเงิน (น้อยไปมาก)</option>
            </select>
          </div>
        </div>
      </div>

      {/* List content */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-300">
            <Receipt className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-slate-700">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกดูเดือนอื่น</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {groupedByDate.map((group) => (
            <div key={group.date} className="p-4 sm:p-5">
              {/* Date Header */}
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-700">
                  {formatThaiDate(group.date)}
                </span>
                <span className={`text-xs font-semibold ${
                  group.netAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {group.netAmount >= 0 ? '+' : ''}{formatCurrency(group.netAmount)}
                </span>
              </div>

              {/* Transactions in Date */}
              <div className="space-y-2">
                {group.items.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/80 transition-colors group border border-transparent hover:border-slate-100"
                  >
                    {/* Left: Category Icon & Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: tx.categoryColor }}
                      >
                        <CategoryIcon name={tx.categoryIcon} className="w-5 h-5 text-white" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 truncate">
                            {tx.categoryName}
                          </span>
                          {renderPaymentIcon(tx.paymentMethod)}
                        </div>

                        {tx.note && (
                          <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                            {tx.note}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {tx.time && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              {tx.time} น.
                            </span>
                          )}

                          {tx.tags && tx.tags.length > 0 && (
                            <div className="flex gap-1">
                              {tx.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-medium"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right">
                        <span className={`text-sm sm:text-base font-bold ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>

                      {/* Action buttons (hover visible) */}
                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(tx)}
                          title="แก้ไข"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                              onDelete(tx.id);
                            }
                          }}
                          title="ลบ"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
