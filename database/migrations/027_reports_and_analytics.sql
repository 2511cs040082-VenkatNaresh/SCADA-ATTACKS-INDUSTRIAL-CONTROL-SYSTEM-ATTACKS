-- Migration 027: Reports & Advanced Analytics Subsystem
-- Extends database schema for professional security reporting, scheduling, exports, versioning, and analytics audit.

CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_uuid` VARCHAR(64) NOT NULL UNIQUE,
  `report_number` VARCHAR(32) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `report_type` VARCHAR(64) NOT NULL,
  `description` TEXT NULL,
  `environment` VARCHAR(32) NOT NULL DEFAULT 'LAB',
  `format` VARCHAR(16) NOT NULL DEFAULT 'PDF',
  `time_range_start` DATETIME NULL,
  `time_range_end` DATETIME NULL,
  `filters_json` JSON NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  `version` INT NOT NULL DEFAULT 1,
  `created_by` INT NULL,
  `created_by_username` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_reports_type` (`report_type`),
  INDEX `idx_reports_status` (`status`),
  INDEX `idx_reports_env` (`environment`),
  INDEX `idx_reports_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `report_versions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_id` INT NOT NULL,
  `version_number` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `definition_json` JSON NOT NULL,
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_report_version` (`report_id`, `version_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `report_exports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `export_uuid` VARCHAR(64) NOT NULL UNIQUE,
  `report_id` INT NOT NULL,
  `export_type` VARCHAR(16) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(512) NULL,
  `file_size_bytes` INT NOT NULL DEFAULT 0,
  `sha256_hash` VARCHAR(64) NULL,
  `is_simulation` BOOLEAN NOT NULL DEFAULT FALSE,
  `generated_by` INT NULL,
  `generated_by_username` VARCHAR(64) NULL,
  `generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  INDEX `idx_exports_type` (`export_type`),
  INDEX `idx_exports_created` (`generated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `report_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `schedule_uuid` VARCHAR(64) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `report_type` VARCHAR(64) NOT NULL,
  `frequency` VARCHAR(32) NOT NULL DEFAULT 'WEEKLY',
  `cron_expression` VARCHAR(64) NULL,
  `export_format` VARCHAR(16) NOT NULL DEFAULT 'PDF',
  `environment` VARCHAR(32) NOT NULL DEFAULT 'LAB',
  `filters_json` JSON NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_run_at` DATETIME NULL,
  `next_run_at` DATETIME NULL,
  `created_by` INT NULL,
  `created_by_username` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_schedules_enabled` (`enabled`),
  INDEX `idx_schedules_next_run` (`next_run_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `report_generation_jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_uuid` VARCHAR(64) NOT NULL UNIQUE,
  `report_id` INT NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  `progress_percent` INT NOT NULL DEFAULT 0,
  `error_message` TEXT NULL,
  `started_at` DATETIME NULL,
  `completed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  INDEX `idx_jobs_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `report_audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `log_uuid` VARCHAR(64) NOT NULL UNIQUE,
  `report_id` INT NULL,
  `action` VARCHAR(64) NOT NULL,
  `user_id` INT NULL,
  `user_role` VARCHAR(32) NULL,
  `username` VARCHAR(64) NULL,
  `details_json` JSON NULL,
  `ip_address` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_report_audit_action` (`action`),
  INDEX `idx_report_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
