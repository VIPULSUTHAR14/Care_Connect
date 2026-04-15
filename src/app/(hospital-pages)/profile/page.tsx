"use client";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Mail, MapPin, Phone, ShieldCheck, Calendar, Image as ImageIcon, UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Hospital = {
  name: string;
  email: string;
  address: string;
  reception_number?: string;
  ambulance_number?: string;
  nha_registration_number?: string;
  role?: string;
  createdAt?: string;
  images?: string[];
  [key: string]: any;
};

const ProfileDetail = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 text-cyan-600">{icon}</div>
      <div className="flex flex-col">
        <span className="text-base text-gray-500">{label}</span>
        <span className="text-lg text-gray-900 font-semibold">{value}</span>
      </div>
    </div>
  );
};

export default function HospitalProfilePage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/signin-hospital");
      return;
    }
    if (status === "authenticated" && session?.user?.userType !== "hospital") {
      router.replace("/doctor/dashboard");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hospital-api/profile");
        if (!res.ok) {
          setError("Failed to fetch hospital profile");
          setHospital(null);
        } else {
          const data = await res.json();
          if (data && data.hospital) {
            setHospital(data.hospital);
          } else {
            setError("No hospital data found");
            setHospital(null);
          }
        }
      } catch (err) {
        setError("An unexpected error occurred");
        setHospital(null);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated" && session?.user?.userType === "hospital") {
      fetchProfile();
    }
  }, [status, session]);

  // --- UI STATES ---

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 to-white text-cyan-800 font-mono flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-20 w-20 animate-spin text-cyan-500" />
        <div className="text-4xl text-cyan-600 tracking-widest font-bold">
          CHECKING SESSION...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 to-white text-cyan-800 font-mono flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-20 w-20 animate-spin text-cyan-500" />
        <div className="text-4xl text-cyan-600 tracking-widest font-bold">
          LOADING PROFILE...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 to-white text-cyan-800 font-mono flex flex-col items-center justify-center gap-6">
        <AlertTriangle className="h-20 w-20 text-red-500" />
        <div className="text-4xl text-red-500 tracking-widest font-bold">
          ERROR: {error}
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 to-white text-cyan-800 font-mono flex flex-col items-center justify-center gap-6">
        <div className="text-4xl text-gray-400 tracking-widest font-bold">
          NO HOSPITAL DATA FOUND.
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-screen bg-gradient-to-br from-cyan-50 to-white text-cyan-900 font-mono flex items-center justify-center p-0 sm:p-0">
      <div className="w-full h-[92vh] max-w-[1800px] bg-white rounded-3xl shadow-2xl border border-cyan-100 p-0 sm:p-0 overflow-hidden flex flex-col">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-cyan-100/60 px-8 py-10 border-b border-cyan-200">
          <div className="flex-shrink-0 flex items-center justify-center w-40 h-40 rounded-full bg-cyan-200/60 border-4 border-cyan-300 shadow">
            <ImageIcon size={80} className="text-cyan-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-cyan-700 tracking-wide mb-2">
              {hospital.name}
            </h1>
            <p className="text-xl sm:text-2xl text-cyan-800 flex items-center justify-center md:justify-start gap-2">
              <MapPin className="h-7 w-7 text-cyan-500" />
              {hospital.address}
            </p>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex flex-col md:flex-row gap-0 md:gap-12 p-8 flex-1">
          {/* Column 1: Contact & Official Details */}
          <div className="w-full md:w-1/2 flex flex-col gap-12 justify-center">
            <div className="space-y-8">
              <ProfileDetail icon={<Mail size={32} />} label="Email" value={hospital.email} />
              <ProfileDetail icon={<Phone size={32} />} label="Reception" value={hospital.reception_number} />
              <ProfileDetail icon={<Phone size={32} color="#f87171" />} label="Ambulance" value={hospital.ambulance_number} />
              <ProfileDetail icon={<ShieldCheck size={32} />} label="NHA Registration" value={hospital.nha_registration_number} />
              <ProfileDetail icon={<UserCircle size={32} />} label="Role" value={hospital.role} />
              <ProfileDetail
                icon={<Calendar size={32} />}
                label="Profile Created"
                value={hospital.createdAt ? new Date(hospital.createdAt).toLocaleString() : "N/A"}
              />
            </div>
          </div>

          {/* Column 2: Image Gallery */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon size={32} className="text-cyan-500" />
              <h2 className="text-2xl text-cyan-700 font-semibold">Image Gallery</h2>
            </div>
            {Array.isArray(hospital.images) && hospital.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-6 w-full">
                {hospital.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden border border-cyan-100 shadow hover:shadow-lg transition-all duration-200 bg-cyan-50"
                  >
                    <img
                      src={img}
                      alt={`Hospital image ${idx + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-base">No images available.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}