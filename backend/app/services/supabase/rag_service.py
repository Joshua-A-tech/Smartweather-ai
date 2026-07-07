"""
Minimal RAG Service - Mock responses
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class SupabaseRAGService:
    def __init__(self):
        logger.info("✅ Minimal RAG Service initialized")
    
    def query(self, question: str, device_id: Optional[str] = None) -> Dict[str, Any]:
        return {
            "answer": f"🤖 SmartWeather AI Assistant\n\nYou asked: '{question}'\nDevice: {device_id or 'ESP32-001'}\n\nThis is a mock response. The system is ready for real data!",
            "sources": [],
            "context": "Mock response"
        }

rag_service = SupabaseRAGService()
