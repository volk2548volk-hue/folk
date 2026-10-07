import { Transaction, Category, MonthlyBudget, FirebaseConfigData } from '../types/finance';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  writeBatch,
  Firestore 
} from 'firebase/firestore';

const STORAGE_KEY_TRANSACTIONS = 'fin_thai_transactions_v1';
const STORAGE_KEY_CATEGORIES = 'fin_thai_categories_v1';
const STORAGE_KEY_BUDGETS = 'fin_thai_budgets_v1';
const STORAGE_KEY_FIREBASE_CONFIG = 'fin_thai_firebase_config_v1';

let firestoreInstance: Firestore | null = null;

// Initialize sample data for current month if empty
export function getInitialDemoTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: 'tx-demo-1',
      type: 'income',
      amount: 45000,
      categoryId: 'inc-salary',
      categoryName: 'เงินเดือน & ค่าจ้างประจำ',
      categoryIcon: 'Briefcase',
      categoryColor: '#10B981',
      date: `${year}-${monthStr}-01`,
      time: '09:00',
      note: 'เงินเดือนประจำเดือน',
      paymentMethod: 'bank_transfer',
      tags: ['ประจำ', 'เงินเดือน'],
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'tx-demo-2',
      type: 'income',
      amount: 8500,
      categoryId: 'inc-freelance',
      categoryName: 'งานเสริม & ฟรีแลนซ์',
      categoryIcon: 'Laptop',
      categoryColor: '#059669',
      date: `${year}-${monthStr}-03`,
      time: '14:30',
      note: 'รับออกแบบเว็บไซต์บริษัท',
      paymentMethod: 'promptpay',
      tags: ['งานนอก', 'freelance'],
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'tx-demo-3',
      type: 'expense',
      amount: 8500,
      categoryId: 'exp-housing',
      categoryName: 'ที่พัก & ค่าน้ำ-ไฟ-เน็ต',
      categoryIcon: 'Home',
      categoryColor: '#8B5CF6',
      date: `${year}-${monthStr}-02`,
      time: '10:00',
      note: 'ค่าเช่าคอนโดมิเนียมและค่าส่วนกลาง',
      paymentMethod: 'bank_transfer',
      tags: ['บ้าน', 'รายเดือน'],
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'tx-demo-4',
      type: 'expense',
      amount: 1450,
      categoryId: 'exp-housing',
      categoryName: 'ที่พัก & ค่าน้ำ-ไฟ-เน็ต',
      categoryIcon: 'Home',
      categoryColor: '#8B5CF6',
      date: `${year}-${monthStr}-02`,
      time: '11:15',
      note: 'ค่าไฟฟ้าและค่าน้ำประปา',
      paymentMethod: 'bank_transfer',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'tx-demo-5',
      type: 'expense',
      amount: 650,
      categoryId: 'exp-food',
      categoryName: 'อาหาร & เครื่องดื่ม',
      categoryIcon: 'Utensils',
      categoryColor: '#F97316',
      date: `${year}-${monthStr}-04`,
      time: '12:30',
      note: 'ทานอาหารกลางวันกับเพื่อนร่วมงาน',
      paymentMethod: 'promptpay',
      tags: ['มื้อเที่ยง'],
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-demo-6',
      type: 'expense',
      amount: 1200,
      categoryId: 'exp-transport',
      categoryName: 'ค่าเดินทาง & น้ำมัน',
      categoryIcon: 'Car',
      categoryColor: '#3B82F6',
      date: `${year}-${monthStr}-04`,
      time: '18:45',
      note: 'เติมน้ำมันเต็มถัง',
      paymentMethod: 'credit_card',
      tags: ['รถยนต์', 'น้ำมัน'],
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-demo-7',
      type: 'expense',
      amount: 2490,
      categoryId: 'exp-shopping',
      categoryName: 'ช้อปปิ้ง & ของใช้',
      categoryIcon: 'ShoppingBag',
      categoryColor: '#EC4899',
      date: `${year}-${monthStr}-05`,
      time: '16:20',
      note: 'ซื้อของใช้เข้าบ้านและอาหารสด Supermarket',
      paymentMethod: 'credit_card',
      tags: ['ของใช้เข้าบ้าน'],
      createdAt: Date.now() - 86400000 * 1,
    },
    {
      id: 'tx-demo-8',
      type: 'expense',
      amount: 450,
      categoryId: 'exp-food',
      categoryName: 'อาหาร & เครื่องดื่ม',
      categoryIcon: 'Utensils',
      categoryColor: '#F97316',
      date: `${year}-${monthStr}-06`,
      time: '08:40',
      note: 'กาแฟและขนมปังยามเช้า',
      paymentMethod: 'promptpay',
      createdAt: Date.now(),
    },
    {
      id: 'tx-demo-9',
      type: 'expense',
      amount: 599,
      categoryId: 'exp-bills',
      categoryName: 'บิลค่าบริการ & รายเดือน',
      categoryIcon: 'ReceiptText',
      categoryColor: '#64748B',
      date: `${year}-${monthStr}-05`,
      time: '09:00',
      note: 'ค่าเน็ตบ้านและแพ็กเกจสตรีมมิ่ง',
      paymentMethod: 'bank_transfer',
      createdAt: Date.now() - 86400000 * 1,
    },
  ];
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      const demo = getInitialDemoTransactions();
      saveTransactions(demo);
      return demo;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load transactions:', err);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch (err) {
    console.error('Failed to load categories:', err);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories:', err);
  }
}

