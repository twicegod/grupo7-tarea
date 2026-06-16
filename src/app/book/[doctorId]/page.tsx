'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, FileText, Stethoscope, ArrowLeft } from 'lucide-react'

type Doctor = {
  id: number
  full_name: string
  available_days: string
  specialties: { name: string }
}

export default function BookPage() {
  const { doctorId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('doctors').select('*, specialties(name)').eq('id', doctorId).single()
      .then(({ data }) => setDoctor(data))
  }, [doctorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('appointments').insert({
      patient_id: user.id,
      doctor_id: Number(doctorId),
      appointment_date: date,
      appointment_time: time,
      reason,
      status: 'pending',
    })

    if (error) setError('Error al agendar la cita. Intenta de nuevo.')
    else router.push('/dashboard')
    setLoading(false)
  }

  if (!doctor) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Cargando información del médico...
    </div>
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agendar Cita</h1>
          <p className="text-sm text-gray-500 mt-0.5">Completa el formulario para reservar tu consulta</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
          Disponible
        </span>
      </div>

      <div className="max-w-2xl">
        {/* Doctor card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex items-center gap-4">
          <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-semibold shrink-0">
            {doctor.full_name.split(' ').slice(1, 3).map((w: string) => w[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{doctor.full_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                <Stethoscope size={11} />
                {doctor.specialties?.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={11} />
                {doctor.available_days}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Datos de la cita</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  <span className="flex items-center gap-1.5"><Calendar size={12} />Fecha</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  <span className="flex items-center gap-1.5"><Clock size={12} />Hora</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5"><FileText size={12} />Motivo de consulta</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Describe brevemente el motivo de tu consulta médica..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={15} />
                Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Agendando...' : 'Confirmar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
