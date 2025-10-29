"use client"

import type React from "react"

import { useState } from "react"
// Header is rendered globally in app/layout.tsx
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import { registerUser, loginAndStore, parseApiError } from "@/lib/auth"
import type { ApiUser } from "@/types/user"
import Image from "next/image"
import Link from "next/link"

export default function AuthPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Step 1: Login and get tokens
      const loginResponse = await apiClient.post<{ access: string; refresh: string }>(
        "/auth/jwt/create/",
        { username, password },
        { includeAuth: false },
      )

      const { access, refresh } = loginResponse.data

      // Store tokens
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)

      // Step 2: Get user info
      const userResponse = await apiClient.get<ApiUser>("/auth/users/me/", {
        includeAuth: true,
      })

      const user = userResponse.data

      // Store user info
      localStorage.setItem("user", JSON.stringify(user))

      // Step 3: Route based on role
      if (user.role === "staff" || user.role === "admin") {
        router.push("/admin")
      } else if (user.role === "owner") {
        router.push("/")
      } else {
        router.push("/")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.details?.detail) {
        setError(err.details.detail)
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const payload = {
        username: username,
        password: password,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      }

      const registerResponse = await registerUser(payload)

      // If backend returns something indicating activation/verification required,
      // show a message instead of attempting auto-login.
  const body = registerResponse.data as any
      const status = registerResponse.status
      // Common DRF behavior: 201 created -> user created. Some APIs include flags.
      if (status === 201 && (body?.is_active === false || body?.needs_activation === true || body?.detail)) {
        setError(body?.detail || "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.")
      } else if (status === 201 || status === 200) {
        // Try auto-login but handle failures gracefully
        try {
          const me = await loginAndStore(username, password)
          // route after successful login
          if (me.role === "staff" || me.role === "admin") router.push("/admin")
          else router.push("/")
        } catch (loginErr) {
          console.error("Auto-login failed after registration", loginErr)
          setError("Đăng ký thành công. Vui lòng đăng nhập.")
        }
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại.")
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(parseApiError(err))
    } finally {
      setIsLoading(false)
    }
  }
  // auto-login is now provided by loginAndStore helper

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Roomie Go Logo" width={50} height={50} className="object-contain" />
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent font-lodestone">
              Roomie Go
            </div>
          </Link>
        </div>

        <Card className="shadow-xl border-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{isRegister ? 'Đăng ký' : 'Đăng nhập'}</CardTitle>
            <CardDescription className="text-center">{isRegister ? 'Tạo tài khoản mới' : 'Nhập thông tin tài khoản để tiếp tục'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="staff"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {isRegister && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Họ</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Tên</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required disabled={isLoading} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isRegister ? "Đang đăng ký..." : "Đang đăng nhập...") : (isRegister ? "Đăng ký" : "Đăng nhập")}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm">
                {isRegister ? (
                  <span>Bạn đã có tài khoản? <button className="text-blue-600 underline" onClick={() => setIsRegister(false)}>Đăng nhập</button></span>
                ) : (
                  <span>Bạn chưa có tài khoản? <button className="text-blue-600 underline" onClick={() => setIsRegister(true)}>Đăng ký</button></span>
                )}
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/" className="text-blue-600 hover:underline">
                Quay lại trang chủ
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
