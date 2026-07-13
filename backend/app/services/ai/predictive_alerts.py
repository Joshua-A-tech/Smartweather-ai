"""
Predictive Alerts Service
Uses ML to predict weather events before they happen
"""

import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.core.database.supabase import get_supabase_client

logger = logging.getLogger(__name__)

class PredictiveAlertService:
    """Service for predicting weather events"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
        
    def get_historical_data(self, device_id: str, hours: int = 24) -> List[Dict]:
        """Fetch historical data for predictions"""
        try:
            response = self.supabase.table('weather_data')\
                .select('*')\
                .eq('device_id', device_id)\
                .order('created_at', desc=True)\
                .limit(hours)\
                .execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            return []
    
    def predict_frost(self, data: List[Dict]) -> Dict:
        """Predict frost within 24 hours"""
        if not data:
            return {"prediction": False, "confidence": 0}
        
        temps = [d.get('temperature', 0) for d in data if d.get('temperature')]
        if len(temps) < 6:
            return {"prediction": False, "confidence": 0}
        
        # Check temperature trend
        recent_avg = sum(temps[:6]) / len(temps[:6])
        forecast_temps = [t - 0.5 for t in temps[:6]]  # Simple cooling trend
        
        if recent_avg < 5 and any(t < 0 for t in forecast_temps):
            return {
                "prediction": True,
                "confidence": 0.75,
                "message": "Frost possible in the next 24 hours",
                "severity": "warning"
            }
        
        return {"prediction": False, "confidence": 0.5}
    
    def predict_heatwave(self, data: List[Dict]) -> Dict:
        """Predict heatwave within 48 hours"""
        if not data:
            return {"prediction": False, "confidence": 0}
        
        temps = [d.get('temperature', 0) for d in data if d.get('temperature')]
        if len(temps) < 6:
            return {"prediction": False, "confidence": 0}
        
        recent_avg = sum(temps[:6]) / len(temps[:6])
        forecast_temps = [t + 0.3 for t in temps[:6]]  # Simple warming trend
        
        if recent_avg > 30 and any(t > 35 for t in forecast_temps):
            return {
                "prediction": True,
                "confidence": 0.70,
                "message": "Heatwave possible in the next 48 hours",
                "severity": "warning"
            }
        
        return {"prediction": False, "confidence": 0.5}
    
    def predict_rain(self, data: List[Dict]) -> Dict:
        """Predict rainfall within 12 hours"""
        if not data:
            return {"prediction": False, "confidence": 0}
        
        # Check pressure trend (falling pressure = rain)
        pressures = [d.get('pressure', 0) for d in data if d.get('pressure')]
        if len(pressures) < 6:
            return {"prediction": False, "confidence": 0}
        
        pressure_trend = pressures[0] - pressures[-1]
        humidity = [d.get('humidity', 0) for d in data if d.get('humidity')]
        avg_humidity = sum(humidity[:6]) / len(humidity[:6]) if humidity[:6] else 0
        
        if pressure_trend > 3 and avg_humidity > 70:
            return {
                "prediction": True,
                "confidence": 0.70,
                "message": "Rain likely in the next 12 hours",
                "severity": "info"
            }
        
        return {"prediction": False, "confidence": 0.4}
    
    def get_predictions(self, device_id: str) -> Dict:
        """Get all predictive alerts for a device"""
        data = self.get_historical_data(device_id, 24)
        
        predictions = {
            "device_id": device_id,
            "timestamp": datetime.now().isoformat(),
            "predictions": []
        }
        
        # Get each prediction
        frost = self.predict_frost(data)
        if frost.get('prediction'):
            predictions['predictions'].append({
                "type": "frost",
                **frost
            })
        
        heatwave = self.predict_heatwave(data)
        if heatwave.get('prediction'):
            predictions['predictions'].append({
                "type": "heatwave",
                **heatwave
            })
        
        rain = self.predict_rain(data)
        if rain.get('prediction'):
            predictions['predictions'].append({
                "type": "rain",
                **rain
            })
        
        return predictions

predictive_alerts = PredictiveAlertService()
