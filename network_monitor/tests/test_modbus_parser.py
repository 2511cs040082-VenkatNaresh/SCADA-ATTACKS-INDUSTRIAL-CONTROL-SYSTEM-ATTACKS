import unittest
from network_monitor.protocols.modbus.modbus_parser import ModbusParser
from network_monitor.protocols.modbus.modbus_adapter import ModbusProtocolAdapter
from network_monitor.correlation.transaction_correlator import TransactionCorrelator

class TestModbusMonitoring(unittest.TestCase):
    def test_modbus_fc03_parsing(self):
        payload = {
            "transaction_id": 101,
            "unit_id": 1,
            "function_code": 3,
            "address": 40001,
            "quantity": 10
        }
        parsed = ModbusParser.parse_payload(payload)
        self.assertEqual(parsed["function_code"], 3)
        self.assertEqual(parsed["function_name"], "Read Holding Registers")
        self.assertEqual(parsed["address"], 40001)

    def test_unknown_function_code(self):
        payload = {
            "transaction_id": 102,
            "unit_id": 1,
            "function_code": 99
        }
        parsed = ModbusParser.parse_payload(payload)
        self.assertEqual(parsed["function_code"], 99)
        self.assertEqual(parsed["function_name"], "UNKNOWN_FUNCTION")

    def test_modbus_adapter_normalization(self):
        adapter = ModbusProtocolAdapter()
        raw = {
            "protocol": "MODBUS_TCP",
            "source": {"asset_id": "HMI-001"},
            "payload": {
                "destination_asset": "PLC-001",
                "function_code": 6,
                "address": 40004,
                "value": 100
            }
        }
        event = adapter.normalize(raw)
        self.assertEqual(event.protocol, "MODBUS_TCP")
        self.assertEqual(event.source_asset_id, "HMI-001")
        self.assertEqual(event.destination_asset_id, "PLC-001")

    def test_transaction_correlation(self):
        correlator = TransactionCorrelator()
        adapter = ModbusProtocolAdapter()

        # 1. Request Event
        req_raw = {
            "protocol": "MODBUS_TCP",
            "source": {"asset_id": "HMI-001"},
            "payload": {
                "destination_asset": "PLC-001",
                "message_type": "REQUEST",
                "transaction_id": 55,
                "function_code": 3
            }
        }
        req_evt = adapter.normalize(req_raw)
        tx1 = correlator.process_event(req_evt)
        self.assertIsNone(tx1)  # Request pending

        # 2. Response Event
        res_raw = {
            "protocol": "MODBUS_TCP",
            "source": {"asset_id": "PLC-001"},
            "payload": {
                "destination_asset": "HMI-001",
                "message_type": "RESPONSE",
                "transaction_id": 55,
                "function_code": 3
            }
        }
        res_evt = adapter.normalize(res_raw)
        tx2 = correlator.process_event(res_evt)

        self.assertIsNotNone(tx2)
        self.assertEqual(tx2["transaction_id"], 55)
        self.assertTrue(tx2["matched"])

if __name__ == "__main__":
    unittest.main()
