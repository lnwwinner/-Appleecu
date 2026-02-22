import json
import struct
import numpy as np
from typing import Dict, Any

class BinaryECUParser:
    """
    A dynamic parser for ECU binary files (.bin, .ori, .mod).
    
    This parser avoids hardcoded map addresses by relying on external JSON definitions.
    The JSON definitions provide metadata such as Name, Address, Dimension (columns, rows),
    Data Type, and Conversion Factor. This allows the engine to be updated dynamically
    for new ECUs without modifying the Python code.
    """
    
    def read_binary(self, filepath: str) -> bytes:
        """
        Safely loads raw binary ECU files.
        
        Args:
            filepath (str): The path to the binary file.
            
        Returns:
            bytes: The raw binary data.
        """
        try:
            with open(filepath, 'rb') as f:
                return f.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Binary file not found: {filepath}")
        except Exception as e:
            raise Exception(f"Error reading binary file: {str(e)}")

    def load_definitions_from_json(self, json_filepath: str) -> Dict[str, Any]:
        """
        Loads a JSON file containing the map metadata.
        
        Args:
            json_filepath (str): The path to the JSON definition file.
            
        Returns:
            dict: The parsed JSON definitions.
        """
        try:
            with open(json_filepath, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"JSON definition file not found: {json_filepath}")
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON format in file: {json_filepath}")

    def extract_map_data(self, binary_data: bytes, start_address: int, columns: int, rows: int, 
                         data_type: str = '16bit_hi_lo', is_signed: bool = False, 
                         conversion_factor: float = 1.0) -> np.ndarray:
        """
        Parses raw bytes into a 2D numpy array based on provided structural definitions.
        
        Args:
            binary_data (bytes): The raw binary data of the ECU file.
            start_address (int): The memory offset where the map begins.
            columns (int): Number of columns in the map.
            rows (int): Number of rows in the map.
            data_type (str): The endianness and bit size ('8bit', '16bit_hi_lo', '16bit_lo_hi').
            is_signed (bool): Whether the data is signed or unsigned.
            conversion_factor (float): The factor to multiply the raw values by.
            
        Returns:
            np.ndarray: A 2D numpy array containing the parsed and converted map data.
        """
        data_size = columns * rows
        
        if data_type == '8bit':
            byte_count = data_size
            format_char = f"{data_size}{'b' if is_signed else 'B'}"
        elif data_type in ['16bit_hi_lo', '16bit_lo_hi']:
            byte_count = data_size * 2
            endian = '>' if data_type == '16bit_hi_lo' else '<'
            format_char = f"{endian}{data_size}{'h' if is_signed else 'H'}"
        else:
            raise ValueError(f"Unsupported data_type: {data_type}")
            
        end_address = start_address + byte_count
        
        if end_address > len(binary_data):
            raise IndexError(f"Memory out-of-bounds: Attempted to read {byte_count} bytes at {hex(start_address)}. "
                             f"File size is {len(binary_data)} bytes.")
                             
        raw_bytes = binary_data[start_address:end_address]
        
        values = struct.unpack(format_char, raw_bytes)
            
        array_1d = np.array(values, dtype=float) * conversion_factor
        return array_1d.reshape((rows, columns))
