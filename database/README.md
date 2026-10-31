# ICS-SHIELD Database Subsystem

## Overview
The `database` module houses the complete MySQL 8+ database schema, migration files, seed scripts, query helpers, and documentation for the ICS-SHIELD Real-Time SCADA & Industrial Control System Defense Platform.

## Directory Structure
```
database/
├── schema/
│   └── full_schema.sql         # Unified reference SQL DDL
├── migrations/
│   ├── 001_initial_database.sql
│   ├── 002_identity.sql
│   ├── ...
│   ├── 016_settings.sql
│   └── migrate.js              # Node.js migration engine runner
├── seed/
│   └── 001_dev_seed_data.sql   # Development/lab dataset
├── queries/                    # Production SQL query modules
└── README.md
```

## Running Schema Migrations
```bash
node database/migrations/migrate.js
```

## Applying Seed Data
```bash
mysql -u root -p ics_shield < database/seed/001_dev_seed_data.sql
```
