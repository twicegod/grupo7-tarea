import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Clock, Stethoscope, PlusCircle, User } from 'lucide-react'

const STATUS: Record<string, { label: string; dot: string; badge: string }> = {
  pending:   { label: 'Pendiente',  dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmada', dot: 'bg-teal-500',   badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  cancelled: { label: 'Cancelada',  dot: 'bg-red-400',    badge: 'bg-red-50 text-red-700 border-red-200' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: patient }, { data: appointments }] = await Promise.all([
    supabase.from('patients').select('full_name, phone').eq('id', user.id).single(),
    supabase.from('appointments')
      .select('*, doctors(full_name, specialties(name))')
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: false }),
  ])

  const total     = appointments?.length ?? 0
  const pending   = appointments?.filter(a => a.status === 'pending').length ?? 0
  const confirmed = appointments?.filter(a => a.status === 'confirmed').length ?? 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Citas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bienvenido, {patient?.full_name ?? user.email}
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={16} />
          Nueva cita
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total citas',   value: total,     color: 'text-gray-700',  bg: 'bg-gray-50'   },
          { label: 'Pendientes',    value: pending,   color: 'text-amber-700', bg: 'bg-amber-50'  },
          { label: 'Confirmadas',   value: confirmed, color: 'text-teal-700',  bg: 'bg-teal-50'   },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-gray-100 p-5`}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Appointments list */}
      {total === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium">No tienes citas agendadas</p>
          <Link href="/" className="text-teal-600 hover:underline text-sm mt-2 inline-block">
            Ver médicos disponibles →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Médico</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Especialidad</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Fecha y hora</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Motivo</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.map((appt, i) => {
                const st = STATUS[appt.status] ?? STATUS.pending
                return (
                  <tr key={appt.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-teal-100 text-teal-700 rounded-full w-7 h-7 flex items-center justify-center">
                          <User size={13} />
                        </div>
                        <span className="font-medium text-gray-800">{appt.doctors?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Stethoscope size={13} className="text-gray-400" />
                        {appt.doctors?.specialties?.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-gray-400" />
                        {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('es-BO', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={13} className="text-gray-400" />
                        {appt.appointment_time?.slice(0, 5)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 max-w-[180px] truncate">
                      {appt.reason ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
