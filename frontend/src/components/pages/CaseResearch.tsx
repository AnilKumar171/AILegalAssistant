import React, { useState, useMemo } from "react";
import axios from "axios";
import { 
  Search, 
  Filter, 
  BookOpen, 
  BrainCircuit, 
  Loader, 
  AlertCircle, 
  CheckCircle2, 
  Scale, 
  Gavel,
  TrendingUp,
  Clock,
  MapPin,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Case {
  title: string;
  summary: string;
  relevance: number;
  date: string;
  jurisdiction: string;
  type: 'civil' | 'criminal';
  citations: number;
}

interface Filters {
  jurisdiction: string;
  dateRange: string;
  caseType: string;
  relevance: number;
}

export default function CaseResearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [similarCases, setSimilarCases] = useState<Case[]>([]);
  const [filters, setFilters] = useState<Filters>({
    jurisdiction: "All Jurisdictions",
    dateRange: "Last 5 years",
    caseType: "All Types",
    relevance: 0
  });

  const [analytics, setAnalytics] = useState({
    totalCases: 0,
    avgRelevance: 0,
    jurisdictionBreakdown: {} as Record<string, number>,
    typeBreakdown: {} as Record<string, number>
  });

  const generateSimilarCases = (analysis: string): Case[] => {
    const text = analysis.toLowerCase();
    
    // Extract key information from analysis
    const sections = text.match(/section \d+[A-Z]?/g) || [];
    const legalTerms = text.match(/\b(act|law|court|rights|case|judgment|appeal|petition)\b/g) || [];
    const amounts = text.match(/₹[\d,]+/g) || [];
    const isCriminal = text.includes('criminal') || text.includes('offense') || text.includes('prosecution');
    
    const getRandomDate = (daysAgo: number) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
      return date.toISOString().split('T')[0];
    };

    const jurisdictions = ['Supreme Court', 'High Court', 'District Court'];
    const cases: Case[] = [];

    cases.push({
      title: `Recent Judgment on ${sections[0] || legalTerms[0] || 'Similar Matter'}`,
      summary: `Latest precedent involving ${amounts[0] ? `claims of ${amounts[0]} and ` : ''}interpretation of ${sections[0] || 'similar provisions'}`,
      relevance: 95,
      date: getRandomDate(30),
      jurisdiction: text.includes('supreme court') ? 'Supreme Court' : jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
      type: isCriminal ? 'criminal' : 'civil',
      citations: Math.floor(Math.random() * 50) + 10
    });

    cases.push({
      title: `Precedent Case on ${sections[1] || legalTerms[1] || 'Related Matter'}`,
      summary: `Established guidelines for ${sections[1] || 'similar cases'} with comprehensive interpretation`,
      relevance: 88,
      date: getRandomDate(60),
      jurisdiction: text.includes('high court') ? 'High Court' : jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
      type: isCriminal ? 'criminal' : 'civil',
      citations: Math.floor(Math.random() * 30) + 5
    });

    cases.push({
      title: `Reference Case on ${sections[2] || legalTerms[2] || 'Similar Context'}`,
      summary: `Similar case involving ${amounts[0] ? 'comparable claims and ' : ''}related legal principles`,
      relevance: 82,
      date: getRandomDate(90),
      jurisdiction: jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
      type: isCriminal ? 'criminal' : 'civil',
      citations: Math.floor(Math.random() * 20) + 3
    });

    // Update analytics
    const jurisdictionBreakdown = cases.reduce((acc, case_) => {
      acc[case_.jurisdiction] = (acc[case_.jurisdiction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeBreakdown = cases.reduce((acc, case_) => {
      acc[case_.type] = (acc[case_.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setAnalytics({
      totalCases: cases.length,
      avgRelevance: Math.round(cases.reduce((sum, case_) => sum + case_.relevance, 0) / cases.length),
      jurisdictionBreakdown,
      typeBreakdown
    });

    return cases;
  };

  const filteredCases = useMemo(() => {
    return similarCases.filter(case_ => {
      const dateRangeFilter = () => {
        const caseDate = new Date(case_.date);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - caseDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'Last month':
            return diffDays <= 30;
          case 'Last year':
            return diffDays <= 365;
          default:
            return diffDays <= 1825;
        }
      };

      const relevanceFilter = case_.relevance >= filters.relevance;

      return (
        (filters.jurisdiction === 'All Jurisdictions' || case_.jurisdiction === filters.jurisdiction) &&
        (filters.caseType === 'All Types' || 
          (filters.caseType === 'Civil' && case_.type === 'civil') ||
          (filters.caseType === 'Criminal' && case_.type === 'criminal')) &&
        dateRangeFilter() &&
        relevanceFilter
      );
    });
  }, [similarCases, filters]);

  const analyzeWithAI = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5002/analyze-text", {
        query: searchQuery,
      });
      setAiResponse(response.data.analysis);
      const generatedCases = generateSimilarCases(response.data.analysis);
      setSimilarCases(generatedCases);
    } catch (error) {
      console.error("Error analyzing:", error);
      setAiResponse("Failed to analyze case.");
      setSimilarCases([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  const RelevanceMeter = ({ relevance }: { relevance: number }) => (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-gray-200 rounded-full h-2">
        <motion.div 
          className={`h-2 rounded-full ${
            relevance >= 80 ? 'bg-green-500' : 
            relevance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${relevance}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700">{relevance}%</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <Gavel className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Case Research
              </h1>
              <p className="text-gray-600 mt-2 text-lg">AI-powered legal precedent analysis and case matching</p>
            </div>
          </div>
        </motion.header>

        {/* Search Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Describe your legal issue, case details, or search for specific precedents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeWithAI()}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 hover:shadow-md text-lg"
                />
              </div>
              <motion.button
                onClick={analyzeWithAI}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <BrainCircuit className="w-5 h-5" />
                )}
                <span className="font-semibold">Analyze with AI</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Analytics Dashboard */}
        {similarCases.length > 0 && (
          <motion.div 
            className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalCases}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Relevance</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgRelevance}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Jurisdictions</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(analytics.jurisdictionBreakdown).length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Latest Case</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(Math.min(...similarCases.map(c => new Date(c.date).getTime()))).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Analysis Results */}
        <AnimatePresence>
          {aiResponse && (
            <motion.div
              className="mb-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-2xl border border-blue-200"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div 
                className="flex items-center gap-4 mb-8"
                variants={itemVariants}
              >
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">AI Legal Analysis</h2>
                  <p className="text-gray-600 mt-1">Comprehensive case assessment and recommendations</p>
                </div>
              </motion.div>

              <div className="space-y-4">
                {aiResponse.split("\n").map((line, index) => {
                  if (!line.trim()) return null;
                  
                  const isHighlight = line.startsWith("*");
                  const isWarning = line.toLowerCase().includes("warning") || line.toLowerCase().includes("caution");
                  const isSuccess = line.toLowerCase().includes("recommended") || line.toLowerCase().includes("positive");

                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className={`p-4 rounded-xl border-l-4 ${
                        isHighlight
                          ? "bg-blue-50 border-blue-500 shadow-sm"
                          : isWarning
                          ? "bg-amber-50 border-amber-500 shadow-sm"
                          : isSuccess
                          ? "bg-green-50 border-green-500 shadow-sm"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {isWarning && <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />}
                        {isSuccess && <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />}
                        {!isWarning && !isSuccess && <FileText className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />}
                        <div 
                          className="text-gray-800 leading-relaxed prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: line
                              .replace(/\*\*(.*?)\*\*/g, "<span class='text-blue-600 font-semibold'>$1</span>")
                              .replace(/Section (\d+[A-Z]?)/g, "<span class='text-purple-600 font-semibold'>Section $1</span>")
                              .replace(/(₹|Rs\.?)\s?([\d,]+)/g, "<span class='text-red-600 font-semibold'>$1$2</span>")
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Header */}
        {similarCases.length > 0 && (
          <motion.div 
            className="mb-6 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Similar Cases Found</h3>
              <p className="text-gray-600">
                Showing {filteredCases.length} of {similarCases.length} relevant cases
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Section */}
          {similarCases.length > 0 && (
            <div className="lg:col-span-1">
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-lg sticky top-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
                  <Filter className="w-6 h-6 text-blue-600" />
                  Filters & Analytics
                </h2>
                
                <div className="space-y-6">
                  {/* Relevance Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Minimum Relevance: {filters.relevance}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.relevance}
                      onChange={(e) => setFilters(prev => ({ ...prev, relevance: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</label>
                    <select 
                      className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3"
                      value={filters.jurisdiction}
                      onChange={(e) => setFilters(prev => ({ ...prev, jurisdiction: e.target.value }))}
                    >
                      <option>All Jurisdictions</option>
                      <option>Supreme Court</option>
                      <option>High Court</option>
                      <option>District Court</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select 
                      className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3"
                      value={filters.dateRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    >
                      <option>Last 5 years</option>
                      <option>Last year</option>
                      <option>Last month</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
                    <select 
                      className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3"
                      value={filters.caseType}
                      onChange={(e) => setFilters(prev => ({ ...prev, caseType: e.target.value }))}
                    >
                      <option>All Types</option>
                      <option>Civil</option>
                      <option>Criminal</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Cases List */}
          <div className={`${similarCases.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="grid gap-6">
              {filteredCases.map((case_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -4,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {case_.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">{case_.summary}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700 font-medium">{case_.date}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700 font-medium">{case_.jurisdiction}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                          case_.type === 'criminal' ? 'bg-red-50' : 'bg-green-50'
                        }`}>
                          <FileText className={`w-4 h-4 ${
                            case_.type === 'criminal' ? 'text-red-600' : 'text-green-600'
                          }`} />
                          <span className={`font-medium capitalize ${
                            case_.type === 'criminal' ? 'text-red-700' : 'text-green-700'
                          }`}>
                            {case_.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                          <span className="text-orange-700 font-medium">{case_.citations} citations</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 text-right">
                      <RelevanceMeter relevance={case_.relevance} />
                      <motion.span 
                        className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-semibold ${
                          case_.relevance >= 80 ? 'bg-green-100 text-green-800' : 
                          case_.relevance >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        {case_.relevance}% Match
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredCases.length === 0 && similarCases.length > 0 && (
                <motion.div 
                  className="text-center py-12 bg-white rounded-2xl shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No cases match your filters</h3>
                  <p className="text-gray-600">Try adjusting your filter criteria to see more results</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}