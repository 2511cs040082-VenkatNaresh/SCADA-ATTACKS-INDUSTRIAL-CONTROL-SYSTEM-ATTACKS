# User & Session Management

## User Administration Workflow

Administrators can manage operator accounts via `/admin/users` or `/api/v1/admin/users`:
- **Create User**: Requires password strength (min 8 chars), unique username/email, valid role assignment (`ADMIN`, `SECURITY_ANALYST`, `SOC_OPERATOR`, `OT_OPERATOR`, `VIEWER`).
- **Disable/Enable User**: Deactivates account instantly, preventing new logins and invalidating active JWT sessions.
- **Password Reset**: Hashes passwords using bcrypt algorithm (salt rounds: 10). Plaintext passwords are never stored or displayed.
- **Session Management**: Lists active sessions with user, IP, user-agent, login time, and expiration. Supports single session revocation and force logout for all user sessions.
