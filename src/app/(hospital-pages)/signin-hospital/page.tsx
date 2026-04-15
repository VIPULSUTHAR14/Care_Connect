"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { UserType } from "@/types/user";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      userType: UserType.HOSPITAL,
    });

    if (result?.ok) {
      router.replace("/hospital_dashboard");
    } else {
      setError("Invalid credentials. Please check your email and password.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col md:flex-row">
      {/* Background Orbs */}
      <div className="gradient-orb gradient-orb-1 opacity-20"></div>
      <div className="gradient-orb gradient-orb-2 opacity-20"></div>

      {/* Hero Image Section - Hidden on small screens */}
      <div className="hidden md:flex md:w-1/2 relative bg-cyan-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cyan-900/40 z-10 backdrop-blur-[2px]"></div>
        <img
          src="/assets/hospital2.jpg"
          className="absolute inset-0 w-full h-full object-cover transform scale-105"
          alt="Hospital Background"
        />
        <div className="relative z-20 p-12 text-center max-w-lg">
          <h2 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight">
            Institutional Access
          </h2>
          <p className="text-xl text-cyan-50 font-medium opacity-90 leading-relaxed">
            Manage your medical facility's administration and provider networks through our integrated healthcare ecosystem.
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
              Enter your credentials to manage your hospital
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-cyan-900/60 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group transition-all duration-200">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-cyan-600 text-cyan-800/40 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl pl-11 pr-4 py-3.5 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                    type="email"
                    placeholder="name@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl pl-11 pr-4 py-3.5 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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
                  Sign in to Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-cyan-800/60 font-medium">
            Don't have an account?{" "}
            <a href="/signup-hospital" className="text-cyan-700 font-bold hover:underline decoration-2 underline-offset-4">
              Register Institution
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}



