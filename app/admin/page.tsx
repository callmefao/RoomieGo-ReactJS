"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Header is rendered globally in app/layout.tsx
import { Users, Home, BarChart3, Clock } from "lucide-react"
import AccountManagement from "@/components/admin/AccountManagement"
import RoomManagement from "@/components/admin/RoomManagement"
import AdminStats from "@/components/admin/AdminStats"
import PendingRooms from "@/components/admin/PendingRooms"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("stats")

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage accounts, rooms, and view statistics</p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Pending</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Rooms</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <AdminStats />
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <PendingRooms />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <AccountManagement />
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <RoomManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
