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
      report.patient.name.toLowerCase().includes(searchTerm.toLowerCase());

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 mb-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Medical Reports</h1>
          <p className="text-lg text-gray-900">View and manage your medical reports and prescriptions</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports by diagnosis, treatment, or patient name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={handleFilterChange}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg"
              >
                <option className='text-gray-900' value="all">All Reports</option>
                <option className='text-gray-900' value="recent">Recent (Last 7 days)</option>
                <option className='text-gray-900' value="followup">With Follow-up</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-lg">{error}</p>
          </div>
        )}

        {/* Reports Grid */}
        <div className="grid gap-6">
          {filteredReports.length > 0 ? (
            filteredReports.map((report: Report) => (
              <div key={report._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {report.diagnosis || 'General Consultation'}
                      </h3>
                      <p className="text-gray-700 text-lg">Report #{report._id.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewMedicines(report._id)}
                      className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-800 rounded-lg hover:bg-green-100 transition-colors text-lg font-medium"
                    >
                      <Pill className="w-5 h-5" />
                      Medicines
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors text-lg font-medium">
                      <Eye className="w-5 h-5" />
                      View Details
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Patient Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-900 text-lg">
                      <User className="w-5 h-5" />
                      <span className="font-semibold">Patient:</span>
                      <span>{report.patient.name || 'N/A'}</span>
                    </div>
                    
                    {report.patient.age > 0 && (
                      <div className="text-lg text-gray-900">
                        Age: {report.patient.age} • Gender: {report.patient.gender || 'N/A'}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-gray-900 text-lg">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">Date:</span>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>

                  {/* Clinical Info */}
                  <div className="space-y-4">
                    {report.symptoms.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-900 text-lg">Symptoms:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {report.symptoms.slice(0, 3).map((symptom: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-yellow-100 text-yellow-900 text-base rounded-full"
                            >
                              {symptom}
                            </span>
                          ))}
                          {report.symptoms.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-900 text-base rounded-full">
                              +{report.symptoms.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {report.treatment && (
                      <div>
                        <span className="font-semibold text-gray-900 text-lg">Treatment:</span>
                        <p className="text-gray-900 text-lg mt-2 line-clamp-2">{report.treatment}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prescription Summary */}
                {report.prescription.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-lg">
                        Prescribed Medicines: {report.prescription.length}
                      </span>
                      <div className="flex gap-2">
                        {report.prescription.slice(0, 3).map((med: Medicine, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-900 text-base rounded-full"
                          >
                            {med.medicine}
                          </span>
                        ))}
                        {report.prescription.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-900 text-base rounded-full">
                            +{report.prescription.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Follow-up Info */}
                {report.followUpDate && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-orange-700 text-lg">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">Follow-up:</span>
                      <span>{formatDate(report.followUpDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Reports Found</h3>
              <p className="text-lg text-gray-900">
                {searchTerm ? 'No reports match your search criteria.' : 'You have no medical reports yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 gap-6">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-lg text-gray-900 font-semibold"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            
            <span className="text-gray-900 text-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-lg text-gray-900 font-semibold"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsListPage;