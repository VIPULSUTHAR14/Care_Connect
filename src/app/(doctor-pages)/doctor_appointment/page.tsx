"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Video,
  FileText,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Pill,
  Plus,
  Trash2,
  CheckCircle,
  MicOff,
  VideoOff,
  PhoneOff,
  UserCircle
} from 'lucide-react';
import React from 'react';

// Define the structure of an appointment
interface Appointment {
  _id: string;
  patientId: string;
  hospitalId: string;
  doctorId: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt: string;
  patient?: {
    name: string;
    age: number;
  };
}

// Enhanced Report Form Types
type Medicine = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  timing: string[];
  duration: string;
  instructions: string;
};

type EnhancedReportForm = {
  patient: {
    name: string;
    age: string;
    gender: string;
  };
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  prescription: Medicine[];
  notes: string;
  followUpDate: string;
  followUpInstructions: string;
};

// Helper for styled status badges
const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
  const statusStyles = {
    approved: { icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />, text: 'Ready for Report', className: 'bg-green-100 text-green-800' },
    completed: { icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />, text: 'Completed', className: 'bg-blue-100 text-blue-800' },
    cancelled: { icon: <AlertCircle className="w-4 h-4 mr-1.5" />, text: 'Cancelled', className: 'bg-red-100 text-red-800' },
    pending: { icon: <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />, text: 'Pending Approval', className: 'bg-yellow-100 text-yellow-800' },
  };
  const style = statusStyles[status] || statusStyles.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style.className}`}>
      {style.icon}
      {style.text}
    </span>
  );
};

export default function DoctorAppointmentPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the report modal
  const [showReportForm, setShowReportForm] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Enhanced Report Form State
  const [reportForm, setReportForm] = useState<EnhancedReportForm>({
    patient: { name: '', age: '', gender: '' },
    symptoms: [],
    diagnosis: '',
    treatment: '',
    prescription: [],
    notes: '',
    followUpDate: '',
    followUpInstructions: ''
  });

  // Medicine form state
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState({
    name: '', dosage: '', frequency: '', timing: [] as string[], duration: '', instructions: ''
  });

  // Constants for form options
  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Sore Throat', 'Nausea', 'Vomiting',
    'Diarrhea', 'Abdominal Pain', 'Chest Pain', 'Shortness of Breath',
    'Dizziness', 'Fatigue', 'Body Aches', 'Chills', 'Loss of Appetite',
    'Insomnia', 'Rash', 'Joint Pain', 'Back Pain', 'Constipation'
  ];
  const medicineTimings = [
    'Before Breakfast', 'After Breakfast', 'Before Lunch', 'After Lunch',
    'Before Dinner', 'After Dinner', 'Morning', 'Afternoon', 'Evening', 'Night'
  ];
  const frequencyOptions = [
    'Once Daily', 'Twice Daily', 'Three Times Daily', 'Four Times Daily', 'As Needed'
  ];

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctor-api/appointments?doctor=me');
      if (!res.ok) {
        throw new Error('Failed to fetch appointments. Please try again later.');
      }
      const data = await res.json();
      setAppointments(data.appointments);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/signin');
      return;
    }
    if (sessionStatus === 'authenticated') {
      fetchAppointments();
    }
  }, [sessionStatus, router, fetchAppointments]);

  // Handlers from the report system
  const handleSymptomToggle = (symptom: string) => {
    setReportForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleTimingToggle = (timing: string) => {
    setCurrentMedicine(prev => ({
      ...prev,
      timing: prev.timing.includes(timing)
        ? prev.timing.filter(t => t !== timing)
        : [...prev.timing, timing]
    }));
  };

  const addMedicine = () => {
    if (currentMedicine.name && currentMedicine.frequency) {
      const newMedicine: Medicine = { ...currentMedicine, id: Date.now() };
      setReportForm(prev => ({ ...prev, prescription: [...prev.prescription, newMedicine] }));
      setCurrentMedicine({ name: '', dosage: '', frequency: '', timing: [], duration: '', instructions: '' });
      setShowMedicineForm(false);
    }
  };

  const removeMedicine = (id: number) => {
    setReportForm(prev => ({ ...prev, prescription: prev.prescription.filter(med => med.id !== id) }));
  };

  const resetReportForm = () => {
    setReportForm({
      patient: { name: '', age: '', gender: '' }, symptoms: [], diagnosis: '',
      treatment: '', prescription: [], notes: '', followUpDate: '', followUpInstructions: ''
    });
    setShowReportForm(false);
    setSelectedAppointment(null);
  };

  const handleOpenReportForm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Pre-fill patient info if available
    setReportForm(prev => ({
      ...prev,
      patient: {
        name: appointment.patient?.name || '',
        age: appointment.patient?.age?.toString() || '',
        gender: ''
      }
    }));
    setShowReportForm(true);
  };

  const handleCompleteReport = async () => {
    if (!selectedAppointment) return;
    try {
      setSubmittingReport(true);
      const reportData = {
        appointmentId: selectedAppointment._id,
        patientId: selectedAppointment.patientId,
        hospitalId: selectedAppointment.hospitalId,
        patient: reportForm.patient,
        symptoms: reportForm.symptoms,
        diagnosis: reportForm.diagnosis,
        treatment: reportForm.treatment,
        prescription: reportForm.prescription.map(med => ({
          medicine: med.name, dosage: med.dosage, frequency: med.frequency,
          timing: med.timing, duration: med.duration, instructions: med.instructions
        })),
        notes: reportForm.notes,
        followUpDate: reportForm.followUpDate,
        followUpInstructions: reportForm.followUpInstructions,
        completedAt: new Date().toISOString(),
      };

      const reportRes = await fetch("/api/reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      if (!reportRes.ok) throw new Error("Failed to create report");

      await fetch("/api/doctor-api/appointments", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: selectedAppointment._id, status: "completed" }),
      });

      resetReportForm();
      await fetchAppointments(); // Refresh list
    } catch (e: any) {
      setError(e?.message || "Failed to complete report");
    } finally {
      setSubmittingReport(false);
    }
  };


  if (sessionStatus === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-red-700 font-semibold mb-2">Error</p>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8 text-blue-900">Your Appointments</h1>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Calendar className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No appointments found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {appointments.map((appt) => (
                <div key={appt._id} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="font-semibold text-gray-800 font-mono">{appt.patient?.name || 'Unknown Patient'}</span>
                      <span className="ml-3 text-gray-500 text-sm font-mono">Age: {appt.patient?.age ?? 'N/A'}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600 text-sm">{new Date(appt.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mb-4"><StatusBadge status={appt.status} /></div>

                    {appt.status === 'approved' && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleOpenReportForm(appt)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium font-mono rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Check Up
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Side-by-Side Video Call and Report Form */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
          {/* Left Side: Dummy Video Call */}
          <div className="w-2/5 bg-gray-900 p-4 flex flex-col text-white relative">
            <h2 className="text-xl font-semibold mb-2">Consultation with {selectedAppointment?.patient?.name || 'Patient'}</h2>
            <p className="text-sm text-gray-400 mb-4">Appointment ID: {selectedAppointment?._id}</p>

            {/* Main Patient Video */}
            <div className="flex-grow bg-black rounded-lg flex items-center justify-center relative">
              <UserCircle className="w-32 h-32 text-gray-600" />
              <span className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm font-semibold">{selectedAppointment?.patient?.name || 'Patient'}</span>
            </div>

            {/* Doctor's Self View */}
            <div className="absolute top-20 right-6 w-40 h-28 bg-gray-800 border-2 border-gray-500 rounded-md flex items-center justify-center">
              <UserCircle className="w-12 h-12 text-gray-500" />
              <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 px-1 rounded text-xs">You</span>
            </div>

            {/* Call Controls */}
            <div className="mt-4 flex justify-center items-center gap-6">
              <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600"><MicOff className="w-6 h-6" /></button>
              <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600"><VideoOff className="w-6 h-6" /></button>
              <button onClick={resetReportForm} className="p-4 bg-red-600 rounded-full hover:bg-red-700"><PhoneOff className="w-6 h-6" /></button>
            </div>
          </div>

          {/* Right Side: Report Form */}
          <div className="w-3/5 bg-white max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-mono font-bold text-cyan-900 flex items-center gap-2"><FileText className="w-6 h-6" /> Complete Medical Report</h3>
                <button onClick={resetReportForm} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-mono font-semibold text-gray-800 mb-3">Patient Information</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-base font-mono font-semibold text-gray-700 mb-1">Patient Name *</label>
                      <input type="text" value={reportForm.patient.name} onChange={(e) => setReportForm(prev => ({ ...prev, patient: { ...prev.patient, name: e.target.value } }))} className="w-full p-3 border border-gray-300 rounded-md font-mono text-lg text-gray-900" required />
                    </div>
                    <div>
                      <label className="block text-base font-mono font-semibold text-gray-700 mb-1">Age *</label>
                      <input type="number" value={reportForm.patient.age} onChange={(e) => setReportForm(prev => ({ ...prev, patient: { ...prev.patient, age: e.target.value } }))} className="w-full p-3 border border-gray-300 rounded-md font-mono text-lg text-gray-900" required />
                    </div>
                    <div>
                      <label className="block text-base font-mono font-semibold text-gray-700 mb-1">Gender *</label>
                      <select value={reportForm.patient.gender} onChange={(e) => setReportForm(prev => ({ ...prev, patient: { ...prev.patient, gender: e.target.value } }))} className="w-full p-3 border border-gray-300 rounded-md font-mono text-lg text-gray-900" required>
                        <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-lg font-mono font-semibold text-gray-800 mb-3">Symptoms</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {commonSymptoms.map(symptom => (
                      <label key={symptom} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={reportForm.symptoms.includes(symptom)} onChange={() => handleSymptomToggle(symptom)} className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                        <span className="text-base text-gray-800 font-mono">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Diagnosis and Treatment */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-lg font-mono font-semibold text-gray-800 mb-3">Clinical Assessment</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base font-mono font-semibold text-gray-700 mb-1">Diagnosis *</label>
                      <textarea
                        value={reportForm.diagnosis}
                        onChange={(e) => setReportForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                        className="w-full p-4 border border-gray-300 rounded-md font-mono text-lg text-gray-900 placeholder-gray-400"
                        rows={4}
                        placeholder="Enter diagnosis details..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-base font-mono font-semibold text-gray-700 mb-1">Treatment Plan *</label>
                      <textarea
                        value={reportForm.treatment}
                        onChange={(e) => setReportForm(prev => ({ ...prev, treatment: e.target.value }))}
                        className="w-full p-4 border border-gray-300 rounded-md font-mono text-lg text-gray-900 placeholder-gray-400"
                        rows={4}
                        placeholder="Enter treatment plan..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Medicines */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-mono font-semibold text-gray-800 flex items-center"><Pill className="w-5 h-5 text-purple-600 mr-2" />Prescription</h4>
                    <button type="button" onClick={() => setShowMedicineForm(true)} className="flex items-center px-3 py-1.5 bg-purple-600 text-white font-mono rounded-md hover:bg-purple-700 text-base">
                      <Plus className="w-4 h-4 mr-1" /> Add Medicine
                    </button>
                  </div>
                  {reportForm.prescription.length > 0 && (
                    <div className="space-y-2">
                      {reportForm.prescription.map(med => (
                        <div key={med.id} className="bg-white p-3 rounded-md border border-purple-200 flex justify-between items-start">
                          <div className="flex-1 text-base text-gray-800 font-mono">
                            <h5 className="font-semibold text-gray-900 text-lg">{med.name}</h5>
                            <p><strong>Dosage:</strong> {med.dosage} | <strong>Frequency:</strong> {med.frequency}</p>
                            {med.timing.length > 0 && <p><strong>Timing:</strong> {med.timing.join(', ')}</p>}
                            {med.duration && <p><strong>Duration:</strong> {med.duration}</p>}
                            {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                          </div>
                          <button type="button" onClick={() => removeMedicine(med.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={resetReportForm} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-mono rounded hover:bg-gray-50 text-lg">Cancel</button>
                  <button
                    type="button"
                    onClick={handleCompleteReport}
                    disabled={submittingReport || !reportForm.diagnosis || !reportForm.treatment || !reportForm.patient.name}
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-mono rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                  >
                    {submittingReport ? (<><Loader2 className="w-4 h-4 animate-spin" />Completing...</>) : (<><CheckCircle className="w-4 h-4" />Complete Report</>)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Form Modal */}
      {showMedicineForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-mono font-semibold mb-4 text-gray-900">Add Medicine</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-base font-mono font-semibold text-gray-700 mb-1">Medicine Name *</label>
                <input type="text" value={currentMedicine.name} onChange={(e) => setCurrentMedicine(prev => ({ ...prev, name: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-md font-mono text-lg text-gray-900" />
              </div>
              <div>
                <label className="block text-base font-mono font-semibold text-gray-700 mb-1">Dosage</label>
                <input type="text" value={currentMedicine.dosage} onChange={(e) => setCurrentMedicine(prev => ({ ...prev, dosage: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-md font-mono text-lg text-gray-900" />
              </div>
              <div>
                <label className="block text-base font-mono font-semibold text-gray-700 mb-1">Frequency *</label>
                <select value={currentMedicine.frequency} onChange={(e) => setCurrentMedicine(prev => ({ ...prev, frequency: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-md font-mono text-lg text-gray-900">
                  <option value="">Select Frequency</option>
                  {frequencyOptions.map(freq => <option key={freq} value={freq}>{freq}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-base font-mono font-semibold text-gray-700 mb-1">Timing</label>
                <div className="grid grid-cols-2 gap-1">
                  {medicineTimings.map(timing => (
                    <label key={timing} className="flex items-center space-x-1 text-base font-mono text-gray-800">
                      <input type="checkbox" checked={currentMedicine.timing.includes(timing)} onChange={() => handleTimingToggle(timing)} className="w-4 h-4" />
                      <span>{timing}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={() => setShowMedicineForm(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 font-mono text-lg">Cancel</button>
              <button type="button" onClick={addMedicine} disabled={!currentMedicine.name || !currentMedicine.frequency} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-mono disabled:opacity-50 text-lg">Add Medicine</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}