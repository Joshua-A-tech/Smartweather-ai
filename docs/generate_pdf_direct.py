#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
SmartWeather AI - Direct PDF Generator
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime

def create_pdf():
    """Generate the SmartWeather AI documentation PDF"""
    
    doc = SimpleDocTemplate(
        "SmartWeather_AI_Documentation.pdf",
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72,
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0066CC'),
        alignment=TA_CENTER,
        spaceAfter=30,
    )
    
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#003366'),
        spaceAfter=12,
        spaceBefore=20,
    )
    
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#004488'),
        spaceAfter=8,
        spaceBefore=12,
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    )
    
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Code'],
        fontSize=9,
        textColor=colors.HexColor('#333333'),
        backColor=colors.HexColor('#F5F5F5'),
        spaceAfter=6,
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        leftIndent=20,
        spaceAfter=4,
    )
    
    flowables = []
    
    # Title
    flowables.append(Paragraph("SmartWeather AI", title_style))
    flowables.append(Paragraph("AI-Enhanced IoT Weather Monitoring System", ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#666666'),
        spaceAfter=30,
    )))
    flowables.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", 
        ParagraphStyle('Date', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor('#999999'), spaceAfter=30)))
    flowables.append(PageBreak())
    
    # Section 1: Overview
    flowables.append(Paragraph("1. Project Overview", heading1_style))
    flowables.append(Paragraph("""
    SmartWeather AI is an end-to-end AI-powered IoT weather monitoring system that combines 
    real-time sensor data with artificial intelligence to provide hyper-local weather 
    forecasting, anomaly detection, and intelligent insights.
    """, body_style))
    
    features = [
        "Real-time Weather Monitoring - Temperature, pressure, humidity, rainfall, and light intensity",
        "AI-Powered Forecasting - LSTM neural network for 24-hour weather predictions",
        "Intelligent Chat Assistant - Natural language queries using Groq LLM",
        "Interactive Dashboard - Real-time data visualization with charts",
        "Anomaly Detection - Real-time alerts for unusual weather patterns",
        "Cloud-Ready - Deployed on Render and Vercel"
    ]
    flowables.append(Paragraph("Key Features:", heading2_style))
    for feature in features:
        flowables.append(Paragraph("• " + feature, bullet_style))
    flowables.append(Spacer(1, 0.2*inch))
    flowables.append(PageBreak())
    
    # Section 2: Architecture
    flowables.append(Paragraph("2. System Architecture", heading1_style))
    flowables.append(Paragraph("""
    The system follows a modern IoT architecture with four layers:
    """, body_style))
    
    arch_layers = [
        "Hardware Layer - ESP32, BMP180, Rain Sensor, LDR",
        "Cloud Layer - FastAPI Backend, Supabase Database, HiveMQ MQTT Broker",
        "AI Layer - Groq LLM, LSTM Forecasting Model",
        "Frontend Layer - React Dashboard, Interactive Charts"
    ]
    for layer in arch_layers:
        flowables.append(Paragraph("• " + layer, bullet_style))
    flowables.append(Spacer(1, 0.2*inch))
    flowables.append(PageBreak())
    
    # Section 3: Technology Stack
    flowables.append(Paragraph("3. Technology Stack", heading1_style))
    
    tech_data = [
        ["Component", "Technology", "Version"],
        ["Backend Framework", "FastAPI", "0.139.0"],
        ["Programming Language", "Python", "3.11+"],
        ["Database", "Supabase/PostgreSQL", "-"],
        ["MQTT Broker", "HiveMQ Cloud", "-"],
        ["LLM API", "Groq", "1.5.0"],
        ["Frontend", "React", "18+"],
        ["CSS Framework", "Bootstrap", "5+"],
        ["Charts", "Chart.js", "4+"],
        ["Cloud Hosting", "Render + Vercel", "-"],
    ]
    
    table = Table(tech_data, colWidths=[2*inch, 2.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    flowables.append(table)
    flowables.append(PageBreak())
    
    # Section 4: Hardware
    flowables.append(Paragraph("4. Hardware Connections", heading1_style))
    
    pin_data = [
        ["Component", "ESP32 Pin", "Type"],
        ["BMP180 SDA", "GPIO21", "I2C"],
        ["BMP180 SCL", "GPIO22", "I2C"],
        ["Rain Analog", "GPIO34", "ADC"],
        ["Rain Digital", "GPIO4", "Digital"],
        ["LDR Analog", "GPIO35", "ADC"],
        ["LDR Digital", "GPIO15", "Digital"],
    ]
    
    table2 = Table(pin_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch])
    table2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#004488')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    flowables.append(table2)
    flowables.append(Spacer(1, 0.2*inch))
    flowables.append(PageBreak())
    
    # Section 5: API
    flowables.append(Paragraph("5. API Documentation", heading1_style))
    flowables.append(Paragraph("Base URL:", heading2_style))
    flowables.append(Paragraph("https://smartweather-ai-backend.onrender.com/api/v1", code_style))
    flowables.append(Spacer(1, 0.1*inch))
    
    endpoints = [
        ("GET /weather/current", "Get current weather data"),
        ("GET /weather/history", "Get historical weather data"),
        ("POST /ai/query", "Ask the AI assistant a question"),
        ("GET /ai/forecast", "Get weather forecast"),
        ("GET /ai/test", "Test AI router"),
        ("GET /ai/stats", "Get AI model statistics"),
    ]
    
    for endpoint, desc in endpoints:
        flowables.append(Paragraph(f"<b>{endpoint}</b> - {desc}", bullet_style))
    flowables.append(PageBreak())
    
    # Section 6: Live URLs
    flowables.append(Paragraph("6. Live URLs", heading1_style))
    
    url_data = [
        ["Service", "URL"],
        ["Backend API", "https://smartweather-ai-backend.onrender.com"],
        ["API Docs", "https://smartweather-ai-backend.onrender.com/docs"],
        ["Frontend", "https://smartweather-ai.vercel.app"],
        ["Database", "https://lfwddvwtbznxyttuzplz.supabase.co"],
    ]
    
    table3 = Table(url_data, colWidths=[1.5*inch, 3.5*inch])
    table3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0066CC')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
cd ~/smartweather-ai/docs

cat > generate_pdf_direct.py << 'EOF'
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
SmartWeather AI - Direct PDF Generator
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime

def create_pdf():
    """Generate the SmartWeather AI documentation PDF"""
    
    doc = SimpleDocTemplate(
        "SmartWeather_AI_Documentation.pdf",
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72,
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0066CC'),
        alignment=TA_CENTER,
        spaceAfter=30,
    )
    
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#003366'),
        spaceAfter=12,
        spaceBefore=20,
    )
    
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#004488'),
        spaceAfter=8,
        spaceBefore=12,
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    )
    
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Code'],
        fontSize=9,
        textColor=colors.HexColor('#333333'),
        backColor=colors.HexColor('#F5F5F5'),
        spaceAfter=6,
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        leftIndent=20,
        spaceAfter=4,
    )
    
    flowables = []
    
    # Title
    flowables.append(Paragraph("SmartWeather AI", title_style))
    flowables.append(Paragraph("AI-Enhanced IoT Weather Monitoring System", ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#666666'),
        spaceAfter=30,
    )))
    flowables.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", 
        ParagraphStyle('Date', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor('#999999'), spaceAfter=30)))
    flowables.append(PageBreak())
    
    # Section 1: Overview
    flowables.append(Paragraph("1. Project Overview", heading1_style))
    flowables.append(Paragraph("""
    SmartWeather AI is an end-to-end AI-powered IoT weather monitoring system that combines 
    real-time sensor data with artificial intelligence to provide hyper-local weather 
    forecasting, anomaly detection, and intelligent insights.
    """, body_style))
    
    features = [
        "Real-time Weather Monitoring - Temperature, pressure, humidity, rainfall, and light intensity",
        "AI-Powered Forecasting - LSTM neural network for 24-hour weather predictions",
        "Intelligent Chat Assistant - Natural language queries using Groq LLM",
        "Interactive Dashboard - Real-time data visualization with charts",
        "Anomaly Detection - Real-time alerts for unusual weather patterns",
        "Cloud-Ready - Deployed on Render and Vercel"
    ]
    flowables.append(Paragraph("Key Features:", heading2_style))
    for feature in features:
        flowables.append(Paragraph("• " + feature, bullet_style))
    flowables.append(Spacer(1, 0.2*inch))
    flowables.append(PageBreak())
    
    # Section 2: Architecture
    flowables.append(Paragraph("2. System Architecture", heading1_style))
    flowables.append(Paragraph("""
    The system follows a modern IoT architecture with four layers:
    """, body_style))
    
    arch_layers = [
        "Hardware Layer - ESP32, BMP180, Rain Sensor, LDR",
        "Cloud Layer - FastAPI Backend, Supabase Database, HiveMQ MQTT Broker",
        "AI Layer - Groq LLM, LSTM Forecasting Model",
        "Frontend Layer - React Dashboard, Interactive Charts"
    ]
    for layer in arch_layers:
        flowables.append(Paragraph("• " + layer, bullet_style))
    flowables.append(Spacer(1, 0.2*inch))
    flowables.append(PageBreak())
    
    # Section 3: Technology Stack
    flowables.append(Paragraph("3. Technology Stack", heading1_style))
    
    tech_data = [
        ["Component", "Technology", "Version"],
        ["Backend Framework", "FastAPI", "0.139.0"],
        ["Programming Language", "Python", "3.11+"],
        ["Database", "Supabase/PostgreSQL", "-"],
        ["MQTT Broker", "HiveMQ Cloud", "-"],
        ["LLM API", "Groq", "1.5.0"],
        ["Frontend", "React", "18+"],
        ["CSS Framework", "Bootstrap", "5+"],
        ["Charts", "Chart.js", "4+"],
        ["Cloud Hosting", "Render + Vercel", "-"],
    ]
    
    table = Table(tech_data, colWidths=[2*inch, 2.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    flowables.append(table)
    flowables.append(PageBreak())
    
    # Section 4: Hardware
    flowables.append(Paragraph("4. Hardware Connections", heading1_style))
    
    pin_data = [
        ["Component", "ESP32 Pin", "Type"],
        ["BMP180 SDA", "GPIO21", "I2C"],
        ["BMP180 SCL", "GPIO22", "I2C"],
        ["Rain Analog", "GPIO34", "ADC"],
        ["Rain Digital", "GPIO4", "Digital"],
        ["LDR Analog", "GPIO35", "ADC"],
        ["LDR Digital", "GPIO15", "Digital"],
    ]
    
    table2 = Table(pin_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch])
    table2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#004488')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    flowables.append(table2)
    flowables.append(Spacer(1, 0.2*inch))
    flowables.append(PageBreak())
    
    # Section 5: API
    flowables.append(Paragraph("5. API Documentation", heading1_style))
    flowables.append(Paragraph("Base URL:", heading2_style))
    flowables.append(Paragraph("https://smartweather-ai-backend.onrender.com/api/v1", code_style))
    flowables.append(Spacer(1, 0.1*inch))
    
    endpoints = [
        ("GET /weather/current", "Get current weather data"),
        ("GET /weather/history", "Get historical weather data"),
        ("POST /ai/query", "Ask the AI assistant a question"),
        ("GET /ai/forecast", "Get weather forecast"),
        ("GET /ai/test", "Test AI router"),
        ("GET /ai/stats", "Get AI model statistics"),
    ]
    
    for endpoint, desc in endpoints:
        flowables.append(Paragraph(f"<b>{endpoint}</b> - {desc}", bullet_style))
    flowables.append(PageBreak())
    
    # Section 6: Live URLs
    flowables.append(Paragraph("6. Live URLs", heading1_style))
    
    url_data = [
        ["Service", "URL"],
        ["Backend API", "https://smartweather-ai-backend.onrender.com"],
        ["API Docs", "https://smartweather-ai-backend.onrender.com/docs"],
        ["Frontend", "https://smartweather-ai.vercel.app"],
        ["Database", "https://lfwddvwtbznxyttuzplz.supabase.co"],
    ]
    
    table3 = Table(url_data, colWidths=[1.5*inch, 3.5*inch])
    table3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0066CC')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    flowables.append(table3)
    flowables.append(PageBreak())
    
    # Section 7: System Status
    flowables.append(Paragraph("7. System Status", heading1_style))
    
    status_data = [
        ["Component", "Status"],
        ["Backend", "Operational (Render)"],
        ["Frontend", "Operational (Vercel)"],
        ["Database", "Operational (Supabase)"],
        ["MQTT", "Operational (HiveMQ)"],
        ["AI Service", "Operational (Groq)"],
        ["Hardware", "Operational (ESP32)"],
    ]
    
    table4 = Table(status_data, colWidths=[2*inch, 3*inch])
    table4.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    flowables.append(table4)
    flowables.append(PageBreak())
    
    # Section 8: License
    flowables.append(Paragraph("8. License", heading1_style))
    flowables.append(Paragraph("""
    MIT License
    Copyright (c) 2026 Joshua-A-tech

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the 'Software'), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    """, body_style))
    flowables.append(PageBreak())
    
    # Section 9: Contact
    flowables.append(Paragraph("9. Contact", heading1_style))
    flowables.append(Paragraph("""
    <b>GitHub:</b> https://github.com/Joshua-A-tech/Smartweather-ai
    <b>Email:</b> muorongolejoshua@gmail.com
    <b>Issues:</b> https://github.com/Joshua-A-tech/Smartweather-ai/issues
    """, body_style))
    flowables.append(Spacer(1, 0.5*inch))
    flowables.append(Paragraph("""
    <i>Built with ❤️ for smarter weather decisions. 🌤️</i>
    """, ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontSize=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0066CC'),
        spaceAfter=0,
    )))
    
    # Build PDF
    doc.build(flowables)
    print("=" * 60)
    print("✅ PDF Created Successfully!")
    print("=" * 60)
    print("📄 File: SmartWeather_AI_Documentation.pdf")
    print("📁 Location: ~/smartweather-ai/docs/")
    print("=" * 60)

if __name__ == "__main__":
    create_pdf()
