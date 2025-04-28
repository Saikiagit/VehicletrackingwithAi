"use client"

import { useEffect, useRef, useState } from "react"
import type { Vehicle } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Car, Navigation, AlertTriangle } from "lucide-react"
import { predictRoute } from "@/lib/ai"

interface VehicleMapProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSelectVehicle: (vehicle: Vehicle) => void
}

export function VehicleMap({ vehicles, selectedVehicle, onSelectVehicle }: VehicleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [predictedRoute, setPredictedRoute] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate map initialization
  useEffect(() => {
    if (!mapRef.current) return

    // In a real implementation, this would initialize a map library like Leaflet or Google Maps
    const mapContainer = mapRef.current
    mapContainer.innerHTML = ""

    const mapCanvas = document.createElement("div")
    mapCanvas.className = "w-full h-full bg-gray-200 rounded-lg relative overflow-hidden"
    mapContainer.appendChild(mapCanvas)

    // Draw a simulated map
    const ctx = document.createElement("canvas")
    ctx.width = mapCanvas.clientWidth
    ctx.height = mapCanvas.clientHeight
    ctx.className = "absolute inset-0 w-full h-full"
    mapCanvas.appendChild(ctx)

    // Add vehicle markers
    vehicles.forEach((vehicle) => {
      const marker = document.createElement("div")
      marker.className = `absolute w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
        vehicle.status === "active" ? "bg-green-500" : vehicle.status === "idle" ? "bg-gray-500" : "bg-amber-500"
      }`

      // Position markers randomly on the map for demo
      const left = 10 + Math.random() * 80 // 10-90% of width
      const top = 10 + Math.random() * 80 // 10-90% of height

      marker.style.left = `${left}%`
      marker.style.top = `${top}%`

      const icon = document.createElement("span")
      icon.className = "text-white"
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>`
      marker.appendChild(icon)

      // Add vehicle ID for identification
      const label = document.createElement("div")
      label.className =
        "absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium shadow"
      label.textContent = vehicle.id
      marker.appendChild(label)

      // Highlight selected vehicle
      if (selectedVehicle && vehicle.id === selectedVehicle.id) {
        marker.classList.add("ring-4", "ring-blue-500", "z-10")
      }

      marker.addEventListener("click", () => {
        onSelectVehicle(vehicle)
      })

      mapCanvas.appendChild(marker)
    })

    // Draw predicted route if available
    if (selectedVehicle && predictedRoute) {
      const routePath = document.createElement("div")
      routePath.className = "absolute inset-0"

      // This would be replaced with actual route drawing in a real implementation
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("width", "100%")
      svg.setAttribute("height", "100%")
      svg.setAttribute("viewBox", "0 0 100 100")
      svg.setAttribute("preserveAspectRatio", "none")

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", "M20,80 Q40,40 60,70 T90,40")
      path.setAttribute("stroke", "#3b82f6")
      path.setAttribute("stroke-width", "2")
      path.setAttribute("fill", "none")
      path.setAttribute("stroke-dasharray", "4")

      svg.appendChild(path)
      routePath.appendChild(svg)
      mapCanvas.appendChild(routePath)
    }
  }, [vehicles, selectedVehicle, predictedRoute])

  const handlePredictRoute = async () => {
    if (!selectedVehicle) return

    setIsLoading(true)
    try {
      const route = await predictRoute(selectedVehicle.id)
      setPredictedRoute(route)
    } catch (error) {
      console.error("Failed to predict route:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span className="text-xs text-gray-600">Active</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-gray-500 mr-1"></span>
            <span className="text-xs text-gray-600">Idle</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
            <span className="text-xs text-gray-600">Alert</span>
          </div>
        </div>
        {selectedVehicle && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handlePredictRoute}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            ) : (
              <Navigation className="h-4 w-4 mr-2" />
            )}
            Predict Route
          </Button>
        )}
      </div>

      <div ref={mapRef} className="flex-1 min-h-[400px] bg-gray-100 rounded-lg relative">
        {/* Map will be rendered here */}
      </div>

      {selectedVehicle && (
        <div className="mt-4 bg-white p-4 rounded-lg border">
          <h3 className="font-medium flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Vehicle Details
          </h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-xs text-gray-500">ID</p>
              <p className="text-sm">{selectedVehicle.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm flex items-center">
                {selectedVehicle.status === "alert" && <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />}
                {selectedVehicle.status.charAt(0).toUpperCase() + selectedVehicle.status.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Speed</p>
              <p className="text-sm">{selectedVehicle.speed} km/h</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fuel</p>
              <p className="text-sm">{selectedVehicle.fuel}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
