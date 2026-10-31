from fastapi import APIRouter, HTTPException
from typing import Dict, Any

router = APIRouter()

def get_engine():
    from ..main import engine
    return engine

@router.get("/status")
def get_status():
    eng = get_engine()
    devices = list(eng.state_manager.devices.values())
    online = [d for d in devices if d.get("status") == "ONLINE"]

    return {
        "simulation_status": "RUNNING" if eng.running else "STOPPED",
        "simulation_mode": eng.clock.mode,
        "simulation_time": int(eng.clock.get_sim_time()),
        "active_scenario": eng.active_scenario_name,
        "device_count": len(devices),
        "online_devices": len(online),
        "process_state": eng.state_manager.process_state.get("mode", "NORMAL"),
        "telemetry_rate_pps": 134,
        "event_rate_eps": 12
    }

@router.get("/devices")
def get_devices():
    eng = get_engine()
    return list(eng.state_manager.devices.values())

@router.get("/process")
def get_process():
    eng = get_engine()
    p_vars = eng.process_model.vars
    return {
        "tank_level": p_vars.tank_level,
        "temperature": p_vars.temperature,
        "pressure": p_vars.pressure,
        "flow_rate": p_vars.flow_rate,
        "pump_speed": p_vars.pump_speed,
        "valve_position": p_vars.valve_position,
        "motor_state": p_vars.motor_state,
        "water_quality": p_vars.water_quality,
        "mode": eng.process_model.mode
    }

@router.get("/topology")
def get_topology():
    eng = get_engine()
    devices = list(eng.state_manager.devices.values())
    nodes = [{"id": d["device_id"], "label": d["name"], "type": d["type"], "zone": d["zone"], "ip": d["ip_address"]} for d in devices]
    
    edges = [
        {"source": "HMI-001", "target": "PLC-001", "protocol": "Modbus TCP"},
        {"source": "SCADA-SRV-01", "target": "PLC-001", "protocol": "Modbus TCP"},
        {"source": "SCADA-SRV-01", "target": "PLC-002", "protocol": "S7comm"},
        {"source": "PLC-001", "target": "SENSOR-001", "protocol": "Analog"},
        {"source": "PLC-001", "target": "ACTUATOR-001", "protocol": "Digital IO"},
        {"source": "RTU-001", "target": "SCADA-SRV-01", "protocol": "DNP3"}
    ]

    zones = ["CORPORATE", "DMZ", "OT", "CONTROL", "SAFETY", "FIELD", "LAB"]

    return {"nodes": nodes, "edges": edges, "zones": zones}

@router.get("/scenarios")
def get_scenarios():
    eng = get_engine()
    return [
        {"id": sc.name, "name": sc.name, "description": sc.description, "severity": sc.severity, "is_active": (sc.name == eng.active_scenario_name)}
        for sc in eng.scenarios.values()
    ]

@router.post("/scenarios/{scenario_id}/start")
async def start_scenario(scenario_id: str):
    eng = get_engine()
    try:
        await eng.set_scenario(scenario_id)
        return {"status": "success", "message": f"Scenario '{scenario_id}' activated."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/scenarios/{scenario_id}/stop")
async def stop_scenario(scenario_id: str):
    eng = get_engine()
    await eng.set_scenario("NORMAL_OPERATION")
    return {"status": "success", "message": f"Scenario '{scenario_id}' stopped. Reverted to NORMAL_OPERATION."}

@router.post("/reset")
async def reset_simulator():
    eng = get_engine()
    await eng.reset_simulation()
    return {"status": "success", "message": "Laboratory simulator state reset."}
