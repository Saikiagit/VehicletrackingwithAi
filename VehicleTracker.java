package com.vehicletrackpro.hardware;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.Random;
import java.util.UUID;
import org.json.JSONObject;

/**
 * Main class for the vehicle-side hardware component.
 * This simulates the hardware device installed in vehicles that collects
 * and transmits data to the central server.
 */
public class VehicleTracker {
    private static final String SERVER_URL = "https://api.vehicletrackpro.com";
    private static final int DATA_TRANSMISSION_INTERVAL_SECONDS = 5;
    
    private final String vehicleId;
    private final GPSSensor gpsSensor;
    private final FuelSensor fuelSensor;
    private final EngineSensor engineSensor;
    private final AccelerometerSensor accelerometerSensor;
    private final HttpClient httpClient;
    private final ScheduledExecutorService scheduler;
    private boolean isRunning = false;
    
    public VehicleTracker(String vehicleId) {
        this.vehicleId = vehicleId;
        this.gpsSensor = new GPSSensor();
        this.fuelSensor = new FuelSensor();
        this.engineSensor = new EngineSensor();
        this.accelerometerSensor = new AccelerometerSensor();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.scheduler = Executors.newScheduledThreadPool(1);
    }
    
    /**
     * Start the vehicle tracker.
     */
    public void start() {
        if (isRunning) {
            System.out.println("Tracker is already running.");
            return;
        }
        
        isRunning = true;
        System.out.println("Starting vehicle tracker for vehicle ID: " + vehicleId);
        
        // Initialize sensors
        gpsSensor.initialize();
        fuelSensor.initialize();
        engineSensor.initialize();
        accelerometerSensor.initialize();
        
        // Schedule regular data transmission
        scheduler.scheduleAtFixedRate(
            this::collectAndTransmitData,
            0,
            DATA_TRANSMISSION_INTERVAL_SECONDS,
            TimeUnit.SECONDS
        );
    }
    
