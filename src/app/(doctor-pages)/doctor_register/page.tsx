"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Eye, EyeOff, User, Mail, Phone, Calendar, Info, Award, Briefcase, Shield, Lock, Loader2, CheckCircle2, MapPin, Building, Activity, Hospital } from "lucide-react";

function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  rightIcon,
  ...rest
}: any) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="flex items-center gap-2 text-sm font-bold text-cyan-900/60 ml-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group transition-all duration-200">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-cyan-600 text-cyan-800/40 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`w-full bg-cyan-50/30 border border-cyan-100 rounded-xl ${Icon ? "pl-11" : "px-4"} ${rightIcon ? "pr-12" : "pr-4"} py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium`}
          type={type}
          name={name}
          id={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute right-4 top-3 transition-colors">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  icon: Icon,
  ...rest
}: any) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="flex items-center gap-2 text-sm font-bold text-cyan-900/60 ml-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group transition-all duration-200">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-cyan-600 text-cyan-800/40 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <select
          className={`w-full bg-cyan-50/30 border border-cyan-100 rounded-xl ${Icon ? "pl-11" : "px-4"} pr-10 py-3 text-cyan-950 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium appearance-none cursor-pointer`}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          required={required}
          {...rest}
        >
          {options.map((opt: any) =>
            typeof opt === "string" ? (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            )
          )}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-cyan-800/40">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function DoctorRegister() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    nmcRegistrationNumber: "",
    department: "",
    qualification: "",
    medicalCollege: "",
    registrationYear: "",
    phoneNumber: "",
    address: "",
    stateMedicalCouncil: "",
    experience: "",
    currentHospital: "",
    emergencyContact: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    position: "",
    schedule: "",
  });

  const [passwordInputType, setPasswordInputType] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([]);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function loadHospitals() {
      try {
        const res = await fetch("/api/doctor-api/findhospital", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load hospitals");
        const data = await res.json();
        setHospitals(Array.isArray(data.hospitals) ? data.hospitals : []);
      } catch (e: any) {
        console.error(e.message);
      }
    }
    loadHospitals();
  }, []);

  const handlePasswordInputType = () => {
    setPasswordInputType((prev) => (prev === "password" ? "text" : "password"));
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      ...form,
      role: "doctor",
    };

    try {
      const res = await fetch("/api/doctor-api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(async () => {
          const result = await signIn("credentials", {
            redirect: false,
            email: form.email,
            password: form.password,
          });
          if (result?.ok) {
            router.replace("/doctor/doctor_dashboard");
          } else {
            router.replace("/doctor/doctor_signin");
          }
        }, 1500);
      }
    } catch (err: any) {
      setError("Connection error. Please try again.");
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
    <div className="min-h-screen bg-white relative overflow-hidden py-10 px-4 sm:px-6">
      {/* Background Orbs */}
      <div className="gradient-orb gradient-orb-1 opacity-10"></div>
      <div className="gradient-orb gradient-orb-2 opacity-10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-950 tracking-tight">
            Practitioner Registration
          </h1>
          <p className="text-cyan-700/70 text-lg font-medium max-w-2xl mx-auto">
            Complete your professional profile to join our elite medical network.
          </p>
        </div>

        <div className="glass-card p-4 md:p-10 border-cyan-100/50">
          <form onSubmit={handleSubmit} className="space-y-10" ref={formRef}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* Left Column: Identity & Security */}
              <div className="space-y-10">
                {/* Personal Information */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-cyan-100/50">
                    <User className="text-cyan-600" size={24} />
                    <h2 className="text-2xl font-bold text-cyan-900">Personal Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Full Name"
                      name="name"
                      placeholder="Dr. John Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                      icon={User}
                    />
                    <InputField
                      label="Email Address"
                      type="email"
                      name="email"
                      placeholder="dr.name@hospital.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      icon={Mail}
                    />
                    <InputField
                      label="Phone Number"
                      type="tel"
                      name="phoneNumber"
                      placeholder="98XXXXXXXX"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      required
                      icon={Phone}
                    />
                    <InputField
                      label="Date of Birth"
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      required
                      icon={Calendar}
                    />
                    <SelectField
                      label="Gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                      icon={User}
                      options={[
                        { value: "", label: "Select Gender" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                    <SelectField
                      label="Blood Group"
                      name="bloodGroup"
                      value={form.bloodGroup}
                      onChange={handleChange}
                      required
                      icon={Activity}
                      options={[
                        { value: "", label: "Select Blood Group" },
                        { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
                        { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
                        { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
                        { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
                      ]}
                    />
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-sm font-bold text-cyan-900/60 ml-1 uppercase tracking-wider">Address</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-3.5 text-cyan-800/40 group-focus-within:text-cyan-600 transition-colors" size={18} />
                        <textarea
                          className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl pl-11 pr-4 py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium min-h-[100px]"
                          name="address"
                          placeholder="Your current clinic or home address"
                          value={form.address}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Account Security */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-cyan-100/50">
                    <Shield className="text-cyan-600" size={24} />
                    <h2 className="text-2xl font-bold text-cyan-900">Security</h2>
                  </div>
                  <InputField
                    label="Account Password"
                    type={passwordInputType}
                    name="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    icon={Lock}
                    rightIcon={
                      <button type="button" onClick={handlePasswordInputType} className="text-cyan-800/40 hover:text-cyan-600 transition-colors">
                        {passwordInputType === "password" ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    }
                  />
                </section>
              </div>

              {/* Right Column: Professional & Clinical */}
              <div className="space-y-10">
                {/* Clinical Credentials */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-cyan-100/50">
                    <Award className="text-cyan-600" size={24} />
                    <h2 className="text-2xl font-bold text-cyan-900">Clinical Credentials</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="NMC Reg. Number"
                      name="nmcRegistrationNumber"
                      placeholder="e.g. 123456"
                      value={form.nmcRegistrationNumber}
                      onChange={handleChange}
                      required
                      icon={Shield}
                    />
                    <SelectField
                      label="Specialization"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      icon={Activity}
                      options={[
                        { value: "", label: "Select Department" },
                        { value: "Cardiology", label: "Cardiology" },
                        { value: "Neurology", label: "Neurology" },
                        { value: "Oncology", label: "Oncology" },
                        { value: "Pediatrics", label: "Pediatrics" },
                        { value: "Orthopedics", label: "Orthopedics" },
                        { value: "General Medicine", label: "General Medicine" },
                      ]}
                    />
                    <InputField
                      label="Qualification"
                      name="qualification"
                      placeholder="e.g. MBBS, MD"
                      value={form.qualification}
                      onChange={handleChange}
                      required
                      icon={Award}
                    />
                    <InputField
                      label="Medical College"
                      name="medicalCollege"
                      placeholder="University name"
                      value={form.medicalCollege}
                      onChange={handleChange}
                      required
                      icon={Building}
                    />
                    <InputField
                      label="Registration Year"
                      type="number"
                      name="registrationYear"
                      placeholder="Year"
                      value={form.registrationYear}
                      onChange={handleChange}
                      required
                      icon={Calendar}
                    />
                    <InputField
                      label="Experience (Years)"
                      type="number"
                      name="experience"
                      placeholder="e.g. 10"
                      value={form.experience}
                      onChange={handleChange}
                      required
                      icon={Briefcase}
                    />
                    <InputField
                      label="State Medical Council"
                      name="stateMedicalCouncil"
                      placeholder="Council name"
                      value={form.stateMedicalCouncil}
                      onChange={handleChange}
                      required
                      icon={Shield}
                    />
                    <SelectField
                      label="Current Hospital"
                      name="currentHospital"
                      value={form.currentHospital}
                      onChange={handleChange}
                      icon={Hospital}
                      options={[
                        { value: "", label: "Select Hospital" },
                        { value: "none", label: "None / Private Practice" },
                        ...hospitals.map((h) => ({ value: h.name, label: h.name })),
                      ]}
                    />
                    <InputField
                      label="Current Position"
                      name="position"
                      placeholder="e.g. Senior Consultant"
                      value={form.position}
                      onChange={handleChange}
                      icon={Briefcase}
                    />
                    <InputField
                      label="Emergency Contact"
                      type="tel"
                      name="emergencyContact"
                      placeholder="Emergency number"
                      value={form.emergencyContact}
                      onChange={handleChange}
                      required
                      icon={Phone}
                    />
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-sm font-bold text-cyan-900/60 ml-1 uppercase tracking-wider">Weekly Schedule</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-3.5 text-cyan-800/40 group-focus-within:text-cyan-600 transition-colors" size={18} />
                        <textarea
                          className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl pl-11 pr-4 py-3 text-cyan-950 placeholder:text-cyan-800/30 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium min-h-[100px]"
                          name="schedule"
                          placeholder="e.g. Mon-Fri: 10AM - 4PM, Sat: 9AM - 1PM"
                          value={form.schedule}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Form Footer */}
            <div className="pt-8 border-t border-cyan-100/50 space-y-6">
              {(error || success) && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-slide-up-stats ${error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                  {error ? <Shield size={20} /> : <CheckCircle2 size={20} />}
                  <p className="font-bold text-sm">{error || success}</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <button
                  type="submit"
                  className="cta-button bg-cyan-800 hover:bg-cyan-900 shadow-xl shadow-cyan-900/20 py-4 px-12 md:w-auto text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={22} />
                      Processing Application...
                    </span>
                  ) : (
                    "Register as Medical Practitioner"
                  )}
                </button>

                <p className="text-cyan-800/60 font-medium">
                  Already have an account?{" "}
                  <a href="/doctor_signin" className="text-cyan-700 font-bold hover:underline decoration-2 underline-offset-4">
                    Sign in here
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

