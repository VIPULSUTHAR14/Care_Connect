"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";

type Report = {
  id: string;
  date: string;
  description: string;
  [key: string]: any;
};

export default function PastReportsOverview() {
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

        // Fetch patient profile data
        const res = await fetch(`/api/patient/profile`);
        if (!res.ok) {
          throw new Error("Failed to fetch patient profile.");
        }
        const data = await res.json();

        // Get the most recent 3 reports for overview
        const recentReports = (data.pastReports || []).slice(0, 3);
        setReports(recentReports);
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
      <div className="w-[80vw] h-[20vh] bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center drop-shadow-lg drop-shadow-black ">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
          <span className="text-gray-600">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[80vw] h-[30vh] bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center drop-shadow-lg drop-shadow-black ">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading reports</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[80vw] h-[30vh] bg-white rounded-xl shadow-lg border border-gray-200 p-6 m-4 drop-shadow-sm drop-shadow-black ">
      
      {reports.length === 0 ? (
        <div className="flex items-center justify-center h-full  ">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <p className="text-gray-600">No past reports found</p>
            <p className="text-sm text-gray-500">Your health reports will appear here</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {reports.map((report, index) => (
            <div key={report.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">
                  Report #{index + 1}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(report.date).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-gray-700 line-clamp-3">
                {report.description || 'No description available'}
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Completed
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
