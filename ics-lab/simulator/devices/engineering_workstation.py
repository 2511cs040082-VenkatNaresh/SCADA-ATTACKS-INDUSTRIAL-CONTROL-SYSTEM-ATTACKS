from .base_device import BaseDevice

class EngineeringWorkstationDevice(BaseDevice):
    active_project: str = "WaterTreatment_Logic_v1.0"
    connected_plc: str = "PLC-001"
