-- 校园二手交易平台 MySQL 8.0 建库脚本
-- 用法：mysql -uroot -p < sql/mysql-schema.sql
-- 然后以 -Dspring.profiles.active=mysql 启动应用（连接信息见 application-mysql.yml）

CREATE DATABASE IF NOT EXISTS campus_market DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE campus_market;

CREATE TABLE IF NOT EXISTS user (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL,
  password    VARCHAR(128) NOT NULL,
  salt        VARCHAR(32)  NOT NULL,
  nickname    VARCHAR(50)  DEFAULT '',
  avatar      VARCHAR(255) DEFAULT '',
  student_id  VARCHAR(30)  DEFAULT '',
  email       VARCHAR(100) DEFAULT '',
  phone       VARCHAR(20)  DEFAULT '',
  campus      VARCHAR(50)  DEFAULT '',
  role        INT DEFAULT 0 COMMENT '0 普通用户 1 管理员',
  status      INT DEFAULT 0 COMMENT '0 正常 1 封禁',
  verified    INT DEFAULT 0 COMMENT '0 未核验 1 已核验',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS category (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(50) NOT NULL,
  parent_id BIGINT DEFAULT 0,
  sort      INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT NOT NULL,
  title          VARCHAR(100) NOT NULL,
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id    BIGINT,
  campus         VARCHAR(50) DEFAULT '',
  images         VARCHAR(2000) DEFAULT '',
  stock          INT DEFAULT 1,
  status         INT DEFAULT 0 COMMENT '0 待审核 1 在售 2 审核拒绝 3 已下架',
  views          INT DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_product_status (status),
  KEY idx_product_category (category_id),
  KEY idx_product_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS favorite (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fav (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_no      VARCHAR(32) NOT NULL,
  product_id    BIGINT NOT NULL,
  buyer_id      BIGINT NOT NULL,
  seller_id     BIGINT NOT NULL,
  title         VARCHAR(100) DEFAULT '',
  image         VARCHAR(255) DEFAULT '',
  price         DECIMAL(10,2) NOT NULL,
  quantity      INT DEFAULT 1,
  status        INT DEFAULT 0 COMMENT '0 待确认 1 待交付 2 已完成 3 已取消',
  meet_location VARCHAR(200) DEFAULT '',
  remark        VARCHAR(500) DEFAULT '',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_orders_buyer (buyer_id),
  KEY idx_orders_seller (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS message (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  sender_id   BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  product_id  BIGINT,
  content     VARCHAR(1000) NOT NULL,
  read_flag   INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_msg_sender (sender_id),
  KEY idx_msg_receiver (receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS review (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id    BIGINT NOT NULL,
  reviewer_id BIGINT NOT NULL,
  target_id   BIGINT NOT NULL,
  rating      INT NOT NULL,
  content     VARCHAR(500) DEFAULT '',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_review (order_id, reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS report (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  reporter_id   BIGINT NOT NULL,
  product_id    BIGINT NOT NULL,
  reason        VARCHAR(500) NOT NULL,
  status        INT DEFAULT 0 COMMENT '0 待处理 1 已处理',
  handle_result VARCHAR(500) DEFAULT '',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS announcement (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(100) NOT NULL,
  content    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始管理员：admin / admin123
INSERT INTO user(username,password,salt,nickname,avatar,student_id,email,phone,campus,role,status,verified,created_at)
SELECT 'admin','1af1683a04d4ba5674846d1fe20210ea0988f64b2acd3bedd57e1a1d7aec8416','c8f3a1','平台管理员','','ADMIN001','admin@campus.edu.cn','','东校区',1,0,1,NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM user WHERE username='admin');
