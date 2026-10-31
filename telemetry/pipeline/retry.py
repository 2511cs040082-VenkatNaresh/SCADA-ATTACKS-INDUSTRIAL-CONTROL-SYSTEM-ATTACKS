import asyncio
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

async def execute_with_retry(
    async_fn: Callable[[], Any],
    max_retries: int = 3,
    initial_delay: float = 0.5,
    max_delay: float = 5.0,
    backoff_factor: float = 2.0
) -> Any:
    """Executes an async function with exponential backoff and retry limits."""
    delay = initial_delay
    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
            return await async_fn()
        except Exception as e:
            last_exception = e
            if attempt == max_retries:
                logger.error(f"Retry limit reached ({max_retries}/{max_retries}). Error: {e}")
                raise e
            logger.warning(f"Attempt {attempt}/{max_retries} failed: {e}. Retrying in {delay:.2f}s...")
            await asyncio.sleep(delay)
            delay = min(delay * backoff_factor, max_delay)

    raise last_exception
