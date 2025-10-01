"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Hospital } from "@/types/hospital";
import Image from "next/image";
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
  Stethoscope
} from "lucide-react";

interface StaffMember {
  speciality: string;
}

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

  const fetchHospitals = useCallback(async () => {
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
  }, [currentPage, searchTerm, cityFilter]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchHospitals();
    }
  }, [session, fetchHospitals]);

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

  const getSpecialities = (staff: StaffMember[] | undefined) => {
    if (!Array.isArray(staff)) {
      return [];
    }
    const specialities = staff.map(s => s.speciality).filter(Boolean);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-xl md:text-2xl font-mono font-bold text-cyan-800">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-cyan-900 text-base font-bold"
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
                className="px-6 py-3 bg-cyan-700 text-white font-mono text-base font-bold rounded-lg hover:bg-cyan-800 transition-colors"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hospitals.map((hospital) => (
                <div
                  key={hospital._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex flex-col"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex flex-col md:flex-row md:space-x-6">
                      <div className="md:w-1/3 mb-4 md:mb-0 flex-shrink-0">
                        {hospital.images && hospital.images.length > 0 ? (
                          <Image
                            src={hospital.images[0]}
                            alt={`${hospital.name} premises`}
                            width={500}
                            height={300}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                            <Building2 className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg text-cyan-900 font-mono font-bold line-clamp-2">
                            {hospital.name}
                          </h3>
                          <span className="inline-flex items-center font-mono px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0 ml-2">
                            Verified
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <p className="text-teal-800 font-mono font-bold">
                              {hospital.address}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a 
                              href={`tel:${hospital.reception_number}`}
                              className="text-teal-800 font-mono font-bold hover:text-cyan-800"
                            >
                              {hospital.reception_number}
                            </a>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Ambulance className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-teal-800 font-mono font-bold">
                              Ambulance: {hospital.ambulance_number}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a 
                              href={`mailto:${hospital.email}`}
                              className="text-teal-800 font-mono font-bold hover:text-cyan-800 truncate"
                            >
                              {hospital.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t mt-4 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="text-base font-medium text-teal-800 font-mono">
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
                          <span className="text-xs text-gray-500 ml-1">
                            +{hospital.staff.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t px-6 py-4 bg-gray-50 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        NHA: {hospital.nha_registration_number}
                      </span>
                      <button
                        onClick={() => {
                          router.push(`/appointment/book?receiverId=${hospital._id}&hospital=${encodeURIComponent(hospital.name)}`);
                        }}
                        className="px-4 py-2 bg-cyan-800 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                      >
                        Book Appointment
                      </button>
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