    /**
     * Stop the vehicle tracker.
     */
    public void stop() {
        if (!isRunning) {
            System.out.println("Tracker is not running.");
            return;
        }
        
        isRunning = false;
        System.out.println("Stopping vehicle tracker for vehicle ID: " + vehicleId);
        
        // Shutdown scheduler
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
    
    /**
     * Collect data from all sensors and transmit to the server.
     */
    private void collectAndTransmitData() {
        try {
            // Collect data from sensors
            GPSData gpsData = gpsSensor.readData();
            double fuelLevel = fuelSensor.readFuelLevel();
            EngineData engineData = engineSensor.readData();
            AccelerometerData accelData = accelerometerSensor.readData();
            
            // Create data payload
            JSONObject payload = new JSONObject();
            payload.put("vehicleId", vehicleId);
            payload.put("timestamp", System.currentTimeMillis());
            
            // GPS data
            JSONObject location = new JSONObject();
            location.put("latitude", gpsData.getLatitude());
            location.put("longitude", gpsData.getLongitude());
            location.put("altitude", gpsData.getAltitude());
            location.put("speed", gpsData.getSpeed());
            location.put("heading", gpsData.getHeading());
            payload.put("location", location);
            
            // Engine data
            JSONObject engine = new JSONObject();
            engine.put("rpm", engineData.getRpm());
            engine.put("temperature", engineData.getTemperature());
            engine.put("oilPressure", engineData.getOilPressure());
            payload.put("engine", engine);
            
            // Fuel data
            payload.put("fuelLevel", fuelLevel);
            
            // Accelerometer data
            JSONObject accelerometer = new JSONObject();
            accelerometer.put("x", accelData.getX());
            accelerometer.put("y", accelData.getY());
            accelerometer.put("z", accelData.getZ());
            payload.put("accelerometer", accelerometer);
            
            // Transmit data to server
            transmitData(payload);
            
        } catch (Exception e) {
            System.err.println("Error collecting or transmitting data: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Transmit data to the central server.
     */
    private void transmitData(JSONObject data) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SERVER_URL + "/api/telemetry"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + getAuthToken())
                .POST(HttpRequest.BodyPublishers.ofString(data.toString()))
                .build();
        
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            System.out.println("Data transmitted successfully.");
        } else {
            System.err.println("Failed to transmit data. Status code: " + response.statusCode());
            System.err.println("Response: " + response.body());
        }
    }
    
    /**
     * Get authentication token for API requests.
     */
    private String getAuthToken() {
        // In a real implementation, this would retrieve or generate a valid auth token
        return "simulated-auth-token-" + vehicleId;
    }
    
    /**
     * Main method for testing the vehicle tracker.
     */
    public static void main(String[] args) {
        // Generate a random vehicle ID for testing
        String testVehicleId = "VH-" + UUID.randomUUID().toString().substring(0, 8);
        
        VehicleTracker tracker = new VehicleTracker(testVehicleId);
        tracker.start();
        
        // Run for 60 seconds then stop
        try {
            Thread.sleep(60000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            tracker.stop();
        }
    }
    
    /**
     * Inner class representing GPS sensor.
     */
    private static class GPSSensor {
        private final Random random = new Random();
        
        public void initialize() {
            System.out.println("Initializing GPS sensor...");
        }
        
        public GPSData readData() {
            // Simulate GPS data for San Francisco area
            double baseLat = 37.7749;
            double baseLng = -122.4194;
            
            // Add some random variation
            double lat = baseLat + (random.nextDouble() - 0.5) * 0.02;
            double lng = baseLng + (random.nextDouble() - 0.5) * 0.02;
            double altitude = 10 + random.nextDouble() * 50;
            double speed = random.nextDouble() * 100;
            double heading = random.nextDouble() * 360;
            
            return new GPSData(lat, lng, altitude, speed, heading);
        }
    }
    
    /**
     * Inner class representing fuel sensor.
     */
    private static class FuelSensor {
        private final Random random = new Random();
        private double fuelLevel = 75.0; // Start at 75% fuel
        
        public void initialize() {
            System.out.println("Initializing fuel sensor...");
        }
        
        public double readFuelLevel() {
            // Simulate gradual fuel consumption
            fuelLevel -= random.nextDouble() * 0.2;
            if (fuelLevel < 0) {
                fuelLevel = 0;
            }
            return fuelLevel;
        }
    }
    
    /**
     * Inner class representing engine sensor.
     */
    private static class EngineSensor {
        private final Random random = new Random();
        
        public void initialize() {
            System.out.println("Initializing engine sensor...");
        }
        
        public EngineData readData() {
            // Simulate engine data
            int rpm = 700 + random.nextInt(2000);
            double temperature = 80 + random.nextDouble() * 20;
            double oilPressure = 40 + random.nextDouble() * 10;
            
            return new EngineData(rpm, temperature, oilPressure);
        }
    }
    
    /**
     * Inner class representing accelerometer sensor.
     */
    private static class AccelerometerSensor {
        private final Random random = new Random();
        
        public void initialize() {
            System.out.println("Initializing accelerometer sensor...");
        }
        
        public AccelerometerData readData() {
            // Simulate accelerometer data
            double x = (random.nextDouble() - 0.5) * 2;
            double y = (random.nextDouble() - 0.5) * 2;
            double z = 9.8 + (random.nextDouble() - 0.5);
            
            return new AccelerometerData(x, y, z);
        }
    }
    
    /**
     * Data class for GPS readings.
     */
    private static class GPSData {
        private final double latitude;
        private final double longitude;
        private final double altitude;
        private final double speed;
        private final double heading;
        
        public GPSData(double latitude, double longitude, double altitude, double speed, double heading) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.altitude = altitude;
            this.speed = speed;
            this.heading = heading;
        }
        
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public double getAltitude() { return altitude; }
        public double getSpeed() { return speed; }
        public double getHeading() { return heading; }
    }
    
    /**
     * Data class for engine readings.
     */
    private static class EngineData {
        private final int rpm;
        private final double temperature;
        private final double oilPressure;
        
        public EngineData(int rpm, double temperature, double oilPressure) {
            this.rpm = rpm;
            this.temperature = temperature;
            this.oilPressure = oilPressure;
        }
        
        public int getRpm() { return rpm; }
        public double getTemperature() { return temperature; }
        public double getOilPressure() { return oilPressure; }
    }
    
    /**
     * Data class for accelerometer readings.
     */
    private static class AccelerometerData {
        private final double x;
        private final double y;
        private final double z;
        
        public AccelerometerData(double x, double y, double z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        
        public double getX() { return x; }
        public double getY() { return y; }
        public double getZ() { return z; }
    }
}
