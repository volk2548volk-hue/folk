export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod = 
  | 'cash' 
  | 'bank_transfer' 
  | 'promptpay' 
  | 'credit_card' 
  | 'debit_card' 
  | 'truemoney' 
  | 'other';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  amount: number;
  categoryBudgets?: Record<string, number>; // categoryId -> amount
}

export interface FirebaseConfigData {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export interface FilterState {
  type: 'all' | 'income' | 'expense';
  categoryId: string;
  searchQuery: string;
  paymentMethod: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface MonthSummary {
  yearMonth: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number; // percentage
  expenseCount: number;
  incomeCount: number;
  dailyAverageExpense: number;
}
