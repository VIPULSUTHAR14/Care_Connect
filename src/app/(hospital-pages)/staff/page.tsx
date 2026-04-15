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
  [key: string]: any;
};

export default function HospitalStaffPage() {
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

  return (
    <main className="min-h-screen w-screen bg-gradient-to-br from-cyan-50 to-white text-cyan-900 font-mono flex flex-col items-center py-8">
      <h1 className="text-4xl font-extrabold text-cyan-800 mb-8 font-mono drop-shadow">
        Hospital Staff
      </h1>
      {loading ? (
        <div className="flex flex-col items-center gap-4 mt-20">
          <Loader2 className="h-16 w-16 animate-spin text-cyan-500" />
          <span className="text-2xl text-cyan-600 font-bold">Loading staff...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 mt-20">
          <AlertTriangle className="h-16 w-16 text-red-500" />
          <span className="text-2xl text-red-500 font-bold">Error: {error}</span>
        </div>
      ) : staff.length === 0 ? (
        <div className="text-gray-400 text-2xl font-semibold mt-20">
          No staff members found.
        </div>
      ) : (
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-8">
          {staff.map((member, idx) => (
            <div
              key={member._id || idx}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-cyan-100 hover:shadow-2xl transition"
            >
              <div className="flex items-center gap-4">
                <UserCircle className="h-12 w-12 text-cyan-500" />
                <div>
                  <div className="text-xl font-bold text-cyan-800">{member.name}</div>
                  <div className="text-base text-cyan-600 capitalize">{member.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-700">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-cyan-400" />
                  <span className="text-gray-700">{member.phone}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
