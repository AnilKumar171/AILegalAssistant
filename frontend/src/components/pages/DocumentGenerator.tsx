import React, { useState, useRef } from 'react';
import {
  FileText,
  Loader2,
  AlertCircle,
  Download,
  ScrollText,
  Sparkles,
  MapPin,
  Users,
  CheckCircle2,
} from 'lucide-react';
import jsPDF from 'jspdf';

const DOC_TYPES = [
  'Non-Disclosure Agreement (NDA)',
  'Rental/Lease Agreement',
  'Employment Contract',
  'Legal Notice',
  'Service Agreement',
  'Partnership Deed',
  'Power of Attorney',
];

export default function DocumentGenerator() {
  const [docType, setDocType] = useState('');
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [keyTerms, setKeyTerms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  
  const resultRef = useRef<HTMLDivElement>(null);

  const canSubmit = docType && partyA && partyB && jurisdiction && keyTerms.trim().length > 10;

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setGeneratedDoc('');

    try {
      const res = await fetch('http://localhost:5002/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, partyA, partyB, jurisdiction, keyTerms }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      
      const data = await res.json();
      setGeneratedDoc(data.document);

      // Save to localStorage history
      const historyRaw = localStorage.getItem('documentHistory');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      let docTitle = docType;
      // Truncate "(NDA)" from the full name if needed or just use the whole DOC_TYPE
      history.unshift({
        id: Date.now(),
        type: docTitle,
        partyA,
        partyB,
        date: new Date().toLocaleDateString('en-IN'),
      });
      localStorage.setItem('documentHistory', JSON.stringify(history.slice(0, 20)));

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.message || 'Document generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedDoc) return;
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(docType, pageWidth / 2, 20, { align: 'center' });
    
    // Body
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(generatedDoc, pageWidth - 2 * margin);
    
    let cursorY = 30;
    lines.forEach((line: string) => {
      if (cursorY > doc.internal.pageSize.height - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += 6;
    });

    doc.save(`${docType.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg">
              <ScrollText className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
              AI Generator
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            Legal Document{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Instantly draft tailored legal documents, agreements, and notices using AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Input Card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" />
              Document Details
            </h2>

            {/* Document Type */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              >
                <option value="">Select a document type…</option>
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Users className="w-4 h-4 text-teal-400" /> Party A
                </label>
                <input
                  type="text"
                  value={partyA}
                  onChange={(e) => setPartyA(e.target.value)}
                  placeholder="E.g., John Doe"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Users className="w-4 h-4 text-teal-400" /> Party B
                </label>
                <input
                  type="text"
                  value={partyB}
                  onChange={(e) => setPartyB(e.target.value)}
                  placeholder="E.g., Acme Corp"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            {/* Jurisdiction */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-teal-400" /> Jurisdiction
              </label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="E.g., Mumbai, Maharashtra / Applicable Indian Law"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* Key Terms */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Key Terms & Conditions
              </label>
              <textarea
                value={keyTerms}
                onChange={(e) => setKeyTerms(e.target.value)}
                rows={5}
                placeholder="List specific terms to include. E.g., 'Term is 12 months, rent is INR 25,000/month, deposit is 2 months rent, notice period is 1 month.'"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-teal-500 resize-none transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!canSubmit || loading}
              className="mt-auto flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating draft...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Document
                </>
              )}
            </button>
          </div>

          {/* ── Preview/Output ── */}
          <div 
            ref={resultRef}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[500px] lg:h-[700px]"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-teal-500" />
                Document Preview
              </h2>
              {generatedDoc && (
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
                >
                  <Download className="w-4 h-4" />
                  Save PDF
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
                <p>AI is drafting your document...</p>
                <p className="text-sm mt-1">This takes a few seconds.</p>
              </div>
            ) : generatedDoc ? (
              <textarea
                value={generatedDoc}
                onChange={(e) => setGeneratedDoc(e.target.value)}
                className="flex-1 w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-700 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
                <ScrollText className="w-16 h-16 mb-4" />
                <p>Fill in details and click "Generate" to preview your draft here.</p>
              </div>
            )}
            
            {generatedDoc && (
               <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 You can edit the text directly before downloading.
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
