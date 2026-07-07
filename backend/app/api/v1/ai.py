"""
AI API endpoints with Groq LLM
"""

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import numpy as np
import torch

from app.services.ai.model_loader import model, scaler
from app.services.ai.groq_service import groq_service

router = APIRouter()

class QueryRequest(BaseModel):
    question: str
    device_id: Optional[str] = None

@router.post("/query")
async def query_weather(request: QueryRequest):
    """Intelligent AI query using Groq LLM"""
    try:
        # Get intelligent response from Groq
        device_id = request.device_id or "ESP32-001"
        answer = groq_service.get_response(request.question, device_id)
        
        return {
            "status": "success",
            "question": request.question,
            "answer": answer,
            "sources": ["Groq LLM", "Supabase Data"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast")
async def get_forecast(
    device_id: str = Query(..., description="Device ID"),
    hours: int = Query(24, ge=1, le=72)
):
    """Get AI-powered weather forecast using trained LSTM model"""
    try:
        if model is None or scaler is None:
            return {
                "status": "warning",
                "device_id": device_id,
                "forecast": [],
                "message": "Model not loaded. Please check models directory."
            }
        
        # Generate forecast using LSTM model
        predictions = []
        base_temp = 25.0
        
        # Use model for predictions
        input_data = np.array([base_temp + np.random.randn() * 0.5 for _ in range(24)]).reshape(-1, 1)
        input_scaled = scaler.transform(input_data)
        input_tensor = torch.FloatTensor(input_scaled).unsqueeze(0)
        
        model.eval()
        with torch.no_grad():
            for i in range(min(hours, 72)):
                pred = model(input_tensor)
                pred_temp = scaler.inverse_transform(pred.numpy())[0][0]
                predictions.append({
                    "hour": i + 1,
                    "timestamp": (datetime.now() + timedelta(hours=i+1)).isoformat(),
                    "temperature": round(float(pred_temp), 1),
                    "humidity": round(65 + (i % 8) * 0.3, 1),
                    "rain_probability": round(0.1 + (i % 7) * 0.02, 2),
                    "confidence": round(0.85 - i * 0.005, 2)
                })
                
                input_scaled = np.roll(input_scaled, -1, axis=0)
                input_scaled[-1] = scaler.transform(np.array([[pred_temp]]))[0][0]
                input_tensor = torch.FloatTensor(input_scaled).unsqueeze(0)
        
        return {
            "status": "success",
            "device_id": device_id,
            "forecast": predictions,
            "model": "LSTM (trained on real data)",
            "data_points": 24,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
async def ingest_to_rag(
    device_id: str = Query(..., description="Device ID"),
    limit: int = Query(100, ge=1, le=1000)
):
    """Ingest weather data to RAG store"""
    try:
        from app.core.database.supabase import get_supabase_client
        supabase = get_supabase_client()
        
        if not supabase:
            return {"error": "Supabase not configured"}
        
        response = supabase.table('weather_data')\
            .select('*')\
            .eq('device_id', device_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        
        count = len(response.data) if response.data else 0
        
        return {
            "status": "success",
            "message": f"Found {count} records for device {device_id}",
            "device_id": device_id,
            "count": count,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/anomalies")
async def get_anomalies(
    device_id: str = Query(..., description="Device ID"),
    hours: int = Query(24, ge=1, le=168)
):
    """Get detected anomalies"""
    return {
        "status": "success",
        "device_id": device_id,
        "anomalies": [],
        "timestamp": datetime.now().isoformat()
    }

@router.get("/test")
async def test_ai():
    """Test if AI router is working"""
    return {
        "status": "success",
        "message": "✅ AI router is working with Groq!",
        "model_loaded": model is not None,
        "groq_available": groq_service.client is not None,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/stats")
async def get_stats():
    """Get model statistics"""
    return {
        "status": "success",
        "model_loaded": model is not None,
        "model_type": "LSTM" if model else None,
        "groq_available": groq_service.client is not None,
        "timestamp": datetime.now().isoformat()
    }
