"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Hospital } from "@/types/hospital";
import { 
  MapPin, 
  Phone, 
  Ambulance, 
  Mail, 
  Users, 
  Search,
  Filter,
  ArrowLeft,
  Building2,
  Stethoscope,
  Clock
} from "lucide-react";

export default function HospitalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchHospitals();
    }
  }, [session, currentPage, searchTerm, cityFilter]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '6',
        ...(searchTerm && { search: searchTerm }),
        ...(cityFilter && { city: cityFilter })
      });

      const response = await fetch(`/api/hospitals?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }
      
      const data = await response.json();
      setHospitals(data.hospitals || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHospitals();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCityFilter("");
    setCurrentPage(1);
  };

  const getSpecialities = (staff: any[]) => {
    const specialities = staff.map(s => s.speciality);
    return [...new Set(specialities)].slice(0, 3);
  };

  if (status === "loading" || loading) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-cyan-800" />
                <h1 className="text-2xl font-mono font-bold text-cyan-800">
                  Hospitals
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {total} hospitals found
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-800 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search hospitals, specialties, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-cyan-900 text-xl font-bold"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-900 w-5 h-5" />
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none text-cyan-900 font-mono"
                  >
                    <option className="text-cyan-900 font-mono" value="">All Cities</option>
                    <option className="text-cyan-900 font-mono" value="Jalandhar">Jalandhar</option>
                    <option className="text-cyan-900 font-mono" value="Amritsar">Amritsar</option>
                    <option className="text-cyan-900 font-mono" value="Ludhiana">Ludhiana</option>
                    <option className="text-cyan-900 font-mono" value="Patiala">Patiala</option>
                    <option className="text-cyan-900 font-mono" value="Mohali">Mohali</option>
                    <option className="text-cyan-900 font-mono" value="Bathinda">Bathinda</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-700 text-white font-mono text-xl font-bold rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Search
              </button>
              {(searchTerm || cityFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {hospitals.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hospitals found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitals.map((hospital) => (
                <div
                  key={hospital._id}
                  className="col-span-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-start space-x-30">
                      <div>
                      {hospital.images && hospital.images.length > 0 ? (
                        <div className="flex space-x-2 overflow-x-auto mb-4">
                          {hospital.images.map((imgUrl: string, idx: number) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt={`Hospital Premises ${idx + 1}`}
                              className="size-[300px] hover:size-[350px] transition-all object-cover rounded-lg border border-gray-200 shadow-sm"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4 flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                          <span className="text-gray-400 font-mono">No premises images available</span>
                        </div>
                      )}
                      </div>
                      <div>
                      <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl text-cyan-900 font-mono font-bold line-clamp-2">
                        {hospital.name}
                      </h3>
                      <span className="inline-flex items-center font-mono px-3 py-2 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 hover:cursor-pointer">
                        Verified
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="size-6 text-gray-400 mt-1 flex-shrink-0" />
                        <p className="text-lg text-teal-800 font-mono font-bold line-clamp-2">
                          {hospital.address}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="size-6 text-gray-400 flex-shrink-0" />
                        <a 
                          href={`tel:${hospital.reception_number}`}
                          className="text-lg text-teal-800 font-mono font-bold hover:text-cyan-800    "
                        >
                          {hospital.reception_number}
                        </a>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Ambulance className="size-6 text-gray-400 flex-shrink-0" />
                        <span className="text-lg text-teal-800 font-mono font-bold">
                          Ambulance: {hospital.ambulance_number}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="size-6 text-gray-400 flex-shrink-0" />
                        <a 
                          href={`mailto:${hospital.email}`}
                          className="text-lg text-teal-800 font-mono font-bold hover:text-cyan-800 truncate"
                        >
                          {hospital.email}
                        </a>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                              <Users className="size-6 text-gray-400" />
                          <span className="text-lg font-medium text-teal-800 font-mono">
                            Staff ({hospital.staff.length})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {getSpecialities(hospital.staff).map((speciality, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
                          >
                            <Stethoscope className="w-3 h-3 mr-1" />
                            {speciality}
                          </span>
                        ))}
                        {hospital.staff.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{hospital.staff.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 px-6">
                          NHA: {hospital.nha_registration_number}
                        </span>
                        <button
                          onClick={() => {
                            router.push(`/appointment/book?receiverId=${hospital._id}&hospital=${encodeURIComponent(hospital.name)}`);
                          }}
                          className="px-4 py-2 bg-cyan-800 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-cyan-800 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
