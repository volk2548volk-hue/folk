/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Transaction, 
  Category, 
  MonthlyBudget, 
  FilterState, 
  MonthSummary, 
  TransactionType 
} from './types/finance';
import { 
  loadTransactions, 
  saveTransactions, 
  loadCategories, 
  saveCategories, 
  loadBudgets, 
  saveBudgets,
  loadFirebaseConfig,
  getInitialDemoTransactions 
} from './services/storageService';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ExpenseDonutChart } from './components/Charts/ExpenseDonutChart';
import { CashFlowTrendChart } from './components/Charts/CashFlowTrendChart';
import { CategoryBreakdown } from './components/Charts/CategoryBreakdown';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { BudgetModal } from './components/BudgetModal';
import { FirebaseModal } from './components/FirebaseModal';
import { ExportModal } from './components/ExportModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Plus, BarChart2, ListFilter } from 'lucide-react';

export default function App() {
  // Current date & default month YYYY-MM
  const initialMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [budgets, setBudgets] = useState<Record<string, MonthlyBudget>>(() => loadBudgets());

  // Chart type toggle in donut chart
  const [donutType, setDonutType] = useState<TransactionType>('expense');

  // Filter state for transaction list
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    categoryId: '',
    searchQuery: '',
    paymentMethod: '',
    sortBy: 'date-desc',
  });

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Active view tab for smaller screens: 'dashboard' vs 'list'
  const [mobileTab, setMobileTab] = useState<'dashboard' | 'transactions'>('dashboard');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to local storage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  // Transactions belonging to selected month
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Compute Summary Metrics
  const summary: MonthSummary = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let incCount = 0;
    let expCount = 0;

    currentMonthTransactions.forEach((t) => {
      if (t.type === 'income') {
        inc += t.amount;
        incCount += 1;
      } else if (t.type === 'expense') {
        exp += t.amount;
        expCount += 1;
      }
    });

    const bal = inc - exp;
    const savingsRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;

    // Days in selected month
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const dailyAvg = exp / (daysInMonth || 30);

    return {
      yearMonth: selectedMonth,
      totalIncome: inc,
      totalExpense: exp,
      balance: bal,
      savingsRate,
      expenseCount: expCount,
      incomeCount: incCount,
      dailyAverageExpense: dailyAvg,
    };
  }, [currentMonthTransactions, selectedMonth]);

  // Current Month's Budget
  const currentBudget = budgets[selectedMonth];

  // Check if custom Firebase is configured
  const hasFirebaseConfig = Boolean(loadFirebaseConfig());

  // Handlers for transactions
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => {
    if (txData.id) {
      // Edit existing
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === txData.id
            ? { ...item, ...txData, updatedAt: Date.now() }
            : item
        )
      );
      addToast('แก้ไขรายการเรียบร้อยแล้ว', 'success');
    } else {
      // Create new
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      addToast('บันทึกรายการสำเร็จ', 'success');
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast('ลบรายการเรียบร้อยแล้ว', 'info');
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
    addToast(`เพิ่มหมวดหมู่ "${newCat.name}" สำเร็จ`, 'success');
  };

  const handleSaveBudget = (newBudget: MonthlyBudget) => {
    setBudgets((prev) => ({
      ...prev,
      [newBudget.month]: newBudget,
    }));
    addToast('บันทึกงบประมาณเรียบร้อยแล้ว', 'success');
  };

  const handleImportTransactions = (imported: Transaction[]) => {
    setTransactions(imported);
    saveTransactions(imported);
  };

  const handleResetToDemo = () => {
    const demo = getInitialDemoTransactions();
    setTransactions(demo);
    saveTransactions(demo);
    addToast('โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-20 md:pb-12">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Header */}
      <Header
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenNewTransactionModal={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isFirebaseConfigured={hasFirebaseConfig}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. Monthly Financial Metric Summary Cards */}
        <SummaryCards
          summary={summary}
          budget={currentBudget}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Mobile Navigation Segmented Controls */}
        <div className="flex md:hidden p-1 bg-slate-200/70 rounded-2xl">
          <button
            onClick={() => setMobileTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mobileTab === 'dashboard'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            สรุปผล & กราฟวิเคราะห์
          </button>
          <button
            onClick={() => setMobileTab('transactions')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mobileTab === 'transactions'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            รายการธุรกรรม ({currentMonthTransactions.length})
          </button>
        </div>

        {/* 2. Visual Charts Row (Donut & Cash Flow Trend) */}
        <div className={`${mobileTab === 'transactions' ? 'hidden md:grid' : 'grid'} grid-cols-1 lg:grid-cols-12 gap-6`}>
          {/* Donut Chart: 5 Cols on desktop */}
          <div className="lg:col-span-5">
            <ExpenseDonutChart
              transactions={currentMonthTransactions}
              currentType={donutType}
              onTypeChange={setDonutType}
            />
          </div>

          {/* Cash Flow Daily/Monthly Bar Trend: 7 Cols on desktop */}
          <div className="lg:col-span-7">
            <CashFlowTrendChart
              transactions={currentMonthTransactions}
              selectedMonth={selectedMonth}
              allTransactions={transactions}
            />
          </div>
        </div>

        {/* 3. Top Spending Breakdown */}
        <div className={mobileTab === 'transactions' ? 'hidden md:block' : 'block'}>
          <CategoryBreakdown
            transactions={currentMonthTransactions}
            onSelectCategory={(catId) => {
              setFilters((prev) => ({ ...prev, categoryId: catId }));
              setMobileTab('transactions');
            }}
          />
        </div>

        {/* 4. Filterable Transaction Records List */}
        <div className={mobileTab === 'dashboard' ? 'hidden md:block' : 'block'}>
          <TransactionList
            transactions={currentMonthTransactions}
            categories={categories}
            filters={filters}
            onFilterChange={setFilters}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-300 z-40 active:scale-95 transition-transform"
        aria-label="บันทึกรายการใหม่"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        editingTransaction={editingTransaction}
        onAddCategoryClick={() => setIsCategoryModalOpen(true)}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        selectedMonth={selectedMonth}
        currentBudget={currentBudget}
        onSaveBudget={handleSaveBudget}
      />

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        transactions={transactions}
        onTransactionsSynced={(newTxs) => setTransactions(newTxs)}
        onShowToast={addToast}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        onImportTransactions={handleImportTransactions}
        onResetToDemo={handleResetToDemo}
        onShowToast={addToast}
      />
    </div>
  );
}
