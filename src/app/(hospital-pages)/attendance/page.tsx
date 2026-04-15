"use client";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, UserCircle, Mail, Phone } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type StaffMember = {
  _id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  available?: boolean;
  [key: string]: any;
};

export default function HospitalAttendancePage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    async function fetchStaff() {
      setLoading(true);
      setError(null);
      try {
        // Fetch hospital profile to get staff list
        const res = await fetch("/api/hospital-api/profile", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to fetch hospital data");
        }
        const data = await res.json();
        // Assume staff is in data.hospital.staff or data.hospital.doctors
        let staffList: StaffMember[] = [];
        if (Array.isArray(data.hospital.staff)) {
          staffList = data.hospital.staff;
        } else if (Array.isArray(data.hospital.doctors)) {
          staffList = data.hospital.doctors;
        }
        setStaff(staffList);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated" && session?.user?.userType === "hospital") {
      fetchStaff();
    }
  }, [status, session]);

  // Handler for radio button change (local state only)
  const handleAvailabilityChange = (idx: number, value: boolean) => {
    setStaff((prev) =>
      prev.map((member, i) =>
        i === idx ? { ...member, available: value } : member
      )
    );
  };

  return (
    <main className="min-h-screen w-screen bg-gradient-to-br from-cyan-50 to-white text-cyan-900 font-mono flex flex-col items-center py-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-800 mb-10 font-mono drop-shadow text-center">
        Staff Attendance
      </h1>
      {loading ? (
        <div className="flex flex-col items-center gap-6 mt-24">
          <Loader2 className="h-20 w-20 animate-spin text-cyan-500" />
          <span className="text-2xl md:text-3xl text-cyan-600 font-bold">Loading staff...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-6 mt-24">
          <AlertTriangle className="h-20 w-20 text-red-500" />
          <span className="text-2xl md:text-3xl text-red-500 font-bold">Error: {error}</span>
        </div>
      ) : staff.length === 0 ? (
        <div className="text-gray-400 text-2xl md:text-3xl font-semibold mt-24 text-center">
          No staff members found.
        </div>
      ) : (
        <div className="w-[90vw] max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {staff.map((member, idx) => (
            <div
              key={member._id || idx}
              className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border border-cyan-100 hover:shadow-2xl transition-all hover:-translate-y-1.5 min-h-[260px]"
            >
              <div className="flex items-center gap-5 mb-2">
                <UserCircle className="h-14 w-14 text-cyan-500" />
                <div>
                  <div className="text-2xl font-bold text-cyan-800">{member.name}</div>
                  <div className="text-base text-cyan-600 capitalize">{member.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-700 break-all">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-cyan-400" />
                  <span className="text-gray-700">{member.phone}</span>
                </div>
              )}
              <div className="flex flex-col gap-2 mt-4">
                <span className="font-semibold text-cyan-700 text-lg">Attendance:</span>
                <div className="flex gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`attendance-${idx}`}
                      checked={member.available === true}
                      onChange={() => handleAvailabilityChange(idx, true)}
                      className="accent-green-500 w-5 h-5"
                    />
                    <span className="text-green-600 font-semibold">Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`attendance-${idx}`}
                      checked={member.available === false}
                      onChange={() => handleAvailabilityChange(idx, false)}
                      className="accent-gray-400 w-5 h-5"
                    />
                    <span className="text-gray-500 font-semibold">Not Available</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}