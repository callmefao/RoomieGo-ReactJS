"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Home, DollarSign, TrendingUp } from "lucide-react"
import { mockUsers } from "@/lib/mock-data/users"
import { mockRooms } from "@/lib/mock-data/rooms"

export default function AdminStats() {
  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter((u) => u.status === "active").length
  const totalRooms = mockRooms.length
  const totalRevenue = mockRooms.reduce((sum, room) => sum + room.price, 0)

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      description: `${activeUsers} active users`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Rooms",
      value: totalRooms,
      description: "Available listings",
      icon: Home,
      color: "text-green-500",
    },
    {
      title: "Monthly Revenue",
      value: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        notation: "compact",
      }).format(totalRevenue),
      description: "From all listings",
      icon: DollarSign,
      color: "text-yellow-500",
    },
    {
      title: "Growth Rate",
      value: "+12.5%",
      description: "vs last month",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
