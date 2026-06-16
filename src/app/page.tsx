import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Phone, Calendar, ChevronRight } from 'lucide-react'

type Doctor = {
  id: number
  full_name: string
  phone: string
  available_days: string
  specialties: { name: string }
}

const specialtyColors: Record<string, string> = {
  'Medicina General': 'bg-blue-50 text-blue-700',
  'Pediatría':        'bg-pink-50 text-pink-700',
  'Cardiología':      'bg-red-50 text-red-700',
  'Dermatología':     'bg-amber-50 text-amber-700',
  'Traumatología':    'bg-purple-50 text-purple-700',
}

export default async function Home() {
  const supabase = await createClient()
  const { data: doctors } = await supabase
    .from('doctors')
    .select('*, specialties(name)')
    .order('full_name')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Médicos Disponibles</h1>
          <p className="text-sm text-gray-500 mt-0.5">Selecciona un especialista para agendar tu cita</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
          Sistema Activo
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {doctors?.map((doctor: Doctor) => {
          const colorClass = specialtyColors[doctor.specialties?.name] ?? 'bg-gray-50 text-gray-700'
          const initials = doctor.full_name.split(' ').slice(1, 3).map((w: string) => w[0]).join('')
          return (
            <div
              key={doctor.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
            >
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-teal-600 text-white rounded-full w-11 h-11 flex items-center justify-center font-semibold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 text-sm truncate">{doctor.full_name}</h2>
                    <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                      {doctor.specialties?.name}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={13} className="text-gray-400 shrink-0" />
                    {doctor.available_days}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    {doctor.phone}
                  </div>
                </div>

                <Link
                  href={`/book/${doctor.id}`}
                  className="flex items-center justify-center gap-1.5 w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Agendar Cita
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
