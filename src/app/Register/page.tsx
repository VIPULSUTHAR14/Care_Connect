"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserType, RegisterData } from "@/types/user";

export default function Register() {
  const [formData, setFormData] = useState<Omit<RegisterData, "confirmPassword">>({
    name: "",
    email: "",
    password: "",
    userType: UserType.PATIENT,
    phone: "",
    address: "",
    specialization: "",
    licenseNumber: "",
    hospitalName: "",
    pharmacyName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    const submitData = formData;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/auth/signin?message=Registration successful. Please sign in.");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-screen h-[90vh] bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div>
        <img src="/assets/doctorImage.jpg" alt="sideImage" className="h-[90vh] w-[50vw]" />
      </div>
      <div className="w-full max-w-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-4xl font-bold font-mono bg-clip-text text-transparent bg-cyan-900 text-center mb-8 px-40 py-10 drop-shadow-xl drop-shadow-green-200 cursor-pointer">
            Create your account
          </h2>
          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-mono font-medium text-cyan-900 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="block w-full pl-4 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent font-mono text-green-950 text-xl font-bold"
                placeholder="Enter your full name"
              />
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-mono font-medium text-green-900 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-4 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent font-mono text-green-950 text-xl font-bold"
                placeholder="Enter your email"
              />
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-mono font-medium text-green-900 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-4 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent font-mono text-green-950 text-xl font-bold"
                placeholder="Enter your password"
              />
            </div>
            {/* Hidden userType */}
            <input type="hidden" name="userType" value={UserType.PATIENT} />
            {/* Error */}
            {error && (
              <div className="text-red-600 text-center bg-red-50 border border-red-200 rounded-md py-2 px-3 text-sm font-mono">
                {error}
              </div>
            )}
            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-800 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-mono font-extrabold"
            >
              {isLoading ? "Creating account..." : "Register"}
            </button>
            {/* Sign in link */}
            <div className="text-center">
              <p className="text-lg font-mono text-gray-600">
                Already have an account?{" "}
                <a
                  href="/auth/signin"
                  className="text-cyan-600 hover:underline hover:text-cyan-700 font-medium"
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
