-- ============================================================
-- Smart Campus Operations Hub — Database Schema
-- MySQL 8.x compatible
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus_hub_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_hub_db;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(50)  NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    google_id       VARCHAR(255)  UNIQUE,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    full_name       VARCHAR(255)  NOT NULL,
    avatar_url      VARCHAR(512),
    password        VARCHAR(255),
    phone           VARCHAR(20),
    department      VARCHAR(100),
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ============================================================
-- 3. USER_ROLES (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- ============================================================
-- 4. RESOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
    id                   BIGINT        NOT NULL AUTO_INCREMENT,
    name                 VARCHAR(255)  NOT NULL,
    type                 VARCHAR(50)   NOT NULL,
    capacity             INT,
    location             VARCHAR(255)  NOT NULL,
    description          TEXT,
    availability_windows VARCHAR(255),
    status               VARCHAR(30)   NOT NULL DEFAULT 'ACTIVE',
    image_url            VARCHAR(512),
    created_by           BIGINT        NOT NULL,
    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_res_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

-- ============================================================
-- 5. BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    resource_id     BIGINT        NOT NULL,
    requester_id    BIGINT        NOT NULL,
    approved_by     BIGINT,
    title           VARCHAR(255)  NOT NULL,
    purpose         TEXT          NOT NULL,
    start_time      DATETIME      NOT NULL,
    end_time        DATETIME      NOT NULL,
    attendees       INT           DEFAULT 1,
    status          VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    admin_notes     TEXT,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_bk_resource    FOREIGN KEY (resource_id)  REFERENCES resources (id),
    CONSTRAINT fk_bk_requester   FOREIGN KEY (requester_id) REFERENCES users (id),
    CONSTRAINT fk_bk_approved_by FOREIGN KEY (approved_by)  REFERENCES users (id),
    CONSTRAINT chk_bk_times CHECK (end_time > start_time)
);

CREATE INDEX idx_bookings_resource_times ON bookings (resource_id, start_time, end_time);
CREATE INDEX idx_bookings_requester      ON bookings (requester_id);
CREATE INDEX idx_bookings_status         ON bookings (status);

-- ============================================================
-- 6. TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    created_by        BIGINT        NOT NULL,
    assigned_to       BIGINT,
    resource_id       BIGINT,
    title             VARCHAR(255)  NOT NULL,
    description       TEXT          NOT NULL,
    category          VARCHAR(50)   NOT NULL,
    priority          VARCHAR(20)   NOT NULL DEFAULT 'MEDIUM',
    status            VARCHAR(30)   NOT NULL DEFAULT 'OPEN',
    preferred_contact VARCHAR(255),
    resolution_notes  TEXT,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at       DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_tk_created_by  FOREIGN KEY (created_by)  REFERENCES users (id),
    CONSTRAINT fk_tk_assigned_to FOREIGN KEY (assigned_to) REFERENCES users (id),
    CONSTRAINT fk_tk_resource    FOREIGN KEY (resource_id) REFERENCES resources (id)
);

CREATE INDEX idx_tickets_status      ON tickets (status);
CREATE INDEX idx_tickets_assigned_to ON tickets (assigned_to);
CREATE INDEX idx_tickets_created_by  ON tickets (created_by);

-- ============================================================
-- 7. TICKET_IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_images (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    ticket_id   BIGINT        NOT NULL,
    image_url   VARCHAR(512)  NOT NULL,
    file_name   VARCHAR(255),
    uploaded_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ti_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
);

-- ============================================================
-- 8. COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    id          BIGINT    NOT NULL AUTO_INCREMENT,
    ticket_id   BIGINT    NOT NULL,
    author_id   BIGINT    NOT NULL,
    body        TEXT      NOT NULL,
    is_internal BOOLEAN   NOT NULL DEFAULT FALSE,
    created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_cm_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_author FOREIGN KEY (author_id) REFERENCES users   (id)
);

-- ============================================================
-- 9. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    user_id     BIGINT        NOT NULL,
    type        VARCHAR(50)   NOT NULL,
    title       VARCHAR(255)  NOT NULL,
    message     TEXT          NOT NULL,
    is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
    ref_type    VARCHAR(30),
    ref_id      BIGINT,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_nf_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);

-- ============================================================
-- 10. NOTIFICATION_PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id               BIGINT  NOT NULL AUTO_INCREMENT,
    user_id          BIGINT  NOT NULL UNIQUE,
    booking_updates  BOOLEAN NOT NULL DEFAULT TRUE,
    ticket_updates   BOOLEAN NOT NULL DEFAULT TRUE,
    comment_alerts   BOOLEAN NOT NULL DEFAULT TRUE,
    assignments      BOOLEAN NOT NULL DEFAULT TRUE,
    system_alerts    BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT fk_np_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO roles (name) VALUES ('USER'), ('ADMIN'), ('TECHNICIAN');

INSERT INTO users (email, full_name, is_active)
VALUES ('admin@smartcampus.edu', 'System Administrator', TRUE);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'admin@smartcampus.edu' AND r.name IN ('USER', 'ADMIN');

INSERT INTO resources (name, type, capacity, location, description, status, created_by)
SELECT 'Lecture Hall A', 'ROOM', 200, 'Block A, Floor 1',
       'Main lecture hall with projector and sound system', 'ACTIVE', u.id
FROM users u WHERE u.email = 'admin@smartcampus.edu';

INSERT INTO resources (name, type, capacity, location, description, status, created_by)
SELECT 'Computer Lab 01', 'LAB', 40, 'Block B, Floor 2',
       'High-performance PCs with development software', 'ACTIVE', u.id
FROM users u WHERE u.email = 'admin@smartcampus.edu';

INSERT INTO resources (name, type, capacity, location, description, status, created_by)
SELECT 'Conference Room C', 'ROOM', 20, 'Block C, Floor 3',
       'Executive conference room with video conferencing', 'ACTIVE', u.id
FROM users u WHERE u.email = 'admin@smartcampus.edu';

INSERT INTO resources (name, type, capacity, location, description, status, created_by)
SELECT 'Projector Unit #5', 'EQUIPMENT', NULL, 'AV Store, Block A',
       'Portable HD projector, 4000 lumens', 'ACTIVE', u.id
FROM users u WHERE u.email = 'admin@smartcampus.edu';