from fpdf import FPDF
from datetime import datetime
import os

class SmartWeatherPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.set_text_color(0, 102, 204)
        self.cell(0, 10, 'SmartWeather AI', 0, 1, 'C')
        self.set_font('Arial', 'I', 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, 'AI-Enhanced IoT Weather Monitoring System', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(0, 51, 102)
        self.cell(0, 10, title, 0, 1, 'L')
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 7, body)
        self.ln()

    def section(self, title, content):
        self.set_font('Arial', 'B', 12)
        self.set_text_color(0, 51, 102)
        self.cell(0, 8, title, 0, 1, 'L')
        self.set_font('Arial', '', 10)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 6, content)
        self.ln(3)

def create_pdf():
    pdf = SmartWeatherPDF('P', 'mm', 'A4')
    pdf.add_page()

    # Title
    pdf.set_font('Arial', 'B', 24)
    pdf.set_text_color(0, 102, 204)
    pdf.cell(0, 20, 'SmartWeather AI', 0, 1, 'C')
    pdf.set_font('Arial', 'I', 16)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 10, 'Complete System Documentation', 0, 1, 'C')
    pdf.ln(10)
    
    # Date
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 5, f'Generated: {datetime.now().strftime("%B %d, %Y")}', 0, 1, 'C')
    pdf.ln(15)

    # Overview
    pdf.chapter_title('1. Project Overview')
    pdf.chapter_body("""
SmartWeather AI is an end-to-end AI-powered IoT weather monitoring system that combines real-time sensor data with artificial intelligence to provide hyper-local weather forecasting, anomaly detection, and intelligent insights.

Key Features:
• Real-time Weather Monitoring - Temperature, pressure, humidity, rainfall, and light intensity
• AI-Powered Forecasting - LSTM neural network for 24-hour weather predictions
• Intelligent Chat Assistant - Natural language queries using Groq LLM
• Interactive Dashboard - Real-time data visualization with charts
• Anomaly Detection - Real-time alerts for unusual weather patterns
• Cloud-Ready - Deployed on Render and Vercel
    """)

    # System Architecture
    pdf.chapter_title('2. System Architecture')
    pdf.chapter_body("""
The system follows a modern IoT architecture with four layers:

Hardware Layer:
• ESP32 Microcontroller - Main processor with Wi-Fi connectivity
• BMP180 Sensor - Temperature and barometric pressure
• Rain Sensor + LM393 - Rainfall detection
• LDR - Light intensity monitoring

Cloud Layer:
• Backend (FastAPI) - RESTful API and MQTT subscriber
• Database (Supabase/PostgreSQL) - Data persistence
• MQTT Broker (HiveMQ Cloud) - Message queuing

Frontend Layer:
• React Dashboard - Real-time data visualization
• AI Chat Interface - Natural language queries
• Anomaly Alerts - Notification system
    """)

    # Technology Stack
    pdf.chapter_title('3. Technology Stack')
    pdf.section('Hardware', """
• ESP32 - Microcontroller with Wi-Fi
• BMP180 - Temperature/Pressure Sensor
• LM393 + Rain Board - Rain Sensor
• LDR - Light Sensor
• USB 5V - Power Supply
    """)

    pdf.section('Backend', """
• FastAPI 0.139.0 - Web Framework
• Python 3.11+ - Programming Language
• SQLAlchemy 2.0.51 - ORM
• Pydantic 2.13.4 - Data Validation
• Uvicorn 0.51.0 - ASGI Server
• Paho-MQTT 2.1.0 - MQTT Client
• Groq 1.5.0 - LLM API Client
    """)

    pdf.section('Frontend', """
• React 18 - UI Framework
• Bootstrap 5 - CSS Framework
• Chart.js 4 - Data Visualization
• Axios 1 - HTTP Client
• React Router 6 - Navigation
    """)

    pdf.section('Cloud Services', """
• Render - Backend Hosting (Free Tier)
• Vercel - Frontend Hosting (Free Tier)
• Supabase - PostgreSQL Database
• HiveMQ Cloud - MQTT Broker
• Groq - LLM API
    """)

    # Hardware Connections
    pdf.chapter_title('4. Hardware Connections')
    pdf.chapter_body("""
ESP32 Pin Configuration:

BMP180 (I2C):
• VCC -> 3.3V
• GND -> GND
• SDA -> GPIO21
• SCL -> GPIO22

Rain Sensor (Analog):
• VCC -> 5V
• GND -> GND
• AO -> GPIO34 (Analog)
• DO -> GPIO4 (Digital)

LDR Light Sensor:
• VCC -> 3.3V
• GND -> GND
• AO -> GPIO35 (Analog)
• DO -> GPIO15 (Digital)
    """)

    # Installation
    pdf.chapter_title('5. Installation & Setup')
    pdf.section('Prerequisites', """
• Python 3.11+
• Node.js 18+
• Arduino IDE
• Git
• Supabase Account (Free)
• HiveMQ Cloud Account (Free)
• Groq API Key (Free)
    """)

    pdf.section('Backend Setup', """
1. Clone Repository:
   git clone https://github.com/Joshua-A-tech/Smartweather-ai.git
   cd Smartweather-ai

2. Create Virtual Environment:
   python -m venv venv
   source venv/bin/activate  # Windows: venv\\Scripts\\activate

3. Install Dependencies:
   pip install -r backend/requirements.txt

4. Configure Environment:
   cp backend/.env.example backend/.env
   # Edit .env with your credentials

5. Run Backend:
   cd backend
   python -m uvicorn app.main:app --reload
    """)

    pdf.section('Frontend Setup', """
1. Install Dependencies:
   cd frontend
   npm install

2. Start Development Server:
   npm start

3. Build for Production:
   npm run build
    """)

    # API Documentation
    pdf.chapter_title('6. API Documentation')
    pdf.section('Base URL', """
https://smartweather-ai-backend.onrender.com/api/v1
    """)

    pdf.section('Weather Endpoints', """
GET /weather/current?device_id=ESP32-001
- Get current weather data

GET /weather/history?device_id=ESP32-001&limit=100
- Get historical weather data
    """)

    pdf.section('AI Endpoints', """
POST /ai/query
- Ask the AI assistant a question
- Body: {"question":"What is the temperature?","device_id":"ESP32-001"}

GET /ai/forecast?device_id=ESP32-001&hours=24
- Get weather forecast

GET /ai/test
- Test AI router
    """)

    # Deployment
    pdf.chapter_title('7. Deployment')
    pdf.section('Backend (Render)', """
1. Go to render.com
2. Click "New" -> "Web Service"
3. Connect GitHub repository
4. Settings:
   - Name: smartweather-ai-backend
   - Environment: Docker
   - Plan: Free
5. Add Environment Variables:
   - SUPABASE_URL
   - SUPABASE_KEY
   - GROQ_API_KEY
   - HIVEMQ_HOST
   - HIVEMQ_USERNAME
   - HIVEMQ_PASSWORD
6. Click "Create Web Service"
    """)

    pdf.section('Frontend (Vercel)', """
1. Go to vercel.com
2. Click "Add New" -> "Project"
3. Select GitHub repository
4. Settings:
   - Framework Preset: Create React App
   - Root Directory: frontend
5. Add Environment Variable:
   - REACT_APP_API_URL = https://smartweather-ai-backend.onrender.com
6. Click "Deploy"
    """)

    # Live URLs
    pdf.chapter_title('8. Live URLs')
    pdf.section('Production URLs', """
Backend API: https://smartweather-ai-backend.onrender.com
API Docs: https://smartweather-ai-backend.onrender.com/docs
Frontend: https://smartweather-ai.vercel.app
Database: https://lfwddvwtbznxyttuzplz.supabase.co
    """)

    # Troubleshooting
    pdf.chapter_title('9. Troubleshooting')
    pdf.section('Common Issues', """
MQTT Connection Failed:
- Check HiveMQ credentials in .env file
- Ensure cluster is active

Supabase Connection Failed:
- Update SUPABASE_KEY with correct anon key
- Verify project URL is correct

ESP32 Not Connecting to Wi-Fi:
- Verify SSID and password
- Ensure ESP32 is in range

Frontend Not Loading Data:
- Check if backend is running
- Verify REACT_APP_API_URL is correct

AI Chat Not Responding:
- Check GROQ_API_KEY in .env
- Ensure you have credits in Groq
    """)

    # System Status
    pdf.chapter_title('10. System Status')
    pdf.section('Current Status', """
✅ Backend: Operational (Render)
✅ Frontend: Operational (Vercel) 
✅ Database: Operational (Supabase)
✅ MQTT: Operational (HiveMQ)
✅ AI Service: Operational (Groq)
✅ Hardware: Operational (ESP32)
    """)

    # License
    pdf.chapter_title('11. License')
    pdf.chapter_body("""
MIT License

Copyright (c) 2026 Joshua-A-tech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
    """)

    # Contact
    pdf.chapter_title('12. Contact')
    pdf.section('Support', """
GitHub: https://github.com/Joshua-A-tech/Smartweather-ai
Email: muorongolejoshua@gmail.com
Issues: https://github.com/Joshua-A-tech/Smartweather-ai/issues
    """)

    # Save PDF
    pdf.output('SmartWeather_AI_Documentation.pdf')
    print("✅ PDF generated: SmartWeather_AI_Documentation.pdf")

if __name__ == "__main__":
    create_pdf()
