"use client"

/**
 * Test Page cho District & University Selectors
 * ==============================================
 * Navigate to: http://localhost:3000/test-selectors
 */

import { useState } from "react"
import DistrictSelector from "@/components/DistrictSelector"
import UniversitySelector from "@/components/UniversitySelector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSelectorsPage() {
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>()
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string>()
  const [selectedUniversity, setSelectedUniversity] = useState<string>()

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">
        Test District & University Selectors
      </h1>

      {/* Test 1: District Selector Standalone */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test 1: District Selector (Standalone)</CardTitle>
        </CardHeader>
        <CardContent>
          <DistrictSelector
            value={selectedDistrictId}
            onChange={(id, slug) => {
              setSelectedDistrictId(id)
              setSelectedDistrictSlug(slug)
              console.log("District selected:", { id, slug })
            }}
          />
          
          {selectedDistrictId && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Selected District ID:</strong> {selectedDistrictId}
              </p>
              <p className="text-sm">
                <strong>Selected District Slug:</strong> {selectedDistrictSlug}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test 2: University Selector (All) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test 2: University Selector (All Universities)</CardTitle>
        </CardHeader>
        <CardContent>
          <UniversitySelector
            value={selectedUniversity}
            onChange={(code) => {
              setSelectedUniversity(code)
              console.log("University selected:", code)
            }}
          />
          
          {selectedUniversity && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Selected University Code:</strong> {selectedUniversity}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test 3: Cascade Selectors */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test 3: Cascade (District → Universities)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              1. Chọn Quận
            </label>
            <DistrictSelector
              value={selectedDistrictId}
              onChange={(id, slug) => {
                setSelectedDistrictId(id)
                setSelectedDistrictSlug(slug)
                setSelectedUniversity(undefined) // Reset university
              }}
            />
          </div>

          {selectedDistrictId && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                2. Chọn Trường (trong quận đã chọn)
              </label>
              <UniversitySelector
                value={selectedUniversity}
                onChange={(code) => setSelectedUniversity(code)}
                districtId={selectedDistrictId}
              />
            </div>
          )}

          {selectedDistrictId && selectedUniversity && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                ✅ Cascade Working!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                District: {selectedDistrictSlug} (ID: {selectedDistrictId})
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                University: {selectedUniversity}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test 4: Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Test 4: Required Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert("Form submitted!")
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">
                Quận <span className="text-destructive">*</span>
              </label>
              <DistrictSelector
                value={selectedDistrictId}
                onChange={(id, slug) => setSelectedDistrictId(id)}
                required
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Submit Form
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
