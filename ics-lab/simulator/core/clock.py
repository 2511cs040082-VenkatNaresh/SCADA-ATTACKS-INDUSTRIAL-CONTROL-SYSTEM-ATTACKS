"""
Simulation Clock Abstraction Layer
Supports REAL_TIME (1 sim sec = 1 real sec) and ACCELERATED modes.
"""

import time
import asyncio

class SimulationClock:
    def __init__(self, mode: str = "REAL_TIME", time_scale: float = 1.0):
        self.mode = mode.upper()
        self.time_scale = max(0.1, float(time_scale))
        self.start_wall_time = time.time()
        self.sim_time = 0.0
        self.running = False

    def start(self):
        self.running = True
        self.start_wall_time = time.time()

    def get_sim_time(self) -> float:
        if not self.running:
            return self.sim_time
        elapsed = time.time() - self.start_wall_time
        return self.sim_time + (elapsed * self.time_scale)

    async def sleep(self, seconds: float):
        """Sleep for simulation seconds scaled by time_scale."""
        actual_sleep = seconds / self.time_scale
        await asyncio.sleep(actual_sleep)
