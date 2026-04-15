"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, X, Upload, Home, Shield, Mail, Hospital, MapPin, Loader2, CheckCircle2, Lock } from "lucide-react";
import { UserType } from "@/types/user";

export default function SignupHospital() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    name: "",
    address: "",
    reception_number: "",
    userType: UserType.HOSPITAL,
    ambulance_number: "",
    nha_registration_number: "",
    email: "",
    password: "",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [passwordinputtype, setPasswordInputType] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordInputType = () => {
    setPasswordInputType(prev => prev === "password" ? "text" : "password");
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const data = new FormData();
    Array.from(files).forEach((file) => data.append("files", file));
    try {
      setUploading(true);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Upload failed");
        return;
      }
      setUploadedImages((prev) => [...prev, ...((json.urls as string[]) || [])]);
    } catch (err) {
      setError("Image upload failed");
      console.error(err instanceof Error);
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage(idx: number) {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      name: form.name,
      address: form.address,
      email: form.email,
      password: form.password,
      reception_number: form.reception_number,
      ambulance_number: form.ambulance_number,
      nha_registration_number: form.nha_registration_number,
      userType: UserType.HOSPITAL,
      images: uploadedImages,
    };

    try {
      const res = await fetch("/api/hospital-api/hospital-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess("Registration successful!");
        signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
          userType: UserType.HOSPITAL,
        });
        router.push("/hospital_dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err instanceof Error);
    } finally {
      setLoading(false);
    }
  }

  const role = session?.user.userType;
  useEffect(() => {
    if (role === "doctor" || status === "authenticated") {
      router.push("/hospital_dashboard");
    }
  }, [session, status, role, router]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden py-12 px-4 sm:px-6">
      {/* Background Orbs */}
      <div className="gradient-orb gradient-orb-1 opacity-10"></div>
      <div className="gradient-orb gradient-orb-2 opacity-10"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-950 tracking-tight">
            Register your Institution
          </h1>
          <p className="text-cyan-700/70 text-lg font-medium max-w-2xl mx-auto">
            Join our network of elite healthcare providers and streamline your hospital operations with our advanced management system.
          </p>
        </div>

        <div className="glass-card p-2 md:p-8 border-cyan-100/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-100/50">
                  <Hospital className="text-cyan-600" size={20} />
                  <h2 className="text-xl font-bold text-cyan-900">Basic Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-cyan-900/60 ml-1">Hospital Name</label>
                    <input
                      className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl px-4 py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      type="text"
                      name="name"
                      placeholder="e.g. City General Hospital"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-cyan-900/60 ml-1">Physical Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 text-cyan-800/40" size={18} />
                      <input
                        className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl pl-11 pr-4 py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                        type="text"
                        name="address"
                        placeholder="Street, City, Zip Code"
                        value={form.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-cyan-900/60 ml-1">Reception Number</label>
                      <input
                        className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl px-4 py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                        type="tel"
                        name="reception_number"
                        placeholder="Landline number"
                        value={form.reception_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-cyan-900/60 ml-1">Ambulance Number</label>
                      <input
                        className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl px-4 py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                        type="tel"
                        name="ambulance_number"
                        placeholder="Internal or Emergency"
                        value={form.ambulance_number}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration & Security Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-100/50">
                  <Shield className="text-cyan-600" size={20} />
                  <h2 className="text-xl font-bold text-cyan-900">Legal & Security</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-cyan-900/60 ml-1">NHA Registration Number</label>
                    <input
                      className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl px-4 py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      type="text"
                      name="nha_registration_number"
                      placeholder="Official license number"
                      value={form.nha_registration_number}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-cyan-900/60 ml-1">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-cyan-800/40" size={18} />
                      <input
                        className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl pl-11 pr-4 py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                        type="email"
                        name="email"
                        placeholder="admin@hospital.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-cyan-900/60 ml-1">Account Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-cyan-800/40" size={18} />
                      <input
                        className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl pl-11 pr-12 py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                        type={passwordinputtype}
                        name="password"
                        placeholder="Minimum 8 characters"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={handlePasswordInputType}
                        className="absolute right-4 top-3 text-cyan-800/40 hover:text-cyan-600 transition-colors"
                      >
                        {passwordinputtype === "password" ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cyan-100/50">
                <Home className="text-cyan-600" size={20} />
                <h2 className="text-xl font-bold text-cyan-900">Hospital Premises Images</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? 'bg-cyan-50/50 border-cyan-200' : 'bg-cyan-50/30 border-cyan-100/50 hover:bg-cyan-50/50 hover:border-cyan-300'}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <Loader2 className="animate-spin text-cyan-600 mb-2" size={24} />
                      ) : (
                        <Upload className="text-cyan-600 mb-2" size={24} />
                      )}
                      <p className="text-sm font-bold text-cyan-900">Upload Photos</p>
                      <p className="text-xs text-cyan-700/60">PNG, JPG up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFilesChange}
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div className="md:col-span-2">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-cyan-100 shadow-sm animate-fade-in">
                        <img src={url} alt={`Premises ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 rounded-full p-1 shadow-sm transition-all scale-0 group-hover:scale-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {uploadedImages.length === 0 && !uploading && (
                      <div className="col-span-full h-40 flex items-center justify-center border border-dashed border-cyan-100 rounded-2xl bg-cyan-50/10">
                        <p className="text-sm text-cyan-800/30 font-medium italic">No images uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {(error || success) && (
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                {error ? <Shield size={20} /> : <CheckCircle2 size={20} />}
                <p className="font-bold text-sm">{error || success}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-cyan-800 hover:bg-cyan-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-cyan-900/20 transition-all disabled:opacity-60"
                disabled={loading || uploading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={22} />
                    Registering Institution...
                  </span>
                ) : (
                  "Create Institutional Account"
                )}
              </button>

              <p className="text-center mt-6 text-cyan-800/60 font-medium font-sans">
                Already registered?{" "}
                <a href="/signin-hospital" className="text-cyan-700 font-bold hover:underline decoration-2 underline-offset-4">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}