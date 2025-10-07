import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Roomie Go - Tìm là có, ở khỏi lo",
  description: "Nền tảng tìm kiếm và thuê phòng trọ, căn hộ tại Việt Nam",
  icons: {
    icon: "/images/MASCOT.png",
    shortcut: "/images/MASCOT.png",
    apple: "/images/MASCOT.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans antialiased bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 min-h-screen">
        {children}
      </body>
    </html>
  )
}
