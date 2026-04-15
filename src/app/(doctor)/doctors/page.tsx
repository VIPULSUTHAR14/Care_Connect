"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Calendar,
  Award,
  Phone,
  Mail,
  Clock,
  Stethoscope,
  BriefcaseMedical,
} from "lucide-react";
import Link from "next/link";

// Define the Doctor type for TypeScript
interface Doctor {
  _id: string;
  name: string;
  department: string;
  qualification: string;
  experience: number;
  medicalCollege: string;
  address: string;
  phoneNumber: string;
  email: string;
  currentHospital: string;
  nmcRegistrationNumber: string;
  stateMedicalCouncil: string;
  isVerified: boolean;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors");
        if (!response.ok) {
          throw new Error("Failed to fetch data from the server.");
        }
        const result = await response.json();

        if (result.success) {
          setDoctors(result.data);
        } else {
          setError(result.message || "An error occurred while fetching doctors.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border-2 border-red-200">
          <div className="text-red-500 text-2xl mb-4 font-extrabold font-mono">
            Oops! Something went wrong.
          </div>
          <p className="text-gray-600 font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/90 shadow-md border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-10 w-10 text-cyan-700 animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-extrabold font-mono text-cyan-900 tracking-tight">
              Meet Our Doctors
            </h1>
          </div>
          <p className="mt-2 md:mt-0 text-cyan-800 font-mono text-lg font-semibold">
            Book appointments with trusted medical professionals.
          </p>
        </div>
      </header>

      {/* Doctors Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <User className="h-20 w-20 text-cyan-200 mb-6" />
            <h2 className="text-2xl font-bold text-cyan-800 font-mono">
              No Doctors Found
            </h2>
            <p className="text-cyan-600 mt-2 font-mono">
              No doctors are available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="group bg-white rounded-3xl shadow-xl border-2 border-cyan-100 hover:border-cyan-300 transition-all duration-300 flex flex-col overflow-hidden hover:scale-[1.025]"
              >
                {/* Doctor Avatar & Header */}
                <div className="bg-gradient-to-br from-cyan-400 via-cyan-600 to-blue-500 p-6 text-center relative">
                  <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-3 shadow-lg border-4 border-cyan-200 group-hover:scale-105 transition-transform">
                    <User className="h-12 w-12 text-cyan-700" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white capitalize font-mono drop-shadow">
                    Dr. {doctor.name}
                  </h3>
                  <p className="text-cyan-100 text-md font-mono font-semibold">
                    {doctor.department}
                  </p>
                  <div className="mt-3">
                    {doctor.isVerified ? (
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold font-mono shadow">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold font-mono shadow">
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center text-cyan-900 font-mono text-sm">
                      <Award className="h-5 w-5 mr-2 text-cyan-400" />
                      <span>{doctor.qualification}</span>
                    </div>
                    <div className="flex items-center text-cyan-900 font-mono text-sm">
                      <Clock className="h-5 w-5 mr-2 text-cyan-400" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                    <div className="flex items-center text-cyan-900 font-mono text-sm">
                      <Calendar className="h-5 w-5 mr-2 text-cyan-400" />
                      <span className="capitalize">{doctor.medicalCollege}</span>
                    </div>
                    <div className="flex items-start text-cyan-900 font-mono text-sm">
                      <MapPin className="h-5 w-5 mr-2 text-cyan-400 mt-0.5" />
                      <span className="capitalize">{doctor.address}</span>
                    </div>
                    <div className="flex items-center text-cyan-900 font-mono text-sm">
                      <BriefcaseMedical className="h-5 w-5 mr-2 text-cyan-400" />
                      <span>
                        <span className="font-bold text-cyan-700">
                          Current Hospital:
                        </span>{" "}
                        <span className="capitalize">
                          {doctor.currentHospital || "N/A"}
                        </span>
                      </span>
                    </div>
                    <div className="border-t border-cyan-100 pt-4 mt-4 space-y-2">
                      <div className="flex items-center text-cyan-900 font-mono text-sm">
                        <Phone className="h-5 w-5 mr-2 text-cyan-400" />
                        <span>{doctor.phoneNumber}</span>
                      </div>
                      <div className="flex items-center text-cyan-900 font-mono text-sm">
                        <Mail className="h-5 w-5 mr-2 text-cyan-400" />
                        <span>{doctor.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Appointment Button */}
                  <Link
                    href={{
                      pathname: "/hospitals",
                      query: { doctorId: doctor._id },
                    }}
                    className="mt-6 font-mono font-bold text-white flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-lg hover:from-cyan-500 hover:to-cyan-300 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 text-md"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
