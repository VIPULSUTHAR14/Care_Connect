"use client";

import { useEffect, useState } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserType } from "@/types/user";
import { toast } from "react-toastify";
import { Eye, EyeClosed } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>(UserType.PATIENT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [PasswordEyeSymbol, setPasswordEyeSymbol] = useState(true);
  const [passwordInputType, setPasswordInputType] = useState("password");
  const router = useRouter();

  const gotoRegister = () => {
    router.push("/Register");
  };

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session, status]);

  const handlePasswordInputType = () => {
    if (passwordInputType === "password") {
      setPasswordInputType("text");
      setPasswordEyeSymbol(false);
    } else {
      setPasswordInputType("password");
      setPasswordEyeSymbol(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        userType,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
        toast.error("Invaild Credentials please try again");
      } else {
        // Get the session to check if login was successful
        const session = await getSession();
        if (session) {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="hidden lg:block lg:w-1/2">
        <img
          src="/assets/doctorImage.jpg"
          alt="sideImage"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="w-full max-w-md lg:w-1/2 flex items-center justify-center p-4">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
          <h2 className="text-4xl font-bold font-mono bg-clip-text text-transparent bg-cyan-900 text-center mb-8 py-10 drop-shadow-xl cursor-pointer">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="size-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-800 focus:border-transparent font-mono text-green-950 text-xl font-bold"
                placeholder="Email"
              />
            </div>

            {/* Password Input */}
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type={passwordInputType}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-800 focus:border-transparent font-mono text-green-950 text-xl font-bold"
                placeholder="Password"
              />
              <button
                onClick={() => handlePasswordInputType()}
                className="p-2"
                type="button"
              >
                {PasswordEyeSymbol ? (
                  <Eye className="size-8 text-cyan-800 " />
                ) : (
                  <EyeClosed className="size-8 text-cyan-800" />
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a
                href="#"
                className="text-md text-cyan-600 hover:text-cyan-800 hover:underline font-mono"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-800 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-mono font-extrabold"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>

            {/* Google Sign In Button */}
            {userType === UserType.PATIENT && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 py-3 px-4 rounded-lg font-bold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-mono text-xl text-green-950 "
              >
                <img
                  src="/assets/google.png"
                  alt="google"
                  className="w-6 h-6 mr-3"
                />
                Proceed with Google
              </button>
            )}

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-lg font-mono text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  onClick={gotoRegister}
                  className="text-cyan-600 hover:underline hover:text-cyan-700 font-medium"
                  type="button"
                >
                  Register
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}