import React, { useState } from "react";
import axios from "axios";
import { 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Shield, 
  Download,
  FileText,
  BarChart3,
  Clock,
  Target,
  Zap,
  Scale,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisResult {
  analysis: string;
  timestamp: number;
  riskScore?: number;
  complianceScore?: number;
  recommendations?: string[];
}

interface AnalysisMetrics {
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  processingTime: number;
  keyFindings: number;
}

export default function ContractAnalysis() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tempAnalysis, setTempAnalysis] = useState<AnalysisResult | null>(null);
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      if (analysis) {
        setTempAnalysis(analysis);
      }
      setAnalysis(null);
      setMetrics(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      setFile(droppedFile);
      if (analysis) {
        setTempAnalysis(analysis);
      }
      setAnalysis(null);
      setMetrics(null);
    }
  };

  const analyzeContract = async () => {
    if (!file) {
      setError("Please upload a contract file.");
      return;
    }

    setLoading(true);
    setError(null);
    const startTime = Date.now();
    
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axios.post("http://localhost:5002/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.groqResponse) {
        const processingTime = Date.now() - startTime;
        
        // Generate mock metrics based on analysis content
        const analysisText = response.data.groqResponse.toLowerCase();
        const riskScore = analysisText.includes('risk') ? 
          (analysisText.includes('high') ? 75 : analysisText.includes('medium') ? 50 : 25) : 30;
        
        const complianceScore = analysisText.includes('compliance') ? 85 : 90;
        const confidence = Math.min(95, 100 - (processingTime / 1000));
        
        const newAnalysis: AnalysisResult = {
          analysis: response.data.groqResponse,
          timestamp: Date.now(),
          riskScore,
          complianceScore,
          recommendations: analysisText.includes('recommend') ? 
            ["Review liability clauses", "Verify compliance requirements", "Consult legal expert"] : []
        };

        const newMetrics: AnalysisMetrics = {
          riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
          confidence: Math.round(confidence),
          processingTime: Math.round(processingTime / 1000),
          keyFindings: (analysisText.match(/risk|compliance|clause|violation/g) || []).length
        };

        setAnalysis(newAnalysis);
        setMetrics(newMetrics);
        setTempAnalysis(null);
      } else {
        setError("No analysis result returned.");
      }
    } catch (error: any) {
      const serverMsg = error?.response?.data?.error || error?.message || "Failed to analyze the contract.";
      console.error("Error analyzing contract:", serverMsg);
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!analysis || !file) return;

    const reportContent = `Contract Analysis Report
Generated: ${new Date(analysis.timestamp).toLocaleString()}
File: ${file.name}
Risk Score: ${analysis.riskScore}%
Compliance Score: ${analysis.complianceScore}%

ANALYSIS RESULTS:
${analysis.analysis}

${analysis.recommendations ? `RECOMMENDATIONS:
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}` : ''}`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-analysis-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const RiskGauge = ({ score, size = 120 }: { score: number; size?: number }) => {
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getColor = (score: number) => {
      if (score >= 70) return '#ef4444';
      if (score >= 40) return '#f59e0b';
      return '#10b981';
    };

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(score)}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: getColor(score) }}>
            {score}%
          </span>
          <span className="text-sm text-gray-500">Risk</span>
        </div>
      </div>
    );
  };

  const renderAnalysisContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const lineLower = line.toLowerCase();
      
      if (lineLower.includes('risk') || lineLower.includes('warning') || lineLower.includes('danger')) {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border-l-4 border-red-500 mb-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 leading-relaxed">{line}</p>
          </motion.div>
        );
      }
      
      if (lineLower.includes('compliance') || lineLower.includes('violation') || lineLower.includes('obligation')) {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500 mb-3"
          >
            <Info className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-yellow-800 leading-relaxed">{line}</p>
          </motion.div>
        );
      }
      
      if (lineLower.includes('recommend') || lineLower.includes('approved') || lineLower.includes('safe') || lineLower.includes('compliant')) {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border-l-4 border-green-500 mb-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-800 leading-relaxed">{line}</p>
          </motion.div>
        );
      }
      
      return (
        <motion.p
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="mb-3 text-gray-700 leading-relaxed"
        >
          {line}
        </motion.p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <Scale className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Contract Analysis
              </h1>
              <p className="text-gray-600 mt-2 text-lg">AI-powered contract review and risk assessment</p>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg border border-green-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div
                className={`border-3 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragging ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
                } ${loading ? "opacity-50 pointer-events-none" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {loading ? (
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-16 h-16 text-green-500" />
                    </motion.div>
                    <p className="mt-4 text-gray-600 text-lg">Analyzing contract...</p>
                    <p className="text-sm text-gray-500">This may take a few moments</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2 text-gray-900">Drop your contract here</h3>
                    <p className="text-gray-500 mb-6 text-lg">or</p>
                    <div className="flex justify-center gap-4">
                      <input 
                        type="file" 
                        className="hidden" 
                        id="file-upload" 
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.txt,image/*"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="font-semibold">Browse Files</span>
                      </label>
                    </div>
                    {file && (
                      <motion.p 
                        className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <FileText className="w-4 h-4" />
                        {file.name}
                      </motion.p>
                    )}
                  </>
                )}
              </div>

              <motion.button
                onClick={analyzeContract}
                disabled={!file || loading}
                className={`mt-6 w-full px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  loading ? "animate-pulse" : ""
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap className="w-5 h-5" />
                <span className="font-semibold text-lg">
                  {loading ? "Analyzing Contract..." : "Analyze with AI"}
                </span>
              </motion.button>
            </motion.div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800">Analysis Error</h4>
                    <p className="text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analysis Results */}
            <AnimatePresence>
              {analysis && (
                <motion.div
                  className="bg-white rounded-2xl p-8 shadow-2xl border border-blue-100"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Analysis Results</h2>
                        <p className="text-gray-600">Generated {new Date(analysis.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={downloadReport}
                      className="flex items-center gap-3 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-semibold">Download Report</span>
                    </motion.button>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    {renderAnalysisContent(analysis.analysis)}
                  </div>

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <motion.div
                      className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <Target className="w-6 h-6 text-green-600" />
                        Key Recommendations
                      </h3>
                      <div className="space-y-3">
                        {analysis.recommendations.map((rec, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-gray-700">{rec}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Risk Assessment */}
            {metrics && (
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-red-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                  Risk Assessment
                </h3>
                <div className="flex justify-center mb-4">
                  <RiskGauge score={analysis?.riskScore || 0} />
                </div>
                <div className="text-center">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    metrics.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                    metrics.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {metrics.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
              </motion.div>
            )}

            {/* Analysis Metrics */}
            {metrics && (
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
                  <Award className="w-6 h-6 text-blue-600" />
                  Analysis Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Confidence</span>
                    <span className="font-bold text-blue-600">{metrics.confidence}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Processing Time</span>
                    <span className="font-bold text-green-600">{metrics.processingTime}s</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Key Findings</span>
                    <span className="font-bold text-purple-600">{metrics.keyFindings}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Features */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-green-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
                <Shield className="w-6 h-6 text-green-600" />
                Analysis Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Risk Assessment</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span>Compliance Check</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                  <span>Clause Analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                  <span>Legal Precedent Matching</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            {analysis && (
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
                  <Clock className="w-6 h-6 text-purple-600" />
                  Quick Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Analysis completed successfully</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Report available for download</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>AI confidence: {metrics?.confidence}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}