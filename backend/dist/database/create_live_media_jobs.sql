CREATE TABLE IF NOT EXISTS live_media_jobs (
  id VARCHAR(64) PRIMARY KEY,
  owner_user_id INT NOT NULL,
  status ENUM('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
  progress INT DEFAULT 0,
  asset_id INT NULL,
  error TEXT NULL,
  retries INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_owner_status (owner_user_id, status),
  CONSTRAINT fk_job_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;













