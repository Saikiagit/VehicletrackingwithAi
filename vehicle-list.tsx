"use client"

import { useState } from "react"
import type { Vehicle } from "@/lib/types"
import { Car, AlertTriangle, Search, ChevronRight, Fuel, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VehicleListProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSelectVehicle: (vehicle: Vehicle) => void
}

export function VehicleList({ vehicles, selectedVehicle, onSelectVehicle }: VehicleListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-full flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search vehicles..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No vehicles found matching your search.</div>
          ) : (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedVehicle?.id === vehicle.id
                    ? "bg-green-50 border border-green-200"
                    : "bg-white border border-gray-100 hover:bg-gray-50"
                }`}
                onClick={() => onSelectVehicle(vehicle)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        vehicle.status === "active"
                          ? "bg-green-100 text-green-600"
                          : vehicle.status === "idle"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      <Car className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">{vehicle.id}</h4>
                        {vehicle.status === "alert" && <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />}
                      </div>
                      <p className="text-xs text-gray-500">{vehicle.type}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{vehicle.lastUpdate}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Fuel className="h-3 w-3 mr-1" />
                    <span>{vehicle.fuel}%</span>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        vehicle.status === "active"
                          ? "default"
                          : vehicle.status === "idle"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {vehicle.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
