"""
Email Alert Service for SmartWeather
Uses Resend for email delivery
"""

import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
import resend
from app.core.database.supabase import get_supabase_client

logger = logging.getLogger(__name__)

class EmailAlertService:
    """Service for sending weather alerts via email using Resend"""
    
    def __init__(self):
        self.api_key = os.getenv('RESEND_API_KEY')
        self.from_email = os.getenv('EMAIL_FROM', 'onboarding@resend.dev')
        self.supabase = get_supabase_client()
        
        if self.api_key:
            resend.api_key = self.api_key
            logger.info("✅ Resend email service initialized")
        else:
            logger.warning("⚠️ RESEND_API_KEY not set. Email alerts disabled.")
    
    def get_user_email(self, user_id: str) -> Optional[str]:
        """Get user email from Supabase"""
        try:
            response = self.supabase.auth.admin.get_user_by_id(user_id)
            return response.user.email if response.user else None
        except Exception as e:
            logger.error(f"Error fetching user email: {e}")
            return None
    
    def get_alert_preferences(self, user_id: str, device_id: str) -> Dict:
        """Get user alert preferences from Supabase"""
        try:
            response = self.supabase.table('alert_preferences')\
                .select('*')\
                .eq('user_id', user_id)\
                .eq('device_id', device_id)\
                .execute()
            
            if response.data:
                return response.data[0]
            return {}
        except Exception as e:
            logger.error(f"Error fetching preferences: {e}")
            return {}
    
    def check_alerts(self, weather_data: Dict, preferences: Dict) -> List[Dict]:
        """Check if weather data triggers any alerts"""
        alerts = []
        
        if not weather_data or not preferences:
            return alerts
        
        # Ensure numeric values
        temp = float(weather_data.get('temperature', 0))
        humidity = float(weather_data.get('humidity', 0))
        is_raining = weather_data.get('is_raining', False)
        rainfall = float(weather_data.get('rainfall', 0))
        
        # Get thresholds with defaults
        temp_high = preferences.get('temp_high')
        temp_low = preferences.get('temp_low')
        humidity_high = preferences.get('humidity_high')
        rain_alert = preferences.get('rain_alert', False)
        
        # Convert to float if not None
        if temp_high is not None:
            temp_high = float(temp_high)
        if temp_low is not None:
            temp_low = float(temp_low)
        if humidity_high is not None:
            humidity_high = float(humidity_high)
        
        # Debug logging
        logger.info(f"📊 Checking alerts: temp={temp}, temp_high={temp_high}, temp_low={temp_low}")
        
        # High Temperature Alert
        if temp_high is not None and temp > temp_high:
            logger.info(f"🔥 HIGH TEMP ALERT: {temp}°C > {temp_high}°C")
            alerts.append({
                'type': 'heatwave',
                'severity': 'warning',
                'title': '🔥 High Temperature Alert',
                'message': f'Temperature has reached {temp:.1f}°C, exceeding your threshold of {temp_high:.1f}°C',
                'data': {'temperature': temp, 'threshold': temp_high}
            })
        
        # Low Temperature Alert
        if temp_low is not None and temp < temp_low:
            logger.info(f"❄️ LOW TEMP ALERT: {temp}°C < {temp_low}°C")
            alerts.append({
                'type': 'frost',
                'severity': 'warning',
                'title': '❄️ Low Temperature Alert',
                'message': f'Temperature has dropped to {temp:.1f}°C, below your threshold of {temp_low:.1f}°C',
                'data': {'temperature': temp, 'threshold': temp_low}
            })
        
        # Rain Alert
        if rain_alert and is_raining:
            logger.info(f"☔ RAIN ALERT: Rain detected with {rainfall}mm")
            alerts.append({
                'type': 'rain',
                'severity': 'info',
                'title': '☔ Rain Detected',
                'message': f'Rain has been detected with {rainfall:.1f}mm of rainfall',
                'data': {'rainfall': rainfall}
            })
        
        # High Humidity Alert
        if humidity_high is not None and humidity > humidity_high:
            logger.info(f"💧 HIGH HUMIDITY ALERT: {humidity}% > {humidity_high}%")
            alerts.append({
                'type': 'humidity',
                'severity': 'info',
                'title': '💧 High Humidity Alert',
                'message': f'Humidity has reached {humidity:.1f}%, exceeding your threshold of {humidity_high:.1f}%',
                'data': {'humidity': humidity, 'threshold': humidity_high}
            })
        
        return alerts
    
    def send_alert_email(self, recipient_email: str, alert: Dict, device_info: Dict) -> bool:
        """Send alert email using Resend"""
        try:
            if not self.api_key:
                logger.warning("Resend API key not configured")
                return False
            
            device_name = device_info.get('name', 'Unknown Device')
            device_location = device_info.get('location', 'Unknown Location')
            
            subject = f"🌤️ SmartWeather Alert: {alert['title']}"
            
            html_content = self._build_email_html(alert, device_name, device_location)
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": [recipient_email],
                "subject": subject,
                "html": html_content
            })
            
            if response and response.get('id'):
                logger.info(f"✅ Alert email sent to {recipient_email} (ID: {response['id']})")
                return True
            else:
                logger.error(f"❌ Failed to send email: {response}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error sending email: {e}")
            return False
    
    def _build_email_html(self, alert: Dict, device_name: str, device_location: str) -> str:
        """Build HTML email content"""
        alert_color = '#ff6b6b' if alert['severity'] == 'warning' else '#ffd93d'
        
        return f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #0066CC; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                    .content {{ padding: 20px; background: #f9f9f9; border: 1px solid #ddd; }}
                    .alert-box {{ 
                        background: {alert_color};
                        padding: 15px;
                        border-radius: 8px;
                        margin: 15px 0;
                    }}
                    .info {{ color: #666; font-size: 14px; }}
                    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #999; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌤️ SmartWeather Alert</h1>
                    </div>
                    <div class="content">
                        <h2>{alert['title']}</h2>
                        <div class="alert-box">
                            <p><strong>{alert['message']}</strong></p>
                        </div>
                        <div class="info">
                            <p><strong>Device:</strong> {device_name}</p>
                            <p><strong>Location:</strong> {device_location}</p>
                            <p><strong>Time:</strong> {datetime.now().strftime('%B %d, %Y %I:%M %p')}</p>
                        </div>
                        <hr>
                        <p><strong>Recommended Actions:</strong></p>
                        <ul>
                            {self._get_action_items(alert['type'])}
                        </ul>
                        <p style="color: #666; font-size: 14px;">
                            To change your alert preferences, visit your SmartWeather dashboard.
                        </p>
                    </div>
                    <div class="footer">
                        <p>SmartWeather - AI-Enhanced IoT Weather Monitoring System</p>
                        <p>© 2026 SmartWeather</p>
                    </div>
                </div>
            </body>
        </html>
        """
    
    def _get_action_items(self, alert_type: str) -> str:
        actions = {
            'heatwave': '<li>Stay hydrated and avoid direct sunlight</li><li>Check on vulnerable family members</li><li>Protect plants and pets from heat</li>',
            'frost': '<li>Bring plants indoors if possible</li><li>Protect outdoor pipes from freezing</li><li>Cover sensitive plants</li>',
            'rain': '<li>Carry an umbrella if going out</li><li>Check for water leaks</li><li>Protect outdoor equipment</li>',
            'humidity': '<li>Use dehumidifier if needed</li><li>Check for mold growth</li><li>Ventilate rooms</li>'
        }
        return actions.get(alert_type, '<li>Monitor the situation</li><li>Stay safe</li>')
    
    def process_alerts(self, device_id: str, weather_data: Dict, user_id: str) -> int:
        """Process alerts for a device and send emails if triggered"""
        try:
            # Get user preferences
            preferences = self.get_alert_preferences(user_id, device_id)
            if not preferences:
                logger.info(f"No alert preferences found for user {user_id}, device {device_id}")
                return 0
            
            # Check for alerts
            alerts = self.check_alerts(weather_data, preferences)
            if not alerts:
                logger.info("✅ No alerts triggered. Everything is normal!")
                return 0
            
            # Get user email
            email = self.get_user_email(user_id)
            if not email:
                logger.warning(f"No email found for user {user_id}")
                return 0
            
            # Get device info
            device_info = {
                'name': preferences.get('device_name', device_id),
                'location': preferences.get('device_location', 'Unknown')
            }
            
            # Send each alert
            sent_count = 0
            for alert in alerts:
                if self.send_alert_email(email, alert, device_info):
                    sent_count += 1
                    self._log_alert(device_id, alert, email)
            
            logger.info(f"✅ {sent_count} alert(s) sent")
            return sent_count
            
        except Exception as e:
            logger.error(f"❌ Error processing alerts: {e}")
            return 0
    
    def _log_alert(self, device_id: str, alert: Dict, email: str):
        """Log alert in database"""
        try:
            self.supabase.table('alert_logs').insert({
                'device_id': device_id,
                'alert_type': alert['type'],
                'severity': alert['severity'],
                'message': alert['message'],
                'sent_to': email,
                'created_at': datetime.now().isoformat()
            }).execute()
        except Exception as e:
            logger.error(f"Error logging alert: {e}")

# Singleton instance
email_alerts = EmailAlertService()
