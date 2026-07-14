"""
PDF Report API Endpoint
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from datetime import datetime
from app.services.pdf.pdf_generator import pdf_generator
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/report")
async def generate_pdf_report(
    device_id: str = Query(..., description="Device ID"),
    days: int = Query(7, ge=1, le=30, description="Number of days to include")
):
    """Generate PDF weather report"""
    try:
        logger.info(f"Generating PDF report for {device_id}, {days} days")
        
        pdf_data = pdf_generator.generate_report(device_id, days)
        
        if not pdf_data:
            raise HTTPException(status_code=404, detail="No data found for this device")
        
        # Generate filename
        filename = f"weather_report_{device_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
        
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
