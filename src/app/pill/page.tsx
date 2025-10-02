"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Pill, 
  Clock, 
  Calendar, 
  Info, 
  ArrowLeft, 
  Download,
  AlertCircle,
  CheckCircle,
  Sunrise,
  Sun,
  Moon,
  Search,
  FileText,
  User,
  Filter
} from 'lucide-react';

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

interface ReportsResponse {
  page: number;
  limit: number;
  total: number;
  reports: Report[];
  pagination: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages: number;
  };
}

interface SessionUser {
  id: string;
  userType: 'patient' | 'hospital';
}

interface Session {
  user: SessionUser;
}

type TimingType = 'morning' | 'afternoon' | 'evening' | 'night';
type FilterType = 'all' | 'recent' | 'active' | 'completed';
type GroupByType = 'report' | 'medicine' | 'date';

interface AllMedicinesPageProps {
  patientId?: string;
  onBack?: () => void;
  demoMode?: boolean;
}

interface MedicineWithReport extends Medicine {
  reportId: string;
  reportDate: string;
  diagnosis: string;
  doctor?: string;
}

const AllMedicinesPage: React.FC<AllMedicinesPageProps> = ({ 
  patientId, 
  onBack,
  demoMode = false
}) => {
  const { data: session, status } = useSession() as { data: Session | null; status: string };
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [groupBy, setGroupBy] = useState<GroupByType>('report');

  // Get patient ID from session if not provided
  const currentPatientId = patientId || session?.user?.id;

  // Fetch all reports for patient
  const fetchAllReports = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentPatientId) {
        throw new Error('Patient ID is required');
      }
      
      console.log('Fetching all reports for patient:', currentPatientId);
      
      // Fetch all pages of reports
      let allReports: Report[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `/api/reports?patientId=${currentPatientId}&page=${currentPage}&limit=50`
        );
        
        if (!response.ok) {
          setReports([]);
          break;
        }
        
        const data: ReportsResponse = await response.json();
        allReports = [...allReports, ...(data.reports || [])];
        
        hasMore = data.pagination?.hasNextPage || false;
        currentPage++;
        
        // Safety break to prevent infinite loops
        if (currentPage > 100) break;
      }
      
      console.log('Total reports fetched:', allReports.length);
      setReports(allReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Demo data loader
  const loadDemoData = (): void => {
    setLoading(true);
    
    setTimeout(() => {
      const demoReports: Report[] = [
        {
          _id: "report1",
          appointmentId: "apt1",
          patientId: "patient123",
          hospitalId: "hospital123",
          patient: { name: "John Doe", age: 35, gender: "Male" },
          symptoms: ["Headache", "Fever"],
          diagnosis: "Common Cold",
          treatment: "Rest and medication",
          prescription: [
            {
              medicine: "Paracetamol",
              dosage: "500mg",
              frequency: "3 times daily",
              timing: ["morning", "afternoon", "evening"],
              duration: "5 days",
              instructions: "Take with food"
            },
            {
              medicine: "Vitamin C",
              dosage: "1000mg",
              frequency: "Once daily",
              timing: ["morning"],
              duration: "10 days",
              instructions: "Take with breakfast"
            }
          ],
          notes: "Rest well",
          followUpDate: "2025-10-02",
          followUpInstructions: "Return if symptoms persist",
          completedAt: "2025-09-20T10:30:00Z",
          createdAt: "2025-09-20T10:30:00Z",
          updatedAt: "2025-09-20T10:30:00Z"
        },
        {
          _id: "report2",
          appointmentId: "apt2",
          patientId: "patient123",
          hospitalId: "hospital123",
          patient: { name: "John Doe", age: 35, gender: "Male" },
          symptoms: ["Back pain"],
          diagnosis: "Muscle Strain",
          treatment: "Physical therapy and pain relief",
          prescription: [
            {
              medicine: "Ibuprofen",
              dosage: "400mg",
              frequency: "Twice daily",
              timing: ["morning", "evening"],
              duration: "7 days",
              instructions: "Take after meals"
            },
            {
              medicine: "Muscle Relaxant",
              dosage: "10mg",
              frequency: "Once at night",
              timing: ["night"],
              duration: "5 days",
              instructions: "May cause drowsiness"
            }
          ],
          notes: "Apply heat therapy",
          followUpDate: "2025-10-05",
          followUpInstructions: "Continue exercises",
          completedAt: "2025-09-15T14:20:00Z",
          createdAt: "2025-09-15T14:20:00Z",
          updatedAt: "2025-09-15T14:20:00Z"
        }
      ];
      
      setReports(demoReports);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    console.log('Medicine page - Session status:', status);
    console.log('Medicine page - Patient ID:', currentPatientId);
    console.log('Medicine page - Demo mode:', demoMode);
    
    if (demoMode) {
      loadDemoData();
      return;
    }
    
    if (status === 'loading') {
      console.log('Session is loading...');
      return;
    }
    
    if (status === 'unauthenticated') {
      setError('Please log in to view medicine details');
      setLoading(false);
      return;
    }
    
    if (!currentPatientId) {
      setError('No patient ID available');
      setLoading(false);
      return;
    }
    
    fetchAllReports();
  }, [currentPatientId, status, demoMode]);

  // Get all medicines from all reports
  const getAllMedicines = (): MedicineWithReport[] => {
    const allMedicines: MedicineWithReport[] = [];
    
    reports.forEach(report => {
      report.prescription.forEach(medicine => {
        allMedicines.push({
          ...medicine,
          reportId: report._id,
          reportDate: report.createdAt,
          diagnosis: report.diagnosis,
        });
      });
    });
    
    return allMedicines;
  };

  // Filter and search medicines
  const getFilteredMedicines = (): MedicineWithReport[] => {
    let medicines = getAllMedicines();
    
    // Apply search filter
    if (searchTerm) {
      medicines = medicines.filter(med =>
        med.medicine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.instructions.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.dosage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      medicines = medicines.filter(med => new Date(med.reportDate) > weekAgo);
    } else if (filterType === 'active') {
      medicines = medicines.filter(med => {
        if (!med.duration) return true;
        // Simple active check - you might want to implement more complex logic
        const reportDate = new Date(med.reportDate);
        const durationDays = parseInt(med.duration.match(/\d+/)?.[0] || '30');
        const endDate = new Date(reportDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
        return endDate > new Date();
      });
    }
    
    return medicines;
  };

  // Group medicines by different criteria
  const getGroupedMedicines = () => {
    const medicines = getFilteredMedicines();
    
    if (groupBy === 'medicine') {
      const grouped: { [key: string]: MedicineWithReport[] } = {};
      medicines.forEach(med => {
        if (!grouped[med.medicine]) {
          grouped[med.medicine] = [];
        }
        grouped[med.medicine].push(med);
      });
      return grouped;
    } else if (groupBy === 'date') {
      const grouped: { [key: string]: MedicineWithReport[] } = {};
      medicines.forEach(med => {
        const date = new Date(med.reportDate).toDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(med);
      });
      return grouped;
    } else {
      // Group by report
      const grouped: { [key: string]: MedicineWithReport[] } = {};
      medicines.forEach(med => {
        if (!grouped[med.reportId]) {
          grouped[med.reportId] = [];
        }
        grouped[med.reportId].push(med);
      });
      return grouped;
    }
  };

  // Helper functions
  // FIX: Remove explicit JSX.Element return type to avoid "Cannot find namespace 'JSX'" error.
  const getTimingIcon = (timing: string) => {
    const timingLower = timing.toLowerCase() as TimingType;
    switch (timingLower) {
      case 'morning':
        return <Sunrise className="w-4 h-4 text-yellow-500" />;
      case 'afternoon':
        return <Sun className="w-4 h-4 text-orange-500" />;
      case 'evening':
      case 'night':
        return <Moon className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTimingColorClass = (timing: string): string => {
    const timingLower = timing.toLowerCase() as TimingType;
    switch (timingLower) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-800';
      case 'afternoon':
        return 'bg-orange-100 text-orange-800';
      case 'evening':
      case 'night':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBack = (): void => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handlePrintAll = (): void => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 text-sm text-blue-600">
            Loading all medicines for patient...
            {currentPatientId && <span className="block">Patient ID: {currentPatientId}</span>}
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Medicines</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allMedicines = getFilteredMedicines();
  const groupedMedicines = getGroupedMedicines();
  const totalReports = reports.length;
  const totalMedicines = getAllMedicines().length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">All Medicines</h1>
              <p className="text-gray-600">
                {totalMedicines} medicine{totalMedicines !== 1 ? 's' : ''} from {totalReports} report{totalReports !== 1 ? 's' : ''}
                {reports[0]?.patient?.name && <span> • {reports[0].patient.name}</span>}
              </p>
            </div>
            <button
              onClick={handlePrintAll}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Print All Medicines
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-xl font-semibold text-gray-900">{totalReports}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Pill className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Medicines</p>
                  <p className="text-xl font-semibold text-gray-900">{totalMedicines}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Search className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Filtered Results</p>
                  <p className="text-xl font-semibold text-gray-900">{allMedicines.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {reports[0]?.patient?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search medicines by name, diagnosis, dosage, or instructions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Medicines</option>
                  <option value="recent">Recent (Last 7 days)</option>
                  <option value="active">Currently Active</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Group by:</span>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="report">Report</option>
                  <option value="medicine">Medicine Name</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Medicines Display */}
        <div className="space-y-6">
          {Object.keys(groupedMedicines).length > 0 ? (
            Object.entries(groupedMedicines).map(([groupKey, medicines]) => {
              // Get group title and info
              let groupTitle = groupKey;
              let groupInfo = '';
              
              if (groupBy === 'report') {
                const report = reports.find(r => r._id === groupKey);
                groupTitle = report?.diagnosis || 'Unknown Diagnosis';
                groupInfo = `Report from ${formatDate(report?.createdAt || '')}`;
              } else if (groupBy === 'date') {
                groupTitle = groupKey;
                groupInfo = `${medicines.length} medicine${medicines.length !== 1 ? 's' : ''}`;
              } else {
                groupInfo = `${medicines.length} prescription${medicines.length !== 1 ? 's' : ''}`;
              }
              
              return (
                <div key={groupKey} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">{groupTitle}</h3>
                    <p className="text-sm text-gray-600">{groupInfo}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid gap-4">
                      {medicines.map((medicine, index) => {
                        const medicineKey = `${groupKey}-${index}`;
                        return (
                          <div
                            key={medicineKey}
                            className={`border rounded-lg p-4 transition-all cursor-pointer ${
                              selectedMedicine === medicineKey 
                                ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedMedicine(selectedMedicine === medicineKey ? null : medicineKey)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                  {medicine.medicine}
                                </h4>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                  {medicine.dosage && (
                                    <div className="flex items-center gap-1">
                                      <Pill className="w-4 h-4" />
                                      <span>{medicine.dosage}</span>
                                    </div>
                                  )}
                                  {medicine.frequency && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{medicine.frequency}</span>
                                    </div>
                                  )}
                                  {medicine.duration && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>{medicine.duration}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>From: {medicine.diagnosis}</span>
                                  <span>•</span>
                                  <span>{formatDate(medicine.reportDate)}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                {selectedMedicine === medicineKey && (
                                  <CheckCircle className="w-5 h-5 text-blue-500" />
                                )}
                              </div>
                            </div>

                            {/* Timing */}
                            {medicine.timing && medicine.timing.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-700 mb-1 block">Take at:</span>
                                <div className="flex flex-wrap gap-1">
                                  {medicine.timing.map((time: string, timeIndex: number) => (
                                    <div
                                      key={timeIndex}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTimingColorClass(time)}`}
                                    >
                                      {getTimingIcon(time)}
                                      <span className="capitalize">{time}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Instructions */}
                            {medicine.instructions && (
                              <div className="border-t border-gray-100 pt-3 mt-3">
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-700">Instructions:</span>
                                    <p className="text-sm text-gray-600 mt-1">{medicine.instructions}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm || filterType !== 'all' ? 'No Matching Medicines' : 'No Medicines Found'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No medical reports with prescriptions found for this patient.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>All prescriptions from medical reports • Please consult your doctor before making any changes</p>
        </div>
      </div>
    </div>
  );
};

export default AllMedicinesPage;