export interface Vehicle {
  id: string
  type: string
  status: "active" | "idle" | "alert"
  location: {
    lat: number
    lng: number
  }
  speed: number
  fuel: number
  lastUpdate: string
  driver?: string
}

export interface Device {
  id: string
  vehicleId: string
  type: string
  status: string
  lastPing: string
}

export interface Location {
  id: string
  vehicleId: string
  lat: number
  lng: number
  timestamp: string
  speed: number
  heading: number
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  lastLogin: string
}

export interface UserVehicle {
  userId: string
  vehicleId: string
  accessLevel: string
}
