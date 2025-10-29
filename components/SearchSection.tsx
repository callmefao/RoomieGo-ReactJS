"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import FilterButtons from "./FilterButtons"

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({})
  const router = useRouter()

  const handleFiltersChange = (filters: Record<string, any>) => {
    setCurrentFilters(filters)
    console.log("🔄 SearchSection received filters:", filters)
  }

  const handleSearch = () => {
    console.log("🔍 SearchSection current filters:", currentFilters)
    
    // Build search params
    const params = new URLSearchParams()
    
    // Add search query if provided
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim())
      console.log("➕ Added search param:", searchQuery.trim())
    }
    
    // Add filters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
        console.log(`➕ Added filter param: ${key} = ${value}`)
      }
    })
    
    // Navigate to rental listings with filters
    const queryString = params.toString()
    const url = queryString ? `/rental-listings?${queryString}` : '/rental-listings'
    
    console.log("🚀 Navigating to:", url)
    router.push(url)
  }

  return (
    <section className="w-full rounded-3xl bg-background/95 px-6 py-12 text-center shadow-[0_40px_120px_-60px_rgba(14,165,233,0.35)] backdrop-blur">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-cyan-600 bg-clip-text text-transparent mb-8 text-balance">Hãy tìm kiếm căn trọ ưng ý cho bạn</h1>

      {/* Temporarily commented out search input box
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Hãy tìm kiếm căn trọ ưng ý cho bạn"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-4 pr-12 text-lg rounded-full border-2 border-border focus:border-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        </div>
      </div>
      */}

      <FilterButtons onFiltersChange={handleFiltersChange} />

      <div className="mt-8">
        <Button 
          onClick={handleSearch} 
          size="lg" 
          className="px-8 py-3 text-lg font-medium rounded-full cursor-pointer bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-cyan-200/25 transition-all duration-300 active:scale-95 hover:scale-105"
        >
          Tìm phòng ngay
        </Button>
      </div>
    </section>
  )
}
