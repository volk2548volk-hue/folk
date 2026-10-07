import { Category, PaymentMethod } from '../types/finance';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  {
    id: 'exp-food',
    name: 'อาหาร & เครื่องดื่ม',
    type: 'expense',
    icon: 'Utensils',
    color: '#F97316', // Orange
  },
  {
    id: 'exp-transport',
    name: 'ค่าเดินทาง & น้ำมัน',
    type: 'expense',
    icon: 'Car',
    color: '#3B82F6', // Blue
  },
  {
    id: 'exp-housing',
    name: 'ที่พัก & ค่าน้ำ-ไฟ-เน็ต',
    type: 'expense',
    icon: 'Home',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'exp-shopping',
    name: 'ช้อปปิ้ง & ของใช้',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#EC4899', // Pink
  },
  {
    id: 'exp-entertainment',
    name: 'บันเทิง & ท่องเที่ยว',
    type: 'expense',
    icon: 'Film',
    color: '#06B6D4', // Cyan
  },
  {
    id: 'exp-health',
    name: 'สุขภาพ & ยารักษาโรค',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#EF4444', // Red
  },
  {
    id: 'exp-education',
    name: 'การศึกษา & พัฒนาตนเอง',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#10B981', // Emerald
  },
  {
    id: 'exp-bills',
    name: 'บิลค่าบริการ & รายเดือน',
    type: 'expense',
    icon: 'ReceiptText',
    color: '#64748B', // Slate
  },
  {
    id: 'exp-debt',
    name: 'ผ่อนชำระ & ภาระหนี้',
    type: 'expense',
    icon: 'CreditCard',
    color: '#E11D48', // Rose
  },
  {
    id: 'exp-other',
    name: 'ค่าใช้จ่ายอื่นๆ',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#94A3B8', // Gray
  },

  // Income Categories
  {
    id: 'inc-salary',
    name: 'เงินเดือน & ค่าจ้างประจำ',
    type: 'income',
    icon: 'Briefcase',
    color: '#10B981', // Emerald
  },
  {
    id: 'inc-freelance',
    name: 'งานเสริม & ฟรีแลนซ์',
    type: 'income',
    icon: 'Laptop',
    color: '#059669', // Dark emerald
  },
  {
    id: 'inc-business',
    name: 'ธุรกิจส่วนตัว & ค้าขาย',
    type: 'income',
    icon: 'Store',
    color: '#2563EB', // Royal Blue
  },
  {
    id: 'inc-invest',
    name: 'การลงทุน & ปันผล/ดอกเบี้ย',
    type: 'income',
    icon: 'TrendingUp',
    color: '#7C3AED', // Violet
  },
  {
    id: 'inc-bonus',
    name: 'โบนัส & เงินรางวัล',
    type: 'income',
    icon: 'Award',
    color: '#F59E0B', // Amber
  },
  {
    id: 'inc-gift',
    name: 'ของขวัญ & รับเงินโอน',
    type: 'income',
    icon: 'Gift',
    color: '#D946EF', // Fuchsia
  },
  {
    id: 'inc-other',
    name: 'รายรับอื่นๆ',
    type: 'income',
    icon: 'PlusCircle',
    color: '#14B8A6', // Teal
  },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'promptpay', label: 'พร้อมเพย์ (PromptPay)', icon: 'QrCode' },
  { id: 'bank_transfer', label: 'โอนผ่านธนาคาร (Mobile Banking)', icon: 'Building2' },
  { id: 'cash', label: 'เงินสด (Cash)', icon: 'Banknote' },
  { id: 'credit_card', label: 'บัตรเครดิต (Credit Card)', icon: 'CreditCard' },
  { id: 'truemoney', label: 'ทรูมันนี่ (TrueMoney)', icon: 'Smartphone' },
  { id: 'debit_card', label: 'บัตรเดบิต (Debit Card)', icon: 'CreditCard' },
  { id: 'other', label: 'อื่นๆ', icon: 'Wallet' },
];

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function formatCurrency(amount: number, includeUnit: boolean = true): string {
  const formatted = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return includeUnit ? `฿${formatted}` : formatted;
}

export function formatThaiDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const thaiYear = year + 543;
  const monthName = THAI_MONTHS[month - 1] || '';
  return `${day} ${monthName} ${thaiYear}`;
}

export function formatThaiMonthYear(yearMonth: string): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  const thaiYear = year + 543;
  const monthName = THAI_MONTHS[month - 1] || '';
  return `${monthName} ${thaiYear} (${year})`;
}
