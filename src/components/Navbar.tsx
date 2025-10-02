'use client'
import React, { useEffect, useState } from "react"
import { Bell, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"


// Mock Next.js hooks and components for a non-Next.js environment


export default function Navbar() {
    const router = useRouter()
    const [authenticatedstatus, setAuthenticatedstatus] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    // In a real Next.js app, you would use the real useSession hook.
    // We are mocking it here to make the component runnable.
    const { data: session, status } = useSession();

    // Effect to update authentication status based on session
    useEffect(() => {
        if (status === "authenticated") {
            setAuthenticatedstatus(true)
        } else {
            setAuthenticatedstatus(false)
        }
    }, [session, status])

    return (
        <nav className=" w-full bg-slate-50 shadow-md sticky top-0 z-30">
            <div className="max-w-[100vw] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <p
                            className="font-mono font-bold text-2xl sm:text-3xl text-cyan-900 cursor-pointer"
                            onClick={() => {
                                router.push("/dashboard")
                            }}
                        >
                            Care Connect
                        </p>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden xl:flex flex-1 items-center justify-center">
                        <ul className="flex items-center space-x-4 lg:space-x-4">
                            {/* Authenticated links: show or hide using if-else className */}
                            {/* <li className={authenticatedstatus ? "text-lg text-cyan-800 font-mono font-bold hover:text-cyan-600 hover:underline transition-all" : "hidden"}>
                                <Link href="/dashboard">Dashboard</Link>
                            </li> */}
                            <li className={authenticatedstatus ? " text-sm lg:text-md text-cyan-800 font-mono font-bold hover:text-cyan-600 hover:underline transition-all" : "hidden"}>
                                <Link href="/hospitals">Book Appointment</Link>
                            </li>
                            {/* <li className={authenticatedstatus ? "text-lg text-cyan-800 font-mono font-bold hover:text-cyan-600 hover:underline transition-all" : "hidden"}>
                                <Link href="/appointments">My Appointments</Link>
                            </li>
                            <li className={authenticatedstatus ? "text-lg text-cyan-800 font-mono font-bold hover:text-cyan-600 hover:underline transition-all" : "hidden"}>
                                <Link href="/prescriptions">Prescriptions</Link>
                            </li> */}
                            <li className={authenticatedstatus ? " text-sm lg:text-md text-cyan-800 font-mono font-bold hover:text-cyan-600 hover:underline transition-all" : "hidden"}>
                                <Link href="/chatbot">Chatbot</Link>
                            </li>
                            <li className={authenticatedstatus ? " text-sm lg:text-md text-cyan-800 font-mono font-bold hover:text-cyan-600 hover:underline transition-all" : "hidden"}>
                                <Link href="/patient/profile">Update Profile</Link>
                            </li>
                            {/* Always visible links */}
                            <li className=" text-sm lg:text-md text-cyan-800 font-mono font-bold hover:text-cyan-600 hover:underline transition-all">
                                <Link href="/about">About Us</Link>
                            </li>
                            <li className=" text-sm lg:text-md text-cyan-800 font-mono font-bold hover:text-cyan-600 hover:underline transition-all">
                                <Link href="/contact">Contact Us</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Desktop Notification Icon and Action Buttons */}
                    <div className="hidden xl:flex items-center space-x-4">

                        <button
                            className="px-3 py-1 bg-red-500 text-lg font-mono font-bold text-white rounded-full hover:bg-red-600 transition-all"
                            onClick={() => { router.push("/emergency") }}
                        >
                            Emergency
                        </button>
                        <button
                            className={authenticatedstatus ? "font-mono bg-cyan-800 px-6 py-1 rounded-full text-md font-bold text-white transition-all hover:bg-cyan-700" : "hidden"}
                            onClick={() => signOut()}
                        >
                            Sign Out
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="xl:hidden flex items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-cyan-900 hover:bg-cyan-100 focus:outline-none"
                            aria-label="Open menu"
                        >
                            {menuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`xl:hidden absolute w-full bg-slate-50 shadow-lg z-20 transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {/* Authenticated links: show or hide using if-else className */}
                    <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className={authenticatedstatus ? "flex items-center text-cyan-800 font-mono font-bold rounded-md px-3 py-2 text-base hover:bg-cyan-100" : "hidden"}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/hospitals"
                        onClick={() => setMenuOpen(false)}
                        className={authenticatedstatus ? "flex items-center text-cyan-800 font-mono font-bold rounded-md px-3 py-2 text-base hover:bg-cyan-100" : "hidden"}
                    >
                        Book Appointment
                    </Link>
                    {/* <Link
                        href="/appointments"
                        onClick={() => setMenuOpen(false)}
                        className={authenticatedstatus ? "flex items-center text-cyan-800 font-mono font-bold rounded-md px-3 py-2 text-base hover:bg-cyan-100" : "hidden"}
                    >
                        My Appointments
                    </Link> */}
                    {/* <Link
                        href="/prescriptions"
                        onClick={() => setMenuOpen(false)}
                        className={authenticatedstatus ? "flex items-center text-cyan-800 font-mono font-bold rounded-md px-3 py-2 text-base hover:bg-cyan-100" : "hidden"}
                    >
                        Prescriptions
                    </Link> */}
                    <Link
                        href="/chatbot"
                        onClick={() => setMenuOpen(false)}
                        className={authenticatedstatus ? "flex items-center text-cyan-800 font-mono font-bold rounded-md px-3 py-2 text-base hover:bg-cyan-100" : "hidden"}
                    >
                        Chatbot
                    </Link>
                    <Link
                        href="/patient/profile"
                        onClick={() => setMenuOpen(false)}
                        className={authenticatedstatus ? "flex items-center text-cyan-800 font-mono font-bold rounded-md px-3 py-2 text-base hover:bg-cyan-100" : "hidden"}
                    >
                        Update Profile
                    </Link>
                    {/* <Link
                        href="/notification"
                        onClick={() => setMenuOpen(false)}
                        className={authenticatedstatus ? "flex items-center text-cyan-800 font-mono font-bold rounded-md px-3 py-2 text-base hover:bg-cyan-100" : "hidden"}
                    >
                        <Bell className="h-6 w-6" />
                    </Link> */}
                    {/* Always visible links */}
                    <Link
                        href="/about"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center text-cyan-800 font-mono font-bold rounded-md px-3 py-2 text-base hover:bg-cyan-100"
                    >
                        About Us
                    </Link>
                    <Link
                        href="/contact"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center text-cyan-800 font-mono font-bold rounded-md px-3 py-2 text-base hover:bg-cyan-100"
                    >
                        Contact Us
                    </Link>
                                            <Link
                            href="/notification"
                            className={authenticatedstatus ? "mr-2 hover:text-cyan-600 transition-all" : "hidden"}
                        >
                            <Bell className="h-6 w-6 text-cyan-900" />
                        </Link>
                </div>
                <div className="px-4 pb-4 pt-3 border-t border-gray-200">
                    <div className="flex flex-col space-y-3">
                        <button
                            className="w-full px-4 py-2 bg-red-500 text-lg font-mono font-bold text-white rounded-full transition-all hover:bg-red-600"
                            onClick={() => {
                                router.push("/emergency");
                                setMenuOpen(false);
                            }}
                        >
                            Emergency
                        </button>
                        <button
                            className={authenticatedstatus ? "w-full font-mono bg-cyan-800 px-2 h-11 rounded-full text-md font-bold text-white transition-all hover:bg-cyan-700" : "hidden"}
                            onClick={() => {
                                signOut();
                                setMenuOpen(false);
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
