import { NextResponse } from "next/server"
import type { Vehicle } from "@/lib/types"

// Mock database for demonstration
const vehicles: Vehicle[] = [
  {
    id: "VH-001",
    type: "Truck",
    status: "active",
    location: { lat: 37.7749, lng: -122.4194 },
    speed: 65,
    fuel: 78,
    lastUpdate: "2 min ago",
  },
  {
    id: "VH-002",
    type: "Van",
    status: "idle",
    location: { lat: 37.7833, lng: -122.4167 },
    speed: 0,
    fuel: 45,
    lastUpdate: "5 min ago",
  },
  {
    id: "VH-003",
    type: "Car",
    status: "alert",
    location: { lat: 37.7694, lng: -122.4862 },
    speed: 0,
    fuel: 12,
    lastUpdate: "1 min ago",
  },
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // Find the vehicle by ID
  const vehicle = vehicles.find((v) => v.id === id)

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
  }

  return NextResponse.json(vehicle)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updates = await request.json()

    // Find the vehicle by ID
    const vehicleIndex = vehicles.findIndex((v) => v.id === id)

    if (vehicleIndex === -1) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    // In a real application, this would update the vehicle in a database
    // For demonstration, we'll just return the updated vehicle
    const updatedVehicle = {
      ...vehicles[vehicleIndex],
      ...updates,
      lastUpdate: "just now",
    }

    return NextResponse.json(updatedVehicle)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // Find the vehicle by ID
  const vehicleIndex = vehicles.findIndex((v) => v.id === id)

  if (vehicleIndex === -1) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
  }

  // In a real application, this would delete the vehicle from a database
  // For demonstration, we'll just return a success message
  return NextResponse.json({ message: "Vehicle deleted successfully" })
}
