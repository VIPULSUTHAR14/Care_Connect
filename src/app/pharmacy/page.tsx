'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Pill, MapPin, Phone, BadgeCheck } from "lucide-react"

// 1. FIX: Defined a more specific type for _id
type Pharmacy = {
  _id: string | { $oid: string }
  name?: string
  email?: string
  createdAt?: string
  pharmacy?: {
    location?: string
    phoneNumber?: string
    drugLicenseNumber?: string
  }
}

export default function PharmacyPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const controller = new AbortController()
    async function fetchPharmacies() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/pharmacy?page=1&limit=50`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to load pharmacies')
        const data = await res.json()
        setPharmacies(data.pharmacies || [])
      } catch (e: unknown) { // 2. FIX: Used 'unknown' for type safety
        if (e instanceof Error) {
          if (e.name !== 'AbortError') {
            setError(e.message || 'Something went wrong');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false)
      }
    }
    fetchPharmacies()
    return () => controller.abort()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-800 mb-8 tracking-tight text-center flex items-center justify-center gap-2">
        <Pill className="w-8 h-8 text-cyan-700" />
        Pharmacies Near Your Location
      </h1>
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-cyan-600"></div>
          <span className="ml-4 text-cyan-700 font-mono text-lg">Loading...</span>
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 font-mono py-4">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pharmacies.length === 0 ? (
            <div className="col-span-full text-center text-cyan-700 font-mono text-lg py-12">
              No pharmacies found.
            </div>
          ) : (
            pharmacies.map((p) => {
              // 3. FIX: Removed all 'as any' casts. The specific type makes them unnecessary.
              const raw = p._id
              const id = (raw && typeof raw === 'object' && '$oid' in raw)
                ? raw.$oid
                : typeof raw === 'string'
                  ? raw
                  : String(raw)
              return (
                <div
                  key={id}
                  className="group bg-white rounded-2xl shadow-md border border-cyan-100 hover:border-cyan-300 transition-all duration-200 flex flex-col p-6 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Pill className="w-7 h-7 text-cyan-600 group-hover:scale-110 transition-transform" />
                    <h2 className="text-xl font-bold text-cyan-900 font-mono">
                      {p.name || 'Unnamed Pharmacy'}
                    </h2>
                    {p.pharmacy?.drugLicenseNumber && (
                      <BadgeCheck className="w-5 h-5 text-green-500 ml-1" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 font-mono mb-1">{p.email}</p>
                  <div className="flex flex-col gap-1 text-sm text-gray-600 font-mono mt-2">
                    {p.pharmacy?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>{p.pharmacy.location}</span>
                      </div>
                    )}
                    {p.pharmacy?.phoneNumber && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-cyan-400" />
                        <span>{p.pharmacy.phoneNumber}</span>
                      </div>
                    )}
                    {p.pharmacy?.drugLicenseNumber && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-cyan-700">License:</span>
                        <span>{p.pharmacy.drugLicenseNumber}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex">
                    <button
                      className="w-full font-mono font-bold px-4 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow hover:from-cyan-500 hover:to-cyan-300 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      onClick={() => {
                        router.push(`/medicine?pharmacyId=${encodeURIComponent(id)}`)
                      }}
                    >
                      View Medicines
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}