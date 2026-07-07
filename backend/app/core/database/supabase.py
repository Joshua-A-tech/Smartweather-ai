"""
Supabase client wrapper
"""

import os
from typing import Optional
from supabase import create_client, Client
from postgrest import APIError
from app.core.config import settings

class SupabaseClient:
    """Wrapper for Supabase client"""
    
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get singleton Supabase client"""
        if cls._instance is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_KEY must be set in environment"
                )
            cls._instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        return cls._instance
    
    @classmethod
    def reset(cls):
        """Reset client (useful for testing)"""
        cls._instance = None

def get_supabase_client() -> Client:
    """Dependency for FastAPI to get Supabase client"""
    return SupabaseClient.get_client()
