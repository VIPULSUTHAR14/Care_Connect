"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, User, FileText, Eye, Pill, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

// Type definitions
interface Patient {
  name: string;
  age: number;
  gender: string;
}

interface Medicine {
  medicine: string;
  dosage: string;
  frequency: string;
  timing: string[];
  duration: string;
  instructions: string;
}

interface Report {
  _id: string;
  appointmentId: string;
  patientId: string;
  hospitalId: string;
  patient: Patient;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  prescription: Medicine[];
  notes: string;
  followUpDate: string;
  followUpInstructions: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
}

interface ReportsResponse {
  page: number;
  limit: number;
  total: number;
  reports: Report[];
  pagination: Pagination;
}

interface SessionUser {
  id: string;
  userType: 'patient' | 'hospital';
}

interface Session {
  user: SessionUser;
}

type FilterType = 'all' | 'recent' | 'followup';

interface ReportsListPageProps {
  onViewMedicines?: (reportId: string) => void;
}

const ReportsListPage: React.FC<ReportsListPageProps> = ({
  onViewMedicines
}) => {
  const { data: session } = useSession() as { data: Session | null };
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Fetch reports
  const fetchReports = async (page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      const patientId = session?.user?.id;
      
      if (!patientId) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch(
        `/api/reports?patientId=${patientId}&page=${page}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data: ReportsResponse = await response.json();
      setReports(data.reports || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchReports(currentPage);
    }
  }, [session, currentPage]);

  // Filter reports based on search term and filter type
  const filteredReports: Report[] = reports.filter((report: Report) => {
    const matchesSearch = searchTerm === '' || 
      report.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.patient && report.patient.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'recent') {
      const reportDate = new Date(report.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && reportDate > weekAgo;
    }
    if (filterType === 'followup') {
      return matchesSearch && report.followUpDate;
    }
    
    return matchesSearch;
  });

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewMedicines = (reportId: string): void => {
    if (onViewMedicines) {
      onViewMedicines(reportId);
    } else {
      // Default behavior - log for demo
      console.log(`Navigate to medicines for report: ${reportId}`);
      // In a real app: router.push(`/medicines/${reportId}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilterType(e.target.value as FilterType);
  };

  const handlePreviousPage = (): void => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = (): void => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="h-12 bg-slate-200 rounded w-full mb-6"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 mb-4 border border-slate-200">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">Medical Reports</h1>
          <p className="text-base md:text-lg text-slate-600">View and manage your medical reports and prescriptions.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by diagnosis, treatment, patient..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400 w-5 h-5 ml-2" />
              <select
                value={filterType}
                onChange={handleFilterChange}
                className="w-full md:w-auto px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-base bg-white"
              >
                <option value="all">All Reports</option>
                <option value="recent">Recent (Last 7 days)</option>
                <option value="followup">With Follow-up</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-base">{error}</p>
          </div>
        )}

        {/* Reports Grid */}
        <div className="grid gap-6">
          {filteredReports.length > 0 ? (
            filteredReports.map((report: Report) => (
              <div key={report._id} className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                        {report.diagnosis || 'General Consultation'}
                      </h3>
                      <p className="text-slate-500 text-sm">Report #{report._id.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleViewMedicines(report._id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-800 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                    >
                      <Pill className="w-4 h-4" />
                      <span>Medicines</span>
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  {/* Patient Info */}
                  <div className="space-y-3 text-base">
                    <div className="flex items-center gap-3 text-slate-700">
                      <User className="w-5 h-5 text-slate-400" />
                      <span className="font-semibold text-slate-800">Patient:</span>
                      <span>{report.patient?.name || 'N/A'}</span>
                    </div>
                    
                    {report.patient?.age > 0 && (
                      <div className="text-slate-700 pl-8">
                        Age: {report.patient.age} &bull; Gender: {report.patient.gender || 'N/A'}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-slate-700">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <span className="font-semibold text-slate-800">Date:</span>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>

                  {/* Clinical Info */}
                  <div className="space-y-4 text-base">
                    {report.symptoms?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Symptoms:</h4>
                        <div className="flex flex-wrap gap-2">
                          {report.symptoms.slice(0, 3).map((symptom: string, index: number) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-yellow-100 text-yellow-900 text-sm rounded-full font-medium"
                            >
                              {symptom}
                            </span>
                          ))}
                          {report.symptoms.length > 3 && (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium">
                              +{report.symptoms.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {report.treatment && (
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">Treatment:</h4>
                        <p className="text-slate-700 line-clamp-2">{report.treatment}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prescription Summary */}
                {report.prescription?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h4 className="font-semibold text-slate-800 text-base">
                        Prescribed Medicines: {report.prescription.length}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.prescription.slice(0, 3).map((med: Medicine, index: number) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-blue-100 text-blue-900 text-sm rounded-full font-medium"
                          >
                            {med.medicine}
                          </span>
                        ))}
                        {report.prescription.length > 3 && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium">
                            +{report.prescription.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Follow-up Info */}
                {report.followUpDate && (
                  <div className="mt-6 pt-6 border-t border-slate-200/60">
                    <div className="flex items-center gap-3 text-orange-800 bg-orange-50 rounded-lg p-3">
                      <Calendar className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold text-base">Follow-up Date:</span>
                      <span className='text-base'>{formatDate(report.followUpDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 sm:py-24">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Reports Found</h3>
              <p className="text-base text-slate-500 max-w-md mx-auto">
                {searchTerm ? 'No reports match your search criteria. Try a different search.' : 'You do not have any medical reports available at the moment.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 md:mt-10 gap-4 sm:gap-6">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 text-sm sm:text-base text-slate-800 font-semibold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            
            <span className="text-slate-700 text-sm sm:text-base font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 text-sm sm:text-base text-slate-800 font-semibold transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsListPage;