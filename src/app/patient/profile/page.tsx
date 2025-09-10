"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserType } from "@/types/user";

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

  // For better UX, auto-dismiss messages
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

  // Fetch profile data for better UX (pre-fill form)
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.userType === UserType.PATIENT) {
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
              family: (data.patient.family || []).map((m: any) => ({
                fullName: m.fullName || m.name || "",
                relation: m.relation || "",
                age: typeof m.age === "number" ? m.age : (m.age ? parseInt(m.age, 10) : null),
                gender: m.gender || "",
                condition: m.condition || m.notes || "",
              })),
            });
          }
        });
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && (session?.user as any)?.userType !== UserType.PATIENT) {
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
        { fullName: "", relation: "", age: null, gender: "", condition: "" } as FamilyMember,
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
      const updated = [...prev.family];
      if (field === "age") {
        (updated[index] as FamilyMember).age = value ? parseInt(value, 10) : null;
      } else {
        (updated[index] as any)[field] = value;
      }
      return { ...prev, family: updated };
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
        body: JSON.stringify({
          mobileNumber: profile.mobileNumber,
          age: profile.age,
          gender: profile.gender,
          role: profile.role,
          address: profile.address,
          bloodGroup: profile.bloodGroup,
          // Do not send pastReports anymore; backend will default to [] if missing
          family: profile.family,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully!");
        setShowMessage(true);
      } else {
        setError(data.error || "Failed to update profile");
        setShowError(true);
      }
    } catch (error) {
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

  if (!session || (session?.user as any)?.userType !== UserType.PATIENT) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 shadow-xl rounded-2xl border border-indigo-700">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-2 font-mono">
              <span className="inline-block bg-indigo-700 rounded-full p-2">
                {/* User icon SVG (no heroicons) */}
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
              Patient Profile
            </h1>
            <p className="text-gray-300 mb-8 font-mono">Please complete or update your profile to help us serve you better.</p>
            
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-semibold text-indigo-200 mb-1 font-mono">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    id="mobileNumber"
                    value={profile.mobileNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono placeholder-gray-400"
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-indigo-200 mb-1 font-mono">
                    Age <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={profile.age || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono placeholder-gray-400"
                    placeholder="Enter your age"
                    min="0"
                    max="150"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-indigo-200 mb-1 font-mono">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono"
                    required
                  >
                    <option value="" className="text-gray-400">Select gender</option>
                    <option value="male" className="text-black">Male</option>
                    <option value="female" className="text-black">Female</option>
                    <option value="other" className="text-black">Other</option>
                    <option value="prefer-not-to-say" className="text-black">Prefer not to say</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label htmlFor="bloodGroup" className="block text-sm font-semibold text-indigo-200 mb-1 font-mono">
                    Blood Group <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="bloodGroup"
                    id="bloodGroup"
                    value={profile.bloodGroup}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono"
                    required
                  >
                    <option value="" className="text-gray-400">Select blood group</option>
                    <option value="A+" className="text-black">A+</option>
                    <option value="A-" className="text-black">A-</option>
                    <option value="B+" className="text-black">B+</option>
                    <option value="B-" className="text-black">B-</option>
                    <option value="AB+" className="text-black">AB+</option>
                    <option value="AB-" className="text-black">AB-</option>
                    <option value="O+" className="text-black">O+</option>
                    <option value="O-" className="text-black">O-</option>
                  </select>
                </div>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-indigo-200 mb-1 font-mono">
                  Role/Profession <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  id="role"
                  value={profile.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono placeholder-gray-400"
                  placeholder="e.g., Student, Engineer, Teacher, etc."
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-indigo-200 mb-1 font-mono">
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={profile.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono placeholder-gray-400"
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              {/* Family Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-indigo-200 font-mono">
                    Family Members <span className="text-gray-400">(Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addFamilyMember}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold py-1.5 px-3 rounded-md transition-colors shadow-sm"
                  >
                    Add member
                  </button>
                </div>

                {profile.family.length === 0 && (
                  <p className="text-sm text-gray-400 font-mono mb-2">No family members added yet.</p>
                )}

                <div className="space-y-5">
                  {profile.family.map((member, index) => (
                    <div key={index} className="border border-indigo-700 rounded-lg p-4 bg-gray-800/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-indigo-200 mb-1 font-mono">Full name</label>
                          <input
                            type="text"
                            value={member.fullName}
                            onChange={(e) => updateFamilyMember(index, "fullName", e.target.value)}
                            className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono placeholder-gray-400"
                            placeholder="e.g., John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-indigo-200 mb-1 font-mono">Relation</label>
                          <input
                            type="text"
                            value={member.relation}
                            onChange={(e) => updateFamilyMember(index, "relation", e.target.value)}
                            className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono placeholder-gray-400"
                            placeholder="e.g., Father, Mother, Spouse"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-indigo-200 mb-1 font-mono">Age</label>
                          <input
                            type="number"
                            value={member.age ?? ""}
                            min="0"
                            max="150"
                            onChange={(e) => updateFamilyMember(index, "age", e.target.value)}
                            className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono placeholder-gray-400"
                            placeholder="Age"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-indigo-200 mb-1 font-mono">Gender</label>
                          <select
                            value={member.gender}
                            onChange={(e) => updateFamilyMember(index, "gender", e.target.value)}
                            className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono"
                          >
                            <option value="" className="text-gray-400">Select gender</option>
                            <option value="male" className="text-black">Male</option>
                            <option value="female" className="text-black">Female</option>
                            <option value="other" className="text-black">Other</option>
                            <option value="prefer-not-to-say" className="text-black">Prefer not to say</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-indigo-200 mb-1 font-mono">Medical conditions / notes</label>
                          <input
                            type="text"
                            value={member.condition}
                            onChange={(e) => updateFamilyMember(index, "condition", e.target.value)}
                            className="mt-1 block w-full border border-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm px-3 py-2 transition bg-gray-800 text-white font-mono placeholder-gray-400"
                            placeholder="e.g., Diabetes, Hypertension"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => removeFamilyMember(index)}
                          className="text-sm bg-gray-800 border border-gray-600 hover:bg-gray-700 text-gray-200 font-semibold py-1.5 px-3 rounded-lg transition-colors shadow-sm font-mono"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback messages */}
              <div className="relative min-h-[32px]">
                {showError && error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900 border border-red-700 p-3 rounded-lg shadow-sm animate-fade-in font-mono">
                    {/* Exclamation SVG */}
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="16" r="1" fill="currentColor" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                {showMessage && message && (
                  <div className="flex items-center gap-2 text-green-300 text-sm bg-green-900 border border-green-700 p-3 rounded-lg shadow-sm animate-fade-in font-mono">
                    {/* Check SVG */}
                    <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path d="M8 12l2 2l4-4" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                    <span>{message}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="bg-gray-800 border border-gray-600 hover:bg-gray-700 text-gray-200 font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm font-mono"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 font-mono"
                >
                  {isSaving && (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Subtle background illustration for better UX */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 10%, rgba(99,102,241,0.18) 0%, transparent 70%), radial-gradient(ellipse at 10% 90%, rgba(99,102,241,0.20) 0%, transparent 70%)"
        }}
      />
    </div>
  );
}
