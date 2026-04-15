"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Loader2, Stethoscope } from "lucide-react";
import { UserType } from "@/types/user";

export default function DoctorSignIn() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [passwordInputType, setPasswordInputType] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordInputType = () => {
    setPasswordInputType(passwordInputType === "password" ? "text" : "password");
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        userType: UserType.DOCTOR,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please verify your email and password.");
      } else if (result?.ok) {
        router.push("/doctor/doctor_dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/doctor_dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col md:flex-row">
      {/* Background Orbs */}
      <div className="gradient-orb gradient-orb-1 opacity-20"></div>
      <div className="gradient-orb gradient-orb-2 opacity-20"></div>

      {/* Hero Image Section - Creative Left Side */}
      <div className="hidden md:flex md:w-1/2 relative bg-cyan-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cyan-950/60 z-10 backdrop-blur-[1px]"></div>
        <img 
          src="/assets/Doctor_1.jpg" 
          className="absolute inset-0 w-full h-full object-cover transform scale-110" 
          alt="Healthcare Professional" 
        />
        <div className="relative z-20 p-12 text-center max-w-lg">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-6 border border-white/10 shadow-2xl">
            <Stethoscope className="text-cyan-300" size={40} />
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight">
            Practitioner Login
          </h2>
          <p className="text-xl text-cyan-50 font-medium opacity-90 leading-relaxed">
            Access your patient records, schedules, and clinical tools within our secure medical platform.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8 glass-card p-10 border-cyan-100/50">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-cyan-950">
              Sign In
            </h1>
            <p className="text-cyan-700/70 font-medium">
              Enter your professional credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-cyan-900/60 ml-1 uppercase tracking-wider">Professional Email</label>
                <div className="relative group transition-all duration-200">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-cyan-600 text-cyan-800/40 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl pl-11 pr-4 py-3.5 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                    type="email"
                    name="email"
                    placeholder="dr.name@hospital.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-cyan-900/60 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-bold text-cyan-600 hover:text-cyan-800 transition-colors">Forgot Password?</a>
                </div>
                <div className="relative group transition-all duration-200">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-cyan-600 text-cyan-800/40 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl pl-11 pr-12 py-3.5 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                    type={passwordInputType}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={handlePasswordInputType}
                    className="absolute right-4 top-3.5 text-cyan-800/40 hover:text-cyan-600 transition-colors"
                  >
                    {passwordInputType === "password" ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-lg p-3 text-center animate-shake" role="alert">
                {error}
              </div>
            )}

            <button
              className="cta-button bg-cyan-800 hover:bg-cyan-900 shadow-lg shadow-cyan-900/10 disabled:opacity-70 group"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in to Portal
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-cyan-800/60 font-medium">
              Don't have an account?{" "}
              <a href="/doctor_register" className="text-cyan-700 font-bold hover:underline decoration-2 underline-offset-4">
                Register as Practitioner
              </a>
            </p>
            <div>
              <a href="/" className="text-sm font-bold text-cyan-900/40 hover:text-cyan-600 transition-colors inline-flex items-center gap-1 group">
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Main Directory
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

