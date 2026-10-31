// Asset Model Placeholder for Phase 1 Foundation
export class AssetModel {
  static async findAll() {
    return [
      { id: 'PLC-MODBUS-01', name: 'Water Substation PLC-01', type: 'PLC', ip: '192.168.1.50', status: 'ONLINE', protocol: 'Modbus TCP' },
      { id: 'RTU-DNP3-02', name: 'Feeder RTU-02', type: 'RTU', ip: '192.168.1.62', status: 'ONLINE', protocol: 'DNP3' },
      { id: 'HMI-SOC-01', name: 'Main Control Room HMI', type: 'HMI', ip: '192.168.1.10', status: 'ONLINE', protocol: 'HTTP/WS' },
    ];
  }
}
