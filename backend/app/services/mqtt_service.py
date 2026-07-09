"""
MQTT service with detailed logging and async support
"""

import json
import logging
import time
from typing import Callable, Dict, Any, Optional
from datetime import datetime
import paho.mqtt.client as mqtt
from app.core.config import settings
import requests

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
            if rc == 4:
                logger.error("   - Check HIVEMQ_USERNAME and HIVEMQ_PASSWORD")
            elif rc == 5:
                logger.error("   - Not authorised - check permissions")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback for MQTT disconnection"""
        self.is_connected = False
        if rc != 0:
            logger.warning(f"⚠️ MQTT disconnected unexpectedly, rc={rc}")
    
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
                logger.info(f"✅ Data saved to Supabase")
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
            # Log environment variables
            logger.info("📋 MQTT Environment Variables:")
            logger.info(f"   HIVEMQ_HOST: {settings.HIVEMQ_HOST}")
            logger.info(f"   HIVEMQ_PORT: {settings.HIVEMQ_PORT}")
            logger.info(f"   HIVEMQ_USERNAME: {settings.HIVEMQ_USERNAME}")
            logger.info(f"   MQTT_TOPIC: {settings.MQTT_TOPIC}")
            logger.info(f"   HIVEMQ_PASSWORD: {'SET' if settings.HIVEMQ_PASSWORD else 'NOT SET'}")
            
            if not settings.HIVEMQ_HOST or settings.HIVEMQ_HOST == "localhost":
                logger.warning("⚠️ MQTT credentials not set")
                return
            
            logger.info(f"🔗 Connecting to {settings.HIVEMQ_HOST}:{settings.HIVEMQ_PORT}")
            
            # Create MQTT client
            self.client = mqtt.Client()
            
            if settings.HIVEMQ_USERNAME and settings.HIVEMQ_PASSWORD:
                logger.info("🔑 Setting MQTT credentials...")
                self.client.username_pw_set(
                    settings.HIVEMQ_USERNAME,
                    settings.HIVEMQ_PASSWORD
                )
            
            # Try TLS connection on port 8883
            if settings.HIVEMQ_PORT == 8883:
                try:
                    logger.info("🔒 Attempting TLS connection on port 8883...")
                    self.client.tls_set()
                    self.client.connect(
                        settings.HIVEMQ_HOST,
                        8883,
                        60
                    )
                    logger.info("✅ TLS connection successful!")
                except Exception as e:
                    logger.warning(f"⚠️ TLS connection failed: {e}")
                    logger.info("🔓 Attempting non-TLS connection on port 1883...")
                    try:
                        self.client.connect(
                            settings.HIVEMQ_HOST,
                            1883,
                            60
                        )
                        logger.info("✅ Non-TLS connection successful!")
                    except Exception as e2:
                        logger.error(f"❌ Both connection attempts failed: {e2}")
                        raise
            else:
                # Direct connection without TLS
                self.client.connect(
                    settings.HIVEMQ_HOST,
                    settings.HIVEMQ_PORT,
                    60
                )
                logger.info("✅ Direct connection successful!")
            
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            self.client.on_message = self._on_message
            
            self.client.loop_start()
            logger.info("🔄 MQTT loop started")
            
        except Exception as e:
            logger.error(f"❌ Error connecting to MQTT: {e}")
            import traceback
            logger.error(traceback.format_exc())

    def disconnect(self):
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            self.is_connected = False

mqtt_service = MQTTService()
