"use client";

import { useMemo, useState } from "react";
import data from "@/data/medicine_data.json";
import { Pill, Search } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface MedicineItem {
    medicine_name: string;
    active_ingredient: string;
    causes_for_use: string[];
    summary: string;
    stock: string;
}

// 1. FIX: Create a type for the imported JSON data structure
interface MedicineData {
    medicines: MedicineItem[];
}

// 2. FIX: Initialize 'medicines' outside the component.
// This gives it a stable reference and solves the exhaustive-deps warning.
const medicines: MedicineItem[] = (data as MedicineData).medicines || [];

export default function WhatYouTakingPage() {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return medicines;
        return medicines.filter((m) => {
            return (
                m.medicine_name.toLowerCase().includes(q) ||
                m.active_ingredient.toLowerCase().includes(q) ||
                m.causes_for_use.some((c) => c.toLowerCase().includes(q))
            );
        });
    }, [query]); // 'medicines' is now a stable constant, so it's removed from dependencies.

    return (
        <div className="min-h-[90vh] bg-gray-50 flex flex-col items-center py-8 px-2 md:px-0">
            <div className="w-full max-w-4xl flex flex-col items-center">
                <div className="flex items-center gap-3 mb-2">
                    <Pill className="size-8 text-cyan-700" />
                    <h1 className="text-3xl md:text-4xl font-mono font-bold text-cyan-800">What You’re Taking</h1>
                </div>
                <p className="text-md md:text-lg text-gray-700 font-mono mb-6 text-center">
                    Search medicines to view ingredients, uses, and availability.
                </p>
                <div className="w-full flex flex-col items-center mb-8">
                    <div className="relative w-full md:w-2/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-700 size-5" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, ingredient, or use..."
                            className="w-full pl-10 pr-4 py-3 border border-violet-300 rounded-full font-mono text-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white transition text-gray-900 placeholder-gray-500"
                        />
                    </div>
                    <div className="mt-2 text-sm text-gray-500 font-mono">
                        {filtered.length} result{filtered.length === 1 ? "" : "s"}
                    </div>
                </div>
            </div>
            <div className="w-full max-w-6xl">
                {filtered.length === 0 ? (
                    <div className="text-gray-500 font-mono text-center py-12 text-lg">No medicines found.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((m) => (
                            <div
                                key={m.medicine_name}
                                className="bg-white rounded-2xl border border-violet-200 shadow-md hover:shadow-violet-300 transition-all p-6 flex flex-col justify-between min-h-[340px]"
                            >
                                <div>
                                    <h3 className="text-xl font-bold font-mono text-violet-800 mb-1">{m.medicine_name}</h3>
                                    <p className="text-sm text-violet-700 font-mono mb-2">{m.active_ingredient}</p>
                                    <div className="mb-2">
                                        <p className="text-sm font-semibold text-gray-800 font-mono mb-1">Common uses:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-700 font-mono space-y-0.5">
                                            {m.causes_for_use.map((c) => (
                                                <li key={c}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p className="text-sm text-gray-700 font-mono mb-4">{m.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}