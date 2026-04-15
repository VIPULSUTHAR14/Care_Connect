"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PastReportsOverview from "@/components/features/reports/PastReportsOverview";
import { ArrowRight, BriefcaseMedical, ClipboardClock, Pill, MessageSquare, Plus, Activity, User } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-cyan-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const sidebarItems = [
    {
      title: "Pill Reminders",
      description: "Get timely alerts for your med schedule.",
      icon: Pill,
      color: "rose",
      path: "/pill",
      cta: "Remind me"
    },
    {
      title: "Pharmacies",
      description: "Find and contact nearby drugstores.",
      icon: BriefcaseMedical,
      color: "blue",
      path: "/pharmacy",
      cta: "Find Now"
    },
    {
      title: "Med Info",
      description: "Detailed details about your meds.",
      icon: ClipboardClock,
      color: "violet",
      path: "/what-you-taking",
      cta: "Learn more"
    },
    {
      title: "Appointments",
      description: "Book visits with top specialists.",
      icon: ClipboardClock,
      color: "amber",
      path: "/hospitals",
      cta: "Book Now"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-cyan-50/40 flex flex-col xl:flex-row pb-10">
      {/* Sidebar Section */}
      <aside className="w-full xl:w-80 px-4 pt-6 xl:pt-10 flex flex-col gap-6">
        <div className="px-2">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-cyan-600 drop-shadow-[0_0_8px_rgba(8,145,178,0.4)]" />
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Healthcare Pulse
            </h2>
          </div>
          <p className="text-sm text-slate-500 font-medium">Manage your health effortlessly</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
          {sidebarItems.map((item, idx) => {
            const colorClasses: Record<string, string> = {
              rose: "bg-rose-50 text-rose-600",
              blue: "bg-blue-50 text-blue-600",
              violet: "bg-violet-50 text-violet-600",
              amber: "bg-amber-50 text-amber-600",
            };
            const hoverBgClasses: Record<string, string> = {
              rose: "bg-rose-500/5",
              blue: "bg-blue-500/5",
              violet: "bg-violet-500/5",
              amber: "bg-amber-500/5",
            };

            return (
              <div
                key={idx}
                onClick={() => router.push(item.path)}
                className="group relative bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-cyan-100/50 hover:border-cyan-200 transition-all cursor-pointer overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 ${hoverBgClasses[item.color]} rounded-full group-hover:scale-150 transition-transform duration-500`} />

                <div className="flex flex-col h-full relative z-10">
                  <div className={`w-10 h-10 rounded-xl ${colorClasses[item.color].split(' ')[0]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${colorClasses[item.color].split(' ')[1]}`} />
                  </div>

                  <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-cyan-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 grow">
                    {item.description}
                  </p>

                  <div className="flex items-center text-xs font-bold text-cyan-600 gap-1 group-hover:gap-2 transition-all">
                    {item.cta} <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 xl:px-8 pt-6 xl:pt-10 flex flex-col gap-8">
        {/* Recent Reports Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recent Health Activity</h2>
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Overview of your latest medical data</p>
            </div>
            <Link
              href="/dashboard/reports"
              className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1.5 transition-all px-4 py-2 bg-cyan-50 rounded-full hover:bg-cyan-100 border border-cyan-100/50 shadow-sm"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-cyan-50 rounded-4xl p-4 shadow-sm overflow-hidden hover:shadow-lg hover:shadow-cyan-100/20 transition-all">
            <PastReportsOverview />
          </div>
        </section>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Health Assistant Hero */}
          <section className="relative overflow-hidden rounded-4xl bg-linear-to-br from-cyan-950 via-cyan-900 to-indigo-950 p-8 shadow-2xl border border-cyan-800/30">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full -mr-32 -mt-32 blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/10 rounded-full -ml-32 -mb-32 blur-[100px]" />

            <div className="relative z-10 h-full flex flex-col items-center justify-between text-center py-4">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-bold text-cyan-100 border border-white/10 uppercase tracking-[0.2em] shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                  AI Powered Insights
                </div>
                <h3 className="text-4xl font-extrabold text-white tracking-tight lead">Need Medical Clarity?</h3>
                <p className="text-cyan-100/80 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                  Ask our AI Assistant about symptoms, medications, or wellness tips for instant guidance.
                </p>
              </div>

              <button
                onClick={() => router.push("/chatbot")}
                className="mt-8 px-10 py-4 bg-white text-cyan-950 rounded-2xl font-black text-lg shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(34,211,238,0.4)] hover:-translate-y-1 transition-all flex items-center gap-3 group border-b-4 border-cyan-200"
              >
                Start Consultation
                <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </section>

          {/* Quick Actions Grid */}
          <section className="flex flex-col gap-5">
            <div className="px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Quick Actions</h2>
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Frequent tasks at your fingertips</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 grow">
              <Link
                href="/hospitals"
                className="group p-6 bg-white/70 backdrop-blur-md border border-blue-100/50 rounded-4xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-blue-50/80 hover:shadow-2xl hover:shadow-blue-200/40 hover:border-blue-200"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-blue-100/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardClock className="w-7 h-7 text-blue-600" />
                </div>
                <span className="font-extrabold text-bl ue-900 tracking-tight text-lg">Appointments</span>
              </Link>

              <Link
                href="/doctors"
                className="group p-6 bg-white/70 backdrop-blur-md border border-emerald-100/50 rounded-4xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-emerald-50/80 hover:shadow-2xl hover:shadow-emerald-200/40 hover:border-emerald-200"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-emerald-100/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7 text-emerald-600" />
                </div>
                <span className="font-extrabold text-emerald-900 tracking-tight text-lg">Find Doctor</span>
              </Link>

              <div className="group p-6 bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl flex items-center justify-between col-span-1 sm:col-span-2 hover:shadow-2xl hover:shadow-cyan-200/30 hover:border-cyan-300 transition-all cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center group-hover:bg-cyan-100 transition-colors shadow-sm">
                    <Plus className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-lg tracking-tight group-hover:text-cyan-700 transition-colors line-clamp-1">Add Medical Report</h4>
                    <p className="text-sm text-slate-500 font-medium">Upload latest test results securely</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-cyan-200 group-hover:bg-cyan-50 transition-all">
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
