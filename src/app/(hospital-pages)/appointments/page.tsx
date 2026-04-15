"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, UserCircle2, ClipboardList, CheckCircle2, AlertCircle, FileText, CheckCircle, Plus, Trash2, User, Calendar, Pill, UserPlus } from "lucide-react";
import { useSocketContext } from "@/app/contexts/SocketContext";
import React from "react";
import AssignDoctorModal from "@/components/features/assign/AssignDoctorModal";

type Appointment = {
  _id: string;
  patientId: string;
  hospitalId: string;
  status: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 border-yellow-300 text-yellow-900",
  approved: "bg-green-100 border-green-300 text-green-900",
  completed: "bg-cyan-100 border-cyan-300 text-cyan-900",
  cancelled: "bg-red-100 border-red-300 text-red-900",
  rejected: "bg-red-100 border-red-300 text-red-900",
};

const statusBadge: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: {
    color: "bg-yellow-500 text-white",
    icon: <ClipboardList className="w-4 h-4 mr-1" />,
  },
  approved: {
    color: "bg-green-600 text-white",
    icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
  },
  completed: {
    color: "bg-cyan-700 text-white",
    icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
  },
  cancelled: {
    color: "bg-red-600 text-white",
    icon: <AlertCircle className="w-4 h-4 mr-1" />,
  },
  rejected: {
    color: "bg-red-600 text-white",
    icon: <AlertCircle className="w-4 h-4 mr-1" />,
  },
};

