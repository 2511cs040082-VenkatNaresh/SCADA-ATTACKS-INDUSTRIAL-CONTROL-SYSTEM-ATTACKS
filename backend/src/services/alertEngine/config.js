export const ALERT_CONFIG = {
  // SLA Target Deadlines in Minutes
  sla_targets: {
    P1: { ack_minutes: 5, resolve_minutes: 60 },
    P2: { ack_minutes: 15, resolve_minutes: 120 },
    P3: { ack_minutes: 30, resolve_minutes: 240 },
    P4: { ack_minutes: 60, resolve_minutes: 720 }
  },
  
  // Default windows
  deduplication_window_seconds: 60,
  correlation_window_seconds: 300,
  
  // Alert Flood Protection
  flood_protection: {
    rate_limit_per_minute: 50,
    cooldown_seconds: 120
  },
  
  // Notification Cooldown per alert/channel
  notification_cooldown_seconds: 300,
  
  // Retention default
  retention_days: 90
};
