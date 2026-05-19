CREATE DATABASE IF NOT EXISTS disaster_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE disaster_db;

CREATE TABLE category (
                          id    BIGINT AUTO_INCREMENT PRIMARY KEY,
                          name  VARCHAR(20) NOT NULL UNIQUE,
                          icon  VARCHAR(10),
                          color VARCHAR(7)
);

CREATE TABLE member (
                        id         BIGINT AUTO_INCREMENT PRIMARY KEY,
                        login_id   VARCHAR(50)  NOT NULL UNIQUE,
                        password   VARCHAR(255) NOT NULL,
                        nickname   VARCHAR(30)  NOT NULL UNIQUE,
                        gender     ENUM('MALE','FEMALE','OTHER') NOT NULL,
                        created_at DATETIME NOT NULL DEFAULT NOW()
);

CREATE TABLE report (
                        id          BIGINT AUTO_INCREMENT PRIMARY KEY,
                        member_id   BIGINT       NOT NULL,
                        category_id BIGINT       NOT NULL,
                        title       VARCHAR(100) NOT NULL,
                        content     VARCHAR(500) NOT NULL,
                        latitude    DOUBLE       NOT NULL,
                        longitude   DOUBLE       NOT NULL,
                        status      ENUM('ACTIVE','RESOLVED') NOT NULL DEFAULT 'ACTIVE',
                        created_at  DATETIME NOT NULL DEFAULT NOW(),
                        resolved_at DATETIME,
                        FOREIGN KEY (member_id)   REFERENCES member(id),
                        FOREIGN KEY (category_id) REFERENCES category(id),
                        INDEX idx_status   (status),
                        INDEX idx_category (category_id, status)
);

CREATE TABLE report_image (
                              id            BIGINT AUTO_INCREMENT PRIMARY KEY,
                              report_id     BIGINT       NOT NULL,
                              file_path     VARCHAR(255) NOT NULL,
                              original_name VARCHAR(255) NOT NULL,
                              FOREIGN KEY (report_id) REFERENCES report(id) ON DELETE CASCADE
);

CREATE TABLE sympathy (
                          id         BIGINT AUTO_INCREMENT PRIMARY KEY,
                          report_id  BIGINT   NOT NULL,
                          member_id  BIGINT   NOT NULL,
                          created_at DATETIME NOT NULL DEFAULT NOW(),
                          UNIQUE KEY uq_sympathy (report_id, member_id),
                          FOREIGN KEY (report_id) REFERENCES report(id) ON DELETE CASCADE,
                          FOREIGN KEY (member_id) REFERENCES member(id)
);

INSERT INTO category (name, icon, color) VALUES
                                             ('침수',    '🌊', '#1E90FF'),
                                             ('화재',    '🔥', '#FF4500'),
                                             ('교통',    '🚗', '#FFA500'),
                                             ('낙석',    '🪨', '#8B4513'),
                                             ('정전',    '⚡', '#FFD700'),
                                             ('가스누출', '💨', '#90EE90');