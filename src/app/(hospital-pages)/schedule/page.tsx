"use client";

import { useState } from "react";
import { Clock, CalendarDays, Edit2, CheckCircle2 } from "lucide-react";

const defaultSchedule = [
  {
    day: "Monday",
    open: "08:00 AM",
    close: "06:00 PM",
    break: "01:00 PM - 02:00 PM",
  },
  {
    day: "Tuesday",
    open: "08:00 AM",
    close: "06:00 PM",
    break: "01:00 PM - 02:00 PM",
  },
  {
    day: "Wednesday",
    open: "08:00 AM",
    close: "06:00 PM",
    break: "01:00 PM - 02:00 PM",
  },
  {
    day: "Thursday",
    open: "08:00 AM",
    close: "06:00 PM",
    break: "01:00 PM - 02:00 PM",
  },
  {
    day: "Friday",
    open: "08:00 AM",
    close: "06:00 PM",
    break: "01:00 PM - 02:00 PM",
  },
  {
    day: "Saturday",
    open: "09:00 AM",
    close: "01:00 PM",
    break: "No Break",
  },
  {
    day: "Sunday",
    open: "Closed",
    close: "Closed",
    break: "-",
  },
];

export default function HospitalSchedulePage() {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    open: "",
    close: "",
    break: "",
  });

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditData({
      open: schedule[idx].open,
      close: schedule[idx].close,
      break: schedule[idx].break,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = (idx: number) => {
    const updated = [...schedule];
    updated[idx] = {
      ...updated[idx],
      open: editData.open,
      close: editData.close,
      break: editData.break,
    };
    setSchedule(updated);
    setEditIdx(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex flex-col items-center py-0 px-0 font-mono">
      <div className="w-full max-w-3xl mx-auto mt-10 mb-8 px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-cyan-900 mb-2 flex items-center gap-3">
          <CalendarDays size={32} className="text-cyan-800" />
          Hospital Weekly Schedule
        </h1>
        <p className="text-gray-800 text-base sm:text-lg mb-6">
          View and manage your hospital's weekly operating hours. <br className="hidden sm:block" />
          <span className="text-cyan-900 font-semibold">Tip:</span> Click <Edit2 size={16} className="inline mb-1" /> to edit a day's schedule.
        </p>
        <div className="overflow-x-auto rounded-2xl shadow-lg border border-cyan-100 bg-white">
          <table className="min-w-full divide-y divide-cyan-100">
            <thead className="bg-cyan-50">
              <tr>
                <th className="px-6 py-4 text-left text-cyan-900 text-lg font-bold">Day</th>
                <th className="px-6 py-4 text-left text-cyan-900 font-semibold">Open</th>
                <th className="px-6 py-4 text-left text-cyan-900 font-semibold">Close</th>
                <th className="px-6 py-4 text-left text-cyan-900 font-semibold">Break</th>
                <th className="px-6 py-4 text-center text-cyan-900 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, idx) => (
                <tr
                  key={item.day}
                  className={`transition hover:bg-cyan-50 ${idx % 2 === 0 ? "bg-white" : "bg-cyan-50/60"}`}
                >
                  <td className="px-6 py-4 font-semibold text-cyan-950">{item.day}</td>
                  <td className="px-6 py-4">
                    {editIdx === idx ? (
                      <input
                        type="text"
                        name="open"
                        value={editData.open}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-28 text-cyan-900 font-mono text-sm"
                        disabled={item.day === "Sunday"}
                      />
                    ) : (
                      <span className={item.open === "Closed" ? "text-red-600 font-semibold" : "text-cyan-950"}>
                        {item.open}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editIdx === idx ? (
                      <input
                        type="text"
                        name="close"
                        value={editData.close}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-28 text-cyan-900 font-mono text-sm"
                        disabled={item.day === "Sunday"}
                      />
                    ) : (
                      <span className={item.close === "Closed" ? "text-red-600 font-semibold" : "text-cyan-950"}>
                        {item.close}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editIdx === idx ? (
                      <input
                        type="text"
                        name="break"
                        value={editData.break}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-40 text-cyan-900 font-mono text-sm"
                        disabled={item.day === "Sunday"}
                      />
                    ) : (
                      <span className="text-cyan-950">{item.break}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editIdx === idx ? (
                      <button
                        className="inline-flex items-center gap-1 bg-cyan-900 text-white px-3 py-1 rounded hover:bg-cyan-950 transition text-sm font-semibold"
                        onClick={() => handleSave(idx)}
                      >
                        <CheckCircle2 size={16} /> Save
                      </button>
                    ) : (
                      <button
                        className="inline-flex items-center gap-1 bg-cyan-200 text-cyan-900 px-3 py-1 rounded hover:bg-cyan-300 transition text-sm font-semibold"
                        onClick={() => handleEdit(idx)}
                        disabled={item.day === "Sunday"}
                        title={item.day === "Sunday" ? "Closed" : "Edit"}
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-900 font-semibold">
            <Clock size={20} />
            <span>
              <span className="font-bold">Regular Hours:</span> Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 1:00 PM
            </span>
          </div>
          <div className="text-gray-800 text-sm">
            <span className="font-semibold text-cyan-900">Note:</span> Sunday Closed
          </div>
        </div>
      </div>
    </div>
  );
}
