'use client'
import React, { useEffect, useState } from "react"
import { Menu, X, Calendar, UserCheck, Bell, User, Clock, Users, LogOut, Building2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Hospital_Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const [authenticatedstatus, setAuthenticatedstatus] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated") {
            setAuthenticatedstatus(true)
        } else {
            setAuthenticatedstatus(false)
        }
    }, [session, status])

    const navLinks = [
        { name: "Appointments", href: "/appointments", icon: Calendar },
        { name: "Attendance", href: "/attendance", icon: UserCheck },
        { name: "Notification", href: "/hospital-notification", icon: Bell },
        { name: "Schedule", href: "/schedule", icon: Clock },
        { name: "Staff", href: "/staff", icon: Users },
        { name: "Profile", href: "/profile", icon: User },
    ]

    return (
        <nav className="w-full bg-slate-50 shadow-md sticky top-0 z-30 border-b border-cyan-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="shrink-0 flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            <Building2 size={24} />
                        </div>
                        <p
                            className="font-mono font-bold text-2xl sm:text-3xl text-emerald-900 cursor-pointer"
                            onClick={() => router.push("/hospital_dashboard")}
                        >
                            Hospital Portal
                        </p>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden xl:flex flex-1 items-center justify-center">
                        <ul className="flex items-center space-x-2">
                            {navLinks.map((link) => {
                                const isActive = pathname?.startsWith(link.href) ?? false
                                return (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-full font-mono font-bold text-sm lg:text-md transition-all
                                                ${isActive
                                                    ? "bg-emerald-100 text-emerald-900"
                                                    : "text-emerald-800 hover:text-emerald-600 hover:bg-slate-100"
                                                }`}
                                        >
                                            <link.icon size={18} />
                                            {link.name}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="hidden xl:flex items-center space-x-4">
                        {authenticatedstatus ? (
                            <button
                                className="flex items-center gap-2 font-mono bg-emerald-800 px-6 py-2 rounded-full text-md font-bold text-white transition-all hover:bg-emerald-700"
                                onClick={() => signOut()}
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        ) : (
                            <button
                                className="font-mono bg-emerald-800 px-6 py-2 rounded-full text-md font-bold text-white transition-all hover:bg-emerald-700"
                                onClick={() => router.push("/signin-hospital")}
                            >
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="xl:hidden flex items-center justify-end">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-emerald-900 hover:bg-emerald-100 focus:outline-none"
                            aria-label="Open menu"
                        >
                            {menuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`xl:hidden absolute w-full bg-slate-50 shadow-lg z-20 transition-all duration-300 ease-in-out border-t border-emerald-100 ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
            >
                <div className="px-4 pt-2 pb-3 space-y-1">
                    {navLinks.map((link) => {
                        const isActive = pathname?.startsWith(link.href) ?? false
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 font-mono font-bold rounded-lg px-4 py-3 text-base transition-colors
                                    ${isActive
                                        ? "bg-emerald-100 text-emerald-900"
                                        : "text-emerald-800 hover:bg-slate-100"
                                    }`}
                            >
                                <link.icon size={20} />
                                {link.name}
                            </Link>
                        )
                    })}
                </div>
                <div className="px-4 pb-4 pt-3 border-t border-gray-200">
                    <div className="flex flex-col space-y-3">
                        {authenticatedstatus ? (
                            <button
                                className="flex items-center justify-center gap-2 w-full font-mono bg-emerald-800 px-4 py-3 rounded-xl text-md font-bold text-white transition-all hover:bg-emerald-700"
                                onClick={() => {
                                    signOut();
                                    setMenuOpen(false);
                                }}
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        ) : (
                            <button
                                className="w-full font-mono bg-emerald-800 px-4 py-3 rounded-xl text-md font-bold text-white transition-all hover:bg-emerald-700"
                                onClick={() => {
                                    router.push("/signin-hospital");
                                    setMenuOpen(false);
                                }}
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}