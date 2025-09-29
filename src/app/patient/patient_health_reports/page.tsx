"use client"

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";

// 1. FIX: Changed 'any' to 'unknown' for better type safety
type Report = {
  id: string;
  date: string;
  description: string;
  [key: string]: unknown;
};

export default function Patient_health_Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const session = await getSession();
        if (!session || !session.user || !session.user.id) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }
        // 2. FIX: Removed unused 'userId' variable
        
        // Fetch patient profile data
        const res = await fetch(`/api/patient/profile`);
        if (!res.ok) {
          throw new Error("Failed to fetch patient profile.");
        }
        const data = await res.json();

        // Assuming the API returns { ...userData, pastReports: [...] }
        setReports(data.pastReports || []);
      } catch (err: unknown) { // 3. FIX: Changed 'any' to 'unknown'
        // Add a type check to safely access the error message
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="w-[100vw] h-[90vh] bg-gray-400" >
        Loading reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-200 w-[100vw] h-[90vh] flex flex-col justify-center items-center" >
      <h2 className="text-2xl font-bold mb-4 text-cyan-800">Past Health Reports</h2>
      {reports.length === 0 ? (
        <div className="text-cyan-700">No past reports found.</div>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li key={report.id} className="border p-4 rounded shadow text-cyan-900">
              <div><strong>Date:</strong> {report.date}</div>
              <div><strong>Description:</strong> {report.description}</div>
              {/* Add more report fields as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}