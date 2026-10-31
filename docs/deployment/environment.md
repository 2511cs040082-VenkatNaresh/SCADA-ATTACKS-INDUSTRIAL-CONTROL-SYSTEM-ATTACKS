# Phase 21 — Environment Variable Reference

| Variable Category | Key Name | Default Value | Description |
|---|---|---|---|
| **System** | `NODE_ENV` | `production` | Execution mode (`development`, `test`, `production`) |
| **System** | `PORT` | `5050` | Backend API port |
| **Database** | `DATABASE_HOST` | `mysql` | MySQL hostname / service name |
| **Database** | `DATABASE_NAME` | `ics_shield` | Database catalog name |
| **Database** | `DATABASE_USER` | `icsshield_user` | Non-root database user |
| **Security** | `JWT_SECRET` | *(REQUIRED)* | HS256 JWT signature secret (32+ chars) |
| **Security** | `SALT_ROUNDS` | `12` | bcrypt password hashing cost factor |
| **Services** | `DETECTION_SERVICE_URL` | `http://detection-engine:8080` | Python ML detection engine endpoint |
| **Services** | `ICS_LAB_SERVICE_URL` | `http://ics-lab:8085` | Isolated simulator service endpoint |
| **Simulation** | `ALLOW_REAL_INFRASTRUCTURE_CONNECT` | `false` | MUST remain false. Safety boundary control |
