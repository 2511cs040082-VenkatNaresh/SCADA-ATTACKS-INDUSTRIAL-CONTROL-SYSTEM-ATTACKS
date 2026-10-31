from typing import Dict, Any, Tuple

MODBUS_FUNCTION_CODES = {
    1: "Read Coils",
    2: "Read Discrete Inputs",
    3: "Read Holding Registers",
    4: "Read Input Registers",
    5: "Write Single Coil",
    6: "Write Single Register",
    15: "Write Multiple Coils",
    16: "Write Multiple Registers"
}

MODBUS_EXCEPTION_CODES = {
    1: "ILLEGAL_FUNCTION",
    2: "ILLEGAL_DATA_ADDRESS",
    3: "ILLEGAL_DATA_VALUE",
    4: "SLAVE_DEVICE_FAILURE",
    5: "ACKNOWLEDGE",
    6: "SLAVE_DEVICE_BUSY",
    8: "MEMORY_PARITY_ERROR",
    10: "GATEWAY_PATH_UNAVAILABLE",
    11: "GATEWAY_TARGET_DEVICE_FAILED"
}

class ModbusParser:
    @staticmethod
    def parse_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses Modbus payload safely without crashing on malformed inputs or unknown function codes.
        """
        if not isinstance(payload, dict):
            payload = {}

        raw_fc = payload.get("function_code", 3)
        try:
            fc_int = int(raw_fc)
        except (ValueError, TypeError):
            fc_int = 3

        # Check exception bit (Modbus exception responses set highest bit 0x80)
        is_exception = False
        exception_code = None
        exception_name = None

        if fc_int > 128:
            is_exception = True
            base_fc = fc_int - 128
            function_name = f"EXCEPTION_RESPONSE ({MODBUS_FUNCTION_CODES.get(base_fc, 'UNKNOWN_FC')})"
            exception_code = payload.get("exception_code", 1)
            exception_name = MODBUS_EXCEPTION_CODES.get(exception_code, "UNKNOWN_EXCEPTION")
        else:
            function_name = MODBUS_FUNCTION_CODES.get(fc_int, "UNKNOWN_FUNCTION")

        return {
            "transaction_id": payload.get("transaction_id", payload.get("tid", 1)),
            "unit_id": payload.get("unit_id", payload.get("uid", 1)),
            "function_code": fc_int,
            "function_name": function_name,
            "operation": payload.get("operation", function_name.upper().replace(" ", "_")),
            "address": payload.get("register", payload.get("address", 40001)),
            "quantity": payload.get("quantity", payload.get("count", 1)),
            "values": payload.get("values", payload.get("value")),
            "is_exception": is_exception,
            "exception_code": exception_code,
            "exception_name": exception_name
        }
