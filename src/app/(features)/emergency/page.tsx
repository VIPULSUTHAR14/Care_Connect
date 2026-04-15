"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Hospital,
  Phone,
  User,
  MapPin,
  Ambulance,
} from "lucide-react";

interface HospitalItem {
  _id: string;
  name: string;
  address?: string;
}

export default function EmergencyPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [forWhom, setForWhom] = useState("");
  const [ambulance, setAmbulance] = useState<boolean>(false);
  const [hospitalId, setHospitalId] = useState("");

  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingHospitals(true);
        const res = await fetch(`/api/hospitals?limit=100`);
        const data = await res.json();
        if (!isMounted) return;
        if (res.ok && Array.isArray(data.hospitals)) {
          setHospitals(data.hospitals);
          if (data.hospitals.length > 0) setHospitalId(data.hospitals[0]._id);
        } else {
          setError(data?.error || "Failed to load hospitals");
        }
      } catch {
        // 1. FIX: Removed unused 'e' variable
        if (!isMounted) return;
        setError("Failed to load hospitals");
      } finally {
        if (isMounted) setLoadingHospitals(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const message = useMemo(() => {
    const lines: string[] = [];
    lines.push(`EMERGENCY REQUEST`);
    lines.push(`Name: ${name || "-"}`);
    lines.push(`Address: ${address || "-"}`);
    lines.push(`Phone: ${phone || "-"}`);
    lines.push(`Emergency For: ${forWhom || "-"}`);
    lines.push(`Ambulance Needed: ${ambulance ? "Yes" : "No"}`);
    lines.push(`Submitted At: ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [name, address, phone, forWhom, ambulance]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!hospitalId) {
      setError("Please select a hospital");
      return;
    }
    if (!name || !phone) {
      setError("Please provide your name and phone number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: "self",
          receiverId: hospitalId,
          type: "emergency_request",
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to send emergency request");
      }
      setSuccessMsg("Emergency request sent to hospital");
    } catch (err: unknown) {
      // 2. FIX: Use 'unknown' for type safety
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[90vh] bg-cyan-50 flex flex-col items-center py-10 px-2 md:px-0">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="size-8 text-cyan-800" />
          <h1 className="text-3xl md:text-4xl font-mono font-bold text-cyan-800">
            Emergency Assistance
          </h1>
        </div>
        <p className="text-md md:text-lg text-gray-700 font-mono mb-6 text-center">
          Provide details below and we will notify the selected hospital
          immediately.
        </p>

        <form onSubmit={onSubmit} className="w-full space-y-5">
          <div>
            <label className="text-sm font-mono font-semibold text-cyan-800 mb-1 flex items-center gap-1">
              <User className="size-4 text-cyan-700" /> Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full border border-cyan-200 rounded-xl px-3 py-2 font-mono text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-cyan-50 transition"
            />
          </div>

          <div>
            <label className="text-sm font-mono font-semibold text-cyan-800 mb-1 flex items-center gap-1">
              <MapPin className="size-4 text-cyan-700" /> Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State"
              className="w-full border border-cyan-200 rounded-xl px-3 py-2 font-mono text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-cyan-50 min-h-[70px] transition"
            />
          </div>

          <div>
            <label className="text-sm font-mono font-semibold text-cyan-800 mb-1 flex items-center gap-1">
              <Phone className="size-4 text-cyan-700" /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
              className="w-full border border-cyan-200 rounded-xl px-3 py-2 font-mono text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-cyan-50 transition"
            />
          </div>

          <div>
            <label className="text-sm font-mono font-semibold text-cyan-800 mb-1 flex items-center gap-1">
              <Hospital className="size-4 text-cyan-700" /> Emergency For Whom
            </label>
            <input
              type="text"
              value={forWhom}
              onChange={(e) => setForWhom(e.target.value)}
              placeholder="Self / Relative / Friend"
              className="w-full border border-cyan-200 rounded-xl px-3 py-2 font-mono text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-cyan-50 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="ambulance"
              type="checkbox"
              checked={ambulance}
              onChange={(e) => setAmbulance(e.target.checked)}
              className="h-4 w-4 text-cyan-700 focus:ring-cyan-400 border-cyan-300 rounded"
            />
            <label
              htmlFor="ambulance"
              className="text-sm font-mono text-cyan-800 flex items-center gap-1"
            >
              <Ambulance className="size-4 text-cyan-700" /> Ambulance needed
            </label>
          </div>

          <div>
            <label className="text-sm font-mono font-semibold text-cyan-800 mb-1 flex items-center gap-1">
              <Hospital className="size-4 text-cyan-700" /> Select Hospital
            </label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              disabled={loadingHospitals}
              className="w-full border border-cyan-200 rounded-xl px-3 py-2 font-mono text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-cyan-50 transition"
            >
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                  {h.address ? ` – ${h.address}` : ""}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-700 font-mono text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertTriangle className="size-4 text-red-700" />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 text-green-700 font-mono text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-cyan-800 hover:bg-cyan-700 text-white font-mono font-bold shadow transition disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send to Hospital"}
            </button>
          </div>
        </form>

        <div className="mt-8 w-full">
          <label className="text-sm font-mono font-semibold text-cyan-800 mb-1">
            Preview message
          </label>
          <pre className="whitespace-pre-wrap bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-sm font-mono text-cyan-900">
            {message}
          </pre>
        </div>
      </div>
    </div>
  );
}
