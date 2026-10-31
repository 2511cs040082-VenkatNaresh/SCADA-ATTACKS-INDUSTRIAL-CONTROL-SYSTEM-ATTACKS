from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator
import uuid

class EventType(str, Enum):
    TELEMETRY = "TELEMETRY"
    PROCESS = "PROCESS"
    DEVICE = "DEVICE"
    NETWORK = "NETWORK"
    PROTOCOL = "PROTOCOL"
    SECURITY = "SECURITY"
    AUTHENTICATION = "AUTHENTICATION"
    CONFIGURATION = "CONFIGURATION"
    SIMULATION = "SIMULATION"
    SYSTEM = "SYSTEM"

class EventPriority(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    NORMAL = "NORMAL"
    LOW = "LOW"

class EventSource(BaseModel):
    asset_id: str
    asset_type: Optional[str] = "UNKNOWN"

class EventEnvelope(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: EventType
    timestamp: str
    source: EventSource
    environment: str = "LAB"
    priority: EventPriority = EventPriority.NORMAL
    payload: Dict[str, Any]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    correlation_id: Optional[str] = None

    @field_validator("event_id")

    def validate_event_id(cls, v):
        if not v:
            return str(uuid.uuid4())
        try:
            uuid.UUID(v)
            return v
        except ValueError:
            return str(uuid.uuid4())
