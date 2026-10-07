import React from 'react';
import { formatThaiMonthYear, THAI_MONTHS } from '../constants/categories';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Cloud, 
  Download, 
  Calendar,
  Wallet,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  selectedMonth: string; // YYYY-MM
  onMonthChange: (newMonth: string) => void;
  onOpenNewTransactionModal: () => void;
  onOpenFirebaseModal: () => void;
  onOpenExportModal: () => void;
  isFirebaseConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  onMonthChange,
  onOpenNewTransactionModal,
  onOpenFirebaseModal,
  onOpenExportModal,
  isFirebaseConfigured,
}) => {
  const [currYear, currMonth] = selectedMonth.split('-').map(Number);

  const handlePrevMonth = () => {
    let y = currYear;
    let m = currMonth - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    onMonthChange(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let y = currYear;
    let m = currMonth + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    onMonthChange(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return selectedMonth === current;
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    จัดการรายรับรายจ่าย
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hidden sm:inline-block">
                    Thai Baht ฿
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  สรุปผลรายเดือน & กราฟวิเคราะห์กระแสเงินสด
                </p>
              </div>
            </div>

            {/* Mobile New Button */}
            <button
              onClick={onOpenNewTransactionModal}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึก</span>
            </button>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
            <button
              onClick={handlePrevMonth}
              title="เดือนก่อนหน้า"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 flex items-center gap-1.5 min-w-[170px] justify-center">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {formatThaiMonthYear(selectedMonth)}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="เดือนถัดไป"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isCurrentMonth() && (
              <button
                onClick={handleCurrentMonth}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors ml-1 hidden sm:block"
              >
                เดือนนี้
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Storage / Firebase Button */}
            <button
              onClick={onOpenFirebaseModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isFirebaseConfigured
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isFirebaseConfigured ? 'Firebase ซิงค์แล้ว' : 'คลาวด์ & ที่เก็บข้อมูล'}</span>
            </button>

            {/* Export / Import Button */}
            <button
              onClick={onOpenExportModal}
              title="ส่งออก Excel / สำรองข้อมูล"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก/นำเข้า</span>
            </button>

            {/* Main Action: Add Transaction */}
            <button
              onClick={onOpenNewTransactionModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกรายการใหม่</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