function getStatusBadge(status: string) {
  const badge = statusBadge[status] || {
    color: "bg-gray-400 text-white",
    icon: <ClipboardList className="w-4 h-4 mr-1" />,
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold ${badge.color}`}>
      {badge.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
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
  // Patient Information
  patient: {
    name: string;
    age: string;
    gender: string;
  };
  // Clinical Information
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  // Prescription
  prescription: Medicine[];
  // Follow-up and Notes
  notes: string;
  followUpDate: string;
  followUpInstructions: string;
};

export default function Appointments() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const { sendPatientNotification } = useSocketContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Appointment[]>([]);
  const [showReportForm, setShowReportForm] = useState<string | null>(null);
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
    name: '',
    dosage: '',
    frequency: '',
    timing: [] as string[],
    duration: '',
    instructions: ''
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
    'Before Dinner', 'After Dinner', 'Morning', 'Afternoon', 'Evening',
    'Night', 'Bedtime', 'Empty Stomach', 'With Food'
  ];

  const frequencyOptions = [
    'Once Daily', 'Twice Daily', 'Three Times Daily', 'Four Times Daily',
    'Every 4 Hours', 'Every 6 Hours', 'Every 8 Hours', 'Every 12 Hours',
    'As Needed', 'Weekly', 'Twice Weekly'
  ];

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    if (status === "authenticated" && session?.user?.userType !== "hospital") {
      router.replace("/doctor/dashboard");
      return;
    }
  }, [status, session, router]);

  const fetchAppointments = useCallback(async () => {
    try {
      if (status !== "authenticated") return;
      const hospitalId = session?.user?.id;
      if (!hospitalId) return;
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/doctor-api/appointments?hospitalId=${hospitalId}`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      const list: Appointment[] = (data.appointments || []).map((d: any) => ({
        _id: String(d._id),
        patientId: String(d.patientId),
        hospitalId: String(d.hospitalId),
        status: String(d.status),
        note: d.note ? String(d.note) : undefined,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Error loading appointments");
    } finally {
      setLoading(false);
    }
  }, [status, session]);


  useEffect(() => {
    void fetchAppointments();
  }, [fetchAppointments])


  const pending = useMemo(() => items.filter(a => a.status === "pending"), [items]);
  const others = useMemo(() => items.filter(a => a.status !== "pending"), [items]);

  // Enhanced form handlers
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
      const newMedicine: Medicine = {
        ...currentMedicine,
        id: Date.now()
      };
      setReportForm(prev => ({
        ...prev,
        prescription: [...prev.prescription, newMedicine]
      }));
      setCurrentMedicine({
        name: '',
        dosage: '',
        frequency: '',
        timing: [],
        duration: '',
        instructions: ''
      });
      setShowMedicineForm(false);
    }
  };

  const removeMedicine = (id: number) => {
    setReportForm(prev => ({
      ...prev,
      prescription: prev.prescription.filter(med => med.id !== id)
    }));
  };

  const resetReportForm = () => {
    setReportForm({
      patient: { name: '', age: '', gender: '' },
      symptoms: [],
      diagnosis: '',
      treatment: '',
      prescription: [],
      notes: '',
      followUpDate: '',
      followUpInstructions: ''
    });
    setShowReportForm(null);
  };

  const handleCompleteReport = async (appointmentId: string, patientId: string) => {
    try {
      setSubmittingReport(true);

      // 1. Create the enhanced report
      const reportData = {
        appointmentId,
        patientId,
        hospitalId: session?.user?.id,
        // Enhanced data structure
        patient: reportForm.patient,
        symptoms: reportForm.symptoms,
        diagnosis: reportForm.diagnosis,
        treatment: reportForm.treatment,
        prescription: reportForm.prescription.map(med => ({
          medicine: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          timing: med.timing,
          duration: med.duration,
          instructions: med.instructions
        })),
        notes: reportForm.notes,
        followUpDate: reportForm.followUpDate,
        followUpInstructions: reportForm.followUpInstructions,
        completedAt: new Date().toISOString(),
      };

      const reportRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!reportRes.ok) throw new Error("Failed to create report");

      // 2. Update appointment status to completed
      const updateRes = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          status: "completed",
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to update appointment");

      // 3. Send notification to patient
      sendPatientNotification({
        patientId,
        message: `Your medical report is ready. Patient: ${reportForm.patient.name}, Diagnosis: ${reportForm.diagnosis}`,
        type: "test-result",
      });

      // 4. Refresh appointments
      const res = await fetch(`/api/appointments?hospitalId=${session?.user?.id}`);
      if (res.ok) {
        const data = await res.json();
        const list: Appointment[] = (data.appointments || []).map((d: any) => ({
          _id: String(d._id),
          patientId: String(d.patientId),
          hospitalId: String(d.hospitalId),
          status: String(d.status),
          note: d.note ? String(d.note) : undefined,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        }));
        setItems(list);
      }

      // 5. Reset form and close
      resetReportForm();
    } catch (e: any) {
      setError(e?.message || "Failed to complete report");
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <>

      <div className="max-w-screen min-h-[90vh] bg-gray-100 mx-auto px-2 sm:px-6 py-10">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-mono font-extrabold text-cyan-900 mb-1 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-cyan-700 drop-shadow" />
              <span>Appointments</span>
            </h1>
            <p className="text-cyan-700 font-mono text-base">
              Manage and review all your hospital's appointment requests.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 font-mono text-xs px-3 py-1 rounded-full border border-yellow-200">
              <ClipboardList className="w-4 h-4" /> Pending: <span className="font-bold">{pending.length}</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 font-mono text-xs px-3 py-1 rounded-full border border-cyan-200">
              <CheckCircle2 className="w-4 h-4" /> Other: <span className="font-bold">{others.length}</span>
            </span>
          </div>
        </div>

        {status === "loading" && (
          <div className="min-h-[200px] w-full flex items-center justify-center text-gray-600 font-mono text-lg animate-pulse">
            <Loader2 className="animate-spin mr-2" size={22} /> Checking session...
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-cyan-700 text-base mb-4 font-mono animate-pulse">
            <Loader2 className="animate-spin" size={20} /> Loading appointments…
          </div>
        )}
        {error && (
          <div className="mb-4 text-base text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 font-mono flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pending Appointments */}
          <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-mono font-bold text-yellow-900 mb-6 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-yellow-700" />
              Pending Appointments
            </h2>
            {pending.length === 0 ? (
              <div className="text-base text-yellow-700 font-mono text-center py-8">
                <span className="opacity-70">No pending appointments.</span>
              </div>
            ) : (
              <ul className="space-y-5">
                {pending.map((a) => (
                  <li
                    key={a._id}
                    className="rounded-xl border border-yellow-100 bg-white px-5 py-4 flex flex-col gap-2 shadow-md hover:shadow-lg transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCircle2 className="w-6 h-6 text-yellow-700" />
                        <span className="font-mono text-yellow-900 text-base">
                          <span className="font-semibold">Patient:</span>{" "}
                          <span className="font-bold tracking-wide">{a.patientId}</span>
                        </span>
                      </div>
                      {getStatusBadge(a.status)}
                    </div>
                    <div className="flex flex-wrap items-center justify-between mt-1 gap-2">
                      <span className="text-xs text-gray-500 font-mono">
                        <span className="font-semibold">Created:</span> {new Date(a.createdAt).toLocaleString()}
                      </span>
                      {a.note && (
                        <span className="text-xs text-yellow-800 font-mono bg-yellow-100 px-2 py-0.5 rounded">
                          <span className="font-semibold">Note:</span> {a.note}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedAppointment(a);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-mono rounded-lg shadow hover:bg-cyan-700 transition-colors font-semibold"
                      >
                        <UserPlus className="w-5 h-5" />
                        Assign Doctor
                      </button>
                      <button
                        onClick={() => {
                          // ADD THIS CONSOLE LOG:
                          console.log("Assigning Appointment:", a);
                          setSelectedAppointment(a);
                        }}
                        className="..."
                      >
                        <UserPlus className="w-5 h-5" />
                        Assign Doctor
                      </button>
                      <button
                        onClick={() => setShowReportForm(a._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-mono rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-colors font-semibold"
                      >
                        <FileText className="w-5 h-5" />
                        Complete Report
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Other Appointments */}
          <section className="bg-cyan-50 border border-cyan-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-mono font-bold text-cyan-900 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-cyan-700" />
              Other Appointments
            </h2>
            {others.length === 0 ? (
              <div className="text-base text-cyan-700 font-mono text-center py-8">
                <span className="opacity-70">No other appointments.</span>
              </div>
            ) : (
              <ul className="space-y-5">
                {others.map((a) => (
                  <li
                    key={a._id}
                    className={`rounded-xl border px-5 py-4 flex flex-col gap-2 shadow-md hover:shadow-lg transition group ${statusColor[a.status] || "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCircle2 className="w-6 h-6 text-cyan-700" />
                        <span className="font-mono text-cyan-900 text-base">
                          <span className="font-semibold">Patient:</span>{" "}
                          <span className="font-bold tracking-wide">{a.patientId}</span>
                        </span>
                      </div>
                      {getStatusBadge(a.status)}
                    </div>
                    <div className="flex flex-wrap items-center justify-between mt-1 gap-2">
                      <span className="text-xs text-gray-500 font-mono">
                        <span className="font-semibold">Updated:</span> {new Date(a.updatedAt).toLocaleString()}
                      </span>
                      {a.note && (
                        <span className="text-xs text-cyan-800 font-mono bg-cyan-100 px-2 py-0.5 rounded">
                          <span className="font-semibold">Note:</span> {a.note}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Enhanced Report Form Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-mono font-bold text-cyan-900 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Complete Medical Report
                  </h3>
                  <button
                    onClick={resetReportForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Patient Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <User className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="text-lg font-mono font-semibold text-gray-800">Patient Information</h4>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Patient Name *</label>
                        <input
                          type="text"
                          value={reportForm.patient.name}
                          onChange={(e) => setReportForm(prev => ({
                            ...prev,
                            patient: { ...prev.patient, name: e.target.value }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Age *</label>
                        <input
                          type="number"
                          value={reportForm.patient.age}
                          onChange={(e) => setReportForm(prev => ({
                            ...prev,
                            patient: { ...prev.patient, age: e.target.value }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Gender *</label>
                        <select
                          value={reportForm.patient.gender}
                          onChange={(e) => setReportForm(prev => ({
                            ...prev,
                            patient: { ...prev.patient, gender: e.target.value }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
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
                          <input
                            type="checkbox"
                            checked={reportForm.symptoms.includes(symptom)}
                            onChange={() => handleSymptomToggle(symptom)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 font-mono">{symptom}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Diagnosis and Treatment */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="text-lg font-mono font-semibold text-gray-800">Clinical Assessment</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Diagnosis *</label>
                        <textarea
                          value={reportForm.diagnosis}
                          onChange={(e) => setReportForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                          rows={3}
                          placeholder="Enter diagnosis details..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Treatment Plan *</label>
                        <textarea
                          value={reportForm.treatment}
                          onChange={(e) => setReportForm(prev => ({ ...prev, treatment: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                          rows={3}
                          placeholder="Enter treatment plan..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medicines */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Pill className="w-5 h-5 text-purple-600 mr-2" />
                        <h4 className="text-lg font-mono font-semibold text-gray-800">Prescription</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMedicineForm(true)}
                        className="flex items-center px-3 py-1.5 bg-purple-600 text-white font-mono rounded-md hover:bg-purple-700 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Medicine
                      </button>
                    </div>

                    {/* Medicine List */}
                    {reportForm.prescription.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {reportForm.prescription.map(medicine => (
                          <div key={medicine.id} className="bg-white p-3 rounded-md border border-purple-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-800 font-mono">{medicine.name}</h5>
                                <p className="text-sm text-gray-600 font-mono">
                                  <strong>Dosage:</strong> {medicine.dosage} | <strong>Frequency:</strong> {medicine.frequency}
                                </p>
                                {medicine.timing.length > 0 && (
                                  <p className="text-sm text-gray-600 font-mono">
                                    <strong>Timing:</strong> {medicine.timing.join(', ')}
                                  </p>
                                )}
                                {medicine.duration && (
                                  <p className="text-sm text-gray-600 font-mono">
                                    <strong>Duration:</strong> {medicine.duration}
                                  </p>
                                )}
                                {medicine.instructions && (
                                  <p className="text-sm text-gray-600 font-mono">
                                    <strong>Instructions:</strong> {medicine.instructions}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMedicine(medicine.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Follow-up and Notes */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Calendar className="w-5 h-5 text-yellow-600 mr-2" />
                      <h4 className="text-lg font-mono font-semibold text-gray-800">Follow-up & Notes</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Follow-up Date</label>
                          <input
                            type="date"
                            value={reportForm.followUpDate}
                            onChange={(e) => setReportForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Follow-up Instructions</label>
                          <textarea
                            value={reportForm.followUpInstructions}
                            onChange={(e) => setReportForm(prev => ({ ...prev, followUpInstructions: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono"
                            rows={2}
                            placeholder="Follow-up instructions..."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Additional Notes</label>
                        <textarea
                          value={reportForm.notes}
                          onChange={(e) => setReportForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono"
                          rows={4}
                          placeholder="Additional notes, observations, or recommendations..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetReportForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-mono rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const appointment = pending.find(a => a._id === showReportForm);
                        if (appointment) {
                          handleCompleteReport(appointment._id, appointment.patientId);
                        }
                      }}
                      disabled={submittingReport || !reportForm.diagnosis || !reportForm.treatment || !reportForm.patient.name || !reportForm.patient.age || !reportForm.patient.gender}
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-mono rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submittingReport ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Complete Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medicine Form Modal */}
        {showMedicineForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-mono font-semibold mb-4">Add Medicine</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    value={currentMedicine.name}
                    onChange={(e) => setCurrentMedicine(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 font-mono"
                    placeholder="e.g., Paracetamol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={currentMedicine.dosage}
                    onChange={(e) => setCurrentMedicine(prev => ({ ...prev, dosage: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 font-mono"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Frequency *</label>
                  <select
                    value={currentMedicine.frequency}
                    onChange={(e) => setCurrentMedicine(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 font-mono"
                  >
                    <option value="">Select Frequency</option>
                    {frequencyOptions.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Timing</label>
                  <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                    {medicineTimings.map(timing => (
                      <label key={timing} className="flex items-center space-x-1 text-xs font-mono">
                        <input
                          type="checkbox"
                          checked={currentMedicine.timing.includes(timing)}
                          onChange={() => handleTimingToggle(timing)}
                          className="w-3 h-3"
                        />
                        <span>{timing}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={currentMedicine.duration}
                    onChange={(e) => setCurrentMedicine(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 font-mono"
                    placeholder="e.g., 7 days"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono font-semibold text-gray-700 mb-1">Special Instructions</label>
                  <textarea
                    value={currentMedicine.instructions}
                    onChange={(e) => setCurrentMedicine(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 font-mono"
                    rows={2}
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowMedicineForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addMedicine}
                  disabled={!currentMedicine.name || !currentMedicine.frequency}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Medicine
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedAppointment && (
        <AssignDoctorModal
          appointment={selectedAppointment} // Pass the full object
          onClose={() => setSelectedAppointment(null)}
          onAssignSuccess={() => {
            setSelectedAppointment(null);
            fetchAppointments();
          }}
        />
      )}
    </>
  );
}