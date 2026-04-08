CREATE TABLE IF NOT EXISTS live_media_assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_user_id INT NOT NULL,
  kind ENUM('live_photo','motion_photo','animated') NOT NULL,
  poster_path VARCHAR(500) NULL,
  video_mp4_path VARCHAR(500) NULL,
  video_webm_path VARCHAR(500) NULL,
  original_image_path VARCHAR(500) NULL,
  original_video_path VARCHAR(500) NULL,
  duration_ms INT NULL,
  width INT NULL,
  height INT NULL,
  fps DECIMAL(6,2) NULL,
  loopable TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_owner (owner_user_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_asset_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




