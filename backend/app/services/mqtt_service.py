"""
MQTT service for subscribing to weather data with TLS support
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
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 10
        
    def _on_connect(self, client, userdata, flags, rc):
        """Callback for MQTT connection"""
        if rc == 0:
            self.is_connected = True
            self.reconnect_attempts = 0
            logger.info("✅ Connected to HiveMQ Cloud!")
            # Subscribe to topics
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
            logger.warning(f"⚠️ Unexpected MQTT disconnection, rc={rc}")
            logger.info("🔄 Attempting to reconnect...")
    
    def _on_message(self, client, userdata, msg):
        """Callback for MQTT messages"""
        try:
            payload = json.loads(msg.payload.decode())
            logger.info(f"📩 Received message on {msg.topic}")
            
            # Process message based on topic
            if msg.topic.startswith("weather/sensors/"):
                self._process_weather_data(payload)
            elif msg.topic.startswith("weather/device/"):
                self._process_device_data(payload)
            
            # Trigger any registered callbacks
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
            
            logger.info(f"📊 Weather Data from {device_id}:")
            logger.info(f"   🌡️ Temperature: {temperature}°C")
            logger.info(f"   💨 Pressure: {pressure} hPa")
            logger.info(f"   ☔ Rain: {is_raining}")
            logger.info(f"   💡 Light: {light}")
            
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
    
    def _process_device_data(self, payload: Dict[str, Any]):
        """Process incoming device data"""
        logger.info(f"📱 Device data received: {payload}")
    
    def connect(self):
        """Connect to HiveMQ Cloud with TLS"""
        try:
            # Check if credentials are set
            if not settings.HIVEMQ_HOST or settings.HIVEMQ_HOST == "localhost":
                logger.warning("⚠️ MQTT credentials not set. Skipping MQTT connection.")
                return
            
            logger.info(f"🔗 Connecting to HiveMQ at {settings.HIVEMQ_HOST}:{settings.HIVEMQ_PORT}")
            logger.info(f"   Username: {settings.HIVEMQ_USERNAME}")
            
            # Create MQTT client
            self.client = mqtt.Client()
            
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
            
            # IMPORTANT: Use TLS for secure connection (port 8883)
            if settings.HIVEMQ_PORT == 8883:
                logger.info("🔒 Using TLS/SSL for secure connection")
                self.client.tls_set()
            else:
                logger.warning("⚠️ Non-TLS connection (port 1883)")
            
            # Connect
            logger.info("📡 Attempting to connect...")
            self.client.connect(
                settings.HIVEMQ_HOST,
                settings.HIVEMQ_PORT,
                60
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
