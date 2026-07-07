"""
Load trained models from local storage
"""

import torch
import pickle
import torch.nn as nn
from pathlib import Path
import logging
import os

logger = logging.getLogger(__name__)

class WeatherLSTM(nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm = nn.LSTM(1, 50, 2, batch_first=True)
        self.fc = nn.Linear(50, 1)
    
    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

def load_model():
    """Load model from local files"""
    try:
        # Get the backend directory (3 levels up from this file)
        # This file is at: app/services/ai/model_loader.py
        # We want: backend/models/
        backend_dir = Path(__file__).parent.parent.parent
        model_path = backend_dir / "models" / "weather_lstm.pth"
        scaler_path = backend_dir / "models" / "scaler.pkl"
        
        logger.info(f"Looking for model at: {model_path}")
        logger.info(f"Looking for scaler at: {scaler_path}")
        
        if not model_path.exists():
            logger.warning(f"Model not found at: {model_path}")
            return None, None
        
        if not scaler_path.exists():
            logger.warning(f"Scaler not found at: {scaler_path}")
            return None, None
        
        # Load model
        model = WeatherLSTM()
        model.load_state_dict(torch.load(model_path, map_location='cpu'))
        model.eval()
        
        # Load scaler
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        
        logger.info("✅ Model loaded successfully from local files!")
        logger.info(f"   Model: {model_path}")
        logger.info(f"   Scaler: {scaler_path}")
        return model, scaler
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        return None, None

# Try to load model
model, scaler = load_model()
