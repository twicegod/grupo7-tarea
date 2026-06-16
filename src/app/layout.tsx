import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ConsultorioMed",
  description: "Sistema de citas médicas online",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-gray-50`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-60">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
