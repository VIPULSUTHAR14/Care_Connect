"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Pencil, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

type DaySchedule = {
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function DoctorSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [weekSchedule, setWeekSchedule] = useState<Record<string, DaySchedule>>(
    () =>
      daysOfWeek.reduce(
        (acc, day) => ({
          ...acc,
          [day]: { startTime: "", endTime: "", location: "", notes: "" },
        }),
        {} as Record<string, DaySchedule>
      )
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    day: string,
    field: keyof DaySchedule,
    value: string
  ) => {
    setWeekSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const filledDays = daysOfWeek.filter(
      (day) =>
        weekSchedule[day].startTime &&
        weekSchedule[day].endTime
    );

    if (filledDays.length === 0) {
      setErrorMsg("Please fill at least one day's start and end time.");
      setLoading(false);
      return;
    }

    for (const day of filledDays) {
      const { startTime, endTime } = weekSchedule[day];
      if (startTime >= endTime) {
        setErrorMsg(`On ${day}, start time must be before end time.`);
        setLoading(false);
        return;
      }
    }

    try {
      const scheduleArray = filledDays.map((day) => ({
        day,
        ...weekSchedule[day],
      }));

      const res = await fetch("/api/doctor/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: session?.user?.id,
          schedules: scheduleArray,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save schedule.");
      }

      setSuccessMsg("Weekly schedule saved successfully!");
      setWeekSchedule(() =>
        daysOfWeek.reduce(
          (acc, day) => ({
            ...acc,
            [day]: { startTime: "", endTime: "", location: "", notes: "" },
          }),
          {} as Record<string, DaySchedule>
        )
      );
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  // Loading and Auth checks remain the same
  if (status === "loading") {
    return <div className="min-h-[90vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-700"/></div>;
  }
  if (status !== "authenticated" || session?.user?.userType !== "doctor") {
    return <div className="min-h-[90vh] flex items-center justify-center p-4 text-center text-red-900 font-mono text-lg">Unauthorized. Please sign in as a doctor.</div>;
  }

  return (
    <div className="min-h-[90vh] bg-gray-50 px-4 py-10 font-mono text-neutral-900 text-lg">
      <div className="w-full max-w-screen mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
        <div className="text-center mb-8">
            <Calendar className="mx-auto h-10 w-10 text-cyan-600 mb-2"/>
            <h1 className="text-3xl font-bold text-neutral-900 font-mono">
                Set Your Weekly Schedule
            </h1>
            <p className="text-neutral-900 mt-1 font-mono text-lg">Update your availability for the upcoming week.</p>
        </div>
        
        <form className="space-y-6 grid grid-cols-2" onSubmit={handleSubmit}>
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-neutral-900 font-mono">{day}</span>
                <span className="text-neutral-500 text-base font-mono">(leave blank if unavailable)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                {/* Start Time */}
                <div>
                  <label className="flex items-center text-lg font-bold text-neutral-900 font-mono mb-1" htmlFor={`${day}-startTime`}>
                    <Clock className="w-5 h-5 mr-2 text-gray-700"/> Start Time
                  </label>
                  <input
                    type="time"
                    id={`${day}-startTime`}
                    value={weekSchedule[day].startTime}
                    onChange={(e) => handleChange(day, "startTime", e.target.value)}
                    className="w-full border-gray-400 rounded-md shadow-sm focus:ring-cyan-600 focus:border-cyan-600 text-neutral-900 font-mono text-lg px-2 py-1"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="flex items-center text-lg font-bold text-neutral-900 font-mono mb-1" htmlFor={`${day}-endTime`}>
                    <Clock className="w-5 h-5 mr-2 text-gray-700"/> End Time
                  </label>
                  <input
                    type="time"
                    id={`${day}-endTime`}
                    value={weekSchedule[day].endTime}
                    onChange={(e) => handleChange(day, "endTime", e.target.value)}
                    className="w-full border-gray-400 rounded-md shadow-sm focus:ring-cyan-600 focus:border-cyan-600 text-neutral-900 font-mono text-lg px-2 py-1"
                  />
                </div>

                {/* Location - Spans full width */}
                <div className="md:col-span-2">
                  <label className="flex items-center text-lg font-bold text-neutral-900 font-mono mb-1" htmlFor={`${day}-location`}>
                    <MapPin className="w-5 h-5 mr-2 text-gray-700"/> Location/Room
                  </label>
                  <input
                    type="text"
                    id={`${day}-location`}
                    value={weekSchedule[day].location}
                    onChange={(e) => handleChange(day, "location", e.target.value)}
                    className="w-full border-gray-400 rounded-md shadow-sm focus:ring-cyan-600 focus:border-cyan-600 text-neutral-900 font-mono text-lg px-2 py-1"
                    placeholder="e.g. Room 101, Main Clinic"
                  />
                </div>

                {/* Notes - Spans full width */}
                <div className="md:col-span-2">
                  <label className="flex items-center text-lg font-bold text-neutral-900 font-mono mb-1" htmlFor={`${day}-notes`}>
                    <Pencil className="w-5 h-5 mr-2 text-gray-700"/> Notes
                  </label>
                  <textarea
                    id={`${day}-notes`}
                    value={weekSchedule[day].notes}
                    onChange={(e) => handleChange(day, "notes", e.target.value)}
                    className="w-full border-gray-400 rounded-md shadow-sm focus:ring-cyan-600 focus:border-cyan-600 text-neutral-900 font-mono text-lg px-2 py-1"
                    rows={2}
                    placeholder="Any special instructions for this day..."
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="flex items-center gap-3 p-3 text-lg text-red-900 bg-red-100 border border-red-300 rounded-md font-mono">
                <AlertCircle className="w-5 h-5"/> {errorMsg}
            </div>
          )}
          {successMsg && (
             <div className="flex items-center gap-3 p-3 text-lg text-green-900 bg-green-100 border border-green-300 rounded-md font-mono">
                <CheckCircle2 className="w-5 h-5"/> {successMsg}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-[40vw] h-[70px] inline-flex justify-center items-center px-4 py-3 border border-transparent text-lg font-bold rounded-md shadow-sm text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            >
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin"/>}
              {loading ? "Saving..." : "Save Weekly Schedule"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/doctor/dashboard")}
              className="w-[40vw] h-[70px] inline-flex justify-center px-4 py-3 border border-gray-400 text-lg font-bold rounded-md shadow-sm text-neutral-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 font-mono"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default DoctorSchedulePage;