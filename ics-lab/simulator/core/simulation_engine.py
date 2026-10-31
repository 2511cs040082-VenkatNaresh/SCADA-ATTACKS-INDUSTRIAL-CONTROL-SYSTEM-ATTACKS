"""
Simulation Engine: Master Laboratory Controller & asyncio loop runner.
"""

import asyncio
import logging
import yaml
import os
import time
from typing import Dict, Any, List

from .clock import SimulationClock
from .event_bus import EventBus
from .state_manager import StateManager

from ..process.process_model import WaterTreatmentProcessModel
from ..protocols.modbus_simulator import ModbusTCPSimulator
from ..telemetry.telemetry_generator import TelemetryGenerator
from ..telemetry.telemetry_sender import TelemetrySender

from ..scenarios.normal_operation import NormalOperationScenario
from ..scenarios.process_anomaly import ProcessAnomalyScenario
from ..scenarios.device_anomaly import DeviceAnomalyScenario
from ..scenarios.protocol_anomaly import ProtocolAnomalyScenario
from ..scenarios.network_anomaly import NetworkAnomalyScenario

logger = logging.getLogger("simulator.engine")

class SimulationEngine:
    def __init__(self, config_path: str = None):
        self.config_path = config_path or os.path.join(os.path.dirname(__file__), "../config/lab_config.yaml")
        self.config = self._load_config()

        sim_cfg = self.config.get("simulation", {})
        self.clock = SimulationClock(mode=sim_cfg.get("mode", "REAL_TIME"), time_scale=sim_cfg.get("time_scale", 1.0))
        self.event_bus = EventBus()
        self.state_manager = StateManager()

        self.process_model = WaterTreatmentProcessModel()
        self.modbus_sim = ModbusTCPSimulator()
        self.telemetry_gen = TelemetryGenerator()
        self.telemetry_sender = TelemetrySender(backend_url=sim_cfg.get("backend_url", "http://localhost:5050/api"))

        self.scenarios = {
            "NORMAL_OPERATION": NormalOperationScenario(),
            "PROCESS_VALUE_ANOMALY": ProcessAnomalyScenario(),
            "DEVICE_OFFLINE": DeviceAnomalyScenario(),
            "PROTOCOL_ANOMALY": ProtocolAnomalyScenario(),
            "ABNORMAL_REQUEST_RATE": NetworkAnomalyScenario()
        }
        self.active_scenario_name = "NORMAL_OPERATION"

        self.running = False
        self._init_devices()

    def _load_config(self) -> Dict[str, Any]:
        if os.path.exists(self.config_path):
            with open(self.config_path, "r") as f:
                return yaml.safe_load(f)
        return {}

    def _init_devices(self):
        devices = self.config.get("devices", [])
        for dev in devices:
            self.state_manager.update_device_state(dev["id"], {
                "name": dev["name"],
                "type": dev["type"],
                "ip_address": dev["ip"],
                "status": "ONLINE",
                "zone": dev.get("zone", "FIELD")
            })

    async def start_simulation(self):
        if self.running:
            return
        self.running = True
        self.clock.start()
        logger.info("[ENGINE] Starting Laboratory Simulation Engine...")

        # Activate default scenario
        await self.set_scenario("NORMAL_OPERATION")

        # Launch background loops
        asyncio.create_task(self._process_loop())
        asyncio.create_task(self._telemetry_loop())

    async def stop_simulation(self):
        self.running = False
        logger.info("[ENGINE] Stopped Laboratory Simulation Engine.")

    async def reset_simulation(self):
        await self.stop_simulation()
        self.process_model = WaterTreatmentProcessModel()
        self._init_devices()
        await self.start_simulation()

    async def set_scenario(self, scenario_name: str):
        if scenario_name not in self.scenarios:
            raise ValueError(f"Unknown scenario: {scenario_name}")

        # Stop active scenario
        if self.active_scenario_name in self.scenarios:
            await self.scenarios[self.active_scenario_name].stop(self)

        self.active_scenario_name = scenario_name
        await self.scenarios[scenario_name].start(self)
        logger.info(f"[ENGINE] Active scenario set to '{scenario_name}'.")

    async def _process_loop(self):
        interval = self.config.get("simulation", {}).get("update_step", 1.0)
        while self.running:
            self.process_model.step(dt=interval)
            # Update state manager
            p_vars = self.process_model.vars
            self.state_manager.process_state["variables"] = {
                "tank_level": p_vars.tank_level,
                "temperature": p_vars.temperature,
                "pressure": p_vars.pressure,
                "flow_rate": p_vars.flow_rate,
                "pump_speed": p_vars.pump_speed,
                "valve_position": p_vars.valve_position,
                "water_quality": p_vars.water_quality
            }
            await self.clock.sleep(interval)

    async def _telemetry_loop(self):
        interval = self.config.get("simulation", {}).get("telemetry_interval", 1.0)
        while self.running:
            # Generate sensor readings
            vars = self.process_model.vars
            tel_readings = [
                self.telemetry_gen.generate_sensor_telemetry("SENSOR-001", "temperature", vars.temperature, "°C"),
                self.telemetry_gen.generate_sensor_telemetry("SENSOR-002", "pressure", vars.pressure, "bar"),
                self.telemetry_gen.generate_sensor_telemetry("SENSOR-003", "flow_rate", vars.flow_rate, "L/min"),
                self.telemetry_gen.generate_sensor_telemetry("SENSOR-004", "tank_level", vars.tank_level, "%")
            ]

            for r in tel_readings:
                await self.event_bus.publish("TELEMETRY", r)

            # Generate active scenario events
            if self.active_scenario_name in self.scenarios:
                scenario_events = self.scenarios[self.active_scenario_name].generate_events(self)
                for evt in scenario_events:
                    await self.event_bus.publish("PROTOCOL_EVENT", evt)

            await self.clock.sleep(interval)
