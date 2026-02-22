import os
import json
from google import genai
from google.genai import types

def identify_map_addresses(metadata: dict) -> str:
    """
    Sends ECU metadata to Gemini to identify Map Addresses (Fuel, Boost, Ignition).
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
        
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are an expert Automotive Software Engineer specializing in ECU tuning.
    Analyze the following ECU metadata and identify potential map addresses for Fuel, Boost, and Ignition.
    
    Metadata:
    {json.dumps(metadata, indent=2)}
    
    Provide a detailed analysis of where these maps might be located based on standard ECU architectures.
    """
    
    response = client.models.generate_content(
        model='gemini-3-flash-preview',
        contents=prompt,
    )
    
    return response.text
