"""
MQTT service with Supabase HTTP API
"""

import json
import logging
import requests
from typing import Callable, Dict, Any, Optional
from datetime import datetime
import paho.mqtt.client as mqtt
from app.core.config import settings

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
            logger.info("✅ Connected to HiveMQ Cloud!")
            client.subscribe(settings.MQTT_TOPIC)
            logger.info(f"✅ Subscribed to {settings.MQTT_TOPIC}")
        else:
            self.is_connected = False
            logger.error(f"❌ Failed to connect to HiveMQ, return code: {rc}")
    
    def _save_to_supabase(self, data: Dict[str, Any]):
        """Save data to Supabase using HTTP API"""
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/weather_data"
            headers = {
                'apikey': settings.SUPABASE_KEY,
                'Authorization': f'Bearer {settings.SUPABASE_KEY}',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code in [200, 201]:
                logger.info(f"✅ Data saved to Supabase via HTTP")
                logger.info(f"   Response: {response.json()}")
            else:
                logger.error(f"❌ Failed to save data: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"❌ Error saving to Supabase: {e}")
    
    def _on_message(self, client, userdata, msg):
        """Callback for MQTT messages"""
        try:
            payload = json.loads(msg.payload.decode())
            logger.info(f"📩 Received message on {msg.topic}")
            
            if msg.topic.startswith("weather/sensors/"):
                device_id = payload.get("device_id", "unknown")
                
                # Prepare data for Supabase
                data = {
                    'device_id': device_id,
                    'temperature': payload.get('temperature'),
                    'pressure': payload.get('pressure'),
                    'altitude': payload.get('altitude'),
                    'rainfall': payload.get('rainfall', 0),
                    'is_raining': payload.get('is_raining', False),
                    'light': payload.get('light'),
                    'rain_percentage': payload.get('rain_percentage', 0),
                    'created_at': datetime.now().isoformat()
                }
                
                self._save_to_supabase(data)
            
            if msg.topic in self.callbacks:
                self.callbacks[msg.topic](payload)
                
        except json.JSONDecodeError:
            logger.error(f"❌ Invalid JSON: {msg.payload}")
        except Exception as e:
            logger.error(f"❌ Error processing message: {e}")
    
    def connect(self):
        """Connect to HiveMQ Cloud"""
        try:
            if not settings.HIVEMQ_HOST or settings.HIVEMQ_HOST == "localhost":
                logger.warning("⚠️ MQTT credentials not set")
                return
            
            logger.info(f"🔗 Connecting to {settings.HIVEMQ_HOST}:{settings.HIVEMQ_PORT}")
            
            self.client = mqtt.Client()
            
            if settings.HIVEMQ_USERNAME and settings.HIVEMQ_PASSWORD:
                self.client.username_pw_set(
                    settings.HIVEMQ_USERNAME,
                    settings.HIVEMQ_PASSWORD
                )
            
            # Use TLS for secure connection
            if settings.HIVEMQ_PORT == 8883:
                logger.info("🔒 Using TLS/SSL for secure connection")
                self.client.tls_set()
            
            self.client.on_connect = self._on_connect
            self.client.on_message = self._on_message
            self.client.connect(
                settings.HIVEMQ_HOST,
                settings.HIVEMQ_PORT,
                60
            )
            
            self.client.loop_start()
            logger.info("🔄 MQTT loop started")
            
        except Exception as e:
            logger.error(f"❌ Error connecting to MQTT: {e}")

    def disconnect(self):
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            self.is_connected = False

mqtt_service = MQTTService()
