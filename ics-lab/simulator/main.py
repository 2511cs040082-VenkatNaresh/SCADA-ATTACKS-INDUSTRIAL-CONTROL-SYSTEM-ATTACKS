"""
ICS-SHIELD Laboratory Simulator Service Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import os

from .core.simulation_engine import SimulationEngine
from .api.simulator_api import router as simulator_router

app = FastAPI(
    title="ICS-SHIELD Laboratory Simulator",
    description="Isolated Virtual SCADA & Industrial Control System Laboratory",
    version="1.0.0-phase4"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = SimulationEngine()

app.include_router(simulator_router, prefix="/api/simulator", tags=["Simulator"])

@app.get("/health")
def health():
    return {
        "service": "ICS-SHIELD Laboratory Simulator",
        "status": "ONLINE",
        "phase": "PHASE_4_ICS_LABORATORY",
        "safety_mode": "ISOLATED_SIMULATION_ONLY",
        "simulation_running": engine.running,
        "active_scenario": engine.active_scenario_name
    }

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(engine.start_simulation())

@app.on_event("shutdown")
async def shutdown_event():
    await engine.stop_simulation()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8085))
    uvicorn.run("ics-lab.simulator.main:app", host="0.0.0.0", port=port, reload=False)
