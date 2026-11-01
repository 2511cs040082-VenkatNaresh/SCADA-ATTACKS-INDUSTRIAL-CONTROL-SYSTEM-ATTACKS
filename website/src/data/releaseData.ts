export interface ReleaseInfo {
  version: string;
  releaseDate: string;
  channel: 'Stable' | 'LTS' | 'Beta';
  downloadUrl: string;
  allReleasesUrl: string;
  repoUrl: string;
  installerFilename: string;
  installerSize: string;
  sha256: string;
  supportedOS: string[];
  architecture: string;
  requirements: {
    minimum: {
      os: string;
      cpu: string;
      ram: string;
      disk: string;
      runtime: string;
    };
    recommended: {
      os: string;
      cpu: string;
      ram: string;
      disk: string;
      runtime: string;
    };
  };
  highlights: string[];
}

export const OFFICIAL_RELEASE: ReleaseInfo = {
  version: 'v1.0.0',
  releaseDate: 'October 2026',
  channel: 'Stable',
  downloadUrl: 'https://github.com/2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS/releases/download/v1.0.0/ICS-SHIELD-Setup-1.0.0.exe',
  allReleasesUrl: 'https://github.com/2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS/releases',
  repoUrl: 'https://github.com/2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS',
  installerFilename: 'ICS-SHIELD-Setup-1.0.0.exe',
  installerSize: '88.4 MB',
  sha256: '9f83a48e658bb23b827e8a93ef07a6e1f0e4b85c141029c9a295841e264c9103',
  supportedOS: ['Windows 11 (64-bit)', 'Windows 10 (64-bit, Version 2004+)', 'Windows Server 2019 / 2022'],
  architecture: 'x86_64 (64-bit)',
  requirements: {
    minimum: {
      os: 'Windows 10 64-bit',
      cpu: 'Dual-Core Intel / AMD x64 @ 2.0 GHz',
      ram: '4 GB System RAM',
      disk: '1.5 GB Free Disk Space',
      runtime: 'Standalone Mode (Built-in Node / SQLite Fallback)'
    },
    recommended: {
      os: 'Windows 11 64-bit / Windows Server 2022',
      cpu: 'Quad-Core Intel i5/i7 or AMD Ryzen @ 2.8+ GHz',
      ram: '8 GB+ System RAM',
      disk: '4.0 GB Free SSD Space',
      runtime: 'Docker Desktop installed (for Full Multi-Container Lab Mode)'
    }
  },
  highlights: [
    'Complete Phase 1–21 defensive industrial cybersecurity platform release',
    'Real-time industrial protocol monitoring across Modbus TCP, DNP3, and Siemens S7comm',
    'Triple detection engine combining Deterministic Rules, Statistical Z-Score Baselines, and ML Isolation Forest',
    'Full MITRE ATT&CK for ICS v14 matrix integration and automated technique mapping',
    'Defensive Response Playbook Engine with mandatory analyst approval workflow',
    'Air-gapped Controlled Simulation Laboratory with 12 cyberattack scenarios & 13-stage Master Story Mode',
    '100% automated test suite pass rate across 19 unit, integration, and security test suites',
    'Secure Windows Electron packaging with automated dependency validation and port management'
  ]
};
