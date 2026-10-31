# Modbus/TCP Industrial Protocol Monitoring Specification

## Supported Function Codes
- `01` — Read Coils
- `02` — Read Discrete Inputs
- `03` — Read Holding Registers
- `04` — Read Input Registers
- `05` — Write Single Coil
- `06` — Write Single Register
- `15` — Write Multiple Coils
- `16` — Write Multiple Registers

## Exception Response Handling
Modbus exception responses (function code > 128) are captured with exception codes:
- `01` ILLEGAL_FUNCTION
- `02` ILLEGAL_DATA_ADDRESS
- `03` ILLEGAL_DATA_VALUE
- `04` SLAVE_DEVICE_FAILURE

> [!NOTE]
> Protocol exceptions and errors are captured as **informational protocol observations** and are not classified as security attacks until Phase 8 detection rules exist.
