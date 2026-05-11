-- 标签系统
CREATE TABLE IF NOT EXISTS file_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tag_name VARCHAR(50) NOT NULL,
  tag_color VARCHAR(20) DEFAULT '#409EFF',
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_tag (user_id, tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS file_tag_relations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  file_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES file_tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_file_tag (file_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
