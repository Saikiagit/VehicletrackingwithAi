"use client"

import type { Vehicle } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface VehicleStatsProps {
  vehicles: Vehicle[]
}

export function VehicleStats({ vehicles }: VehicleStatsProps) {
  // Calculate status distribution
  const statusCounts = vehicles.reduce(
    (acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // Calculate fuel distribution
  const fuelRanges = {
    "0-25%": 0,
    "26-50%": 0,
    "51-75%": 0,
    "76-100%": 0,
  }

  vehicles.forEach((vehicle) => {
    if (vehicle.fuel <= 25) fuelRanges["0-25%"]++
    else if (vehicle.fuel <= 50) fuelRanges["26-50%"]++
    else if (vehicle.fuel <= 75) fuelRanges["51-75%"]++
    else fuelRanges["76-100%"]++
  })

  const fuelData = Object.entries(fuelRanges).map(([name, value]) => ({
    name,
    value,
  }))

  // Calculate speed distribution
  const speedRanges = {
    "0 km/h": 0,
    "1-30 km/h": 0,
    "31-60 km/h": 0,
    "61-90 km/h": 0,
    "91+ km/h": 0,
  }

  vehicles.forEach((vehicle) => {
    if (vehicle.speed === 0) speedRanges["0 km/h"]++
    else if (vehicle.speed <= 30) speedRanges["1-30 km/h"]++
    else if (vehicle.speed <= 60) speedRanges["31-60 km/h"]++
    else if (vehicle.speed <= 90) speedRanges["61-90 km/h"]++
    else speedRanges["91+ km/h"]++
  })

  const speedData = Object.entries(speedRanges).map(([name, value]) => ({
    name,
    value,
  }))

  // Colors for charts
  const COLORS = ["#16a34a", "#d97706", "#6b7280", "#ef4444"]
  const SPEED_COLORS = ["#6b7280", "#22c55e", "#eab308", "#f97316", "#ef4444"]

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium mb-4">Vehicle Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium mb-4">Fuel Level Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fuelData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium mb-4">Speed Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={speedData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6">
                {speedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SPEED_COLORS[index % SPEED_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
