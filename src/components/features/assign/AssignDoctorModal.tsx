"use client";
import { useEffect, useState } from "react";
import { Loader2, User, X } from "lucide-react";

type Doctor = {
  _id: string;
  name: string;
  specialty?: string;
};

type AssignDoctorModalProps = {
  appointment: any;
  onClose: () => void;
  onAssignSuccess: () => void;
};

export default function AssignDoctorModal({
  appointment,
  onClose,
  onAssignSuccess,
}: AssignDoctorModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        // CORRECTED URL: 'hospital' should be singular to match your API route folder.
        const res = await fetch("/api/hospital-api/hospital_doctors");
        if (!res.ok) {
          throw new Error("Failed to fetch doctors list.");
        }
        const data = await res.json();
        setDoctors(data.doctors);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleAssign = async (doctorId: string) => {
    try {
      if (!appointment?._id || !doctorId) {
        throw new Error("Missing appointmentId or doctorId");
      }
      setAssigning(doctorId);
      const res = await fetch("/api/doctor-api/appointments/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment._id,
          doctorId: doctorId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to assign appointment");
      }
      onAssignSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-xl font-mono font-bold text-cyan-900">Assign Doctor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-cyan-600" /></div>}
          {error && <div className="text-red-600 text-center font-mono p-4">{error}</div>}
          {!loading && !error && (
            <ul className="space-y-3">
              {doctors.length > 0 ? (
                doctors.map((doc) => (
                  <li key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-mono font-semibold text-gray-800">{doc.name}</span>
                    </div>
                    <button
                      onClick={() => handleAssign(doc._id)}
                      disabled={!!assigning}
                      className="px-3 py-1 bg-cyan-600 text-white text-sm font-mono rounded-md hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                    >
                      {assigning === doc._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign"}
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500 font-mono py-4">No doctors found.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}