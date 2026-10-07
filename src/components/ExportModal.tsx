import React, { useRef } from 'react';
import { Transaction } from '../types/finance';
import { formatThaiDate } from '../constants/categories';
import { 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileCode, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onImportTransactions: (imported: Transaction[]) => void;
  onResetToDemo: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onImportTransactions,
  onResetToDemo,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export to CSV with UTF-8 BOM so Thai characters open cleanly in Microsoft Excel
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      onShowToast('ไม่มีข้อมูลสำหรับส่งออก', 'info');
      return;
    }

    const headers = ['ID', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน(บาท)', 'วันที่', 'เวลา', 'ช่องทางชำระ', 'หมายเหตุ', 'ป้ายกำกับ'];
    const rows = transactions.map((t) => [
      t.id,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.categoryName.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.date,
      t.time || '',
      t.paymentMethod,
      `"${(t.note || '').replace(/"/g, '""')}"`,
      `"${(t.tags || []).join(';')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('ส่งออกไฟล์ CSV สำหรับ Excel สำเร็จแล้ว', 'success');
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('สำรองไฟล์ JSON เรียบร้อยแล้ว', 'success');
  };

  // Import from JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportTransactions(parsed);
          onShowToast(`นำเข้าข้อมูลสำเร็จ ${parsed.length} รายการ`, 'success');
          onClose();
        } else {
          onShowToast('รูปแบบไฟล์ไม่ถูกต้อง หรือไม่มีรายการข้อมูล', 'error');
        }
      } catch (err) {
        onShowToast('ไม่สามารถอ่านไฟล์ JSON ได้', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">นำเข้า & ส่งออกข้อมูล</h3>
              <p className="text-xs text-slate-400">สำรองและถ่ายโอนข้อมูลธุรกรรมของคุณ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Export Options */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              ส่งออกข้อมูล (Export)
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    ไฟล์ CSV (Excel)
                  </div>
                  <div className="text-[10px] text-slate-400">รองรับภาษาไทย</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                    ไฟล์ JSON Backup
                  </div>
                  <div className="text-[10px] text-slate-400">สำรองแบบครบถ้วน</div>
                </div>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              นำเข้าข้อมูล (Import)
            </h4>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 text-xs font-semibold text-slate-700 transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              เลือกไฟล์ JSON เพื่อนำเข้าข้อมูล
            </button>
          </div>

          {/* Demo reset */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">ต้องการทดลองข้อมูลตัวอย่าง?</span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('คุณต้องการรีเซ็ตเป็นข้อมูลตัวอย่างจำลองใช่หรือไม่?')) {
                    onResetToDemo();
                    onClose();
                  }
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                โหลดข้อมูลตัวอย่าง
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
