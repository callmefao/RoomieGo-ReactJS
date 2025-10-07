"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/20 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo và Roomie Go thành một khối clickable */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/images/logo.png" alt="Roomie Go Logo" width={40} height={40} className="object-contain" />
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent font-lodestone">Roomie Go</div>
        </Link>
        
        {/* Toolbar với các service buttons */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-200 rounded-lg"
              onClick={() => window.location.href = '/rental-listings'}
            >
              Tìm phòng nhanh
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-200 rounded-lg"
              onClick={() => window.location.href = '#combo'}
            >
              Combo
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-200 rounded-lg"
              onClick={() => window.location.href = '#tim-ban-o-ghep'}
            >
              Tìm bạn ở ghép
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-200 rounded-lg"
              onClick={() => window.location.href = '#dich-vu-van-chuyen'}
            >
              Dịch vụ vận chuyển
            </Button>
          </div>
          
          {/* Button đăng nhập với glass effect */}
          <Button className="font-medium bg-slate-800/90 hover:bg-slate-900 text-white border-slate-700 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-slate-400/25 transition-all duration-300 active:scale-95 hover:scale-105 backdrop-blur-sm">
            Đăng nhập
          </Button>
        </div>
      </div>
    </header>
  )
}
