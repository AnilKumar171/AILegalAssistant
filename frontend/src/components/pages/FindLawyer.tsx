import { useState } from "react";
import lawyers from "./LawyersData";
import { Users, MapPin, Briefcase, Award, Mail, Scale, Trophy, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FindLawyer = () => {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [casesSolved, setCasesSolved] = useState("");
  const [location, setLocation] = useState("");
  const [expandedLawyer, setExpandedLawyer] = useState<string | null>(null);

  // Filtering logic
  const filteredLawyers = lawyers.filter((lawyer) => {
    return (
      lawyer.Name.toLowerCase().includes(search.toLowerCase()) &&
      (specialization ? lawyer.Specialization === specialization : true) &&
      (experience
        ? lawyer.Years_of_Experience >= parseInt(experience.split("-")[0]) &&
          lawyer.Years_of_Experience <= parseInt(experience.split("-")[1])
        : true) &&
      (casesSolved
        ? lawyer.Number_of_Cases_Solved >= parseInt(casesSolved.split("-")[0]) &&
          lawyer.Number_of_Cases_Solved <= parseInt(casesSolved.split("-")[1])
        : true) &&
      (location ? lawyer.Location === location : true)
    );
  });

  const calculateWinRate = (won: number, lost: number) => {
    const total = won + lost;
    return total > 0 ? Math.round((won / total) * 100) : 0;
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 60) return 'bg-blue-100 text-blue-800';
    if (rate >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find a Lawyer</h1>
        <p className="text-gray-600 mt-2">Connect with experienced legal professionals</p>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lawyers.length}</p>
              <p className="text-gray-600">Total Lawyers</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(lawyers.map(l => l.Specialization)).size}
              </p>
              <p className="text-gray-600">Specializations</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(lawyers.map(l => l.Location)).size}
              </p>
              <p className="text-gray-600">Locations</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.max(...lawyers.map(l => l.Years_of_Experience))}+
              </p>
              <p className="text-gray-600">Max Experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Specialization Dropdown */}
          <select
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {[...new Set(lawyers.map((lawyer) => lawyer.Specialization))].map(
              (spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              )
            )}
          </select>

          {/* Experience Range Dropdown */}
          <select
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">All Experience Levels</option>
            <option value="0-5">0-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="11-15">11-15 years</option>
            <option value="16-20">16-20 years</option>
            <option value="21-25">21-25 years</option>
          </select>

          {/* Cases Solved Dropdown */}
          <select
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={casesSolved}
            onChange={(e) => setCasesSolved(e.target.value)}
          >
            <option value="">All Cases Solved</option>
            <option value="0-50">0-50 cases</option>
            <option value="51-100">51-100 cases</option>
            <option value="101-150">101-150 cases</option>
            <option value="151-200">151-200 cases</option>
            <option value="201-300">201-300 cases</option>
          </select>

          {/* Location Dropdown */}
          <select
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {[...new Set(lawyers.map((lawyer) => lawyer.Location))].map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredLawyers.length} of {lawyers.length} lawyers
        </p>
      </div>

      {/* Lawyer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLawyers.length > 0 ? (
          filteredLawyers.map((lawyer, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Basic Info Section */}
              <div className="p-6 border-b">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-blue-600">
                      {lawyer.Name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{lawyer.Name}</h2>
                    <p className="text-blue-600">{lawyer.Specialization}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Experience</span>
                    </div>
                    <p className="text-lg font-semibold">{lawyer.Years_of_Experience} years</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Location</span>
                    </div>
                    <p className="text-lg font-semibold">{lawyer.Location}</p>
                  </div>
                </div>

                {/* Win/Loss Stats */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Success Rate</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      getWinRateColor(calculateWinRate(lawyer.cases_won, lawyer.cases_lost))
                    }`}>
                      {calculateWinRate(lawyer.cases_won, lawyer.cases_lost)}%
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">{lawyer.cases_won} won</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600 font-medium">{lawyer.cases_lost} lost</span>
                    </div>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedLawyer(expandedLawyer === lawyer.Name ? null : lawyer.Name)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {expandedLawyer === lawyer.Name ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View Famous Cases
                    </>
                  )}
                </button>
              </div>

              {/* Famous Cases Section */}
              {expandedLawyer === lawyer.Name && (
                <div className="p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Notable Cases</h3>
                  <div className="space-y-4">
                    {lawyer.famous_cases.map((case_, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{case_.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            case_.outcome === 'won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {case_.outcome === 'won' ? 'Won' : 'Lost'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{case_.description}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Year: {case_.year}</span>
                          <span className="text-blue-600">Impact: {case_.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <div className="p-6 border-t">
                <a
                  href={`mailto:${lawyer.Email}`}
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact Lawyer
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500 text-lg">
              No lawyers found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindLawyer;