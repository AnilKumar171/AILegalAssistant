import React, { useState, useEffect } from 'react';
import { Globe, Tag, TrendingUp, Clock, BookOpen, AlertCircle, Search, MapPin, Shield, Scale, Gavel, Building2 } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export default function LegalNews() {
  const [selectedCategory, setSelectedCategory] = useState<'india' | 'global'>('india');
  const [selectedTopic, setSelectedTopic] = useState('indian law');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [globalNews, setGlobalNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const API_KEY = '876d7f67dae77fc1ef18a07ab1712dd6';
  const ARTICLES_PER_PAGE = 10;

  const indianTopics = [
    { name: "Indian Law", value: "indian law", icon: Scale },
    { name: "Supreme Court", value: "supreme court india", icon: Gavel },
    { name: "High Courts", value: "high court india", icon: Building2 },
    { name: "Constitutional Law", value: "indian constitutional law", icon: Shield },
    { name: "Criminal Law", value: "indian criminal law", icon: Scale }
  ];

  const globalTopics = [
    { name: "International Law", value: "international law", icon: Globe },
    { name: "Corporate Law", value: "global corporate law", icon: Building2 },
    { name: "Human Rights", value: "international human rights", icon: Shield },
    { name: "Trade Law", value: "international trade law", icon: Scale }
  ];

  useEffect(() => {
    fetchIndianNews();
    fetchGlobalNews();
    
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 300000);

    return () => clearInterval(interval);
  }, [selectedTopic, refreshKey]);

  const fetchIndianNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = `${selectedTopic} india`;
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=${ARTICLES_PER_PAGE}&apikey=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]);
      }

      setNewsArticles(data.articles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Indian news');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGlobalNews = async () => {
    setIsLoadingGlobal(true);
    try {
      const query = "international law global";
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${ARTICLES_PER_PAGE}&apikey=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]);
      }

      setGlobalNews(data.articles || []);
    } catch (err) {
      console.error('Failed to fetch global news:', err);
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const filterArticles = () => {
    const articles = selectedCategory === 'india' ? newsArticles : globalNews;
    if (!searchQuery) return articles;
    return articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const getTopics = () => selectedCategory === 'india' ? indianTopics : globalTopics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-slate-200/60 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-slate-900 bg-clip-text text-transparent">
              Legal News & Updates
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Stay informed with the latest legal developments and court rulings
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filter Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/60 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search legal news, cases, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setSelectedCategory('india')}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium ${
                      selectedCategory === 'india'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Indian Law
                  </button>
                  <button
                    onClick={() => setSelectedCategory('global')}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium ${
                      selectedCategory === 'global'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Global Law
                  </button>
                </div>
              </div>
            </div>

            {/* News Articles */}
            {(selectedCategory === 'india' ? isLoading : isLoadingGlobal) ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/60 animate-pulse">
                    <div className="h-48 bg-slate-200 rounded-xl mb-4"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filterArticles().map((article, index) => (
                  <div
                    key={index}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {article.image && (
                        <div className="lg:w-48 lg:flex-shrink-0">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-40 lg:h-32 object-cover rounded-xl shadow-sm"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors duration-200">
                          {article.title}
                        </h3>
                        <p className="text-slate-600 mb-4 leading-relaxed">{article.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                          <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4" />
                            {formatDate(article.publishedAt)}
                          </span>
                          <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                            <Globe className="w-4 h-4" />
                            {article.source.name}
                          </span>
                        </div>
                        
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors group-hover:gap-3 duration-200"
                        >
                          <BookOpen className="w-4 h-4" />
                          Read Full Analysis
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Topics Filter */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                {selectedCategory === 'india' ? 'Indian Legal Topics' : 'Global Legal Topics'}
              </h3>
              <div className="space-y-2">
                {getTopics().map((topic) => {
                  const IconComponent = topic.icon;
                  return (
                    <button
                      key={topic.value}
                      onClick={() => setSelectedTopic(topic.value)}
                      className={`w-full px-4 py-3 text-left rounded-xl transition-all duration-200 flex items-center gap-3 font-medium ${
                        selectedTopic === topic.value
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {topic.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Trending Legal Topics
              </h3>
              <div className="space-y-3">
                {(selectedCategory === 'india' ? newsArticles : globalNews)
                  .slice(0, 4)
                  .map((article, index) => (
                    <a
                      key={index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
                    >
                      <h4 className="font-semibold text-slate-800 line-clamp-2 mb-1">{article.title}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(article.publishedAt)}
                      </p>
                    </a>
                  ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-3">Legal Insights</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Articles Today</span>
                  <span className="font-semibold">{filterArticles().length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Topics Covered</span>
                  <span className="font-semibold">{getTopics().length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Updated</span>
                  <span className="font-semibold">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}