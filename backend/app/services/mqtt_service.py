"""
MQTT service for subscribing to weather data
"""

import json
import logging
import time
from typing import Callable, Dict, Any, Optional
from datetime import datetime
import paho.mqtt.client as mqtt
from app.core.config import settings
from app.core.database.supabase import get_supabase_client

logger = logging.getLogger(__name__)

class MQTTService:
    """Service for handling MQTT connections and messages"""
    
    def __init__(self):
        self.client: Optional[mqtt.Client] = None
        self.callbacks: Dict[str, Callable] = {}
        self.is_connected = False
        
    def _on_connect(self, client, userdata, flags, rc):
        """Callback for MQTT connection"""
        logger.info(f"📡 MQTT Connect callback - rc: {rc}")
        if rc == 0:
            self.is_connected = True
            logger.info("✅ Connected to HiveMQ Cloud!")
            client.subscribe(settings.MQTT_TOPIC)
            logger.info(f"✅ Subscribed to {settings.MQTT_TOPIC}")
        else:
            self.is_connected = False
            logger.error(f"❌ Failed to connect to HiveMQ, return code: {rc}")
            if rc == 1:
                logger.error("   - Connection refused - incorrect protocol version")
            elif rc == 2:
                logger.error("   - Connection refused - invalid client identifier")
            elif rc == 3:
                logger.error("   - Connection refused - server unavailable")
            elif rc == 4:
                logger.error("   - Connection refused - bad username or password")
            elif rc == 5:
                logger.error("   - Connection refused - not authorised")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback for MQTT disconnection"""
        self.is_connected = False
        if rc != 0:
            logger.warning(f"⚠️ MQTT disconnected unexpectedly, rc={rc}")
    
    def _on_message(self, client, userdata, msg):
        """Callback for MQTT messages"""
        try:
            payload = json.loads(msg.payload.decode())
            logger.info(f"📩 Received message on {msg.topic}")
            
            if msg.topic.startswith("weather/sensors/"):
                self._process_weather_data(payload)
            
            if msg.topic in self.callbacks:
                self.callbacks[msg.topic](payload)
                
        except json.JSONDecodeError:
            logger.error(f"❌ Invalid JSON payload: {msg.payload}")
        except Exception as e:
            logger.error(f"❌ Error processing message: {e}")
    
    def _process_weather_data(self, payload: Dict[str, Any]):
        """Process incoming weather data and save to Supabase"""
        try:
            device_id = payload.get("device_id", "unknown")
            temperature = payload.get("temperature")
            pressure = payload.get("pressure")
            altitude = payload.get("altitude")
            rainfall = payload.get("rainfall", 0)
            is_raining = payload.get("is_raining", False)
            light = payload.get("light")
            rain_percentage = payload.get("rain_percentage", 0)
            
            logger.info(f"📊 Weather from {device_id}: {temperature}°C, {pressure} hPa")
            
            # Save to Supabase
            supabase = get_supabase_client()
            if supabase:
                data = {
                    'device_id': device_id,
                    'temperature': temperature,
                    'pressure': pressure,
                    'altitude': altitude,
                    'rainfall': rainfall,
                    'is_raining': is_raining,
                    'light': light,
                    'rain_percentage': rain_percentage,
                    'created_at': datetime.now().isoformat()
                }
                result = supabase.table('weather_data').insert(data).execute()
                logger.info(f"✅ Data saved to Supabase for {device_id}")
            else:
                logger.warning("⚠️ Supabase not available - data not saved")
            
        except Exception as e:
            logger.error(f"❌ Error processing weather data: {e}")
    
    def connect(self):
        """Connect to HiveMQ Cloud"""
        try:
            # Check if credentials are set
            if not settings.HIVEMQ_HOST or settings.HIVEMQ_HOST == "localhost":
                logger.warning("⚠️ MQTT credentials not set. Skipping MQTT connection.")
                return
            
            logger.info(f"🔗 Connecting to HiveMQ at {settings.HIVEMQ_HOST}:{settings.HIVEMQ_PORT}")
            logger.info(f"   Username: {settings.HIVEMQ_USERNAME}")
            
            # Create MQTT client with callback API version 2
            self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
            
            # Set credentials if provided
            if settings.HIVEMQ_USERNAME and settings.HIVEMQ_PASSWORD:
                self.client.username_pw_set(
                    settings.HIVEMQ_USERNAME,
                    settings.HIVEMQ_PASSWORD
                )
            
            # Set callbacks
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            self.client.on_message = self._on_message
            
            # Use TLS for secure connection
            if settings.HIVEMQ_PORT == 8883:
                logger.info("🔒 Using TLS/SSL for secure connection")
                self.client.tls_set()
            
            # Connect with keepalive
            logger.info("📡 Attempting to connect...")
            self.client.connect(
                settings.HIVEMQ_HOST,
                settings.HIVEMQ_PORT,
                60  # Keepalive
            )
            
            # Start loop in background
            self.client.loop_start()
            logger.info("🔄 MQTT loop started")
            
        except Exception as e:
            logger.error(f"❌ Error connecting to MQTT: {e}")
            logger.error("   Please check:")
            logger.error(f"   - HIVEMQ_HOST: {settings.HIVEMQ_HOST}")
            logger.error(f"   - HIVEMQ_PORT: {settings.HIVEMQ_PORT}")
            logger.error(f"   - HIVEMQ_USERNAME: {settings.HIVEMQ_USERNAME}")
            logger.error("   - HIVEMQ_PASSWORD: [hidden]")
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            self.is_connected = False
            logger.info("🔌 Disconnected from MQTT broker")
    
    def publish(self, topic: str, payload: Dict[str, Any]):
        """Publish a message to MQTT"""
        if self.client and self.is_connected:
            try:
                self.client.publish(topic, json.dumps(payload))
                logger.info(f"📤 Published to {topic}")
            except Exception as e:
                logger.error(f"❌ Failed to publish: {e}")
        else:
            logger.warning("⚠️ Not connected to MQTT broker")
    
    def register_callback(self, topic: str, callback: Callable):
        """Register a callback for a specific topic"""
        self.callbacks[topic] = callback
        if self.client and self.is_connected:
            self.client.subscribe(topic)
            logger.info(f"📋 Registered callback for {topic}")

# Singleton instance
mqtt_service = MQTTService()
