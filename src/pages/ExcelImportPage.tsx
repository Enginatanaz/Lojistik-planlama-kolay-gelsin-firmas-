import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  Database
} from 'lucide-react';

interface ExcelImportPageProps {
  onImportSuccess?: () => void;
}

export const ExcelImportPage: React.FC<ExcelImportPageProps> = ({ onImportSuccess }) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setImportStatus('SUCCESS');
      }, 700);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Excel Veri Aktarımı ve Şablon Entegrasyonu</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Günlük sevkiyat listesini, paket ve desi matrisini Excel formatında sisteme yükleyin veya resmi şablonu indirin.
          </p>
        </div>

        <button
          onClick={() => {
            alert('Operasyonel Excel Şablonu indirildi: Lojistik_Paket_Desi_Sablonu_v2.4.xlsx');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Excel Şablonunu İndir (.xlsx)</span>
        </button>
      </div>

      {/* Upload Box */}
      <div className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 transition text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          Operasyonel Veri Dosyasını Yükleyin
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          .XLSX, .XLS veya .CSV formatındaki güncel paket ve desi sevkiyat dosyasını buraya sürükleyin veya bilgisayarınızdan seçin.
        </p>

        <div className="mt-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition">
            <span>Dosya Seç</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleSimulateFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {selectedFileName && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg inline-flex items-center gap-2 text-xs font-mono text-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Seçilen: <strong>{selectedFileName}</strong></span>
            {isProcessing && <span className="text-blue-600 animate-pulse font-sans">Ayrıştırılıyor...</span>}
            {importStatus === 'SUCCESS' && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Şema Doğrulandı (19 Konsinye Hazır)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Required Columns Schema Definition */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          GEREKLİ EXCEL SÜTUN ŞEMASI VE DOĞRULAMA KONTROLLERİ
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Veri aktarımında verinin kayıpsız işlenmesi için aşağıdaki sütun başlıkları Excel dosyasının ilk satırında bulunmalıdır:
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs divide-y divide-slate-200 border">
            <thead className="bg-slate-100 font-semibold text-slate-700">
              <tr>
                <th className="p-2.5 text-left">Sütun Adı</th>
                <th className="p-2.5 text-left">Tip</th>
                <th className="p-2.5 text-left">Zorunlu mu?</th>
                <th className="p-2.5 text-left">Örnek Değer</th>
                <th className="p-2.5 text-left">Operasyon Kuralı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="p-2.5 font-mono font-bold text-slate-800">Cikis_Tesisi_Kodu</td>
                <td className="p-2.5 text-slate-600">Metin (KOD)</td>
                <td className="p-2.5 text-emerald-700 font-semibold">Evet</td>
                <td className="p-2.5 font-mono">ANK-ATM</td>
                <td className="p-2.5 text-slate-500">Sincan veya OSTİM ise Cross Dock zorunlu tutulur</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-slate-800">Gercek_Varis_Kodu</td>
                <td className="p-2.5 text-slate-600">Metin (KOD)</td>
                <td className="p-2.5 text-emerald-700 font-semibold">Evet</td>
                <td className="p-2.5 font-mono">IST-AND</td>
                <td className="p-2.5 text-slate-500">Hiçbir cross dock veya durak nedeniyle değiştirilemez</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-slate-800">Paket_Adedi</td>
                <td className="p-2.5 text-slate-600">Tam Sayı</td>
                <td className="p-2.5 text-emerald-700 font-semibold">Evet</td>
                <td className="p-2.5 font-mono">450</td>
                <td className="p-2.5 text-slate-500">Araç koli sınırında denetlenir</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-slate-800">Toplam_Desi</td>
                <td className="p-2.5 text-slate-600">Ondalık/Tam Sayı</td>
                <td className="p-2.5 text-emerald-700 font-semibold">Evet</td>
                <td className="p-2.5 font-mono">1350</td>
                <td className="p-2.5 text-slate-500">%90 eşik ve hat operasyonel sınırı için kullanılır</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-slate-800">Kargo_Tanimi</td>
                <td className="p-2.5 text-slate-600">Metin</td>
                <td className="p-2.5 text-slate-500">Opsiyonel</td>
                <td className="p-2.5 text-slate-700">Otomotiv Yan Sanayi</td>
                <td className="p-2.5 text-slate-500">Konsinye manifestosuna yazılır</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
