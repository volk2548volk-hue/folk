import React, { useState, useEffect } from 'react';
import { FirebaseConfigData, Transaction } from '../types/finance';
import { 
  loadFirebaseConfig, 
  saveFirebaseConfig, 
  syncToFirestore, 
  pullFromFirestore,
  getFirebaseFirestore
} from '../services/storageService';
import { 
  X, 
  Cloud, 
  CloudOff, 
  Database, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onTransactionsSynced: (newTransactions: Transaction[]) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onTransactionsSynced,
  onShowToast,
}) => {
  const [projectId, setProjectId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [appId, setAppId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = loadFirebaseConfig();
      if (cfg) {
        setProjectId(cfg.projectId || '');
        setApiKey(cfg.apiKey || '');
        setAuthDomain(cfg.authDomain || '');
        setAppId(cfg.appId || '');
        setIsConfigured(true);
      } else {
        setIsConfigured(false);
      }
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    if (!projectId.trim() || !apiKey.trim()) {
      setStatusMsg({
        text: 'กรุณากรอก Project ID และ API Key ให้ครบถ้วน',
        type: 'error',
      });
      return;
    }

    const newCfg: FirebaseConfigData = {
      projectId: projectId.trim(),
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      appId: appId.trim() || '1:123456789:web:abcdef',
    };

    saveFirebaseConfig(newCfg);
    setIsConfigured(true);
    setStatusMsg({
      text: 'บันทึกการตั้งค่า Firebase สำเร็จแล้ว! คุณสามารถกด Sync ข้อมูลได้ทันที',
      type: 'success',
    });
    onShowToast('บันทึกการตั้งค่า Firebase เรียบร้อย', 'success');
  };

  const handleClearConfig = () => {
    if (window.confirm('คุณต้องการยกเลิกการเชื่อมต่อ Firebase และกลับไปใช้ Local Storage หรือไม่?')) {
      saveFirebaseConfig(null);
      setProjectId('');
      setApiKey('');
      setAuthDomain('');
      setAppId('');
      setIsConfigured(false);
      setStatusMsg(null);
      onShowToast('เปลี่ยนกลับมาใช้งาน Local Storage แล้ว', 'info');
    }
  };

  const handleSyncToFirebase = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const result = await syncToFirestore(transactions);
      setStatusMsg({ text: result.message, type: 'success' });
      onShowToast(result.message, 'success');
    } catch (err: any) {
      setStatusMsg({
        text: err?.message || 'ไม่สามารถเชื่อมต่อหรือเขียนข้อมูลไปยัง Firebase ได้',
        type: 'error',
      });
      onShowToast('เกิดข้อผิดพลาดในการ Sync กับ Firebase', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePullFromFirebase = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const list = await pullFromFirestore();
      if (list.length === 0) {
        setStatusMsg({
          text: 'เชื่อมต่อสำเร็จ แต่ยังไม่พบข้อมูลธุรกรรมใน Firestore ของโปรเจกต์นี้',
          type: 'success',
        });
        onShowToast('ยังไม่พบข้อมูลใน Firestore', 'info');
      } else {
        onTransactionsSynced(list);
        setStatusMsg({
          text: `ดึงข้อมูลจาก Firebase สำเร็จ ${list.length} รายการ`,
          type: 'success',
        });
        onShowToast(`ดึงข้อมูล ${list.length} รายการสำเร็จ`, 'success');
      }
    } catch (err: any) {
      setStatusMsg({
        text: err?.message || 'ไม่สามารถดึงข้อมูลจาก Firebase ได้ กรุณาตรวจสอบสิทธิ์และการตั้งค่า',
        type: 'error',
      });
      onShowToast('เกิดข้อผิดพลาดในการดึงข้อมูลจาก Firebase', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
              isConfigured ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'
            }`}>
              {isConfigured ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                การจัดเก็บข้อมูล & Firebase
              </h3>
              <p className="text-xs text-slate-400">
                สลับระหว่าง Local Storage ในเครื่อง และ Firebase Cloud Database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Storage Status Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isConfigured
              ? 'bg-amber-50/50 border-amber-200'
              : 'bg-emerald-50/50 border-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              {isConfigured ? (
                <Cloud className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {isConfigured ? 'เชื่อมโยงกับ Firebase Cloud' : 'จัดเก็บในเครื่อง (Local Storage)'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isConfigured 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isConfigured ? 'Custom Firebase' : 'Active (พร้อมใช้)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {isConfigured
                    ? `เชื่อมต่อกับโปรเจกต์: "${projectId || 'Custom'}" สามารถซิงค์ข้อมูลขึ้น Firestore ได้ทุกเมื่อ`
                    : 'ข้อมูลทั้งหมดจะถูกบันทึกในเบราว์เซอร์ของคุณอย่างปลอดภัยทันทีโดยไม่ต้องเชื่อมต่ออินเทอร์เน็ต'}
                </p>
              </div>
            </div>
          </div>

          {/* Sync actions if configured */}
          {isConfigured && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleSyncToFirebase}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                สำรองขึ้น Firebase ({transactions.length})
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handlePullFromFirebase}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                ดึงข้อมูลจาก Firebase
              </button>
            </div>
          )}

          {/* Status Message */}
          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Configuration Form */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ตั้งค่าโปรเจกต์ Firebase ของคุณ
              </h4>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Firebase Project ID (ชื่อโปรเจกต์) *
              </label>
              <input
                type="text"
                placeholder="เช่น my-expense-tracker-app"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                API Key *
              </label>
              <input
                type="text"
                placeholder="เช่น AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Auth Domain (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น your-app.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  App ID (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น 1:123456789:web:abc"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
              💡 <strong>วิธีดูข้อมูล:</strong> เข้าไปที่ Firebase Console &gt; Project Settings (รูปฟันเฟือง) &gt; General &gt; เลื่อนลงมาที่ "Your apps" &gt; เลือก Web App (&lt;/&gt;) แล้วคัดลอกค่ามาใส่ที่นี่
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {isConfigured ? (
              <button
                type="button"
                onClick={handleClearConfig}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <CloudOff className="w-3.5 h-3.5" />
                ยกเลิกเชื่อมต่อ
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
