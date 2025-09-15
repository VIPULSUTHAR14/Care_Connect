"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{" "}
              <span className="text-indigo-600">Healthcare Platform</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              A comprehensive healthcare management system connecting patients, doctors, hospitals, and pharmacies.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">🏥</div>
                <h3 className="font-semibold text-gray-900">Patients</h3>
                <p className="text-sm text-gray-600">Manage your health records and appointments</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">👨‍⚕️</div>
                <h3 className="font-semibold text-gray-900">Doctors</h3>
                <p className="text-sm text-gray-600">Access patient records and manage consultations</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="font-semibold text-gray-900">Hospitals</h3>
                <p className="text-sm text-gray-600">Streamline operations and patient care</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">💊</div>
                <h3 className="font-semibold text-gray-900">Pharmacies</h3>
                <p className="text-sm text-gray-600">Manage prescriptions and inventory</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/signin"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Sign In
              </a>
              <a
                href="/auth/register"
                className="bg-white hover:bg-gray-50 text-indigo-600 font-medium py-3 px-8 rounded-lg border border-indigo-600 transition-colors"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
