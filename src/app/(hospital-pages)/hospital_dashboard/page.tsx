"use client"
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    Users,
    Calendar,
    Clock,
    UserCircle,
    ChevronRight,
    Activity,
    ShieldCheck,
    Building2,
    Settings,
    Plus,
    ArrowRight
} from "lucide-react";

export default function Dashboard() {
    const { status, data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.replace("/signin-hospital");
            return;
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-slate-800">
                <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Synchronizing Hospital Data...</p>
            </div>
        );
    }

    const hospitalName = session?.user?.name || "Hospital";

    const stats = [
        { label: "Active Staff", value: "24", icon: Users, color: "blue" },
        { label: "Today's Appointments", value: "128", icon: Calendar, color: "emerald" },
        { label: "System Status", value: "Online", icon: Activity, color: "cyan" },
        { label: "Security", value: "Verified", icon: ShieldCheck, color: "amber" },
    ];

    const menuItems = [
        {
            title: "Hospital Profile",
            desc: "Manage credentials, facility details, and public imagery.",
            icon: UserCircle,
            href: "/profile",
            color: "bg-blue-50",
            iconColor: "text-blue-600",
            borderColor: "border-blue-100"
        },
        {
            title: "Medical Staff",
            desc: "Onboard doctors, nursing staff, and administrative personnel.",
            icon: Users,
            href: "/staff",
            color: "bg-emerald-50",
            iconColor: "text-emerald-600",
            borderColor: "border-emerald-100"
        },
        {
            title: "Appointments",
            desc: "Real-time queue management and appointment scheduling.",
            icon: Calendar,
            href: "/appointments",
            color: "bg-sky-50",
            iconColor: "text-sky-600",
            borderColor: "border-sky-100"
        },
        {
            title: "Master Schedule",
            desc: "Configure duty rosters and facility operational hours.",
            icon: Clock,
            href: "/hospital-schedule",
            color: "bg-violet-50",
            iconColor: "text-violet-600",
            borderColor: "border-violet-100"
        },
        {
            title: "Attendance Logs",
            desc: "Track biometric records and duty hours for all employees.",
            icon: ShieldCheck,
            href: "/attendance",
            color: "bg-amber-50",
            iconColor: "text-amber-600",
            borderColor: "border-amber-100"
        },
        {
            title: "System Settings",
            desc: "Configure platform notifications and access controls.",
            icon: Settings,
            href: "/settings",
            color: "bg-slate-50",
            iconColor: "text-slate-600",
            borderColor: "border-slate-200"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-800">
            {/* Top Navigation / Greeting */}
            <div className="bg-white border-b border-slate-100 px-6 py-10 md:px-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sky-600 font-bold text-sm uppercase tracking-[0.2em]">
                            <Building2 className="w-5 h-5" />
                            Administrative Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Hospital <span className="text-sky-600 font-extrabold tracking-normal">Dashboard</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-xl text-lg">
                            Welcome back, {hospitalName}. Manage your healthcare facility's operations and personnel from one unified interface.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 transition-all">
                            <Plus className="w-6 h-6" />
                            Operations
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10 space-y-12">
                {/* Stats Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-xl hover:shadow-slate-100 transition-all group">
                            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Main Operations Grid */}
                <section>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-sky-500 rounded-full" />
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Management Hub</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className="group relative bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-sky-100 hover:border-sky-100 transition-all hover:-translate-y-2 overflow-hidden flex flex-col justify-between min-h-[320px]"
                            >
                                {/* Decorative Circle */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-50 rounded-full opacity-30 group-hover:bg-sky-50 group-hover:opacity-100 transition-all duration-500" />

                                <div className="relative z-10 space-y-8">
                                    <div className={`w-16 h-16 rounded-2xl ${item.color} ${item.iconColor} flex items-center justify-center group-hover:scale-110 shadow-inner transition-transform`}>
                                        <item.icon className="w-8 h-8" />
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500 text-base leading-relaxed font-medium">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative z-10 flex items-center justify-between mt-4 pt-4 border-t border-slate-50 group-hover:border-sky-50">
                                    <span className="text-sm font-bold text-slate-400 group-hover:text-sky-600 transition-colors uppercase tracking-widest">Access Module</span>
                                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Support Insight */}
                <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border-2 border-slate-100 text-slate-900 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group hover:border-sky-200 transition-colors">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-sky-50 rounded-full -mr-48 -mt-48 blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1 bg-sky-50 rounded-full text-sky-600 font-bold text-xs uppercase tracking-widest">
                            Technical Support
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">Need assistance <br />with facility data?</h2>
                        <p className="text-slate-500 max-w-md font-medium text-lg leading-relaxed">
                            Our administration support team is available 24/7 to help you with credentials, staff onboarding, and system configurations.
                        </p>
                    </div>
                    <button className="relative z-10 px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-sky-600 hover:shadow-2xl hover:shadow-sky-200 transition-all flex items-center gap-3">
                        Contact Admin Support
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}