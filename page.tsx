"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Car, MapPin, AlertTriangle, BarChart3, Clock, Users, Settings } from "lucide-react"
import { VehicleMap } from "@/components/vehicle-map"
import { VehicleList } from "@/components/vehicle-list"
import { VehicleStats } from "@/components/vehicle-stats"
import { fetchVehicles } from "@/lib/api"
import type { Vehicle } from "@/lib/types"

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles()
        setVehicles(data)
        if (data.length > 0) {
          setSelectedVehicle(data[0])
        }
      } catch (error) {
        console.error("Failed to load vehicles:", error)
      } finally {
        setLoading(false)
      }
    }

    loadVehicles()

    // Set up WebSocket for real-time updates
    const ws = new WebSocket("wss://echo.websocket.org") // Placeholder WebSocket URL

    ws.onopen = () => {
      console.log("WebSocket connected")
    }

    ws.onmessage = (event) => {
      try {
        const updatedVehicle = JSON.parse(event.data)
        setVehicles((prev) =>
          prev.map((vehicle) => (vehicle.id === updatedVehicle.id ? { ...vehicle, ...updatedVehicle } : vehicle)),
        )
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  const activeVehicles = vehicles.filter((v) => v.status === "active")
  const alertVehicles = vehicles.filter((v) => v.status === "alert")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">VehicleTrack Pro</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Button variant="ghost" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            <Button variant="ghost" className="flex items-center">
              <Car className="mr-2 h-4 w-4" /> Vehicles
            </Button>
            <Button variant="ghost" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" /> Analytics
            </Button>
            <Button variant="ghost" className="flex items-center">
              <Users className="mr-2 h-4 w-4" /> Users
            </Button>
            <Button variant="ghost" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </nav>
          <div>
            <Button variant="outline">Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Fleet Dashboard</h1>
          <div className="flex space-x-4">
            <Button variant="outline" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" /> History
            </Button>
            <Button className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" /> Alerts
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <p className="text-xs text-gray-500 mt-1">Across all fleets</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeVehicles.length}</div>
              <p className="text-xs text-gray-500 mt-1">Currently on the road</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{alertVehicles.length}</div>
              <p className="text-xs text-gray-500 mt-1">Require attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Fuel Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142.8 L</div>
              <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Vehicle Locations</CardTitle>
                <CardDescription>Real-time tracking of all vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[500px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <VehicleMap
                    vehicles={vehicles}
                    selectedVehicle={selectedVehicle}
                    onSelectVehicle={setSelectedVehicle}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Tabs defaultValue="vehicles">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
              <TabsContent value="vehicles">
                <Card className="h-[600px]">
                  <CardHeader>
                    <CardTitle>Vehicle List</CardTitle>
                    <CardDescription>All vehicles in your fleet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-[500px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                      </div>
                    ) : (
                      <VehicleList
                        vehicles={vehicles}
                        selectedVehicle={selectedVehicle}
                        onSelectVehicle={setSelectedVehicle}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="stats">
                <Card className="h-[600px]">
                  <CardHeader>
                    <CardTitle>Vehicle Statistics</CardTitle>
                    <CardDescription>Performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-[500px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                      </div>
                    ) : (
                      <VehicleStats vehicles={vehicles} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
