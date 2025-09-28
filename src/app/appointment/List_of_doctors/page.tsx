"use client"
import DoctorList from "@/components/DoctorList";

export default function List_of_doctors(){
    const handleCall = (doctorId: string) => {
        console.log("Calling doctor:", doctorId);
        // later: emit `call:request` via socket
      };
    
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Available Doctors</h1>
          <DoctorList onCall={handleCall} />
        </div>
      );
}