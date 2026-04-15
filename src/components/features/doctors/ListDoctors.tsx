import React from "react";

export interface Doctor {
  id: string | number;
  name: string;
  specialty: string;
}

export interface DoctorListProps {
  doctors: Doctor[];
  onCall: (doctorId: string | number) => void;
}

const ListDoctor: React.FC<DoctorListProps> = ({ doctors, onCall }) => {
  return (
    <div className="py-6 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Available Doctors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition-transform transform hover:scale-105 hover:shadow-lg border border-gray-100"
          >
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{doctor.name}</h3>
              <p className="text-gray-500 mb-4">{doctor.specialty}</p>
            </div>
            <button
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              onClick={() => onCall(doctor.id)}
            >
              Call
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListDoctor;
