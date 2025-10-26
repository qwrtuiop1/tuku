ALTER TABLE live_media_jobs
MODIFY COLUMN status ENUM('queued','processing','completed','failed','cancelled') NOT NULL DEFAULT 'queued';


