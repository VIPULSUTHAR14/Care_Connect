"use client";

import { useEffect, useState } from "react";

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
}

interface DoctorListProps {
  onCall: (doctorId: string) => void;
}

export default function DoctorList({ onCall }: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");
        const data = await res.json();
        if (data.success) {
          setDoctors(data.data);
        } else {
          setError(data.message || "Failed to fetch doctors");
        }
      } catch (err) {
        setError("Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading doctors...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (doctors.length === 0) {
    return <p className="text-gray-500">No doctors available</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {doctors.map((doctor) => (
        <div
          key={doctor._id}
          className="p-4 border rounded-lg shadow hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold">{doctor.name}</h3>
          <p className="text-sm text-gray-600">{doctor.specialty}</p>
          <button
            onClick={() => onCall(doctor._id)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Call
          </button>
        </div>
      ))}
    </div>
  );
}
