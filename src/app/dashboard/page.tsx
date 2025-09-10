"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const To_report = ()=>{
    router.push("/patient/patient_health_reports")
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-teal-100">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getUserTypeDisplay = (userType: string) => {
    switch (userType) {
      case "patient":
        return "Patient";
      case "doctor":
        return "Doctor";
      case "hospital":
        return "Hospital";
      case "pharmacy":
        return "Pharmacy";
      default:
        return userType;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-teal-100">
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-8">
        <div className="bg-white/80 shadow-xl rounded-3xl p-10 border border-teal-200">
          <div className="flex flex-col items-center">
            <img
              src="/assets/Board.png"
              alt="Healthcare"
              className="w-32 h-32 rounded-full shadow-lg mb-6 border-4 border-indigo-200 object-cover"
            />
            <h1 className="text-4xl font-extrabold text-teal-900 mb-2 font-mono tracking-tight">
              Welcome, {(session.user as any)?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-lg text-gray-600 mb-6 font-mono">
              Your personalized Healthcare Dashboard
            </p>
            <div className="bg-gradient-to-r from-indigo-100 to-teal-100 shadow-inner rounded-xl px-8 py-6 w-full max-w-lg flex items-center gap-4 mb-8">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-indigo-200 flex items-center justify-center shadow">
                  <span className="text-indigo-700 font-bold text-3xl font-mono">
                    {(session.user as any)?.name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-mono">
                  {(session.user as any)?.name || "User"}
                </h2>
                <p className="text-md text-gray-500 font-mono">
                  {(session.user as any)?.email}
                </p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-teal-200 text-teal-900 text-xs font-bold font-mono uppercase tracking-wider">
                  {getUserTypeDisplay((session.user as any)?.userType || "unknown")}
                </span>
              </div>
            </div>
            <div className="w-full">
              <h3 className="text-xl font-bold text-teal-900 mb-4 font-mono text-left">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <button className="flex flex-col items-center bg-gradient-to-br from-white to-teal-50 p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-teal-100 hover:-translate-y-1 group">
                  <div className="text-indigo-600 text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                  <div className="text-base font-semibold text-gray-900 font-mono">Profile</div>
                </button>
                <button className="flex flex-col items-center bg-gradient-to-br from-white to-teal-50 p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-teal-100 hover:-translate-y-1 group">
                  <div className="text-indigo-600 text-3xl mb-2 group-hover:scale-110 transition-transform">🔍</div>
                  <div className="text-base font-semibold text-gray-900 font-mono">Search</div>
                </button>
                <button onClick={()=>{To_report()}} className="flex flex-col items-center bg-gradient-to-br from-white to-teal-50 p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-teal-100 hover:-translate-y-1 group">
                  <div className="text-indigo-600 text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                  <div className="text-base font-semibold text-gray-900 font-mono">Reports</div>
                </button>
                <button className="flex flex-col items-center bg-gradient-to-br from-white to-teal-50 p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-teal-100 hover:-translate-y-1 group">
                  <div className="text-indigo-600 text-3xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
                  <div className="text-base font-semibold text-gray-900 font-mono">Settings</div>
                </button>
              </div>
            </div>
            <div className="mt-10 w-full flex justify-center">
              <button
                onClick={() => {
                  window.location.href = "/api/auth/signout";
                }}
                className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-10 rounded-2xl shadow-lg transition-all font-mono text-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
