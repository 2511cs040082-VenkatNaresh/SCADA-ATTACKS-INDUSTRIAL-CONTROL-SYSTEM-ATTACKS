import os
import logging
import asyncio
import yaml
from fastapi import FastAPI, HTTPException, Header
import uvicorn

from telemetry.pipeline.pipeline import TelemetryPipeline
from telemetry.schemas.event_schema import EventEnvelope
from telemetry.normalization.normalizer import TelemetryNormalizer

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("TelemetryMicroservice")

app = FastAPI(
    title="ICS-SHIELD Telemetry Pipeline Service",
    version="1.0.0",
    description="Real-Time Telemetry & Event Pipeline Microservice"
)

# Load configuration
config_path = os.path.join(os.path.dirname(__file__), "config", "telemetry_config.yaml")
if os.path.exists(config_path):
    with open(config_path, "r") as f:
        config = yaml.safe_yaml_load(f) or {}
else:
    config = {}

backend_url = os.getenv("BACKEND_URL", config.get("backend", {}).get("url", "http://localhost:5050"))
simulator_url = os.getenv("ICS_SIMULATOR_URL", config.get("collector", {}).get("simulator_url", "http://localhost:8085"))

pipeline = TelemetryPipeline(backend_url=backend_url, simulator_url=simulator_url)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing Telemetry Pipeline Service...")
    await pipeline.start()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Telemetry Pipeline Service...")
    await pipeline.stop()

@app.get("/health")
async def health_check():
    return pipeline.get_health()

@app.get("/api/v1/system/telemetry/health")
async def pipeline_health():
    return pipeline.get_health()

@app.post("/api/v1/telemetry/ingest")
async def manual_ingest(raw_event: dict):
    """Allows manual injection of synthetic events into the pipeline."""
    try:
        norm_event = TelemetryNormalizer.normalize_event(raw_event)
        await pipeline.queue.put(norm_event)
        return {"status": "success", "event_id": norm_event.event_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("TELEMETRY_PORT", 8086))
    uvicorn.run(app, host="0.0.0.0", port=port)
