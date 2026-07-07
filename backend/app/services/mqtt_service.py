"""
MQTT service for subscribing to weather data
"""

import json
import asyncio
from typing import Callable, Dict, Any, Optional
from datetime import datetime
import paho.mqtt.client as mqtt
from app.core.config import settings
from app.models.weather import WeatherDataCreate
import logging

logger = logging.getLogger(__name__)

class MQTTService:
    """Service for handling MQTT connections and messages"""
    
    def __init__(self):
        self.client: Optional[mqtt.Client] = None
        self.callbacks: Dict[str, Callable] = {}
        self.is_connected = False
        
    def _on_connect(self, client, userdata, flags, rc):
        """Callback for MQTT connection"""
        if rc == 0:
            self.is_connected = True
            logger.info(f"Connected to HiveMQ Cloud")
            # Subscribe to topics
            client.subscribe(settings.MQTT_TOPIC)
            logger.info(f"Subscribed to {settings.MQTT_TOPIC}")
        else:
            logger.error(f"Failed to connect to HiveMQ, return code: {rc}")
    
    def _on_message(self, client, userdata, msg):
        """Callback for MQTT messages"""
        try:
            payload = json.loads(msg.payload.decode())
            logger.info(f"Received message on {msg.topic}: {payload}")
            
            # Process message based on topic
            if msg.topic.startswith("weather/sensors/"):
                self._process_weather_data(payload)
            elif msg.topic.startswith("weather/device/"):
                self._process_device_data(payload)
            
            # Trigger any registered callbacks
            if msg.topic in self.callbacks:
                self.callbacks[msg.topic](payload)
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON payload: {msg.payload}")
        except Exception as e:
            logger.error(f"Error processing message: {e}")
    
    def _process_weather_data(self, payload: Dict[str, Any]):
        """Process incoming weather data"""
        try:
            # Validate and create weather data
            weather_data = WeatherDataCreate(
                device_id=payload.get("device_id"),
                temperature=payload.get("temperature"),
                humidity=payload.get("humidity"),
                pressure=payload.get("pressure"),
                wind_speed=payload.get("wind_speed"),
                wind_direction=payload.get("wind_direction"),
                rainfall=payload.get("rainfall"),
                light_intensity=payload.get("light_intensity"),
                battery_voltage=payload.get("battery_voltage"),
                signal_strength=payload.get("signal_strength")
            )
            
            # Store in database
            # TODO: Save to Supabase/PostgreSQL
            logger.info(f"Processed weather data for device {weather_data.device_id}")
            
        except Exception as e:
            logger.error(f"Error processing weather data: {e}")
    
    def _process_device_data(self, payload: Dict[str, Any]):
        """Process incoming device data"""
        # TODO: Update device status in database
        logger.info(f"Device data received: {payload}")
    
    def connect(self):
        """Connect to HiveMQ Cloud"""
        try:
            self.client = mqtt.Client()
            
            # Set credentials if provided
            if settings.HIVEMQ_USERNAME and settings.HIVEMQ_PASSWORD:
                self.client.username_pw_set(
                    settings.HIVEMQ_USERNAME,
                    settings.HIVEMQ_PASSWORD
                )
            
            # Set callbacks
            self.client.on_connect = self._on_connect
            self.client.on_message = self._on_message
            
            # Connect
            self.client.connect(
                settings.HIVEMQ_HOST,
                settings.HIVEMQ_PORT,
                60
            )
            
            # Start loop in background
            self.client.loop_start()
            
        except Exception as e:
            logger.error(f"Error connecting to MQTT: {e}")
            raise
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            self.is_connected = False
            logger.info("Disconnected from MQTT broker")
    
    def register_callback(self, topic: str, callback: Callable):
        """Register a callback for a specific topic"""
        self.callbacks[topic] = callback
        if self.client and self.is_connected:
            self.client.subscribe(topic)
            logger.info(f"Registered callback for {topic}")

# Singleton instance
mqtt_service = MQTTService()
