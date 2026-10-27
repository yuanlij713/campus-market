-- 校园二手交易平台数据库结构（H2 MySQL 兼容模式 / MySQL 8.0 通用语法）

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
  CONSTRAINT uk_user_username UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS category (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(50) NOT NULL,
  parent_id BIGINT DEFAULT 0,
  sort      INT DEFAULT 0
);

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
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorite (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_fav UNIQUE (user_id, product_id)
);

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
  CONSTRAINT uk_order_no UNIQUE (order_no)
);

CREATE TABLE IF NOT EXISTS message (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  sender_id   BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  product_id  BIGINT,
  content     VARCHAR(1000) NOT NULL,
  read_flag   INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id    BIGINT NOT NULL,
  reviewer_id BIGINT NOT NULL,
  target_id   BIGINT NOT NULL,
  rating      INT NOT NULL,
  content     VARCHAR(500) DEFAULT '',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_review UNIQUE (order_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS report (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  reporter_id   BIGINT NOT NULL,
  product_id    BIGINT NOT NULL,
  reason        VARCHAR(500) NOT NULL,
  status        INT DEFAULT 0 COMMENT '0 待处理 1 已处理',
  handle_result VARCHAR(500) DEFAULT '',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcement (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(100) NOT NULL,
  content    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
