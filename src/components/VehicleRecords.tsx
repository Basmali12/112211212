import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { normalizeArabic } from '../mockData';

const STORAGE_KEY = 'military_vehicle_records_v1';

interface VehicleRecord {
  id: string;
  vehicleType: string;
  chassisNumber: string;
  vehicleColor: string;
  vehicleNumber: string;
  driverName: string;
  vehicleOwnership: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type VehicleFormState = Omit<VehicleRecord, 'id' | 'createdAt' | 'updatedAt'>;

interface VehicleRecordsProps {
  isDarkMode: boolean;
  onBack: () => void;
  onShowToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
}

const EMPTY_FORM: VehicleFormState = {
  vehicleType: '',
  chassisNumber: '',
  vehicleColor: '',
  vehicleNumber: '',
  driverName: '',
  vehicleOwnership: '',
  notes: '',
};

const readRecords = (): VehicleRecord[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistRecords = (records: VehicleRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const getStoredVehicleCount = (): number => readRecords().length;

const normalizeSearchValue = (value: string): string =>
  normalizeArabic(value).toLocaleLowerCase('ar-IQ').trim();

const FIELD_LABELS: Array<{ key: keyof VehicleFormState; label: string; placeholder: string }> = [
  { key: 'vehicleType', label: 'نوع العجلة', placeholder: 'مثال: بيك أب أو صالون' },
  { key: 'chassisNumber', label: 'رقم الشاصي', placeholder: 'أدخل رقم الشاصي' },
  { key: 'vehicleColor', label: 'لون العجلة', placeholder: 'أدخل لون العجلة' },
  { key: 'vehicleNumber', label: 'رقم العجلة', placeholder: 'أدخل رقم العجلة' },
  { key: 'driverName', label: 'اسم السائق', placeholder: 'أدخل اسم السائق' },
  { key: 'vehicleOwnership', label: 'عائدية العجلة', placeholder: 'أدخل عائدية العجلة' },
];

export const VehicleRecords: React.FC<VehicleRecordsProps> = ({
  isDarkMode,
  onBack,
  onShowToast,
}) => {
  const [records, setRecords] = useState<VehicleRecord[]>(readRecords);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleFormState>(EMPTY_FORM);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return records;
    return records.filter((record) => normalizeSearchValue(record.driverName).includes(normalizedQuery));
  }, [query, records]);

  const inputStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    borderColor: isDarkMode ? '#3e3e3e' : '#cbd5e1',
    color: isDarkMode ? '#ffffff' : '#0f172a',
  };

  const updateForm = (field: keyof VehicleFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (record: VehicleRecord) => {
    setEditingId(record.id);
    setForm({
      vehicleType: record.vehicleType,
      chassisNumber: record.chassisNumber,
      vehicleColor: record.vehicleColor,
      vehicleNumber: record.vehicleNumber,
      driverName: record.driverName,
      vehicleOwnership: record.vehicleOwnership,
      notes: record.notes,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.vehicleType.trim() || !form.vehicleNumber.trim() || !form.driverName.trim()) {
      onShowToast('warning', 'حقول مطلوبة', 'أدخل نوع العجلة ورقم العجلة واسم السائق.');
      return;
    }

    const now = new Date().toISOString();
    const cleanedForm = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()]),
    ) as VehicleFormState;

    const nextRecords = editingId
      ? records.map((record) =>
          record.id === editingId ? { ...record, ...cleanedForm, updatedAt: now } : record,
        )
      : [
          ...records,
          {
            id: globalThis.crypto?.randomUUID?.() || `vehicle_${Date.now()}`,
            ...cleanedForm,
            createdAt: now,
            updatedAt: now,
          },
        ];

