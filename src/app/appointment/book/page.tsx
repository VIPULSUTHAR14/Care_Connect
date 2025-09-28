"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Calendar, Clock, AlertTriangle, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";

type Severity = "low" | "medium" | "high" | "emergency";

// Add some basic symptoms for selection
const BASIC_SYMPTOMS = [
  "Fever",
  "Headache",
  "Cough",
  "Cold",
  "Sore throat",
  "Body ache",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Fatigue",
  "Shortness of breath",
  "Chest pain",
  "Dizziness",
  "Rash",
  "Stomach pain",
  "Back pain",
  "Joint pain",
  "Other",
];

function getToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString().slice(0, 10);
}

function getTimeSlots() {
  // 9:00 to 17:00, every 30 min
  const slots: string[] = [];
  for (let h = 9; h <= 17; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    if (h !== 17) slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

export default function BookAppointmentPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  const receiverId = params?.get("receiverId") || "";
  const hospitalName = params?.get("hospital") || "Hospital";

  const [date, setDate] = useState<string>(getToday());
  const [time, setTime] = useState<string>("");
  const [severity, setSeverity] = useState<Severity>("low");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherSymptom, setOtherSymptom] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const now = new Date();
    const today = getToday();
    if (date === today) {
      const slots = getTimeSlots();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      let found = slots.find((slot) => {
        const [h, m] = slot.split(":").map(Number);
        return h * 60 + m > currentMinutes;
      });
      setTime(found || slots[0]);
    } else {
      setTime(getTimeSlots()[0]);
    }
  }, [date]);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!receiverId || !date || !time) {
      setError("Please pick a date and time.");
      return;
    }
    try {
      setSubmitting(true);
      const when = new Date(`${date}T${time}:00`).toLocaleString();

      // Compose symptoms string
      let symptomsText = "";
      if (selectedSymptoms.length > 0) {
        symptomsText =
          "Symptoms: " +
          selectedSymptoms
            .map((s) =>
              s === "Other" && otherSymptom.trim()
                ? `Other (${otherSymptom.trim()})`
                : s
            )
            .join(", ");
      }

      const message =
        `Appointment request for ${when}. Severity: ${severity.toUpperCase()}.` +
        (symptomsText ? `\n${symptomsText}` : "") +
        (customMessage.trim() ? `\nMessage: ${customMessage.trim()}` : "");

      const res = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: "self",
          receiverId,
          type: "appointment",
          message,
        }),
      });
      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch {
          // ignore
        }
        throw new Error((data as any)?.error || "Failed to send request");
      }
      setSuccess("Appointment request sent to hospital");
      toast.success("Appointment request sent to hospital");
      setTimeout(() => router.push("/notification"), 800);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
      toast.error(err?.message || "Something went wrong")
    } finally {
      setSubmitting(false);
    }
  };

  // Check what is causing screen overflow in width

  // 1. The outermost div uses `minWidth: "100vw"` in the style prop.
  //    - "100vw" includes the width of the scrollbar, which can cause horizontal overflow.
  //    - Tailwind's `w-screen` or `min-w-screen` can also cause this if used.
  //    - The className also has an extra space at the start, but that's not a functional issue.

  // 2. The inner container uses `w-full max-w-7xl`, which is fine as long as the parent doesn't overflow.

  // 3. The time slot picker uses a grid with `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2`.
  //    - If there are too many time slots, and the parent is too narrow, it could overflow, but with `w-full` on the parent, it should wrap.

  // 4. The symptom picker uses `flex flex-wrap gap-2` for the buttons, which should wrap and not overflow.

  // 5. The form uses `w-full`, which is fine as long as the parent is not overflowing.

  // 6. The action buttons use `w-full sm:w-auto`, so on small screens they stack, on larger screens they are inline.

  // 7. The only thing that can cause horizontal overflow is the use of `minWidth: "100vw"` on the outermost div.
  //    - On most browsers, `100vw` includes the scrollbar, so the content is wider than the viewport, causing horizontal scroll.
  //    - The correct approach is to use `w-full` or remove the `minWidth: "100vw"` style.

  // 8. To fix, remove `minWidth: "100vw"` from the style prop.

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 to-white px-2 sm:px-4"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-full max-w-7xl py-10 sm:py-16 px-2 sm:px-8 bg-white rounded-none sm:rounded-2xl shadow-md border border-gray-100 box-border overflow-x-auto">
        <h1 className="text-3xl sm:text-4xl font-mono font-extrabold text-cyan-800 mb-8 tracking-tight text-center">
          Book Appointment
        </h1>
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="font-mono text-lg text-cyan-700">at</span>
          <span className="font-mono text-xl font-bold text-cyan-900 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-100">
            {hospitalName}
          </span>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-7 font-mono text-base text-gray-800 w-full"
          autoComplete="off"
        >
          {/* Date Picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-800 mb-2">
              <Calendar className="w-4 h-4 text-cyan-500" />
              Choose a date
            </label>
            <input
              type="date"
              min={getToday()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-cyan-200 rounded-lg px-4 py-2 font-mono text-cyan-900 bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition"
              required
            />
          </div>
          {/* Time Slot Picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-800 mb-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              Select a time slot
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {getTimeSlots().map((slot) => (
                <button
                  type="button"
                  key={slot}
                  className={`px-3 py-2 rounded-lg border font-mono text-base transition shadow-sm w-full ${
                    time === slot
                      ? "bg-cyan-700 text-white border-cyan-700 font-bold"
                      : "bg-white border-cyan-200 text-cyan-800 hover:bg-cyan-50"
                  }`}
                  onClick={() => setTime(slot)}
                  aria-pressed={time === slot}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          {/* Symptom Picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-800 mb-2">
              <span role="img" aria-label="symptom">🩺</span>
              Select your symptoms <span className="text-xs text-gray-400">(choose all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BASIC_SYMPTOMS.map((symptom) => (
                <button
                  type="button"
                  key={symptom}
                  className={`px-3 py-1 rounded-full border font-mono text-xs transition shadow-sm ${
                    selectedSymptoms.includes(symptom)
                      ? "bg-cyan-600 text-white border-cyan-600 font-bold"
                      : "bg-white border-cyan-200 text-cyan-800 hover:bg-cyan-50"
                  }`}
                  onClick={() => handleSymptomToggle(symptom)}
                  aria-pressed={selectedSymptoms.includes(symptom)}
                >
                  {symptom}
                </button>
              ))}
            </div>
            {/* Show input for "Other" symptom */}
            {selectedSymptoms.includes("Other") && (
              <input
                type="text"
                value={otherSymptom}
                onChange={(e) => setOtherSymptom(e.target.value)}
                className="mt-2 w-full border border-cyan-200 rounded-lg px-4 py-2 font-mono text-cyan-900 bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="Please specify other symptom(s)..."
              />
            )}
          </div>
          {/* Severity Picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-800 mb-2">
              <AlertTriangle className="w-4 h-4 text-cyan-500" />
              Issue severity
            </label>
            <div className="flex flex-wrap gap-2">
              {(["low", "medium", "high", "emergency"] as Severity[]).map((level) => (
                <button
                  type="button"
                  key={level}
                  className={`px-4 py-2 rounded-full border font-mono text-xs font-bold uppercase transition shadow-sm ${
                    severity === level
                      ? "bg-cyan-800 text-white border-cyan-800"
                      : "bg-white border-cyan-200 text-cyan-800 hover:bg-cyan-50"
                  }`}
                  onClick={() => setSeverity(level)}
                  aria-pressed={severity === level}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          {/* Message */}
          <div>
            <label className="text-sm font-mono font-bold text-cyan-800 mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-cyan-500" />
              Additional message <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="w-full border border-cyan-200 rounded-lg px-4 py-2 font-mono text-cyan-900 bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition"
              placeholder="Describe your symptoms, preferences, or any other info..."
            />
          </div>
          {/* Error/Success */}
          {error && (
            <div className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2" data-testid="error-message">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm font-mono text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2" data-testid="success-message">
              {success}
            </div>
          )}
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2 w-full">
            <button
              disabled={submitting}
              type="submit"
              className="px-6 py-2 bg-cyan-800 text-white font-mono font-bold rounded-full shadow hover:bg-cyan-700 transition disabled:opacity-60 w-full sm:w-auto"
            >
              {submitting ? "Sending…" : "Send Request"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-cyan-800 text-cyan-800 font-mono font-bold rounded-full bg-white hover:bg-cyan-50 transition w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
