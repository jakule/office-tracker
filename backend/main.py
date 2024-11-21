# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
import json
from typing import Dict, Optional
import logging
from datetime import date

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Office Attendance Tracker API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data file path
DATA_DIR = Path("data")
DATA_FILE = DATA_DIR / "attendance.json"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

# Create data file if it doesn't exist
if not DATA_FILE.exists():
    with open(DATA_FILE, "w") as f:
        json.dump({}, f)

# Pydantic models for request/response validation
class AttendanceUpdate(BaseModel):
    date: str
    attended: bool

class AttendanceResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, bool]] = None
    error: Optional[str] = None

def read_attendance_data() -> Dict[str, bool]:
    """Read attendance data from JSON file."""
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading attendance data: {e}")
        raise HTTPException(status_code=500, detail="Error reading attendance data")

def write_attendance_data(data: Dict[str, bool]) -> None:
    """Write attendance data to JSON file."""
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error(f"Error writing attendance data: {e}")
        raise HTTPException(status_code=500, detail="Error saving attendance data")

@app.get("/api/attendance", response_model=AttendanceResponse)
async def get_attendance():
    """Get all attendance records."""
    try:
        data = read_attendance_data()
        return AttendanceResponse(success=True, data=data)
    except Exception as e:
        logger.error(f"Error in get_attendance: {e}")
        return AttendanceResponse(success=False, error=str(e))

@app.post("/api/attendance", response_model=AttendanceResponse)
async def update_attendance(update: AttendanceUpdate):
    """Update attendance for a specific date."""
    try:
        data = read_attendance_data()
        
        # Validate date format
        try:
            date.fromisoformat(update.date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

        if update.attended:
            data[update.date] = True
        else:
            data.pop(update.date, None)
        
        write_attendance_data(data)
        return AttendanceResponse(success=True, data=data)
    except Exception as e:
        logger.error(f"Error in update_attendance: {e}")
        return AttendanceResponse(success=False, error=str(e))

# Serve static files from the React build directory
app.mount("/", StaticFiles(directory="front/dist", html=True), name="static")

# For handling client-side routing
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    return FileResponse("frontend/dist/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)