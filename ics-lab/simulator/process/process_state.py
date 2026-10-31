from enum import Enum

class ProcessMode(str, Enum):
    STARTUP = "STARTUP"
    NORMAL = "NORMAL"
    HIGH_LOAD = "HIGH_LOAD"
    LOW_LOAD = "LOW_LOAD"
    MAINTENANCE = "MAINTENANCE"
    SHUTDOWN = "SHUTDOWN"
