import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import Header from "@/components/Header"
import ErrorOverlayProvider from "@/components/ErrorOverlayProvider"
import MainLayout from "@/components/layout/MainLayout"
import ChatBot from "@/components/ChatBot"
import GoogleAuthProvider from "@/components/GoogleAuthProvider"

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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HBXHX7GCJR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HBXHX7GCJR');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 min-h-screen">
        <GoogleAuthProvider>
          <ErrorOverlayProvider>
            <Header />
            <main className="py-8">
              <MainLayout>{children}</MainLayout>
            </main>
            <ChatBot />
          </ErrorOverlayProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  )
}
