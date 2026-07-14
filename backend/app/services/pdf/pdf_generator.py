"""
PDF Report Generator for SmartWeather
Generates professional weather reports
"""

import io
from datetime import datetime, timedelta
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.linecharts import HorizontalLineChart
import logging
from app.core.database.supabase import get_supabase_client

logger = logging.getLogger(__name__)

class PDFReportGenerator:
    """Generate PDF weather reports"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
        self.styles = getSampleStyleSheet()
        
    def get_weather_data(self, device_id: str, days: int = 7):
        """Fetch weather data for report"""
        try:
            response = self.supabase.table('weather_data')\
                .select('*')\
                .eq('device_id', device_id)\
                .order('created_at', desc=True)\
                .limit(days * 24)\
                .execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            return []
    
    def generate_report(self, device_id: str, days: int = 7) -> bytes:
        """Generate PDF report"""
        data = self.get_weather_data(device_id, days)
        
        if not data:
            return None
        
        # Create buffer for PDF
        buffer = io.BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )
        
        flowables = []
        
        # ============================================================
        # TITLE SECTION
        # ============================================================
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0066CC'),
            alignment=TA_CENTER,
            spaceAfter=30,
        )
        
        flowables.append(Paragraph("SmartWeather Report", title_style))
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=self.styles['Normal'],
            fontSize=14,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#666666'),
            spaceAfter=20,
        )
        
        device_name = data[0].get('device_name', device_id) if data else device_id
        location = data[0].get('location', 'Unknown') if data else 'Unknown'
        
        flowables.append(Paragraph(
            f"Device: {device_name} | Location: {location}",
            subtitle_style
        ))
        
        date_style = ParagraphStyle(
            'Date',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#999999'),
            spaceAfter=20,
        )
        
        flowables.append(Paragraph(
            f"Generated: {datetime.now().strftime('%B %d, %Y %I:%M %p')}",
            date_style
        ))
        
        flowables.append(PageBreak())
        
        # ============================================================
        # SUMMARY STATISTICS
        # ============================================================
        heading1_style = ParagraphStyle(
            'Heading1',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#003366'),
            spaceAfter=12,
        )
        
        flowables.append(Paragraph("Summary Statistics", heading1_style))
        
        # Calculate stats
        temps = [d.get('temperature', 0) for d in data if d.get('temperature')]
        humidities = [d.get('humidity', 0) for d in data if d.get('humidity')]
        pressures = [d.get('pressure', 0) for d in data if d.get('pressure')]
        
        if temps:
            avg_temp = sum(temps) / len(temps)
            max_temp = max(temps)
            min_temp = min(temps)
        else:
            avg_temp = max_temp = min_temp = 0
        
        avg_humidity = sum(humidities) / len(humidities) if humidities else 0
        avg_pressure = sum(pressures) / len(pressures) if pressures else 0
        
        rain_days = len([d for d in data if d.get('is_raining') or d.get('rainfall', 0) > 0])
        
        # Create stats table
        stats_data = [
            ['Metric', 'Value'],
            [f'Average Temperature', f'{avg_temp:.1f}°C'],
            [f'Maximum Temperature', f'{max_temp:.1f}°C'],
            [f'Minimum Temperature', f'{min_temp:.1f}°C'],
            [f'Average Humidity', f'{avg_humidity:.1f}%'],
            [f'Average Pressure', f'{avg_pressure:.1f} hPa'],
            [f'Rainy Days', str(rain_days)],
            [f'Total Records', str(len(data))],
        ]
        
        table = Table(stats_data, colWidths=[3*inch, 2*inch])
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
        ]))
        flowables.append(table)
        flowables.append(Spacer(1, 0.5*inch))
        flowables.append(PageBreak())
        
        # ============================================================
        # DAILY DETAILS
        # ============================================================
        flowables.append(Paragraph("Daily Details", heading1_style))
        
        # Group by day
        daily_data = {}
        for record in data:
            date = record.get('created_at', '')
            if date:
                day = date[:10] if len(date) > 10 else date
                if day not in daily_data:
                    daily_data[day] = []
                daily_data[day].append(record)
        
        body_style = ParagraphStyle(
            'Body',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=12,
            spaceAfter=6,
        )
        
        for day, records in sorted(daily_data.items())[:14]:  # Max 14 days
            day_temps = [r.get('temperature', 0) for r in records if r.get('temperature')]
            if day_temps:
                day_avg = sum(day_temps) / len(day_temps)
                day_max = max(day_temps)
                day_min = min(day_temps)
                day_rain = any(r.get('is_raining', False) for r in records)
                
                flowables.append(Paragraph(f"<b>{day}</b>", body_style))
                flowables.append(Paragraph(
                    f"  Temperature: {day_avg:.1f}°C (Range: {day_min:.1f}°C - {day_max:.1f}°C) | "
                    f"Rain: {'Yes' if day_rain else 'No'} | "
                    f"Records: {len(records)}",
                    body_style
                ))
                flowables.append(Spacer(1, 0.1*inch))
        
        # ============================================================
        # FOOTER
        # ============================================================
        footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#999999'),
            spaceAfter=0,
        )
        
        flowables.append(Spacer(1, 0.5*inch))
        flowables.append(Paragraph(
            "This report was generated automatically by SmartWeather AI.",
            footer_style
        ))
        flowables.append(Paragraph(
            f"Report ID: SW-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            footer_style
        ))
        flowables.append(Paragraph(
            "© 2026 SmartWeather - AI-Enhanced IoT Weather Monitoring System",
            footer_style
        ))
        
        # Build PDF
        doc.build(flowables)
        
        # Get PDF data
        pdf_data = buffer.getvalue()
        buffer.close()
        
        return pdf_data

pdf_generator = PDFReportGenerator()
