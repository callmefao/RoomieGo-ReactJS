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
import Footer from "@/components/Footer"
import Image from "next/image"
import Link from "next/link"
import { User, Lock, ArrowLeft, Mail, Phone } from "lucide-react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"

export default function AuthPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rePassword, setRePassword] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

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

      // Debug logging
      console.log('🔍 API Response from /auth/users/me/:', user)
      console.log('🔍 User role:', user.role)
      console.log('🔍 User username:', user.username)

      // Store user info
      localStorage.setItem("user", JSON.stringify(user))
      console.log('✅ Stored user in localStorage:', JSON.parse(localStorage.getItem("user") || '{}'))

      // Dispatch auth change event
      window.dispatchEvent(new Event('authStateChanged'))

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
      const errorMessage = parseApiError(err)
      setError(errorMessage || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validate password match
    if (password !== rePassword) {
      setError("Mật khẩu không khớp. Vui lòng kiểm tra lại.")
      return
    }
    
    setIsLoading(true)
    try {
      const payload = {
        username: username,
        password: password,
        re_password: rePassword,
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
          // Dispatch auth change event
          window.dispatchEvent(new Event('authStateChanged'))
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

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    setIsGoogleLoading(true)
    setError("")
    
    try {
      // Send Google credential token to backend
      const response = await apiClient.post<{
        access: string
        refresh: string
        user: ApiUser
        is_new_user?: boolean
      }>(
        "/api/auth/google/login/",
        { token: credentialResponse.credential },
        { includeAuth: false }
      )

      const { access, refresh, user, is_new_user } = response.data

      // Store tokens and user info
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
      localStorage.setItem("user", JSON.stringify(user))

      // Debug logging
      console.log('✅ Google login successful:', user)
      if (is_new_user) {
        console.log('🎉 New user created!')
      }

      // Dispatch auth change event
      window.dispatchEvent(new Event('authStateChanged'))

      // Route based on role
      if (user.role === "staff" || user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (err: any) {
      console.error("Google login error:", err)
      setError("Đăng nhập Google thất bại. Vui lòng thử lại.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Đăng nhập Google thất bại. Vui lòng thử lại.")
    setIsGoogleLoading(false)
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      <div className="relative flex-grow flex items-center justify-center py-12">
      <div className="w-full max-w-2xl px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group drop-shadow-lg transition-all duration-300 hover:scale-105">
            <Image 
              src="/images/logo.png" 
              alt="Roomie Go Logo" 
              width={80} 
              height={80} 
              className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xl" 
            />
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent font-lodestone drop-shadow-sm">
              Roomie Go
            </div>
          </Link>
        </div>

        <div className="relative">
          <Card className="relative shadow-[0_40px_120px_-60px_rgba(14,165,233,0.35)] border-transparent rounded-3xl backdrop-blur-sm bg-background/95 ring-1 ring-blue-100/50">
          <CardHeader className="space-y-2 pb-8 pt-8">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-slate-800 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
              {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground/80 text-base">
              {isRegister ? 'Tạo tài khoản mới để bắt đầu' : 'Nhập thông tin để tiếp tục'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="whitespace-pre-line">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-12 h-12 rounded-xl border-blue-200/60 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base bg-white/50"
                  />
                </div>
              </div>

              {isRegister && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="email@example.com"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={isLoading}
                        className="pl-12 h-12 rounded-xl border-blue-200/60 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base bg-white/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold">Họ</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Nguyễn"
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        required 
                        disabled={isLoading}
                        className="h-12 rounded-xl border-blue-200/60 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold">Tên</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Văn A"
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        required 
                        disabled={isLoading}
                        className="h-12 rounded-xl border-blue-200/60 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base bg-white/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input 
                        id="phone" 
                        placeholder="0912345678"
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        required 
                        disabled={isLoading}
                        className="pl-12 h-12 rounded-xl border-blue-200/60 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base bg-white/50"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-12 h-12 rounded-xl border-blue-200/60 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base bg-white/50"
                  />
                </div>
              </div>

              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="rePassword" className="text-sm font-semibold">Nhập lại mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input
                      id="rePassword"
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={rePassword}
                      onChange={(e) => setRePassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-12 h-12 rounded-xl border-blue-200/60 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base bg-white/50"
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 mt-6 text-lg rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-cyan-200/25 transition-all duration-300 hover:scale-[1.03] active:scale-95 hover:-translate-y-0.5" 
                disabled={isLoading}
              >
                {isLoading ? (isRegister ? "Đang đăng ký..." : "Đang đăng nhập...") : (isRegister ? "Đăng ký" : "Đăng nhập")}
              </Button>
            </form>

            {/* Divider */}
            {!isRegister && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-200/60" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background/95 px-4 text-muted-foreground">hoặc</span>
                  </div>
                </div>

                {/* Google Login Button */}
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={handleGoogleError}
                    text="signin_with"
                    shape="rectangular"
                    size="large"
                    theme="outline"
                    width="100%"
                  />
                </div>
              </>
            )}

            <div className="mt-8 text-center">
              <div className="text-base text-muted-foreground">
                {isRegister ? (
                  <span>
                    Bạn đã có tài khoản?{" "}
                    <button 
                      className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-all duration-200 hover:underline-offset-4 hover:scale-105 inline-block" 
                      onClick={() => {
                        setIsRegister(false)
                        setError("")
                        setRePassword("")
                      }}
                    >
                      Đăng nhập
                    </button>
                  </span>
                ) : (
                  <span>
                    Chưa có tài khoản?{" "}
                    <button 
                      className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-all duration-200 hover:underline-offset-4 hover:scale-105 inline-block" 
                      onClick={() => {
                        setIsRegister(true)
                        setError("")
                      }}
                    >
                      Đăng ký ngay
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-base text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300 group hover:gap-3"
              >
                <ArrowLeft className="h-4 w-4 transition-all duration-300 group-hover:-translate-x-1 group-hover:scale-110" />
                <span className="transition-all duration-300 group-hover:underline underline-offset-2">Quay lại trang chủ</span>
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
        </div>
      </div>
      <Footer />  
    </div>
  )
}
