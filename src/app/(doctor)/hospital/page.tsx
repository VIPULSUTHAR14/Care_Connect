"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function HospitalRegister() {
	const router = useRouter();
	const [hospitalName, setHospitalName] = useState("");
	const [registerNumber, setRegisterNumber] = useState("");
	const [location, setLocation] = useState("");
	const [adminEmail, setAdminEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const registrationCertificateRef = useRef<HTMLInputElement | null>(null);
	const premisesImagesRef = useRef<HTMLInputElement | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setSuccess("");

		const registrationCertificate = registrationCertificateRef.current?.files?.[0];
		const premisesImagesFiles = premisesImagesRef.current?.files;

		if (!registrationCertificate) {
			setError("Registration certificate is required");
			setIsLoading(false);
			return;
		}

		if (!premisesImagesFiles || premisesImagesFiles.length < 3 || premisesImagesFiles.length > 5) {
			setError("Please upload 3 to 5 premises images");
			setIsLoading(false);
			return;
		}

		try {
			const formData = new FormData();
			formData.append("hospitalName", hospitalName);
			formData.append("registerNumber", registerNumber);
			formData.append("registrationCertificate", registrationCertificate);
			Array.from(premisesImagesFiles).forEach((file) => formData.append("premisesImages", file));
			formData.append("location", location);
			formData.append("adminEmail", adminEmail);
			formData.append("password", password);

			const response = await fetch("/api/auth/hospital_register", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.error || "Failed to register hospital");
			}

			setSuccess("Hospital registered successfully. Signing you in...");

			// Sign in using NextAuth Credentials provider
			const signInResult = await signIn("credentials", {
				redirect: false,
				email: adminEmail,
				password,
				userType: "hospital",
			});

			if (signInResult?.error) {
				setError("Registered, but failed to sign in. Please try signing in.");
				setIsLoading(false);
				return;
			}

			router.push("/dashboard");
		} catch (err: unknown) {
			//ts-ignore
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-[90vh] flex items-center justify-center bg-teal-50">
			<div className="w-[60vw] flex items-center space-y-8 p-10 bg-teal-600/50 rounded-3xl ">
				<div>
					<img src="/assets/Board.png" alt="board" className="size-96" />
				</div>
				<div className="w-full max-w-xl">
					<div>
						<h2 className="mt-6 text-center text-3xl font-extrabold text-white font-mono">
							Register your hospital
						</h2>
						<p className="mt-2 text-center text-md text-teal-950 font-mono">
							Provide required details and verification documents.
						</p>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
						<div className="space-y-4">
							<div>
								<input
									id="hospitalName"
									name="hospitalName"
									type="text"
									required
									value={hospitalName}
									onChange={(e) => setHospitalName(e.target.value)}
									className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-4xl border-white placeholder-white font-mono text-white focus:outline-none text-xl font-bold"
									placeholder="Hospital Name"
								/>
							</div>

							<div>
								<input
									id="registerNumber"
									name="registerNumber"
									type="text"
									required
									value={registerNumber}
									onChange={(e) => setRegisterNumber(e.target.value)}
									className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-4xl border-white placeholder-white font-mono text-white focus:outline-none text-xl font-bold"
									placeholder="Registration Number"
								/>
							</div>

							<div>
								<textarea
									id="location"
									name="location"
									rows={3}
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-2xl border-white placeholder-white font-mono text-white focus:outline-none text-lg font-bold"
									placeholder='Location (text or JSON like {"address":"..."})'
								/>
							</div>

							<div>
								<input
									id="adminEmail"
									name="adminEmail"
									type="email"
									required
									value={adminEmail}
									onChange={(e) => setAdminEmail(e.target.value)}
									className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-4xl border-white placeholder-white font-mono text-white focus:outline-none text-xl font-bold"
									placeholder="Admin Email"
								/>
							</div>

							<div>
								<input
									id="password"
									name="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-4xl border-white placeholder-white font-mono text-white focus:outline-none text-xl font-bold"
									placeholder="Create a password"
								/>
							</div>

							<div className="text-white font-mono">
								<label htmlFor="registrationCertificate" className="block mb-2">Registration Certificate (PDF/JPG/PNG)</label>
								<input
									id="registrationCertificate"
									name="registrationCertificate"
									type="file"
									accept=".pdf,.jpg,.jpeg,.png"
									required
									ref={registrationCertificateRef}
									className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-800 file:text-white hover:file:bg-teal-700"
								/>
							</div>

							<div className="text-white font-mono">
								<label htmlFor="premisesImages" className="block mb-2">Premises Images (3 to 5)</label>
								<input
									id="premisesImages"
									name="premisesImages"
									type="file"
									accept=".jpg,.jpeg,.png"
									multiple
									required
									ref={premisesImagesRef}
									className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-800 file:text-white hover:file:bg-teal-700"
								/>
								<p className="text-xs mt-1">Upload between 3 and 5 images.</p>
							</div>
						</div>

						{error && (
							<div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>
						)}
						{success && (
							<div className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-md">{success}</div>
						)}

						<div className="pt-2">
							<button
								type="submit"
								disabled={isLoading}
								className="font-mono text-white px-10 py-3 rounded-2xl hover:cursor-pointer active:animate-bounce font-bold text-2xl bg-teal-800"
							>
								{isLoading ? "Submitting..." : "Register Hospital"}
							</button>
						</div>

						<div className="text-center">
							<p className="text-sm text-gray-200 font-mono">
								Already have an account? <a href="/auth/signin" className="font-medium underline text-white">Sign in here</a>
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
