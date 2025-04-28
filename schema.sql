-- Vehicle Tracking System Database Schema

-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Vehicles Table
CREATE TABLE vehicles (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INT,
    license_plate VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'idle',
    fuel_level DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Devices Table
CREATE TABLE devices (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    firmware_version VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    last_ping TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Locations Table with PostGIS
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    position GEOGRAPHY(POINT, 4326) NOT NULL,
    altitude DECIMAL(10,2),
    speed DECIMAL(10,2),
    heading DECIMAL(5,2),
    accuracy DECIMAL(10,2),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create index for spatial queries
CREATE INDEX locations_position_idx ON locations USING GIST (position);

-- Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Vehicle Associations
CREATE TABLE user_vehicles (
    user_id VARCHAR(50) NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL,
    access_level VARCHAR(20) NOT NULL DEFAULT 'view',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, vehicle_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Telemetry Data
CREATE TABLE telemetry (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    engine_rpm INT,
    engine_temperature DECIMAL(5,2),
    oil_pressure DECIMAL(5,2),
    fuel_consumption DECIMAL(5,2),
    battery_voltage DECIMAL(5,2),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Alerts
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Maintenance Records
CREATE TABLE maintenance (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by VARCHAR(100),
    cost DECIMAL(10,2),
    odometer_reading INT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Geofences
CREATE TABLE geofences (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Vehicle Geofence Associations
CREATE TABLE vehicle_geofences (
    vehicle_id VARCHAR(50) NOT NULL,
    geofence_id INT NOT NULL,
    alert_on_enter BOOLEAN DEFAULT FALSE,
    alert_on_exit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (vehicle_id, geofence_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (geofence_id) REFERENCES geofences(id) ON DELETE CASCADE
);

-- Routes
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    path GEOGRAPHY(LINESTRING, 4326) NOT NULL,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- AI Predictions
CREATE TABLE ai_predictions (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    prediction_data JSONB NOT NULL,
    confidence DECIMAL(5,4),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create functions for common spatial queries

-- Function to get vehicles within a radius
CREATE OR REPLACE FUNCTION get_vehicles_within_radius(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION
) RETURNS TABLE (
    vehicle_id VARCHAR(50),
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.vehicle_id,
        ST_Distance(
            l.position::geography,
            ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
        ) AS distance_meters
    FROM locations l
    JOIN (
        SELECT vehicle_id, MAX(timestamp) AS max_timestamp
        FROM locations
        GROUP BY vehicle_id
    ) latest ON l.vehicle_id = latest.vehicle_id AND l.timestamp = latest.max_timestamp
    WHERE ST_DWithin(
        l.position::geography,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
        radius_meters
    )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a vehicle is inside a geofence
CREATE OR REPLACE FUNCTION is_vehicle_in_geofence(
    p_vehicle_id VARCHAR(50),
    p_geofence_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM locations l
        JOIN geofences g ON ST_Contains(g.boundary, l.position)
        WHERE l.vehicle_id = p_vehicle_id
        AND g.id = p_geofence_id
        AND l.timestamp = (
            SELECT MAX(timestamp)
            FROM locations
            WHERE vehicle_id = p_vehicle_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updates

-- Update timestamp on vehicle update
CREATE OR REPLACE FUNCTION update_vehicle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vehicle_timestamp_trigger
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_vehicle_timestamp();

-- Update timestamp on device update
CREATE OR REPLACE FUNCTION update_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_timestamp_trigger
BEFORE UPDATE ON devices
FOR EACH ROW
EXECUTE FUNCTION update_device_timestamp();
