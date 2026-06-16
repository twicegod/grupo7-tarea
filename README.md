# ConsultorioMed — Sistema de Citas Médicas

> **Grupo 7 · Materia: Servidores Web · Plataforma asignada: Supabase + Vercel**  
> Integrante: Rodrigo Calle

Aplicación web fullstack para gestión de citas médicas, desplegada usando **Supabase** como backend (base de datos + autenticación) y **Vercel** como plataforma de despliegue del frontend.

🔗 **Demo en producción:** https://grupo7-tarea.vercel.app  
📁 **Repositorio:** https://github.com/twicegod/grupo7-tarea

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend + Backend | Next.js 15 (App Router) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Estilos | Tailwind CSS |
| Iconos | Lucide React |
| Despliegue | Vercel |

---

## Funcionalidades

- Registro e inicio de sesión de pacientes (Supabase Auth)
- Listado de médicos por especialidad
- Agendamiento de citas médicas
- Panel de mis citas con estados (Pendiente / Confirmada / Cancelada)
- Rutas protegidas con middleware de autenticación
- Diseño responsivo con sidebar de navegación

---

## Estructura de la base de datos

```
specialties    → Especialidades médicas
doctors        → Médicos (FK → specialties)
patients       → Pacientes (FK → auth.users)
appointments   → Citas (FK → patients, doctors)
```

---

## Instrucciones de despliegue local

### Pre-requisitos

- Node.js >= 18
- npm >= 9
- Cuenta en [supabase.com](https://supabase.com)
- Cuenta en [vercel.com](https://vercel.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/twicegod/grupo7-tarea.git
cd grupo7-tarea
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Obtén estos valores desde: **Supabase Dashboard → Project Settings → API**

### 4. Crear las tablas en Supabase

En el **SQL Editor** de Supabase, ejecuta:

```sql
create table specialties (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz default now()
);

create table doctors (
  id bigint generated always as identity primary key,
  full_name text not null,
  specialty_id bigint references specialties(id),
  phone text,
  available_days text,
  created_at timestamptz default now()
);

create table patients (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  birth_date date,
  phone text,
  created_at timestamptz default now()
);

create table appointments (
  id bigint generated always as identity primary key,
  patient_id uuid references patients(id) on delete cascade,
  doctor_id bigint references doctors(id),
  appointment_date date not null,
  appointment_time time not null,
  reason text,
  status text default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz default now()
);
```

### 5. Configurar políticas RLS

```sql
alter table specialties enable row level security;
alter table doctors enable row level security;
create policy "Leer especialidades" on specialties for select using (true);
create policy "Leer médicos" on doctors for select using (true);

alter table patients enable row level security;
create policy "Ver mi perfil" on patients for select using (auth.uid() = id);
create policy "Crear mi perfil" on patients for insert with check (auth.uid() = id);
create policy "Editar mi perfil" on patients for update using (auth.uid() = id);

alter table appointments enable row level security;
create policy "Ver mis citas" on appointments for select using (auth.uid() = patient_id);
create policy "Crear cita" on appointments for insert with check (auth.uid() = patient_id);
create policy "Cancelar cita" on appointments for update using (auth.uid() = patient_id);
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Despliegue en Vercel

1. Sube el proyecto a un repositorio GitHub público
2. En [vercel.com](https://vercel.com), importa el repositorio
3. Agrega las variables de entorno en el paso de configuración
4. Clic en **Deploy**
5. En Supabase → Authentication → URL Configuration, agrega la URL de Vercel

---

## Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `Email signups are disabled` | Email provider desactivado | Authentication → Providers → Email → activar |
| `401 Unauthorized` en patients | Email sin confirmar | Desactivar "Confirm email" en Auth settings |
| Fondo oscuro en la app | Dark mode del sistema | Agregar `color-scheme: light` en globals.css |
| Input pierde foco al escribir | Componente definido dentro de otro | Mover el componente fuera del padre |

---

## Licencia

Proyecto académico — Universidad Unifranz · 2026
