import React, { useState } from 'react';
import { 
  OperationalRule, 
  RuleStatus 
} from '../types/logistics';
import { 
  ShieldCheck, 
  HelpCircle, 
  Archive, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  History, 
  FileText,
  UserCheck,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface RuleManagementCenterProps {
  rules: OperationalRule[];
  onVerifyRule: (ruleId: string, approved: boolean, operatorName: string) => void;
  onAddNewRule: (rule: Partial<OperationalRule>) => void;
}

export const RuleManagementCenter: React.FC<RuleManagementCenterProps> = ({
  rules,
  onVerifyRule,
  onAddNewRule
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'VERIFICATION' | 'ARCHIVE'>('ACTIVE');
  const [operatorName, setOperatorName] = useState('Baş Planlamacı (Ankara Hub)');
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);

  // New rule form state
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<OperationalRule['category']>('ISTISNA');
  const [newDescription, setNewDescription] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newVersion, setNewVersion] = useState('v1.0');

  const activeRules = rules.filter(r => r.status === 'AKTIF');
  const verificationRules = rules.filter(r => r.status === 'DOGRULAMA_GEREKLI');
  const archiveRules = rules.filter(r => r.status === 'ESKI_NOT_ARSIV');

  return (
    <div className="space-y-6">
      {/* Title & Philosophy Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span>Operasyonel Kural Yönetimi ve Sürüm Denetim Merkezi</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Kaynak dokümanda yer alan tüm operasyonel kurallar, araç kotaları, çalışma saatleri ve güzergâh istisnaları sadakatle korunmaktadır. Kaynakta kesinleşmemiş kurallar tahmin edilmeden <strong>“Kullanıcı doğrulaması gerekli”</strong> olarak tutulur; eski operasyon notları silinmeden tarihsel sürüm olarak arşivde saklanır.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewRuleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Kural / Sürüm Kaydet</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mt-6 -mb-6 space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`pb-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'ACTIVE'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Yürürlükteki Aktif Kurallar ({activeRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('VERIFICATION')}
            className={`pb-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'VERIFICATION'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Kullanıcı Doğrulaması Gerekli ({verificationRules.length})</span>
            {verificationRules.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ARCHIVE')}
            className={`pb-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'ARCHIVE'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Archive className="w-4 h-4 text-slate-500" />
            <span>Eski Operasyon Notları &amp; Kural Sürümleri ({archiveRules.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE RULES */}
      {activeTab === 'ACTIVE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRules.map(rule => (
            <div key={rule.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {rule.code}
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Yürürlükte
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2.5">
                {rule.title}
              </h3>

              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {rule.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rule.sourceDocument}</span>
                </div>
                <span className="font-mono text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                  {rule.version}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: USER VERIFICATION REQUIRED (No Speculation Principle) */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block">Kaynak Belirsizliği İlkesi:</span>
              <p className="mt-0.5 leading-relaxed">
                Aşağıdaki kurallar kaynak döküman ve saha notlarında kesin bir sayısal ya da idari karara bağlanmamıştır. Sistem tahmin yürütmeyerek bu kuralları teyit bekleyen statüde kilitlemiştir. İlgili kural onaylandığında kilit kalkar ve bağlı yükler otomatik olarak sefere dahil edilir.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {verificationRules.map(rule => (
              <div key={rule.id} className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-xs">
                      {rule.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {rule.title}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    Kullanıcı Doğrulaması Gerekli
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-700 leading-relaxed">
                  <p>{rule.description}</p>
                </div>

                {rule.originalNotes && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">Orijinal Kaynak Saha Notu:</span>
                    "{rule.originalNotes}"
                  </div>
                )}

                {rule.verificationQuestion && (
                  <div className="mt-4 p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-950">
                    <span className="font-bold text-indigo-900 block mb-1 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-700" />
                      Planlamacı Doğrulama Sorusu:
                    </span>
                    <p className="text-indigo-900 font-medium leading-relaxed">
                      {rule.verificationQuestion}
                    </p>
                  </div>
                )}

                <div className="mt-5 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Kaynak: <strong>{rule.sourceDocument}</strong> • Versiyon: {rule.version}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onVerifyRule(rule.id, false, operatorName)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      Kısıtı Koru / Reddet
                    </button>
                    <button
                      onClick={() => onVerifyRule(rule.id, true, operatorName)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                    >
                      ✓ Kuralı Onayla ve Yürürlüğe Al
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORICAL ARCHIVE (Preserving Old Operational Notes) */}
      {activeTab === 'ARCHIVE' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-3">
            <Archive className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block text-slate-900">Tarihsel Kural ve Not Arşivi:</span>
              <p className="mt-0.5 leading-relaxed">
                "Eski operasyon notlarını silme. Bunları ayrı kural sürümü veya doğrulama bekleyen kayıt olarak sakla." kuralı gereğince, revize edilen veya geçerliliğini yitirmiş tüm geçmiş operasyon teamülleri mutabakat ve denetim güvenliği için burada muhafaza edilmektedir.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archiveRules.map(rule => (
              <div key={rule.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    {rule.code}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <History className="w-3 h-3 text-slate-500" />
                    Arşiv Sürümü
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 mt-2.5">
                  {rule.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {rule.description}
                </p>

                {rule.originalNotes && (
                  <div className="mt-3 p-2.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600">
                    {rule.originalNotes}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{rule.sourceDocument}</span>
                  <span className="font-mono text-slate-700 font-semibold">{rule.version}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Rule Modal */}
      {showNewRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Yeni Operasyonel Kural / Sürüm Ekle</span>
              </h3>
              <button
                onClick={() => setShowNewRuleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kural Kodu:</label>
                <input
                  type="text"
                  placeholder="Örn: KRL-2026-IST-01"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kural Başlığı:</label>
                <input
                  type="text"
                  placeholder="Örn: Hafta Sonu İzmir Ek Araç Kapasite Tahsisi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kategori:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as OperationalRule['category'])}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="SABIT_HAT">Sabit Hat Yönetimi</option>
                  <option value="YUZDE_90_KURALI">%90 Doluluk Eşiği</option>
                  <option value="DIREKT_SEVKIYAT">Direkt Sevkiyat Önceliği</option>
                  <option value="CROSS_DOCK_BIRLESTIRME">Cross Dock Konsolidasyon</option>
                  <option value="KAPASITE_LIMITI">Araç ve Hat Kapasite Limiti</option>
                  <option value="ISTISNA">Özel Operasyonel İstisna</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kural Açıklaması:</label>
                <textarea
                  rows={3}
                  placeholder="Kuralın operasyonel içeriğini ve uygulama esaslarını yazınız..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kaynak Doküman:</label>
                  <input
                    type="text"
                    placeholder="Örn: 2026 Hat Protokolü"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Sürüm:</label>
                  <input
                    type="text"
                    placeholder="v2.5"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowNewRuleModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                İptal
              </button>
              <button
                disabled={!newCode || !newTitle || !newDescription}
                onClick={() => {
                  onAddNewRule({
                    code: newCode,
                    title: newTitle,
                    category: newCategory,
                    description: newDescription,
                    sourceDocument: newSource || 'Planlamacı Manuel Kararı',
                    version: newVersion || 'v1.0',
                    status: 'AKTIF'
                  });
                  setShowNewRuleModal(false);
                  setNewCode('');
                  setNewTitle('');
                  setNewDescription('');
                }}
                className="px-4 py-2 bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500 shadow-sm"
              >
                Kuralı Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
