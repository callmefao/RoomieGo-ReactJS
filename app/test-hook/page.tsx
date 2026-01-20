"use client"

/**
 * Test page for useLocations Hook
 * URL: http://localhost:3000/test-hook
 */

import { useLocations } from "@/hooks/useLocations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, MapPin, School } from "lucide-react"

export default function TestHookPage() {
  const {
    districts,
    universities,
    selectedDistrict,
    selectedDistrictSlug,
    selectedUniversity,
    setSelectedDistrict,
    setSelectedUniversity,
    loadingDistricts,
    loadingUniversities,
    error,
    refreshDistricts,
    refreshUniversities,
  } = useLocations({
    autoLoadDistricts: true,
  })

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">useLocations Hook Test</h1>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Districts Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Districts ({districts.length})
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshDistricts}
                disabled={loadingDistricts}
              >
                <RefreshCw className={`w-4 h-4 ${loadingDistricts ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDistricts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Đang tải quận/huyện...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {districts.map((district) => (
                  <button
                    key={district.id}
                    onClick={() => setSelectedDistrict(district.id, district.slug)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedDistrict === district.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="font-medium">{district.name}</div>
                    <div className="text-sm opacity-70 mt-1">
                      {district.slug} · {district.universities_count} trường
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Universities Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5" />
                Universities ({universities.length})
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshUniversities}
                disabled={loadingUniversities}
              >
                <RefreshCw className={`w-4 h-4 ${loadingUniversities ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUniversities ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Đang tải trường học...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {universities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {selectedDistrict 
                      ? "Không có trường nào trong quận này"
                      : "Chọn một quận để xem các trường"}
                  </div>
                ) : (
                  universities.map((university) => (
                    <button
                      key={university.code}
                      onClick={() => setSelectedUniversity(university.code)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedUniversity === university.code
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="font-medium">{university.short_name}</div>
                      <div className="text-sm opacity-70 mt-1">
                        {university.code}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Values Display */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Selected Values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium">District ID:</span>{" "}
            <Badge variant={selectedDistrict ? "default" : "secondary"}>
              {selectedDistrict || "None"}
            </Badge>
          </div>
          <div>
            <span className="font-medium">District Slug:</span>{" "}
            <Badge variant={selectedDistrictSlug ? "default" : "secondary"}>
              {selectedDistrictSlug || "None"}
            </Badge>
          </div>
          <div>
            <span className="font-medium">University Code:</span>{" "}
            <Badge variant={selectedUniversity ? "default" : "secondary"}>
              {selectedUniversity || "None"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">Loading States:</span>
            {loadingDistricts && <Badge variant="outline">Loading Districts</Badge>}
            {loadingUniversities && <Badge variant="outline">Loading Universities</Badge>}
            {!loadingDistricts && !loadingUniversities && (
              <Badge variant="outline">✅ Idle</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card className="mt-6 border-primary/20">
        <CardHeader>
          <CardTitle>📋 Test Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>✅ Districts load on mount (check left panel)</div>
          <div>✅ Click a district → Universities load automatically</div>
          <div>✅ Selected values update (check "Selected Values" section)</div>
          <div>✅ Changing district resets university selection</div>
          <div>✅ Refresh buttons work correctly</div>
          <div>✅ Loading states show during API calls</div>
          <div>✅ No errors in console</div>
        </CardContent>
      </Card>
    </div>
  )
}
