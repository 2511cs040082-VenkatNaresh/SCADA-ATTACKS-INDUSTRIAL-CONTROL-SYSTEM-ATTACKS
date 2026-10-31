import os
import logging
import asyncio
from fastapi import FastAPI, HTTPException
import uvicorn
from network_monitor.network_service import NetworkMonitoringService

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("NetworkMonitorMicroservice")

app = FastAPI(
    title="ICS-SHIELD Real-Time ICS Network & Protocol Monitoring Microservice",
    version="1.0.0",
    description="Protocol Parsing, Modbus/TCP Monitoring, Flow Aggregation & Session Management"
)

backend_url = os.getenv("BACKEND_URL", "http://localhost:5050")
service = NetworkMonitoringService(backend_url=backend_url)

@app.get("/health")
@app.get("/api/v1/system/network/health")
async def health():
    return {
        "status": "HEALTHY",
        "service": "ICS Network & Industrial Protocol Monitor",
        "metrics": service.get_metrics()
    }

@app.get("/api/v1/network/flows")
async def get_flows():
    return service.flow_aggregator.get_all_flows()

@app.get("/api/v1/network/sessions")
async def get_sessions():
    return service.session_manager.get_all_sessions()

@app.post("/api/v1/network/process-event")
async def process_event(event: dict):
    try:
        res = service.process_raw_event(event)
        return {"status": "success", "result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("NETWORK_MONITOR_PORT", 8087))
    uvicorn.run(app, host="0.0.0.0", port=port)
