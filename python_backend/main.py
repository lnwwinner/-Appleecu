from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from typing import Optional, Dict, Any
import numpy as np
import json
from BinaryECUParser import BinaryECUParser
from ai_handler import identify_map_addresses

app = FastAPI(title="ECU Tuning Analysis API")
parser = BinaryECUParser()

class MapDefinition(BaseModel):
    name: str
    start_address: int
    columns: int
    rows: int
    data_type: str = '16bit_hi_lo'
    is_signed: bool = False
    conversion_factor: float = 1.0

@app.post("/api/upload")
async def upload_ecu_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.bin', '.ori', '.mod', '.hex')):
        raise HTTPException(status_code=400, detail="Invalid file type")
    content = await file.read()
    
    # Placeholder for Checksum Correction
    # In a real implementation, this would calculate and correct the checksum
    # based on the specific ECU family (e.g., Bosch EDC17, MED9, etc.)
    checksum_valid = True
    
    return {
        "filename": file.filename, 
        "size": len(content), 
        "status": "uploaded", 
        "checksum_valid": checksum_valid
    }

@app.post("/api/extract")
async def extract_metadata(file: UploadFile = File(...), definition_json: str = Form(...)):
    # In a real scenario, definition would be loaded from DB or JSON
    content = await file.read()
    try:
        def_dict = json.loads(definition_json)
        definition = MapDefinition(**def_dict)
        
        data = parser.extract_map_data(
            content, 
            definition.start_address, 
            definition.columns, 
            definition.rows,
            definition.data_type,
            definition.is_signed,
            definition.conversion_factor
        )
        return {"map_data": data.tolist()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/safe-limit")
async def calculate_safe_limit(current_value: float, strategy: str):
    # Safe-Limit calculator
    # The Backend provides a 'Hard-Limit' to prevent engine damage.
    
    # Dummy logic for risk score based on strategy
    strategy_multipliers = {
        "Heavy Duty": 0.8,
        "Gasoline": 1.2,
        "Diesel": 1.0,
        "Eco": 0.5,
        "Manual": 1.5
    }
    
    multiplier = strategy_multipliers.get(strategy, 1.0)
    
    risk_score = min(100, max(0, (current_value / 100) * 50 * multiplier))
    hard_limit = 150.0 * (1 / multiplier)
    
    return {
        "risk_score": risk_score, 
        "hard_limit": hard_limit, 
        "strategy": strategy,
        "is_safe": current_value <= hard_limit
    }

@app.post("/api/ai/identify-maps")
async def ai_identify_maps(metadata: Dict[str, Any]):
    try:
        analysis = identify_map_addresses(metadata)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
