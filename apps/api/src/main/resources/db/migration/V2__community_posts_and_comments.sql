SET NAMES utf8mb4;

CREATE TABLE community_posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_id BIGINT NOT NULL,
  topic VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url MEDIUMTEXT,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_community_post_author FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE community_post_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  parent_comment_id BIGINT NULL,
  author_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_community_comment_post FOREIGN KEY (post_id) REFERENCES community_posts(id),
  CONSTRAINT fk_community_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES community_post_comments(id),
  CONSTRAINT fk_community_comment_author FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX idx_community_comments_post_id ON community_post_comments(post_id);
CREATE INDEX idx_community_comments_parent_id ON community_post_comments(parent_comment_id);
