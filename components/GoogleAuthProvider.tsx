"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import { useState, useEffect } from "react"

// Fallback Client ID from Google Cloud Console
const FALLBACK_CLIENT_ID = "313636903945-i3dudtfm42lhr4kacagsduup9ppiikah.apps.googleusercontent.com"

export default function GoogleAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [clientId, setClientId] = useState<string>(FALLBACK_CLIENT_ID)

  useEffect(() => {
    // Try to fetch Google Client ID from backend
    const fetchClientId = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        const response = await fetch(`${backendUrl}/api/auth/google/config/`)
        const data = await response.json()
        
        if (data.client_id) {
          console.log('✅ Fetched Google Client ID from backend:', data.client_id)
          setClientId(data.client_id)
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch Google Client ID from backend, using fallback:', error)
        // Already using fallback
      }
    }

    fetchClientId()
  }, [])

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
