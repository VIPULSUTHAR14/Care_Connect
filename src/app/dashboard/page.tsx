"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PastReportsOverview from "@/components/PastReportsOverview";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const To_report = () => {
    router.push("/patient/patient_health_reports");
  };

  const To_chatbot = () => {
    router.push("/chatbot");
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
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
    <div className=" min-h-[90vh] bg-gray-50 flex flex-col md:flex-row">
      <div className="w-full md:w-[20vw] flex flex-col items-center justify-start pt-4 space-y-12  px-4">
        <p className="text-2xl text-cyan-800 font-mono font-bold">
          Medication Management
        </p>
        <div className="w-full max-w-sm bg-red-300/70 rounded-2xl flex flex-col justify-center items-center border border-rose-900 py-4">
        <p className="font-mono text-xl text-red-800 flex px-6 text-center" >Get reminders for your pills</p>
        <button type="button" className="font-mono font-bold text-red-800 flex items-center gap-1 mt-2" onClick={()=>{
          router.push("/Pill_remider")
        }} >Remind me <ArrowRight/> </button>
        </div>
        <div className="w-full max-w-sm bg-blue-400/70 rounded-2xl flex flex-col justify-center items-center border border-blue-900 py-4">
        <p className="font-mono text-xl text-blue-800 flex px-6 text-center  " >Find out about your medicine </p>
        <button type="button" className="font-mono font-bold text-blue-800 flex items-center gap-1 mt-2" onClick={()=>{
          router.push("/pharmacy")
        }} >Pharmacy <ArrowRight/> </button>
        </div>
        <div className="w-full max-w-sm bg-violet-400/70 rounded-2xl flex flex-col justify-center items-center border border-violet-900 py-4">
        <p className="font-mono text-xl text-violet-800 flex px-6 text-center  " >Keep track of what you take</p>
        <button type="button" className="font-mono font-bold text-violet-800 flex items-center gap-1 mt-2" onClick={()=>{
          router.push("/Pill_remider")
        }} >learn more <ArrowRight/> </button>
        </div>
        <div className="w-full max-w-sm bg-yellow-400/40 rounded-2xl flex flex-col justify-center items-center border border-yellow-900 py-4">
        <p className="font-mono text-xl text-yellow-800 flex px-6 text-center  " >Book an apointment</p>
        <button type="button" className="font-mono font-bold text-yellow-800 flex items-center gap-1 mt-2" onClick={()=>{
          router.push("/Pill_remider")
        }} >Book now <ArrowRight/> </button>
        </div>
      </div>
      <div className="flex flex-col flex-1 w-full px-4 md:px-6 "  >
        <div className="flex-1 gap-10">
          <div className="pt-4 ">
            <p className="text-2xl text-cyan-800 font-mono font-bold pl-1 md:pl-5">
              Recent Reports
            </p>
            <PastReportsOverview />
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6 md:gap-8 pt-8 md:pt-16" >
              {/* new div */}
              <div className="pt-5" >
                {/* this is for the chat bot */}
              
                <div className="bg-gray-100 w-full max-w-full md:max-w-4xl rounded-2xl flex flex-col justify-center items-center drop-shadow-lg drop-shadow-black p-6 h-auto md:h-[30vh] ">
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
              <button onClick={()=>{
                router.push("/chatbot")
              }} className="bg-cyan-800 hover:bg-cyan-700 transition-all text-xl md:text-2xl hover:underline px-6 py-3 md:p-5 rounded-full font-mono font-bold " >
                Start Chatting Now
              </button>
            </div>
              </div>
              <div className="flex flex-col w-full max-w-full md:max-w-5xl h-auto md:h-[30vh] bg-gray-100 rounded-2xl drop-shadow-lg drop-shadow-cyan-950 m-3 md:m-5 p-4 ">
                {/* this is for the quick action  */}
              <p className="text-2xl font-mono font-bold text-cyan-800 p-4">
                Quick Action
              </p>
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="h-32 sm:h-40 bg-cyan-900 rounded-2xl text-white flex items-center justify-center">
                    Quick
                  </div>
                  <div className="h-32 sm:h-40 bg-cyan-900 rounded-2xl text-white flex items-center justify-center">
                    Quick
                  </div>
                  <div className="h-32 sm:h-40 bg-cyan-900 rounded-2xl text-white flex items-center justify-center">
                    Quick
                  </div>
                </div>
              </div>
            </div>
            </div>
          
        </div>
      </div>
    </div>
  );
}
