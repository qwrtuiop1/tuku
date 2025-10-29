CREATE TABLE IF NOT EXISTS live_media_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  label VARCHAR(32) NOT NULL, -- 如 360p/480p/720p/1080p
  width INT NULL,
  height INT NULL,
  bitrate_k INT NULL,
  mp4_path VARCHAR(500) NULL,
  webm_path VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_asset_label (asset_id, label),
  INDEX idx_asset (asset_id),
  CONSTRAINT fk_variant_asset FOREIGN KEY (asset_id) REFERENCES live_media_assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;















