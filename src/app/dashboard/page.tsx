"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PastReportsOverview from "@/components/PastReportsOverview";
import { ArrowRight, BriefcaseMedical, ClipboardClock, Pill } from "lucide-react";
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
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className=" bg-gray-50 flex flex-col xl:flex-row h-[93vh] overflow-y-auto xl:pt-10">
      <div
        className="w-full xl:w-[20vw] flex flex-col  items-center justify-start pt-4 px-4"
      >
        <p className="text-2xl text-cyan-800 font-mono font-bold mb-2">
          Medication Management
        </p>
        <div className=" w-full  xl:w-[20vw] grid grid-cols-2 lg:flex xl:flex-col gap-6 p-2">
          {/* Reminders Card */}
          <div
            className="   group relative bg-gradient-to-br from-rose-100 via-red-200 to-rose-200 rounded-3xl flex flex-col justify-center items-center border-2 border-rose-400 px-4 py-4 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br hover:from-red-300 hover:to-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 flex-1  "
            tabIndex={0}
            role="button"
            aria-label="Go to Pill Reminders"
            onClick={() => router.push("/pill")}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") router.push("/pill"); }}
          >
            <div className="absolute top-3 right-3 animate-pulse drop-shadow-lg">
              <Pill className="w-8 h-8 text-rose-600 opacity-80 group-hover:scale-110 animate-bounce duration-300 transition-transform hidden md:block" />
            </div>
            <p className="font-mono text-lg font-bold text-rose-900 flex px-4 text-center mb-1 group-hover:underline transition-all drop-shadow">
              Pill Reminders
            </p>
            <p className=" hidden sm:block text-sm text-rose-700 font-mono text-center mb-2 max-w-xs">
              Get timely reminders for all your medications.
            </p>
            <button
              type="button"
              className="font-mono font-bold text-white flex items-center gap-2 mt-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-red-400 shadow-lg hover:from-rose-400 hover:to-red-300 hover:scale-105 transition-all group-hover:bg-white group-hover:text-rose-700 group-hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              onClick={e => { e.stopPropagation(); router.push("/pill"); }}
            >
              <span className="text-[10px] sm:text-sm " >Remind me</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1 w-4 h-4" />
            </button>
          </div>

          {/* Pharmacy Card */}
          <div
            className="group relative bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-3xl flex flex-col justify-center items-center border-2 border-blue-500 px-3 py-4 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-blue-200 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 min-h-0"
            tabIndex={0}
            role="button"
            aria-label="Go to Pharmacy"
            onClick={() => router.push("/pharmacy")}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") router.push("/pharmacy"); }}
          >
            <div className="absolute top-3 right-3 animate-bounce drop-shadow-lg">
              <BriefcaseMedical className="w-8 h-8 text-blue-700 opacity-80 group-hover:scale-110 transition-transform hidden md:block" />
            </div>
            <p className="font-mono text-lg font-bold text-blue-900 flex px-4 text-center mb-1 group-hover:underline transition-all drop-shadow">
            Pharmacies
            </p>
            <p className="hidden sm:block text-sm text-blue-700 font-mono text-center mb-2 max-w-xs">
              Check nearby Pharmacies.
            </p>
            <button
              type="button"
              className="font-mono font-bold text-white flex items-center gap-2 mt-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg hover:from-blue-400 hover:to-blue-300 hover:scale-105 transition-all group-hover:bg-white group-hover:text-blue-700 group-hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              onClick={e => { e.stopPropagation(); router.push("/pharmacy"); }}
            >
              <span className="text-[10px] sm:text-sm " >Go to Pharmacy</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1 w-4 h-4" />
            </button>
          </div>

          {/* Track Medication Card */}
          <div
            className="group relative bg-gradient-to-br from-violet-300 via-violet-400 to-violet-500 rounded-3xl flex flex-col justify-center items-center border-2 border-violet-700 px-3 py-4 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-violet-400 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400 flex-1 min-h-0"
            tabIndex={0}
            role="button"
            aria-label="Track your medications"
            onClick={() => router.push("/what-you-taking")}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") router.push("/what-you-taking"); }}
          >
            <div className="absolute top-3 right-3 animate-spin-slow drop-shadow-lg">
              <ClipboardClock className="w-8 h-8 text-violet-800 opacity-80 group-hover:scale-110 transition-transform hidden md:block" />
            </div>
            <p className="font-mono text-lg font-bold text-violet-900 flex px-4 text-center mb-1 group-hover:underline transition-all drop-shadow">
              Know Your Medications
            </p>
            <p className=" hidden sm:block text-sm text-violet-700 font-mono text-center mb-2 max-w-xs">
             your medication Information.
            </p>
            <button
              type="button"
              className="font-mono font-bold text-white flex items-center gap-2 mt-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 shadow-lg hover:from-violet-400 hover:to-violet-300 hover:scale-105 transition-all group-hover:bg-white group-hover:text-violet-700 group-hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
              onClick={e => { e.stopPropagation(); router.push("/what-you-taking"); }}
            >
              <span className="text-[10px] sm:text-sm " >Learn more</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1 w-4 h-4" />
            </button>
          </div>

          {/* Book Appointment Card */}
          <div
            className="group relative bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 rounded-3xl flex flex-col justify-center items-center border-2 border-yellow-600 px-3 py-5 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-yellow-300/60 hover:from-yellow-300 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 flex-1 min-h-0"
            tabIndex={0}
            role="button"
            aria-label="Book an appointment"
            onClick={() => router.push("/hospitals")}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") router.push("/hospitals"); }}
          >
            <div className="absolute top-3 right-3 animate-pulse drop-shadow-lg">
              <ClipboardClock className="w-9 h-9 text-yellow-700 opacity-80 group-hover:scale-110 transition-transform hidden md:block" />
            </div>
            <p className="font-mono text-lg font-extrabold text-yellow-900 flex px-4 text-center mb-1 group-hover:underline transition-all drop-shadow">
              Book an Appointment
            </p>
            <p className=" hidden sm:block text-sm text-yellow-800 font-mono text-center mb-2 max-w-xs">
              Secure your spot with a doctor in seconds. Fast, easy, and convenient.
            </p>
            <button
              type="button"
              className="font-mono font-bold text-white flex items-center gap-2 mt-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-lg hover:from-yellow-400 hover:to-yellow-300 hover:scale-105 transition-all group-hover:bg-white group-hover:text-yellow-700 group-hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              onClick={e => { e.stopPropagation(); router.push("/hospitals"); }}
            >
              <span className="text-[10px] sm:text-sm " >Book Now</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1 w-4 h-4" />
            </button>
          </div>

          {/* Add a fifth section if needed */}
          {/* <div
            className="group relative bg-gradient-to-br from-cyan-100 via-cyan-200 to-cyan-300 rounded-3xl flex flex-col justify-center items-center border-2 border-cyan-500 px-3 py-4 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-cyan-200 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 flex-1 min-h-0"
            tabIndex={0}
            role="button"
            aria-label="Go to Health Assistant"
            onClick={() => router.push("/chatbot")}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") router.push("/chatbot"); }}
          >
            <div className="absolute top-3 right-3 animate-bounce drop-shadow-lg">
              <ClipboardClock className="w-8 h-8 text-cyan-700 opacity-80 group-hover:scale-110 transition-transform" />
            </div>
            <p className="font-mono text-lg font-bold text-cyan-900 flex px-4 text-center mb-1 group-hover:underline transition-all drop-shadow">
              Health Assistant
            </p>
            <p className="text-sm text-cyan-700 font-mono text-center mb-2 max-w-xs">
              Chat with our AI assistant for health tips and symptom checks.
            </p>
            <button
              type="button"
              className="font-mono font-bold text-white flex items-center gap-2 mt-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-lg hover:from-cyan-400 hover:to-cyan-300 hover:scale-105 transition-all group-hover:bg-white group-hover:text-cyan-700 group-hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
              onClick={e => { e.stopPropagation(); router.push("/chatbot"); }}
            >
              <span>Ask Now</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1 w-4 h-4" />
            </button>
          </div> */}
        </div>
      </div>
      <div className="flex flex-col flex-1 w-full px-4 md:px-6">
        <div className="flex-1 gap-10">
          <div className="pt-4">
            <p className="text-2xl text-cyan-800 font-mono font-bold pl-1 md:pl-5">Recent Reports</p>
            <PastReportsOverview />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6 md:gap-8 pt-8 md:pt-2">
            {/* new div */}
            <div className="pt-5">
              {/* this is for the chat bot */}
              <div className="bg-gray-100 w-full max-w-full md:max-w-4xl rounded-2xl flex flex-col justify-center items-center drop-shadow-lg drop-shadow-black p-6 h-auto md:h-[30vh]">
                <p className="text-2xl font-mono font-bold text-cyan-800">
                  AI Health Assistant
                </p>
                <p className="text-lg text-cyan-700 p-2 md:p-4 font-mono text-center ">
                  Meet your{" "}
                  <span className="font-semibold text-gray-700 underline">
                    Symptom &amp; Health AI Assistant
                  </span>
                  !
                </p>
                <button
                  onClick={() => {
                    router.push("/chatbot");
                  }}
                  className="bg-cyan-800 hover:bg-cyan-700 transition-all text-xl md:text-2xl hover:underline px-6   py-3 md:py-3 rounded-full font-mono font-bold "
                >
                  Start Chatting Now
                </button>
              </div>
            </div>
            <div className=" flex flex-col w-full max-w-full md:max-w-5xl h-full md:h-[30vh] bg-gray-100 rounded-2xl drop-shadow-lg drop-shadow-cyan-950 mt-5 p-4">
              {/* this is for the quick action  */}
              <p className="text-2xl font-mono font-bold text-cyan-800 p-4">
                Quick Action
              </p>
              <div className="">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  gap-4">
                <div className="h-24 bg-sky-600/40 rounded-2xl text-white flex flex-col space-y-4 items-center justify-center">
                    <ClipboardClock className="size-[40px] text-cyan-900" />
                    <p className="text-md text-black font-mono ">
                      <Link href="/hospitals">Appointment</Link>
                    </p>
                  </div>
                  <div onClick={()=>{router.push("/doctors")}}  className="h-24 bg-green-600/40 rounded-2xl text-white flex flex-col space-y-4 items-center justify-center">
                    <BriefcaseMedical className="size-[40px] text-cyan-900" />
                    <p className="text-md text-black font-mono ">
                      <Link href="/doctors" >Talk To doctor</Link>
                    </p>
                  </div>
                  {/* <div className="h-32 sm:h-40 bg-purple-700/40 rounded-2xl text-white flex flex-col space-y-4 items-center justify-center">
                    <Pill className="size-[40px] text-cyan-900" />
                    <p className="text-md text-black font-mono ">Priscription Refill</p>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
