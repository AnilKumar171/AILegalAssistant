import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Shield, Brain, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from './Navbar';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Scale,
      title: 'Smart Legal Research',
      description: 'AI-powered case law analysis and intelligent document processing'
    },
    {
      icon: Shield,
      title: 'Contract Security',
      description: 'Advanced risk assessment and compliance verification'
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: '24/7 legal guidance and document analysis support'
    },
    {
      icon: Sparkles,
      title: 'Finding Lawyer',
      description: 'Finding the best lawyer to represent you'
    }
  ];

  const stats = [
    { label: 'Legal Documents Processed', value: '10,000+', increment: 10000 },
    { label: 'Accuracy Rate', value: '98%', increment: 98 },
    { label: 'AI Support', value: '24/7', isStatic: true }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      if (stat.isStatic) return null;
      return setInterval(() => {
        setCounters(prev => {
          const newCounters = [...prev];
          if (newCounters[index] < stat.increment) {
            newCounters[index] = Math.min(
              newCounters[index] + stat.increment / 50,
              stat.increment
            );
          }
          return newCounters;
        });
      }, 50);
    });

    return () => intervals.forEach(interval => interval && clearInterval(interval));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Banner Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/90 z-10" />
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2940"
            alt="Legal office"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 h-full flex items-center relative z-20">
          <div className="max-w-4xl mx-auto text-center transform transition-all duration-1000 ease-out"
               style={{
                 opacity: isVisible ? 1 : 0,
                 transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
               }}>
            <div className="flex justify-center mb-6">
              <Scale className="w-16 h-16 text-blue-400 animate-bounce" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              LegalAI Pro
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-slide-up">
              Transform your legal workflow with AI-powered intelligence
            </p>
            <button 
              onClick={() => navigate('/cases')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              Get Started
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fade-in">
            Powerful Features for Legal Professionals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 ${
                  activeFeature === index ? 'scale-105 shadow-lg' : ''
                }`}
              >
                <feature.icon className={`w-12 h-12 text-blue-600 mb-4 transition-all duration-300 ${
                  activeFeature === index ? 'animate-bounce' : ''
                }`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {stat.isStatic ? stat.value : Math.floor(counters[index]).toLocaleString()}
                  {!stat.isStatic && stat.value.includes('%') && '%'}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-gray-600 mb-8 animate-slide-up">
            Join thousands of legal professionals using LegalAI Pro
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 animate-bounce"
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}