"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { ApiUser } from "@/types/user"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/MainLayout"

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<ApiUser | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error("Failed to parse user data:", e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/20 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <MainLayout className="flex items-center justify-between py-4">
        {/* Logo và Roomie Go thành một khối clickable */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/images/logo.png" alt="Roomie Go Logo" width={40} height={40} className="object-contain" />
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent font-lodestone">
            Roomie Go
          </div>
        </Link>

        {/* Toolbar với các service buttons */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-200 rounded-lg"
              onClick={() => router.push("/rental-listings")}
            >
              Tìm phòng nhanh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-200 rounded-lg"
              onClick={() => router.push("/find-roomie")}
            >
              Tìm bạn ở ghép
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-200 rounded-lg"
              onClick={() => (window.location.href = "#combo")}
            >
              Combo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-200 rounded-lg"
              onClick={() => (window.location.href = "#dich-vu-van-chuyen")}
            >
              Dịch vụ vận chuyển
            </Button>

            {user?.role === "owner" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-200 rounded-lg"
                onClick={() => router.push("/owner/rooms")}
              >
                Quản lý phòng
              </Button>
            )}
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="font-medium cursor-pointer bg-transparent">
                  <User className="w-4 h-4 mr-2" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-blue-600 font-medium capitalize">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(user.role === "admin" || user.role === "staff") && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="font-medium bg-slate-800/90 hover:bg-slate-900 text-white border-slate-700 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-slate-400/25 transition-all duration-300 active:scale-95 hover:scale-105 backdrop-blur-sm"
              onClick={() => router.push("/auth")}
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </MainLayout>
    </header>
  )
}
