import React, { useState, useEffect, useRef } from 'react';
import {
  Scale,
  ChevronDown,
  Loader2,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  Gavel,
  MapPin,
  FileText,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface SimilarCase {
  name: string;
  year: string;
  outcome: string;
  relevance: string;
}

interface PredictionResult {
  probability: number;
  factors: string[];
  similar_cases: SimilarCase[];
  analysis: string;
}

// ── Config ─────────────────────────────────────────────────────────────────────
const CASE_TYPES = [
  'Civil Dispute',
  'Criminal Defense',
  'Family Law',
  'Property / Real Estate',
  'Contract Breach',
  'Employment / Labour',
  'Intellectual Property',
  'Consumer Protection',
  'Constitutional / PIL',
  'Tax / Revenue',
  'Defamation / Media',
  'Cyber Crime',
  'Other',
];

const JURISDICTIONS = [
  'Supreme Court of India',
  'Delhi High Court',
  'Bombay High Court',
  'Madras High Court',
  'Calcutta High Court',
  'Karnataka High Court',
  'Allahabad High Court',
  'Rajasthan High Court',
  'Gujarat High Court',
  'Kerala High Court',
  'District Court – Delhi',
  'District Court – Mumbai',
  'Other District Court',
];

// ── Circular progress ring ─────────────────────────────────────────────────────
function ProbabilityRing({ probability }: { probability: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 72;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (animated / 100) * circumference;

  const color =
    probability >= 70
      ? '#10b981' // green
      : probability >= 45
      ? '#f59e0b' // amber
      : '#ef4444'; // red

  const label =
    probability >= 70 ? 'High' : probability >= 45 ? 'Moderate' : 'Low';

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(probability), 200);
    return () => clearTimeout(timeout);
  }, [probability]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        {/* Background ring */}
        <svg width={radius * 2} height={radius * 2} className="rotate-[-90deg]">
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{ transition: 'stroke-dashoffset 1.2s ease-in-out, stroke 0.3s' }}
          />
        </svg>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {animated}%
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Win Chance
          </span>
        </div>
      </div>
      {/* Badge */}
      <span
        className="mt-3 px-4 py-1 rounded-full text-sm font-bold text-white"
        style={{ background: color }}
      >
        {label} Probability
      </span>
    </div>
  );
}

// ── Animated progress bar ──────────────────────────────────────────────────────
function AnimatedBar({ value, color }: { value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="w-full bg-slate-200 rounded-full h-3">
      <div
        className="h-3 rounded-full transition-all duration-1000"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CasePredictor() {
  const [description, setDescription] = useState('');
  const [caseType, setCaseType] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const canSubmit = description.trim().length > 30 && caseType && jurisdiction;

  const handlePredict = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('http://localhost:5002/api/predict-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, caseType, jurisdiction }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const data: PredictionResult = await res.json();
      setResult(data);

      // Save to localStorage history
      const historyRaw = localStorage.getItem('predictionHistory');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift({
        id: Date.now(),
        caseType,
        jurisdiction,
        probability: data.probability,
        preview: description.slice(0, 80),
        date: new Date().toLocaleDateString('en-IN'),
      });
      localStorage.setItem('predictionHistory', JSON.stringify(history.slice(0, 20)));

      // Scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setDescription('');
    setCaseType('');
    setJurisdiction('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
              AI-Powered
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            Case Outcome{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Predictor
            </span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Describe your case and get an AI-powered outcome prediction with key legal factors.
          </p>
        </div>

        {/* ── Input Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Case Details
          </h2>

          {/* Case Type + Jurisdiction row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Case Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <Scale className="inline w-4 h-4 mr-1 text-indigo-400" />
                Case Type
              </label>
              <div className="relative">
                <select
                  id="case-type-select"
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full appearance-none border border-slate-300 rounded-xl px-4 py-3 pr-10 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">Select case type…</option>
                  {CASE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Jurisdiction */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <MapPin className="inline w-4 h-4 mr-1 text-indigo-400" />
                Jurisdiction
              </label>
              <div className="relative">
                <select
                  id="jurisdiction-select"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full appearance-none border border-slate-300 rounded-xl px-4 py-3 pr-10 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">Select jurisdiction…</option>
                  {JURISDICTIONS.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Case Description */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Case Description
              <span className="ml-2 text-xs font-normal text-slate-400">(min. 30 characters)</span>
            </label>
            <textarea
              id="case-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder='Describe the facts of your case in detail. E.g. "My landlord unlawfully evicted me without serving proper notice under the Rent Control Act. I have receipts of rent paid for the past 3 years and a lease agreement signed in 2021…"'
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition placeholder:text-slate-400"
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${description.length < 30 ? 'text-red-400' : 'text-emerald-500'}`}>
                {description.length} characters {description.length < 30 ? `(${30 - description.length} more needed)` : '✓'}
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-xs text-amber-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This prediction is AI-generated for informational purposes only and does not constitute legal advice. Always consult a qualified lawyer for critical matters.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              id="predict-btn"
              onClick={handlePredict}
              disabled={!canSubmit || loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Predict Outcome
                </>
              )}
            </button>
            {(result || error) && (
              <button
                id="reset-btn"
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-3 border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <Scale className="absolute inset-0 m-auto w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-slate-600 font-semibold text-lg">AI is analyzing your case…</p>
            <p className="text-slate-400 text-sm">Reviewing precedents and legal factors</p>
          </div>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <div ref={resultRef} className="space-y-5">

            {/* Win Probability Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center gap-8">
              <ProbabilityRing probability={result.probability} />

              <div className="flex-1 w-full">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Probability Breakdown
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">Win Likelihood</span>
                      <span className="font-bold text-emerald-600">{result.probability}%</span>
                    </div>
                    <AnimatedBar value={result.probability} color="#10b981" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">Loss / Unfavourable</span>
                      <span className="font-bold text-red-500">{100 - result.probability}%</span>
                    </div>
                    <AnimatedBar value={100 - result.probability} color="#ef4444" />
                  </div>
                </div>

                {/* Analysis */}
                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800 leading-relaxed">
                  {result.analysis}
                </div>
              </div>
            </div>

            {/* Key Factors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                Key Factors
              </h3>
              <ul className="space-y-2.5">
                {result.factors.map((factor, i) => {
                  const isFav = !factor.toLowerCase().startsWith('weak') &&
                                !factor.toLowerCase().startsWith('lack') &&
                                !factor.toLowerCase().startsWith('no ') &&
                                !factor.toLowerCase().startsWith('absence') &&
                                !factor.toLowerCase().startsWith('risk');
                  return (
                    <li
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                        isFav
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      {isFav
                        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                        : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />}
                      {factor}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Similar Cases */}
            {result.similar_cases?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  Similar Precedent Cases
                </h3>
                <div className="space-y-3">
                  {result.similar_cases.map((sc, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{sc.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{sc.year}</p>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap">
                          {sc.outcome}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{sc.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
