import type { Vehicle, Device, Location, User, UserVehicle } from "./types"

// Mock data for demonstration
const mockVehicles: Vehicle[] = [
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
  {
    id: "VH-004",
    type: "Truck",
    status: "active",
    location: { lat: 37.8044, lng: -122.2711 },
    speed: 72,
    fuel: 65,
    lastUpdate: "3 min ago",
  },
  {
    id: "VH-005",
    type: "Van",
    status: "active",
    location: { lat: 37.7575, lng: -122.4376 },
    speed: 45,
    fuel: 89,
    lastUpdate: "just now",
  },
  {
    id: "VH-006",
    type: "Car",
    status: "idle",
    location: { lat: 37.7749, lng: -122.4194 },
    speed: 0,
    fuel: 32,
    lastUpdate: "10 min ago",
  },
  {
    id: "VH-007",
    type: "Truck",
    status: "alert",
    location: { lat: 37.7833, lng: -122.4167 },
    speed: 15,
    fuel: 8,
    lastUpdate: "4 min ago",
  },
]

const mockDevices: Device[] = [
  {
    id: "DEV-001",
    vehicleId: "VH-001",
    type: "GPS Tracker",
    status: "online",
    lastPing: "2023-04-28T10:30:00Z",
  },
  {
    id: "DEV-002",
    vehicleId: "VH-001",
    type: "Fuel Sensor",
    status: "online",
    lastPing: "2023-04-28T10:32:00Z",
  },
  {
    id: "DEV-003",
    vehicleId: "VH-002",
    type: "GPS Tracker",
    status: "online",
    lastPing: "2023-04-28T10:25:00Z",
  },
]

const mockLocations: Location[] = [
  {
    id: "LOC-001",
    vehicleId: "VH-001",
    lat: 37.7749,
    lng: -122.4194,
    timestamp: "2023-04-28T10:30:00Z",
    speed: 65,
    heading: 90,
  },
  {
    id: "LOC-002",
    vehicleId: "VH-001",
    lat: 37.775,
    lng: -122.4195,
    timestamp: "2023-04-28T10:29:00Z",
    speed: 63,
    heading: 90,
  },
  {
    id: "LOC-003",
    vehicleId: "VH-002",
    lat: 37.7833,
    lng: -122.4167,
    timestamp: "2023-04-28T10:25:00Z",
    speed: 0,
    heading: 0,
  },
]

const mockUsers: User[] = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    lastLogin: "2023-04-28T09:00:00Z",
  },
  {
    id: "USR-002",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "driver",
    lastLogin: "2023-04-28T08:30:00Z",
  },
]

const mockUserVehicles: UserVehicle[] = [
  {
    userId: "USR-001",
    vehicleId: "VH-001",
    accessLevel: "full",
  },
  {
    userId: "USR-002",
    vehicleId: "VH-002",
    accessLevel: "driver",
  },
]

// API functions
export async function fetchVehicles(): Promise<Vehicle[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockVehicles)
    }, 1000)
  })
}

export async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const vehicle = mockVehicles.find((v) => v.id === id) || null
      resolve(vehicle)
    }, 500)
  })
}

export async function fetchDevices(): Promise<Device[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDevices)
    }, 800)
  })
}

export async function fetchLocationHistory(vehicleId: string): Promise<Location[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const locations = mockLocations.filter((l) => l.vehicleId === vehicleId)
      resolve(locations)
    }, 700)
  })
}

export async function fetchUsers(): Promise<User[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers)
    }, 600)
  })
}

export async function fetchUserVehicles(userId: string): Promise<UserVehicle[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const userVehicles = mockUserVehicles.filter((uv) => uv.userId === userId)
      resolve(userVehicles)
    }, 500)
  })
}
