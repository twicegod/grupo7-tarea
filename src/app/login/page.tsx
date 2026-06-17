'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Stethoscope, Mail, Lock, User, Phone, Calendar } from 'lucide-react'

function Field({ icon: Icon, label, ...props }: { icon: React.ElementType; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          {...props}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Correo o contraseña incorrectos')
    else { router.push('/dashboard'); router.refresh() }
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone || null, birth_date: birthDate || null },
      },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (!data.user) { setError('Error al crear cuenta. Intenta de nuevo.'); setLoading(false); return }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError('Cuenta creada. Revisa tu correo para activarla y luego inicia sesión.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="bg-teal-600 text-white p-2 rounded-xl">
            <Stethoscope size={22} />
          </div>
          <span className="font-bold text-gray-800 text-xl">ConsultorioMed</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h1 className="text-lg font-bold text-gray-800 mb-1">
            {isRegister ? 'Crear cuenta' : 'Bienvenido'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {isRegister ? 'Regístrate para agendar tus citas' : 'Ingresa para gestionar tus citas'}
          </p>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <>
                <Field icon={User} label="Nombre completo" type="text" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} required placeholder="Dr. Juan Pérez" />
                <Field icon={Phone} label="Teléfono" type="text" value={phone}
                  onChange={(e) => setPhone(e.target.value)} placeholder="591-700-00000" />
                <Field icon={Calendar} label="Fecha de nacimiento" type="date" value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)} />
              </>
            )}
            <Field icon={Mail} label="Correo electrónico" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required placeholder="correo@ejemplo.com" />
            <Field icon={Lock} label="Contraseña" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className="text-teal-600 hover:underline font-medium"
            >
              {isRegister ? 'Ingresar' : 'Registrarme'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