export function loadBudgets(): Record<string, MonthlyBudget> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (err) {
    console.error('Failed to load budgets:', err);
    return {};
  }
}

export function saveBudgets(budgets: Record<string, MonthlyBudget>): void {
  try {
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save budgets:', err);
  }
}

export function loadFirebaseConfig(): FirebaseConfigData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load firebase config:', err);
    return null;
  }
}

export function saveFirebaseConfig(config: FirebaseConfigData | null): void {
  try {
    if (!config) {
      localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
      firestoreInstance = null;
    } else {
      localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
    }
  } catch (err) {
    console.error('Failed to save firebase config:', err);
  }
}

// Initialize Firestore if config is provided
export function getFirebaseFirestore(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  const config = loadFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (err) {
    console.error('Error initializing Firebase client:', err);
    return null;
  }
}

// Sync local transactions to Firestore
export async function syncToFirestore(transactions: Transaction[]): Promise<{ success: boolean; message: string; count: number }> {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error('กรุณาตั้งค่าเชื่อมต่อ Firebase ในหน้าต่างการตั้งค่าก่อนทำการ Sync');
  }

  try {
    const batch = writeBatch(db);
    const txCol = collection(db, 'transactions');
    
    // Batch write transactions
    for (const tx of transactions) {
      const docRef = doc(txCol, tx.id);
      batch.set(docRef, {
        ...tx,
        syncedAt: Date.now(),
      });
    }

    await batch.commit();
    return {
      success: true,
      message: `บันทึกข้อมูลธุรกรรม ${transactions.length} รายการไปยัง Firebase เรียบร้อยแล้ว`,
      count: transactions.length,
    };
  } catch (err: any) {
    console.error('Firestore sync error:', err);
    throw new Error(err?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูลไปยัง Firebase');
  }
}

// Pull transactions from Firestore
export async function pullFromFirestore(): Promise<Transaction[]> {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error('กรุณาตั้งค่าเชื่อมต่อ Firebase ในหน้าต่างการตั้งค่าก่อนทำการดึงข้อมูล');
  }

  try {
    const txCol = collection(db, 'transactions');
    const snapshot = await getDocs(txCol);
    const list: Transaction[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.amount !== undefined && data.type) {
        list.push({
          id: docSnap.id,
          type: data.type,
          amount: Number(data.amount) || 0,
          categoryId: data.categoryId || 'exp-other',
          categoryName: data.categoryName || 'อื่นๆ',
          categoryIcon: data.categoryIcon || 'Wallet',
          categoryColor: data.categoryColor || '#94A3B8',
          date: data.date || new Date().toISOString().split('T')[0],
          time: data.time || '12:00',
          note: data.note || '',
          paymentMethod: data.paymentMethod || 'cash',
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt,
        });
      }
    });

    return list;
  } catch (err: any) {
    console.error('Firestore pull error:', err);
    throw new Error(err?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Firebase');
  }
}
