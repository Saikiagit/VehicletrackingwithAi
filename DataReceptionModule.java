package com.vehicletrackpro.server;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

/**
 * Data Reception Module for the Vehicle Tracking System.
 * Responsible for receiving telemetry data from vehicle devices,
 * validating it, and forwarding it to the Data Processing Module.
 */
@Service
public class DataReceptionModule {
    
    private final DataProcessingModule dataProcessingModule;
    private final ConcurrentMap<String, Long> lastHeartbeats = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, WebSocketSession> connectedSessions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    @Autowired
    public DataReceptionModule(DataProcessingModule dataProcessingModule) {
        this.dataProcessingModule = dataProcessingModule;
        
        // Start heartbeat monitor
        scheduler.scheduleAtFixedRate(
            this::checkHeartbeats,
            0,
            30,
            TimeUnit.SECONDS
        );
    }
    
    /**
     * Process incoming telemetry data from vehicles.
     * 
     * @param payload The JSON payload containing telemetry data
     * @return True if processing was successful, false otherwise
     */
    public boolean processTelemetryData(String payload) {
        try {
            // Parse JSON payload
            JSONObject data = new JSONObject(payload);
            
            // Validate required fields
            if (!validateTelemetryData(data)) {
                System.err.println("Invalid telemetry data received: " + payload);
                return false;
            }
            
            // Update heartbeat timestamp for the vehicle
            String vehicleId = data.getString("vehicleId");
            updateHeartbeat(vehicleId);
            
            // Forward data to processing module
            dataProcessingModule.processTelemetryData(data);
            
            // Broadcast update to connected clients
            broadcastUpdate(vehicleId, data);
            
            return true;
        } catch (Exception e) {
            System.err.println("Error processing telemetry data: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Register a new WebSocket session for real-time updates.
     * 
     * @param sessionId The session ID
     * @param session The WebSocket session
     */
    public void registerSession(String sessionId, WebSocketSession session) {
        connectedSessions.put(sessionId, session);
        System.out.println("Registered new WebSocket session: " + sessionId);
    }
    
    /**
     * Unregister a WebSocket session.
     * 
     * @param sessionId The session ID to unregister
     */
    public void unregisterSession(String sessionId) {
        connectedSessions.remove(sessionId);
        System.out.println("Unregistered WebSocket session: " + sessionId);
    }
    
    /**
     * Validate the telemetry data to ensure it contains all required fields.
     * 
     * @param data The JSON data to validate
     * @return True if valid, false otherwise
     */
    private boolean validateTelemetryData(JSONObject data) {
        // Check for required fields
        if (!data.has("vehicleId") || !data.has("timestamp") || !data.has("location")) {
            return false;
        }
        
        // Validate location data
        JSONObject location = data.getJSONObject("location");
        return location.has("latitude") && location.has("longitude");
    }
    
    /**
     * Update the heartbeat timestamp for a vehicle.
     * 
     * @param vehicleId The ID of the vehicle
     */
    private void updateHeartbeat(String vehicleId) {
        lastHeartbeats.put(vehicleId, System.currentTimeMillis());
    }
    
    /**
     * Check for vehicles that haven't sent heartbeats recently.
     */
    private void checkHeartbeats() {
        long currentTime = System.currentTimeMillis();
        long timeout = 120000; // 2 minutes
        
        lastHeartbeats.forEach((vehicleId, lastHeartbeat) -> {
            if (currentTime - lastHeartbeat > timeout) {
                // Vehicle hasn't sent data in a while, mark as potentially offline
                System.out.println("Vehicle " + vehicleId + " may be offline. Last heartbeat: " + 
                                  (currentTime - lastHeartbeat) / 1000 + " seconds ago");
                
                // Notify data processing module
                JSONObject offlineEvent = new JSONObject();
                offlineEvent.put("vehicleId", vehicleId);
                offlineEvent.put("timestamp", currentTime);
                offlineEvent.put("event", "connection_lost");
                
                dataProcessingModule.processEvent(offlineEvent);
            }
        });
    }
    
    /**
     * Broadcast vehicle updates to connected WebSocket clients.
     * 
     * @param vehicleId The ID of the updated vehicle
     * @param data The update data
     */
    private void broadcastUpdate(String vehicleId, JSONObject data) {
        // Create simplified update for clients
        JSONObject update = new JSONObject();
        update.put("type", "vehicle_update");
        update.put("vehicleId", vehicleId);
        update.put("timestamp", data.getLong("timestamp"));
        
        if (data.has("location")) {
            update.put("location", data.getJSONObject("location"));
        }
        
        if (data.has("fuelLevel")) {
            update.put("fuelLevel", data.getDouble("fuelLevel"));
        }
        
        if (data.has("engine")) {
            JSONObject engine = data.getJSONObject("engine");
            if (engine.has("rpm")) {
                update.put("speed", engine.getInt("rpm") / 100); // Simplified speed calculation
            }
        }
        
        // Send update to all connected clients
        TextMessage message = new TextMessage(update.toString());
        connectedSessions.forEach((sessionId, session) -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(message);
                }
            } catch (IOException e) {
                System.err.println("Error sending WebSocket message: " + e.getMessage());
            }
        });
    }
    
    /**
     * Shutdown the module and release resources.
     */
    public void shutdown() {
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
}
