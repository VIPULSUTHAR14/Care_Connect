"use client"

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";

type Report = {
  id: string;
  date: string;
  description: string;
  [key: string]: any;
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
        const userId = session.user.id;

        // Fetch patient profile data
        const res = await fetch(`/api/patient/profile`);
        if (!res.ok) {
          throw new Error("Failed to fetch patient profile.");
        }
        const data = await res.json();

        // Assuming the API returns { ...userData, pastReports: [...] }
        setReports(data.pastReports || []);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div>
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
    <div>
      <h2 className="text-2xl font-bold mb-4">Past Health Reports</h2>
      {reports.length === 0 ? (
        <div>No past reports found.</div>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li key={report.id} className="border p-4 rounded shadow">
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