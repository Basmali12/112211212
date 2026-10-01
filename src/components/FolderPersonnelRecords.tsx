import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { ArrowRight, ClipboardList, Download, Pencil, Plus, Search, Trash2, Upload, UserPlus, X } from 'lucide-react';
import { normalizeArabic } from '../mockData';
import { ConfirmDialog } from './ConfirmDialog';
import { ExcelRowCheckbox, SelectedExcelButton, useExcelSelection } from './ExcelSelection';

const STORAGE_KEY = 'military_folder_personnel_records_v1';

export const PERSONNEL_RECORD_FOLDER_IDS = [
  'file_sareya_1',
  'file_sareya_2',
  'file_sareya_3',
  'file_sareya_4',
  'file_maqar',
  'file_movements',
  'file_intel',
  'file_alamal',
  'file_security',
  'file_readiness',
] as const;

export const isPersonnelRecordsFolder = (folderId: string): boolean =>
  PERSONNEL_RECORD_FOLDER_IDS.includes(folderId as (typeof PERSONNEL_RECORD_FOLDER_IDS)[number]);

interface FolderPersonnelRecord {
  id: string;
  folderId: string;
  militaryNumber: string;
  fullName: string;
  position: string;
  unitOrCompany: string;
  motherName: string;
  birthDate: string;
  qiCardNumber: string;
  nationalCardNumber: string;
  createdAt: string;
}

type FolderPersonnelStore = Record<string, FolderPersonnelRecord[]>;

interface RecordFormState {
  militaryNumber: string;
  fullName: string;
  position: string;
  unitOrCompany: string;
  motherName: string;
  birthDate: string;
  qiCardNumber: string;
  nationalCardNumber: string;
}

interface FolderPersonnelRecordsProps {
  folderId: string;
  folderName: string;
  folderLabel: string;
  isDarkMode: boolean;
  onBack: () => void;
  onShowToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
}

const EMPTY_FORM: RecordFormState = {
  militaryNumber: '',
  fullName: '',
  position: '',
  unitOrCompany: '',
  motherName: '',
  birthDate: '',
  qiCardNumber: '',
  nationalCardNumber: '',
};

const readStore = (): FolderPersonnelStore => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const readFolderRecords = (folderId: string): FolderPersonnelRecord[] => {
  const records = readStore()[folderId];
  return Array.isArray(records) ? records : [];
};

export const getStoredPersonnelFolderCount = (folderId: string): number => readFolderRecords(folderId).length;

const normalizeSearchValue = (value: string): string => normalizeArabic(value).toLocaleLowerCase('ar-IQ').trim();

