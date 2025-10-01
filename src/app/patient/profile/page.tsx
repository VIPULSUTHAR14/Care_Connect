"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserType } from "@/types/user";

// --- INTERFACES ---
interface FamilyMember {
  fullName: string;
  relation: string;
  age: number | null;
  gender: string;
  condition: string;
}

interface PatientProfile {
  mobileNumber: string;
  age: number | null;
  gender: string;
  role: string;
  address: string;
  bloodGroup: string;
  family: FamilyMember[];
}

// Type for the raw family member data coming from the API
interface ApiFamilyMember {
    fullName?: string;
    name?: string;
    relation?: string;
    age?: number | string | null;
    gender?: string;
    condition?: string;
    notes?: string;
}


export default function PatientProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showError, setShowError] = useState(false);

  const [profile, setProfile] = useState<PatientProfile>({
    mobileNumber: "",
    age: null,
    gender: "",
    role: "",
    address: "",
    bloodGroup: "",
    family: [],
  });

  // Auto-dismiss messages
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showMessage || showError) {
      timer = setTimeout(() => {
        setShowMessage(false);
        setShowError(false);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [showMessage, showError]);

  // Fetch profile data
  useEffect(() => {
    if (status === "authenticated" && session?.user.userType === UserType.PATIENT) {
      fetch("/api/patient/profile")
        .then(res => res.json())
        .then(data => {
          if (data.patient) {
            setProfile({
              mobileNumber: data.patient.mobileNumber || "",
              age: data.patient.age ?? null,
              gender: data.patient.gender || "",
              role: data.patient.role || "",
              address: data.patient.address || "",
              bloodGroup: data.patient.bloodGroup || "",
              family: (data.patient.family || []).map((m: ApiFamilyMember) => ({
                fullName: m.fullName || m.name || "",
                relation: m.relation || "",
                age: typeof m.age === "number" ? m.age : (m.age ? parseInt(String(m.age), 10) : null),
                gender: m.gender || "",
                condition: m.condition || m.notes || "",
              })),
            });
          }
        });
    }
  }, [status, session]);

  // Handle routing based on session status
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user.userType !== UserType.PATIENT) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === "age" ? (value ? parseInt(value) : null) : value
    }));
  };

  const addFamilyMember = () => {
    setProfile(prev => ({
      ...prev,
      family: [
        ...prev.family,
        { fullName: "", relation: "", age: null, gender: "", condition: "" },
      ],
    }));
  };

  const removeFamilyMember = (index: number) => {
    setProfile(prev => ({
      ...prev,
      family: prev.family.filter((_, i) => i !== index),
    }));
  };

  const updateFamilyMember = (
    index: number,
    field: keyof FamilyMember,
    value: string
  ) => {
    setProfile(prev => {
      const updatedFamily = [...prev.family];
      const memberToUpdate = updatedFamily[index];
      
      if (field === "age") {
        memberToUpdate.age = value ? parseInt(value, 10) : null;
      } else {
        memberToUpdate[field] = value;
      }
      
      return { ...prev, family: updatedFamily };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");
    setShowMessage(false);
    setShowError(false);

    try {
      const response = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully!");
        setShowMessage(true);
      } else {
        setError(data.error || "Failed to update profile");
        setShowError(true);
      }
    } catch {
      setError("An error occurred while updating profile");
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <span className="text-indigo-700 font-medium font-mono">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!session || session.user.userType !== UserType.PATIENT) {
    return null;
  }

  const inputStyles = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-gray-900 placeholder:text-gray-500";

  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
              <span className="inline-block bg-indigo-600 rounded-full p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
              Patient Profile
            </h1>
            <p className="text-gray-700 text-sm sm:text-base mb-8">Please complete or update your profile to help us serve you better.</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* --- Personal Information --- */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-800">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input type="tel" name="mobileNumber" id="mobileNumber" value={profile.mobileNumber} onChange={handleInputChange} className={inputStyles + " bg-gray-50"} placeholder="Enter your mobile number" required />
                  </div>

                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-800">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input type="number" name="age" id="age" value={profile.age || ""} onChange={handleInputChange} className={inputStyles + " bg-gray-50"} placeholder="Enter your age" min="0" max="150" required />
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-800">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select name="gender" id="gender" value={profile.gender} onChange={handleInputChange} className={inputStyles + " bg-gray-50"} required>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-800">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select name="bloodGroup" id="bloodGroup" value={profile.bloodGroup} onChange={handleInputChange} className={inputStyles + " bg-gray-50"} required>
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-800">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea name="address" id="address" rows={3} value={profile.address} onChange={handleInputChange} className={inputStyles + " bg-gray-50"} placeholder="Enter your complete address" required />
                </div>
              </div>

              {/* --- Family Members --- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-medium text-gray-900">
                    Family Members <span className="text-gray-600 text-sm">(Optional)</span>
                  </label>
                  <button type="button" onClick={addFamilyMember} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-1.5 px-3 rounded-md transition-colors shadow-sm">
                    Add Member
                  </button>
                </div>

                {profile.family.length === 0 && (
                  <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <p>No family members added yet.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {profile.family.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50/80 relative">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Full name</label>
                          <input type="text" value={member.fullName} onChange={(e) => updateFamilyMember(index, "fullName", e.target.value)} className={inputStyles + " bg-white"} placeholder="e.g., John Doe" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Relation</label>
                          <input type="text" value={member.relation} onChange={(e) => updateFamilyMember(index, "relation", e.target.value)} className={inputStyles + " bg-white"} placeholder="e.g., Father, Spouse" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Age</label>
                          <input type="number" value={member.age ?? ""} min="0" max="150" onChange={(e) => updateFamilyMember(index, "age", e.target.value)} className={inputStyles + " bg-white"} placeholder="Age" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Gender</label>
                          <select value={member.gender} onChange={(e) => updateFamilyMember(index, "gender", e.target.value)} className={inputStyles + " bg-white"}>
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700">Medical conditions / notes</label>
                          <input type="text" value={member.condition} onChange={(e) => updateFamilyMember(index, "condition", e.target.value)} className={inputStyles + " bg-white"} placeholder="e.g., Diabetes, Hypertension" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <button type="button" onClick={() => removeFamilyMember(index)} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-2 rounded-md transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- Feedback & Actions --- */}
              <div className="pt-5">
                <div className="relative min-h-[48px] mb-4">
                  {showError && error && (
                    <div className="flex items-center gap-3 text-red-800 text-sm bg-red-100 border border-red-300 p-3 rounded-lg shadow-sm animate-fade-in font-mono">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                      <span>{error}</span>
                    </div>
                  )}
                  {showMessage && message && (
                    <div className="flex items-center gap-3 text-green-800 text-sm bg-green-100 border border-green-300 p-3 rounded-lg shadow-sm animate-fade-in font-mono">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8-0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>{message}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => router.push("/dashboard")} className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-4 rounded-md transition-colors shadow-sm" disabled={isSaving}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-md transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                    {isSaving && (
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a10 10 0 00-10 10h2zm2 8a8 8 0 018-8h-2a10 10 0 00-8 8v2z" />
                      </svg>
                    )}
                    {isSaving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 10%, rgba(99,102,241,0.1) 0%, transparent 70%), radial-gradient(ellipse at 10% 90%, rgba(99,102,241,0.1) 0%, transparent 70%)"
        }}
      />
    </div>
  );
}