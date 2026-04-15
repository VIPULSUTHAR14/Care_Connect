"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    CalendarDays,
    Users,
    ClipboardList,
    Stethoscope,
    Clock,
    FileText,
    ArrowRight,
    Activity,
    Mail,
    Award,
    MapPin,
    Phone,
    Briefcase,
    Search,
    Settings,
    Bell,
    ChevronRight,
    TrendingUp,
    Loader2,
    LayoutDashboard,
    Video
} from "lucide-react";

// --- Custom Components for the New Layout ---

function SidebarItem({ icon: Icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-cyan-900/60 hover:bg-cyan-50'}`}>
            <Icon size={20} className={active ? '' : 'group-hover:text-cyan-600 transition-colors'} />
            <span className="font-bold text-sm tracking-tight">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
        </Link>
    );
}

function BentoCard({ children, className = "", title = "", icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) {
    return (
        <div className={`glass-card p-6 border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group relative ${className}`}>
            {title && (
                <div className="flex items-center gap-2 mb-6">
                    {Icon && <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600"><Icon size={18} /></div>}
                    <h3 className="text-sm font-extrabold text-cyan-950 uppercase tracking-widest">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
}

function MiniStat({ label, value, trend, icon: Icon, colorClass }: { label: string, value: string | number, trend: string, icon: any, colorClass: string }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${colorClass} text-white shadow-lg shrink-0`}>
                    <Icon size={20} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                    <TrendingUp size={10} /> {trend}
                </div>
            </div>
            <div>
                <div className="text-2xl font-black text-cyan-950 tracking-tighter">{value}</div>
                <div className="text-[11px] font-bold text-cyan-800/40 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );
}

export default function DoctorDashboard() {
    const { status, data: session } = useSession();
    const router = useRouter();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState({
        todayAppointments: 0,
        totalPatients: 0,
        pendingReports: 0,
        totalReports: 0,
        nextAppointment: null as null | { patientName: string; time: string; type: string },
    });

    useEffect(() => {
        async function fetchDashboard() {
            setLoading(true);
            setError(null);
            try {
                const [profileRes, appointmentsRes, patientsRes, reportsRes] = await Promise.all([
                    fetch("/api/doctor-api/profile", { cache: "no-store" }),
                    fetch("/api/doctor-api/appointments?doctor=me", { cache: "no-store" }),
                    fetch("/api/doctor-api/patients?doctor=me", { cache: "no-store" }),
                    fetch("/api/doctor-api/patient_reports?doctor=me", { cache: "no-store" }),
                ]);

                if (!profileRes.ok) throw new Error("Failed to fetch doctor profile");
                const doctorData = await profileRes.json();
                setDoctor(doctorData.doctor);

                let todayAppointments = 0;
                let nextAppointment = null;
                if (appointmentsRes.ok) {
                    const { appointments } = await appointmentsRes.json();
                    const todayStr = new Date().toISOString().split("T")[0];
                    const todayList = (appointments || []).filter((a: any) => a.date?.startsWith(todayStr));
                    todayAppointments = todayList.length;

                    const now = new Date();
                    const next = todayList
                        .map((a: any) => ({ ...a, dateObj: new Date(a.date + "T" + (a.time || "00:00")) }))
                        .filter((a: any) => a.dateObj > now)
                        .sort((a: any, b: any) => a.dateObj - b.dateObj)[0];

                    if (next) {
                        nextAppointment = {
                            patientName: next.patientName || "Anonymous",
                            time: next.time || "00:00",
                            type: "Standard Consultation"
                        };
                    }
                }

                let patients = patientsRes.ok ? (await patientsRes.json()).patients || [] : [];
                let reports = reportsRes.ok ? (await reportsRes.json()).reports || [] : [];

                setStats({
                    todayAppointments,
                    totalPatients: patients.length,
                    pendingReports: reports.filter((r: any) => !r.completedAt).length,
                    totalReports: reports.length,
                    nextAppointment,
                });
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        }
        if (status === "authenticated" && session?.user?.userType === "doctor") {
            fetchDashboard();
        }
    }, [status, session]);

    if (loading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-cyan-50">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl border-4 border-cyan-100 border-t-cyan-600 animate-spin"></div>
                        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-600 animate-pulse" size={24} />
                    </div>
                    <p className="text-cyan-900 font-black tracking-widest text-sm uppercase">Nexus Initializing</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">

            {/* --- Sidebar Nexus --- */}
            <aside className="w-72 bg-white border-r border-slate-100 hidden xl:flex flex-col p-8 space-y-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-600/30">D</div>
                    <h1 className="text-xl font-black text-cyan-950 tracking-tight">Clinical Nexus</h1>
                </div>

                <div className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Overview" href="/dashboard" active />
                    <SidebarItem icon={CalendarDays} label="Appointments" href="/doctor_appointment" />
                    <SidebarItem icon={Users} label="Patient Directory" href="#" />
                    <SidebarItem icon={FileText} label="Clinical Reports" href="#" />
                    <SidebarItem icon={Video} label="Video Consult" href="/consult" />
                    <SidebarItem icon={Clock} label="Operational Hours" href="/doctor-schedule" />
                </div>

                <div className="bg-cyan-50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-cyan-600 shadow-sm"><Settings size={16} /></div>
                        <span className="text-sm font-bold text-cyan-950">Nexus Settings</span>
                    </div>
                    <p className="text-[10px] font-bold text-cyan-800/40 uppercase tracking-widest">Version Platinum 2.0</p>
                </div>
            </aside>

            {/* --- Main Dashboard Area --- */}
            <main className="flex-1 min-h-screen p-6 md:p-10 space-y-10 overflow-y-auto">

                {/* Top Intelligence Bar */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-900/30 group-focus-within:text-cyan-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search patients, reports, ID..."
                            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-cyan-950 placeholder:text-cyan-900/20 focus:ring-4 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-slate-100 rounded-2xl text-cyan-900/40 hover:text-cyan-600 hover:border-cyan-100 transition-all shadow-sm relative">
                            <Bell size={20} />
                            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-sm font-black text-cyan-950 truncate max-w-[150px]">{doctor?.name || "Dr. User"}</div>
                                <div className="text-[10px] font-bold text-cyan-800/40 uppercase tracking-widest">{doctor?.department || "Department"}</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-cyan-900 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-cyan-900/20">
                                {doctor?.name?.[0] || "D"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Bento Intelligence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* LARGE BENTO: Profile Nexus */}
                    <BentoCard className="md:col-span-2 md:row-span-2 bg-[#1E293B] text-white flex flex-col justify-between p-10 border-none">
                        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                            <Stethoscope size={180} />
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                Active Practitioner
                            </div>
                            <h2 className="text-4xl font-black tracking-tight leading-none">Your Clinical <br /><span className="text-cyan-400">Fingerprint</span></h2>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-4">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Medical License</div>
                                    <div className="text-lg font-bold">{doctor?.nmcRegistrationNumber || "N/A"}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Practice Length</div>
                                    <div className="text-lg font-bold">{doctor?.experience || "0"} Active Years</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Base Facility</div>
                                    <div className="text-lg font-bold truncate">{doctor?.currentHospital || "Nexus Center"}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Qualification</div>
                                    <div className="text-lg font-bold truncate">{doctor?.qualification || "MBBS"}</div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 relative z-10">
                            <button className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-cyan-500 text-white font-black hover:bg-cyan-400 transition-all duration-300 shadow-xl shadow-cyan-500/30">
                                Detailed Profile Analytics <ArrowRight size={18} />
                            </button>
                        </div>
                    </BentoCard>

                    {/* MEDIUM BENTO: Priority Queue */}
                    <BentoCard className="md:col-span-2 bg-[#F0F9FF] border border-cyan-100" title="Priority Pulse" icon={Activity}>
                        {stats.nextAppointment ? (
                            <div className="flex items-center justify-between">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-cyan-800/40 uppercase tracking-widest mb-1">Upcoming Patient</div>
                                        <div className="text-2xl font-black text-cyan-950">{stats.nextAppointment.patientName}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-cyan-600 bg-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm border border-cyan-50">
                                            <Clock size={14} /> {stats.nextAppointment.time}
                                        </div>
                                        <div className="text-[11px] font-bold text-cyan-950/60 uppercase tracking-widest">{stats.nextAppointment.type}</div>
                                    </div>
                                </div>
                                <div className="p-5 bg-white rounded-3xl shadow-xl shadow-cyan-900/5 text-cyan-600 border border-cyan-50 group-hover:scale-110 transition-transform duration-500">
                                    <Video size={32} />
                                </div>
                            </div>
                        ) : (
                            <div className="py-2 text-center space-y-2">
                                <div className="text-cyan-950 font-black text-lg">Nexus Quiet</div>
                                <p className="text-xs font-bold text-cyan-800/40 uppercase tracking-widest leading-relaxed">No immediate clinical <br />actions required</p>
                            </div>
                        )}
                    </BentoCard>

                    {/* SMALL BENTOS: Metrics & Vital Stats */}
                    <BentoCard className="bg-white">
                        <MiniStat label="Daily Rounds" value={stats.todayAppointments} trend="+12%" icon={CalendarDays} colorClass="bg-cyan-600" />
                    </BentoCard>
                    <BentoCard className="bg-white">
                        <MiniStat label="Nexus Patients" value={stats.totalPatients} trend="+5%" icon={Users} colorClass="bg-blue-600" />
                    </BentoCard>
                    <BentoCard className="bg-white">
                        <MiniStat label="Pending Logs" value={stats.pendingReports} trend="-8%" icon={ClipboardList} colorClass="bg-orange-600" />
                    </BentoCard>
                    <BentoCard className="bg-white">
                        <MiniStat label="Diagnostic Vault" value={stats.totalReports} trend="+18%" icon={FileText} colorClass="bg-indigo-600" />
                    </BentoCard>

                    {/* QUICKS BENTO: Deep Links */}
                    <BentoCard className="md:col-span-2 lg:col-span-1" title="Utilities" icon={Settings}>
                        <div className="space-y-3">
                            <Link href="/doctor_appointment" className="flex items-center justify-between p-4 rounded-xl hover:bg-cyan-50 transition-colors group/link">
                                <span className="text-xs font-black text-cyan-950 uppercase tracking-widest">Master Queue</span>
                                <ChevronRight size={14} className="text-cyan-300 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/doctor-schedule" className="flex items-center justify-between p-4 rounded-xl hover:bg-cyan-50 transition-colors group/link">
                                <span className="text-xs font-black text-cyan-950 uppercase tracking-widest">Vault Access</span>
                                <ChevronRight size={14} className="text-cyan-300 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="#" className="flex items-center justify-between p-4 rounded-xl hover:bg-cyan-50 transition-colors group/link">
                                <span className="text-xs font-black text-cyan-950 uppercase tracking-widest">Clinical Bio</span>
                                <ChevronRight size={14} className="text-cyan-300 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </BentoCard>

                    {/* CONTACT BENTO: Urgent Communications */}
                    <BentoCard className="md:col-span-2 lg:col-span-1 border-dashed border-2 border-cyan-800/10 hover:border-cyan-600/30" title="Direct Sync" icon={Phone}>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600"><Phone size={14} /></div>
                                <div className="text-[11px] font-bold text-cyan-950">{doctor?.phoneNumber || "No Sync"}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600"><MapPin size={14} /></div>
                                <div className="text-[11px] font-bold text-cyan-950 truncate max-w-[150px]">{doctor?.address || "Hosp. Nexus"}</div>
                            </div>
                        </div>
                    </BentoCard>

                </div>
            </main>
        </div>
    );
}