export const FolderPersonnelRecords: React.FC<FolderPersonnelRecordsProps> = ({
  folderId,
  folderName,
  folderLabel,
  isDarkMode,
  onBack,
  onShowToast,
}) => {
  const [records, setRecords] = useState<FolderPersonnelRecord[]>(() => readFolderRecords(folderId));
  const selection = useExcelSelection(records, (record) => record.id);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RecordFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showForm && editingId) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [showForm, editingId]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return records;

    return records.filter((record) =>
      [
        record.militaryNumber,
        record.fullName,
        record.position || '',
        record.unitOrCompany || '',
        record.motherName,
        record.birthDate,
        record.qiCardNumber,
        record.nationalCardNumber,
      ].some((value) => normalizeSearchValue(value).includes(normalizedQuery)),
    );
  }, [query, records]);

  const inputStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    borderColor: isDarkMode ? '#3e3e3e' : '#cbd5e1',
    color: isDarkMode ? '#ffffff' : '#0f172a',
  };

  const updateForm = (field: keyof RecordFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const openEditForm = (record: FolderPersonnelRecord) => {
    setEditingId(record.id);
    setForm({
      militaryNumber: record.militaryNumber,
      fullName: record.fullName,
      position: record.position,
      unitOrCompany: record.unitOrCompany,
      motherName: record.motherName,
      birthDate: record.birthDate,
      qiCardNumber: record.qiCardNumber,
      nationalCardNumber: record.nationalCardNumber,
    });
    setShowForm(true);
  };

  const deleteRecord = () => {
    const record = records.find((item) => item.id === pendingDeleteId);
    if (!record) { setPendingDeleteId(null); return; }
    const nextRecords = records.filter((item) => item.id !== record.id);
    try {
      const store = readStore();
      store[folderId] = nextRecords;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      onShowToast('warning', 'تعذر الحذف', 'لم يُحفظ التغيير في المتصفح. حاول مرة أخرى.');
      return;
    }
    setRecords(nextRecords);
    setPendingDeleteId(null);
    if (editingId === record.id) closeForm();
    onShowToast('success', 'تم حذف المنتسب', `حُذف سجل ${record.fullName} من ${folderName}.`);
  };

  const saveRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.militaryNumber.trim() || !form.fullName.trim()) {
      onShowToast('warning', 'حقول مطلوبة', 'أدخل الرقم العسكري والاسم الرباعي واللقب.');
      return;
    }

    const existing = records.find((item) => item.id === editingId);
    const newRecord: FolderPersonnelRecord = {
      id: existing?.id || globalThis.crypto?.randomUUID?.() || `record_${Date.now()}`,
      folderId,
      militaryNumber: form.militaryNumber.trim(),
      fullName: form.fullName.trim(),
      position: form.position.trim(),
      unitOrCompany: form.unitOrCompany.trim(),
      motherName: form.motherName.trim(),
      birthDate: form.birthDate.trim(),
      qiCardNumber: form.qiCardNumber.trim(),
      nationalCardNumber: form.nationalCardNumber.trim(),
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    const nextRecords = existing
      ? records.map((record) => record.id === existing.id ? newRecord : record)
      : [...records, newRecord];
    try {
      const store = readStore();
      store[folderId] = nextRecords;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      onShowToast('warning', 'تعذر الحفظ', 'لم تُحفظ التغييرات في المتصفح. حاول مرة أخرى.');
      return;
    }
    setRecords(nextRecords);
    closeForm();
    onShowToast('success', existing ? 'تم تعديل المنتسب' : 'تمت إضافة المنتسب', `حُفظ السجل داخل ${folderName}.`);
  };

  const downloadExcel = (toExport = records) => {
    const rows = toExport.map((record, index) => ({
      'ت': index + 1,
      'الرقم العسكري': record.militaryNumber,
      'الاسم الرباعي واللقب': record.fullName,
      'المنصب': record.position || '',
      'الفوج أو السرية': record.unitOrCompany || '',
      'اسم الأم': record.motherName,
      'تاريخ التولد': record.birthDate,
      'رقم بطاقة كي كارد': record.qiCardNumber,
      'رقم البطاقة الوطنية': record.nationalCardNumber,
    }));
    const worksheet = rows.length > 0
      ? XLSX.utils.json_to_sheet(rows)
      : XLSX.utils.aoa_to_sheet([['ت', 'الرقم العسكري', 'الاسم الرباعي واللقب', 'المنصب', 'الفوج أو السرية', 'اسم الأم', 'تاريخ التولد', 'رقم بطاقة كي كارد', 'رقم البطاقة الوطنية']]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل_المنتسبين');
    XLSX.writeFile(workbook, `${folderName}_سجل_المنتسبين${toExport === records ? '' : '_المحدد'}.xlsx`);
    onShowToast('success', 'تم تحميل Excel', `تم تنزيل ${toExport.length} سجل من ${folderName}.`);
  };

  const uploadExcel = async (file: File | undefined) => {
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '', raw: false });
      const imported = rows.map((row, index): FolderPersonnelRecord | null => {
        const militaryNumber = String(row['الرقم العسكري'] ?? row['رقم العسكري'] ?? '').trim();
        const fullName = String(row['الاسم الرباعي واللقب'] ?? row['الاسم'] ?? '').trim();
        if (!militaryNumber && !fullName) return null;
        return {
          id: globalThis.crypto?.randomUUID?.() || `record_${Date.now()}_${index}`,
          folderId,
          militaryNumber,
          fullName,
          position: String(row['المنصب'] ?? row['الصفة'] ?? '').trim(),
          unitOrCompany: String(row['الفوج أو السرية'] ?? row['الفوج او السرية'] ?? row['الفوج'] ?? row['السرية'] ?? '').trim(),
          motherName: String(row['اسم الأم'] ?? row['اسم الام'] ?? '').trim(),
          birthDate: String(row['تاريخ التولد'] ?? row['تاريخ الميلاد'] ?? '').trim(),
          qiCardNumber: String(row['رقم بطاقة كي كارد'] ?? row['رقم الكي كارد'] ?? '').trim(),
          nationalCardNumber: String(row['رقم البطاقة الوطنية'] ?? row['رقم البطاقة الموحدة'] ?? '').trim(),
          createdAt: new Date().toISOString(),
        };
      }).filter((record): record is FolderPersonnelRecord => record !== null);

      if (imported.length === 0) {
        onShowToast('warning', 'ملف Excel فارغ', 'لم يتم العثور على سجلات قابلة للإضافة.');
        return;
      }
      const nextRecords = [...records, ...imported];
      const store = readStore();
      store[folderId] = nextRecords;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      setRecords(nextRecords);
      onShowToast('success', 'تم رفع Excel', `تمت إضافة ${imported.length} سجل إلى ${folderName} فقط.`);
    } catch {
      onShowToast('warning', 'تعذر قراءة Excel', 'تأكد من اختيار ملف Excel صالح وبالعناوين الصحيحة.');
    } finally {
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-[560px]">
      <div
        className="flex flex-col gap-4 p-4 rounded-2xl border mb-4"
        style={{
          backgroundColor: isDarkMode ? '#242424' : '#f8fafc',
          borderColor: isDarkMode ? '#383838' : '#e2e8f0',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
              style={{
                backgroundColor: isDarkMode ? '#333333' : '#e2e8f0',
                color: isDarkMode ? '#ffffff' : '#1e293b',
              }}
              title="الرجوع إلى ملفات الفوج"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع إلى ملفات الفوج</span>
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {folderLabel}
                </span>
                <span className="text-[10px] text-neutral-400">{records.length} سجل</span>
              </div>
              <h3 className="text-lg font-bold" style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}>
                سجلات منتسبي {folderName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={() => excelInputRef.current?.click()} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95">
              <Upload className="w-4 h-4" />
              <span>رفع Excel</span>
            </button>
            <input ref={excelInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(event) => void uploadExcel(event.target.files?.[0])} />
            <button type="button" onClick={() => downloadExcel()} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95">
              <Download className="w-4 h-4" />
              <span>تحميل Excel</span>
            </button>
            <SelectedExcelButton enabled={selection.enabled} count={selection.selectedRecords.length} onAction={() => selection.run(downloadExcel, () => onShowToast('warning', 'لا توجد سجلات محددة', 'حدد منتسبًا واحدًا على الأقل.'))} onCancel={selection.reset} />
            <button
              type="button"
              onClick={() => {
                if (showForm && !editingId) closeForm();
                else { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              aria-expanded={showForm}
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة منتسب</span>
            </button>
          </div>
        </div>

        <div className="relative w-full">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث بالرقم العسكري أو الاسم أو أي رقم بطاقة..."
            aria-label="بحث في سجلات المنتسبين"
            className="w-full py-2 pr-10 pl-10 rounded-xl text-xs border focus:outline-hidden transition-all text-right"
            style={inputStyle}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute left-3 top-2.5 text-neutral-400 hover:text-white cursor-pointer"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          ref={formRef}
          onSubmit={saveRecord}
          className="p-4 rounded-2xl border mb-4 scroll-mt-44"
          style={{
            backgroundColor: isDarkMode ? '#202020' : '#ffffff',
            borderColor: isDarkMode ? '#3b4252' : '#cbd5e1',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Plus className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold">{editingId ? 'تعديل سجل المنتسب' : 'إضافة سجل منتسب جديد'}</h4>
            </div>
            <button type="button" onClick={closeForm} className="text-neutral-400 hover:text-white cursor-pointer" aria-label="إغلاق نموذج المنتسب">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="text-[11px] font-bold text-neutral-300">
              الرقم العسكري <span className="text-red-400">*</span>
              <input
                value={form.militaryNumber}
                onChange={(event) => updateForm('militaryNumber', event.target.value)}
                placeholder="أدخل الرقم العسكري"
                inputMode="numeric"
                required
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right"
                style={inputStyle}
              />
            </label>
            <label className="text-[11px] font-bold text-neutral-300 sm:col-span-2">
              الاسم الرباعي واللقب <span className="text-red-400">*</span>
              <input
                value={form.fullName}
                onChange={(event) => updateForm('fullName', event.target.value)}
                placeholder="أدخل الاسم الرباعي واللقب"
                required
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right"
                style={inputStyle}
              />
            </label>
            <label className="text-[11px] font-bold text-neutral-300">
              المنصب
              <input
                value={form.position}
                onChange={(event) => updateForm('position', event.target.value)}
                placeholder="أدخل المنصب"
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right"
                style={inputStyle}
              />
            </label>
            <label className="text-[11px] font-bold text-neutral-300">
              الفوج أو السرية
              <input
                value={form.unitOrCompany}
                onChange={(event) => updateForm('unitOrCompany', event.target.value)}
                placeholder="أدخل الفوج أو السرية"
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right"
                style={inputStyle}
              />
            </label>
            <label className="text-[11px] font-bold text-neutral-300">
              اسم الأم
              <input
                value={form.motherName}
                onChange={(event) => updateForm('motherName', event.target.value)}
                placeholder="أدخل اسم الأم"
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right"
                style={inputStyle}
              />
            </label>
            <label className="text-[11px] font-bold text-neutral-300">
              التولد
              <input
                value={form.birthDate}
                onChange={(event) => updateForm('birthDate', event.target.value)}
                placeholder="مثال: 24/3/1967"
                inputMode="numeric"
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right"
                style={inputStyle}
              />
            </label>
            <label className="text-[11px] font-bold text-neutral-300">
              رقم الكي كارد الجديد
              <input
                value={form.qiCardNumber}
                onChange={(event) => updateForm('qiCardNumber', event.target.value)}
                placeholder="أدخل رقم الكي كارد"
                inputMode="numeric"
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right"
                style={inputStyle}
              />
            </label>
            <label className="text-[11px] font-bold text-neutral-300">
              رقم البطاقة الموحدة
              <input
                value={form.nationalCardNumber}
                onChange={(event) => updateForm('nationalCardNumber', event.target.value)}
                placeholder="أدخل رقم البطاقة الموحدة"
                inputMode="numeric"
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right"
                style={inputStyle}
              />
            </label>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer">
              {editingId ? 'حفظ التعديل' : 'حفظ السجل'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              style={{ backgroundColor: isDarkMode ? '#333333' : '#e2e8f0', color: isDarkMode ? '#ffffff' : '#1e293b' }}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div
        className="flex-1 min-h-[330px] rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
          borderColor: isDarkMode ? '#343434' : '#e2e8f0',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1480px] text-right border-collapse">
            <thead>
              <tr style={{ backgroundColor: isDarkMode ? '#2b2b2b' : '#f1f5f9' }}>
                {(selection.enabled ? ['تحديد', 'ت', 'إجراءات', 'الرقم العسكري', 'الاسم الرباعي واللقب', 'المنصب', 'الفوج أو السرية', 'اسم الأم', 'التولد', 'رقم الكي كارد الجديد', 'رقم البطاقة الموحدة'] : ['ت', 'إجراءات', 'الرقم العسكري', 'الاسم الرباعي واللقب', 'المنصب', 'الفوج أو السرية', 'اسم الأم', 'التولد', 'رقم الكي كارد الجديد', 'رقم البطاقة الموحدة']).map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-[11px] font-bold border-b whitespace-nowrap"
                    style={{ borderColor: isDarkMode ? '#3d3d3d' : '#cbd5e1', color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={record.id} className="hover:bg-blue-500/5 transition-colors">
                  {selection.enabled && <td className="px-3 py-3 border-b" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}><ExcelRowCheckbox checked={selection.selectedIds.has(record.id)} label={record.fullName} onChange={() => selection.toggle(record.id)} /></td>}
                  <td className="px-4 py-3 text-[11px] border-b whitespace-nowrap" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>{index + 1}</td>
                  <td className="px-3 py-2 border-b whitespace-nowrap" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEditForm(record)} aria-label={`تعديل سجل ${record.fullName}`} className="px-2 py-1.5 rounded-lg border border-blue-500/40 text-blue-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-blue-500/10"><Pencil className="w-3.5 h-3.5" /> تعديل</button>
                      <button type="button" onClick={() => setPendingDeleteId(record.id)} aria-label={`حذف سجل ${record.fullName}`} className="px-2 py-1.5 rounded-lg border border-red-500/40 text-red-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
                    </div>
                  </td>
                  {[
                    record.militaryNumber,
                    record.fullName,
                    record.position || '—',
                    record.unitOrCompany || '—',
                    record.motherName || '—',
                    record.birthDate || '—',
                    record.qiCardNumber || '—',
                    record.nationalCardNumber || '—',
                  ].map((value, cellIndex) => (
                    <td
                      key={`${record.id}-${cellIndex}`}
                      className="px-4 py-3 text-[11px] border-b whitespace-nowrap"
                      style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0', color: isDarkMode ? '#e5e7eb' : '#334155' }}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="min-h-[280px] flex flex-col items-center justify-center text-center p-8">
            <span className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <ClipboardList className="w-7 h-7" />
            </span>
            <h4 className="text-sm font-bold mb-1">
              {query ? 'لا توجد نتائج مطابقة' : `لا توجد سجلات في ${folderName}`}
            </h4>
            <p className="text-xs text-neutral-400 mb-3">
              {query ? 'جرّب البحث باسم أو رقم مختلف.' : 'اضغط على زر إضافة منتسب لإدخال أول سجل.'}
            </p>
            {!query && (
              <button type="button" onClick={() => setShowForm(true)} className="text-xs font-bold text-blue-400 hover:underline cursor-pointer">
                إضافة أول سجل
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 py-3 text-[11px] text-neutral-400">
        <span>{filteredRecords.length} سجل ظاهر</span>
        {query && <span>من أصل {records.length} سجل</span>}
      </div>
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        isDarkMode={isDarkMode}
        title="تأكيد حذف سجل المنتسب"
        message={`هل تريد حذف سجل «${records.find((record) => record.id === pendingDeleteId)?.fullName || ''}» من ${folderName} نهائيًا؟`}
        onConfirm={deleteRecord}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};
