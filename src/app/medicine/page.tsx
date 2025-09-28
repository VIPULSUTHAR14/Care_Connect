'use client'
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

type Medicine = {
  medicine_name: string
  active_ingredient?: string
  causes_for_use?: string[]
  summary?: string
  stock?: string
}

export default function MedicinePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [availability, setAvailability] = useState<'all' | 'available' | 'not-available'>('all')
  // Showing all medicines regardless of stock; toggle removed
  const searchParams = useSearchParams()

  useEffect(() => {
    const controller = new AbortController()
    async function fetchMedicines() {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()
        params.set('medicines', 'all')
        params.set('page', '1')
        params.set('limit', '200')
        const pharmacyId = searchParams.get('pharmacyId')
        if (pharmacyId) params.set('pharmacyId', pharmacyId)
        // Fetch from /api/pharmacy, but expect a flat array of medicines as per the DB format
        const res = await fetch(`/api/pharmacy?${params.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to load medicines')
        const data = await res.json()
        // If the API returns { medicines: [...] }, use that, else fallback to [].
        const list: Medicine[] = Array.isArray(data.medicines) ? data.medicines : []
        setAllMedicines(list)
        setMedicines(list)
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchMedicines()
    return () => controller.abort()
  }, [searchParams])

  function isAvailable(stock?: string): boolean {
    if (!stock) return false
    return stock.trim().toLowerCase() === 'available'
  }

  function applyFilters() {
    const query = search.trim().toLowerCase()
    const filtered = allMedicines.filter((m) => {
      // Availability filter
      if (availability === 'available' && !isAvailable(m.stock)) return false
      if (availability === 'not-available' && isAvailable(m.stock)) return false

      // Text search over key fields
      if (!query) return true
      const hay = [
        m.medicine_name,
        m.active_ingredient,
        m.summary,
        Array.isArray(m.causes_for_use) ? m.causes_for_use.join(' ') : undefined,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(query)
    })
    setMedicines(filtered)
  }

  return (
    <div className="min-w-screen bg-gray-300 mx-auto p-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-cyan-800">Medicines</h1>
      </div>
      <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Search</label>
          <input
            className="w-full border rounded px-3 py-2 text-black placeholder:text-black"
            placeholder="Search by name, ingredient, summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Availability</label>
          <select
            className="border rounded px-3 py-2 text-black"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as any)}
          >
            <option className="text-black" value="all">All</option>
            <option className="text-black" value="available">Available</option>
            <option className="text-black" value="not-available">Not Available</option>
          </select>
        </div>
        <div>
          <button
            className="px-4 py-2 bg-cyan-800 text-white rounded"
            onClick={applyFilters}
          >
            Search
          </button>
        </div>
      </div>
      {(() => { const pid = searchParams.get('pharmacyId'); if (pid) { return (
        <div className="mb-4 text-sm text-gray-600">Showing medicines for pharmacy ID: <span className="font-mono">{pid}</span></div>
      ); } return null; })()}

      {loading && <p className="text-gray-600">Medicines are loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.length === 0 && (
            <p className="text-gray-600">No medicines to display.</p>
          )}
          {medicines.map((m, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-cyan-900">{m.medicine_name}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${/available/i.test(m.stock || '') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {m.stock || 'Unknown'}
                </span>
              </div>
              {m.active_ingredient && (
                <p className="text-sm text-gray-700 mt-1">{m.active_ingredient}</p>
              )}
              {Array.isArray(m.causes_for_use) && m.causes_for_use.length > 0 && (
                <ul className="text-xs text-gray-600 mt-2 list-disc list-inside">
                  {m.causes_for_use.map((cause, i) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              )}
              {m.summary && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{m.summary}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
