"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { ApiUser } from "@/types/user"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: Array<"admin" | "staff" | "owner" | "user">
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      // Check if authentication is required
      if (!requireAuth) {
        setIsAuthorized(true)
        setIsChecking(false)
        return
      }

      // Check for access token
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("❌ No access token found, redirecting to", redirectTo)
        router.push(redirectTo)
        setIsChecking(false)
        return
      }

      // Check user role if roles are specified
      if (allowedRoles && allowedRoles.length > 0) {
        const userStr = localStorage.getItem("user")
        if (!userStr) {
          console.log("❌ No user data found, redirecting to", redirectTo)
          router.push(redirectTo)
          setIsChecking(false)
          return
        }

        try {
          const user: ApiUser = JSON.parse(userStr)
          
          if (!allowedRoles.includes(user.role)) {
            console.log(`❌ User role "${user.role}" not authorized. Allowed: ${allowedRoles.join(", ")}`)
            router.push("/")
            setIsChecking(false)
            return
          }

          console.log(`✅ User "${user.username}" authorized with role "${user.role}"`)
        } catch (e) {
          console.error("❌ Failed to parse user data:", e)
          router.push(redirectTo)
          setIsChecking(false)
          return
        }
      }

      // All checks passed
      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAuth()
  }, [requireAuth, allowedRoles, redirectTo, router])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
      </div>
    )
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
