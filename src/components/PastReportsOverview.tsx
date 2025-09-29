"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Calendar, User, Pill, FileText, Clock, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

// Enhanced Report type matching the updated API response
type Medicine = {
  medicine: string;
  dosage: string;
  frequency: string;
  timing: string[];
  duration: string;
  instructions: string;
};

type Report = {
  _id: string;
  appointmentId: string;
  patientId: string;
  hospitalId: string;
  
  // Enhanced patient information
  patient: {
    name: string;
    age: number;
    gender: string;
  };
  
  // Clinical information
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  
  // Enhanced prescription structure
  prescription: Medicine[];
  
  // Follow-up and notes
  notes: string;
  followUpDate: string;
  followUpInstructions: string;
  
  // Timestamps
  completedAt: string;
  createdAt: string;
  updatedAt?: string;
};

type ApiResponse = {
  page: number;
  limit: number;
  total: number;
  reports: Report[];
  pagination?: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages: number;
  };
};

export default function PastReportsOverview() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReports, setTotalReports] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const router = useRouter();


  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const session = await getSession();
        if (!session?.user?.id) {
          throw new Error("User not authenticated. Please log in.");
        }

        const patientId = session.user.id;

        // Fetch the 3 most recent reports
        const res = await fetch(`/api/reports?patientId=${patientId}&limit=3`);

        if (!res.ok) {
          if (res.status === 404) {
            // No reports found - this is not an error, just empty state
            setReports([]);
            setTotalReports(0);
            return;
          }
          
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${res.status}: Failed to fetch reports`);
        }

        const data: ApiResponse = await res.json();
        console.log("Fetched enhanced reports data:", data); // Debug log
        setReports(data.reports || []);
        setTotalReports(data.total || 0);

      } catch (err: unknown) { // 1. FIX: Use 'unknown' for type safety
        console.error("Error fetching reports:", err);
        
        // Add a type guard to safely access error properties
        if (err instanceof Error) {
          if (err.name === 'TypeError' && err.message.includes('fetch')) {
            setError("Network error. Please check your connection and try again.");
          } else if (err.message.includes("Unexpected token '<'")) {
            setError("Server error. Please try again later.");
          } else {
            setError(err.message);
          }
        } else {
          setError("An unexpected error occurred while loading reports.");
        }
      }  finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return 'No date';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getReportSummary = (report: Report): string => {
    if (report.diagnosis && report.diagnosis.trim()) {
      return report.diagnosis;
    }
    if (report.symptoms && report.symptoms.length > 0) {
      return `Symptoms: ${report.symptoms.slice(0, 2).join(', ')}${report.symptoms.length > 2 ? '...' : ''}`;
    }
    if (report.treatment && report.treatment.trim()) {
      return `Treatment: ${report.treatment.substring(0, 50)}${report.treatment.length > 50 ? '...' : ''}`;
    }
    return "Medical consultation completed";
  };

  const getStatusColor = (report: Report): string => {
    return report.completedAt ? "bg-green-400" : "bg-yellow-400";
  };

  const getStatusText = (report: Report): string => {
    return report.completedAt ? "Completed" : "Pending";
  };

  const getPrescriptionSummary = (prescription: Medicine[]): string => {
    if (!prescription || prescription.length === 0) {
      return "No prescription";
    }
    
    if (prescription.length === 1) {
      return prescription[0].medicine;
    }
    
    return `${prescription[0].medicine} +${prescription.length - 1} more`;
  };

  const openReportModal = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setSelectedReport(null);
    setShowReportModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 m-4">
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            <span className="text-gray-600 text-lg font-mono">Loading your reports...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-red-200 p-6 m-4">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2 font-mono">Error Loading Reports</h3>
            <p className="text-sm text-red-500 max-w-md mx-auto font-mono">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-mono"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-8xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 m-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 font-mono flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-600" />
              Past Medical Reports
            </h2>
            <p className="text-gray-600 text-sm mt-1 font-mono">
              {totalReports > 0 
                ? `Showing ${Math.min(3, reports.length)} of ${totalReports} total reports`
                : "Your recent medical reports"
              }
            </p>
          </div>
          {totalReports > 3 && (
            <button className="px-4 py-2 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-mono" onClick={()=>{router.push('/reports')}}>
              View All Reports
            </button>
          )}
        </div>

        {/* Reports Grid or Empty State */}
        {reports.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2 font-mono">No Reports Found</h3>
              <p className="text-gray-500 mb-2 font-mono">You don&apos;t have any medical reports yet.</p>
              <p className="text-sm text-gray-400 font-mono">
                Your health reports will appear here after your appointments.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, index) => (
              <div
                key={report._id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => openReportModal(report)}
              >
                {/* Report Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1 rounded-full font-mono">
                      Report #{index + 1}
                    </span>
                    <div className="flex items-center text-xs text-gray-600">
                      <span className={`w-2 h-2 ${getStatusColor(report)} rounded-full mr-1`}></span>
                      <span className="font-mono font-medium">{getStatusText(report)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatDate(report.createdAt)}
                  </span>
                </div>

                {/* Patient Info */}
                {report.patient && report.patient.name && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-mono">
                      {report.patient.name}, {report.patient.age}y, {report.patient.gender}
                    </span>
                  </div>
                )}

                {/* Report Content */}
                <div className="space-y-3">
                  <div className="text-sm text-gray-800 line-clamp-2 min-h-[2.5rem]">
                    <span className="font-medium font-mono">{getReportSummary(report)}</span>
                  </div>

                  {/* Symptoms */}
                  {report.symptoms && report.symptoms.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium font-mono">Symptoms: </span>
                      <span className="font-mono">{report.symptoms.slice(0, 3).join(', ')}</span>
                      {report.symptoms.length > 3 && <span className="font-mono"> +{report.symptoms.length - 3} more</span>}
                    </div>
                  )}

                  {/* Prescription Summary */}
                  {report.prescription && report.prescription.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Pill className="w-3 h-3 text-purple-500" />
                      <span className="font-mono">{getPrescriptionSummary(report.prescription)}</span>
                    </div>
                  )}

                  {/* Follow-up Date */}
                  {report.followUpDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3 text-yellow-500" />
                      <span className="font-mono">Follow-up: {formatDate(report.followUpDate)}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="font-mono">{formatDate(report.createdAt)}</span>
                    </div>
                    
                    <button 
                      className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-800 font-mono font-medium transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openReportModal(report);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        {reports.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center font-mono">
              Last updated: {formatDate(reports[0]?.createdAt)}
            </p>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 font-mono flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cyan-600" />
                  Medical Report Details
                </h3>
                <button
                  onClick={closeReportModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Information */}
                {selectedReport.patient && selectedReport.patient.name && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <User className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-800 font-mono">Patient Information</h4>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-base">
                      <div>
                        <span className="font-medium font-mono text-gray-700">Name:</span>
                        <p className="font-mono text-gray-900 text-lg">{selectedReport.patient.name}</p>
                      </div>
                      <div>
                        <span className="font-medium font-mono text-gray-700">Age:</span>
                        <p className="font-mono text-gray-900 text-lg">{selectedReport.patient.age} years</p>
                      </div>
                      <div>
                        <span className="font-medium font-mono text-gray-700">Gender:</span>
                        <p className="font-mono text-gray-900 text-lg">{selectedReport.patient.gender}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Symptoms */}
                {selectedReport.symptoms && selectedReport.symptoms.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 font-mono">Symptoms</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedReport.symptoms.map((symptom, idx) => (
                        <span key={idx} className="bg-red-100 text-red-900 text-base px-3 py-2 rounded font-mono font-semibold">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Assessment */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 font-mono">Clinical Assessment</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium font-mono text-gray-700 block">Diagnosis:</span>
                      <p className="font-mono text-gray-900 text-lg">{selectedReport.diagnosis || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium font-mono text-gray-700 block">Treatment:</span>
                      <p className="font-mono text-gray-900 text-lg">{selectedReport.treatment || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Prescription */}
                {selectedReport.prescription && selectedReport.prescription.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Pill className="w-5 h-5 text-purple-600 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-800 font-mono">Prescription</h4>
                    </div>
                    <div className="space-y-3">
                      {selectedReport.prescription.map((medicine, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-purple-200">
                          <h5 className="font-semibold text-gray-900 text-lg font-mono">{medicine.medicine}</h5>
                          <div className="text-base text-gray-800 font-mono mt-1">
                            {medicine.dosage && <span><strong>Dosage:</strong> {medicine.dosage} | </span>}
                            {medicine.frequency && <span><strong>Frequency:</strong> {medicine.frequency}</span>}
                          </div>
                          {medicine.timing && medicine.timing.length > 0 && (
                            <div className="text-base text-gray-800 font-mono">
                              <strong>Timing:</strong> {medicine.timing.join(', ')}
                            </div>
                          )}
                          {medicine.duration && (
                            <div className="text-base text-gray-800 font-mono">
                              <strong>Duration:</strong> {medicine.duration}
                            </div>
                          )}
                          {medicine.instructions && (
                            <div className="text-base text-gray-800 font-mono">
                              <strong>Instructions:</strong> {medicine.instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up and Notes */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-800 font-mono">Follow-up & Notes</h4>
                  </div>
                  <div className="space-y-3">
                    {selectedReport.followUpDate && (
                      <div>
                        <span className="font-medium font-mono text-gray-700 block">Follow-up Date:</span>
                        <p className="font-mono text-gray-900 text-lg">{formatDate(selectedReport.followUpDate)}</p>
                      </div>
                    )}
                    {selectedReport.followUpInstructions && (
                      <div>
                        <span className="font-medium font-mono text-gray-700 block">Follow-up Instructions:</span>
                        <p className="font-mono text-gray-900 text-lg">{selectedReport.followUpInstructions}</p>
                      </div>
                    )}
                    {selectedReport.notes && (
                      <div>
                        <span className="font-medium font-mono text-gray-700 block">Additional Notes:</span>
                        <p className="font-mono text-gray-900 text-lg">{selectedReport.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Report Metadata */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 font-mono">Report Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-base">
                    <div>
                      <span className="font-medium font-mono text-gray-700">Created:</span>
                      <p className="font-mono text-gray-900 text-lg">{formatDate(selectedReport.createdAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium font-mono text-gray-700">Status:</span>
                      <p className="font-mono text-gray-900 text-lg">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(selectedReport)} text-white`}>
                          {selectedReport.completedAt ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                          {getStatusText(selectedReport)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeReportModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-mono"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}