    persistRecords(nextRecords);
    setRecords(nextRecords);
    closeForm();
    onShowToast(
      'success',
      editingId ? 'تم تعديل السيارة' : 'تمت إضافة السيارة',
      editingId ? 'حُفظت التعديلات بنجاح.' : 'حُفظ سجل السيارة داخل ملف الآليات.',
    );
  };

  const deleteRecord = (record: VehicleRecord) => {
    if (!window.confirm(`هل تريد حذف سيارة السائق "${record.driverName}"؟`)) return;
    const nextRecords = records.filter((item) => item.id !== record.id);
    persistRecords(nextRecords);
    setRecords(nextRecords);
    if (expandedId === record.id) setExpandedId(null);
    if (editingId === record.id) closeForm();
    onShowToast('info', 'تم حذف السيارة', `حُذف سجل سيارة السائق ${record.driverName}.`);
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-[560px]" dir="rtl">
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
              className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? '#333333' : '#e2e8f0',
                color: isDarkMode ? '#ffffff' : '#1e293b',
              }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع إلى ملفات الفوج</span>
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  شعبة الآليات
                </span>
                <span className="text-[10px] text-neutral-400">{records.length} سيارة</span>
              </div>
              <h3 className="text-lg font-bold" style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}>
                سجل السيارات والآليات
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سيارة</span>
          </button>
        </div>

        <div className="relative w-full">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث وفهرس السيارات باسم السائق..."
            aria-label="بحث باسم السائق"
            className="w-full py-2 pr-10 pl-10 rounded-xl text-xs border focus:outline-hidden text-right"
            style={inputStyle}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute left-3 top-2.5 text-neutral-400 hover:text-white cursor-pointer"
              aria-label="مسح بحث السائق"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={saveRecord}
          className="p-4 rounded-2xl border mb-4"
          style={{
            backgroundColor: isDarkMode ? '#202020' : '#ffffff',
            borderColor: isDarkMode ? '#3b4252' : '#cbd5e1',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                {editingId ? <Pencil className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
              </span>
              <h4 className="text-sm font-bold">{editingId ? 'تعديل بيانات السيارة' : 'إضافة سيارة جديدة'}</h4>
            </div>
            <button type="button" onClick={closeForm} aria-label="إغلاق نموذج السيارة" className="text-neutral-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FIELD_LABELS.map((field) => (
              <label key={field.key} className="text-[11px] font-bold text-neutral-300">
                {field.label}
                {(field.key === 'vehicleType' || field.key === 'vehicleNumber' || field.key === 'driverName') && (
                  <span className="text-red-400"> *</span>
                )}
                <input
                  value={form[field.key]}
                  onChange={(event) => updateForm(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  required={field.key === 'vehicleType' || field.key === 'vehicleNumber' || field.key === 'driverName'}
                  className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right"
                  style={inputStyle}
                />
              </label>
            ))}
            <label className="text-[11px] font-bold text-neutral-300 sm:col-span-2 lg:col-span-3">
              الملاحظات
              <textarea
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                placeholder="أدخل الملاحظات الخاصة بالسيارة"
                rows={3}
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl text-xs border focus:outline-hidden text-right resize-y"
                style={inputStyle}
              />
            </label>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer">
              {editingId ? 'حفظ التعديلات' : 'حفظ السيارة'}
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
          <table className="w-full min-w-[1180px] text-right border-collapse">
            <thead>
              <tr style={{ backgroundColor: isDarkMode ? '#2b2b2b' : '#f1f5f9' }}>
                {['ت', 'نوع العجلة', 'رقم الشاصي', 'لون العجلة', 'رقم العجلة', 'اسم السائق', 'عائدية العجلة', 'الإجراءات'].map((heading) => (
                  <th key={heading} className="px-3 py-3 text-[11px] font-bold border-b whitespace-nowrap" style={{ borderColor: isDarkMode ? '#3d3d3d' : '#cbd5e1' }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <React.Fragment key={record.id}>
                  <tr className="hover:bg-teal-500/5 transition-colors">
                    <td className="px-3 py-3 text-[11px] border-b" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>{index + 1}</td>
                    <td className="px-3 py-3 text-[11px] border-b whitespace-nowrap" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>{record.vehicleType}</td>
                    <td className="px-3 py-3 text-[11px] border-b whitespace-nowrap font-mono" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>{record.chassisNumber || '—'}</td>
                    <td className="px-3 py-3 text-[11px] border-b whitespace-nowrap" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>{record.vehicleColor || '—'}</td>
                    <td className="px-3 py-3 text-[11px] border-b whitespace-nowrap font-mono" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>{record.vehicleNumber}</td>
                    <td className="px-3 py-3 text-[11px] border-b whitespace-nowrap font-bold" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>{record.driverName}</td>
                    <td className="px-3 py-3 text-[11px] border-b whitespace-nowrap" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>{record.vehicleOwnership || '—'}</td>
                    <td className="px-3 py-2 border-b" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0' }}>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <button type="button" onClick={() => setExpandedId(expandedId === record.id ? null : record.id)} className="p-1.5 rounded-lg bg-neutral-700/70 hover:bg-neutral-600 text-white cursor-pointer" aria-label={`عرض تفاصيل سيارة ${record.driverName}`}>
                          {expandedId === record.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <button type="button" onClick={() => openEditForm(record)} className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer" aria-label={`تعديل سيارة ${record.driverName}`}>
                          <Pencil className="w-3 h-3" /> تعديل
                        </button>
                        <button type="button" onClick={() => deleteRecord(record)} className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer" aria-label={`حذف سيارة ${record.driverName}`}>
                          <Trash2 className="w-3 h-3" /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === record.id && (
                    <tr>
                      <td colSpan={8} className="px-4 py-3 border-b" style={{ borderColor: isDarkMode ? '#343434' : '#e2e8f0', backgroundColor: isDarkMode ? '#181f1f' : '#f0fdfa' }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                          {[
                            ['نوع العجلة', record.vehicleType],
                            ['رقم الشاصي', record.chassisNumber],
                            ['لون العجلة', record.vehicleColor],
                            ['رقم العجلة', record.vehicleNumber],
                            ['اسم السائق', record.driverName],
                            ['عائدية العجلة', record.vehicleOwnership],
                            ['الملاحظات', record.notes],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border p-2" style={{ borderColor: isDarkMode ? '#334747' : '#99f6e4' }}>
                              <div className="text-[9px] text-neutral-400 mb-1">{label}</div>
                              <div className="text-[11px] font-bold break-words">{value || '—'}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="min-h-[280px] flex flex-col items-center justify-center text-center p-8">
            <span className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
              <Truck className="w-7 h-7" />
            </span>
            <h4 className="text-sm font-bold mb-1">{query ? 'لا توجد سيارة بهذا السائق' : 'لا توجد سيارات مسجلة'}</h4>
            <p className="text-xs text-neutral-400 mb-3">{query ? 'جرّب اسم سائق آخر.' : 'اضغط على زر إضافة سيارة لإدخال أول سجل.'}</p>
            {!query && (
              <button type="button" onClick={openAddForm} className="text-xs font-bold text-teal-400 hover:underline cursor-pointer">
                إضافة أول سيارة
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 py-3 text-[11px] text-neutral-400">
        <span>{filteredRecords.length} سيارة ظاهرة</span>
        {query && <span>من أصل {records.length} سيارة</span>}
      </div>
    </div>
  );
};
