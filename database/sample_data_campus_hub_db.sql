-- ============================================================
-- CampusFlow — Sample Data
-- Run AFTER schema.sql
-- All passwords are BCrypt of: Password@123
-- ============================================================

USE campus_hub_db;

-- ============================================================
-- ROLES
-- ============================================================
INSERT IGNORE INTO roles (id, name) VALUES
  (1, 'USER'),
  (2, 'ADMIN'),
  (3, 'TECHNICIAN');

-- ============================================================
-- USERS  (password = Password@123 bcrypt hash)
-- ============================================================
INSERT IGNORE INTO users
  (id, email, full_name, password, phone, department, is_active)
VALUES
  (1, 'admin@campusflow.lk',       'Admin User',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '0711234567', 'IT Department',          TRUE),
  (2, 'john.perera@sliit.lk',      'John Perera',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '0722345678', 'Computer Science',       TRUE),
  (3, 'sara.fernando@sliit.lk',    'Sara Fernando',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '0733456789', 'Information Technology', TRUE),
  (4, 'kamal.silva@campusflow.lk', 'Kamal Silva',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '0744567890', 'Facilities',             TRUE),
  (5, 'nimal.j@sliit.lk',          'Nimal Jayawardena', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '0755678901', 'Computer Science',       TRUE);

-- ============================================================
-- USER ROLES
-- ============================================================
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
  (1, 2), -- admin@       → ADMIN
  (1, 1), -- admin@       → USER
  (2, 1), -- john@        → USER
  (3, 1), -- sara@        → USER
  (4, 3), -- kamal@       → TECHNICIAN
  (5, 1); -- nimal@       → USER

-- ============================================================
-- RESOURCES
-- ============================================================
INSERT IGNORE INTO resources
  (id, name, type, capacity, location, description, availability_windows, status, created_by)
VALUES
  (1,  'Lecture Hall A',       'ROOM',      120,  'Block A - Ground Floor', 'Main lecture hall with projector and surround sound.',             'Mon-Fri 08:00-20:00', 'ACTIVE',            1),
  (2,  'CS Lab 01',            'LAB',        40,  'Block B - 2nd Floor',   'High-performance PCs with IntelliJ, VS Code, MySQL Workbench.',   'Mon-Sat 07:00-22:00', 'ACTIVE',            1),
  (3,  'Conference Room 1',    'ROOM',       20,  'Block C - 3rd Floor',   'Executive room with video conferencing and smart whiteboard.',    'Mon-Fri 09:00-18:00', 'ACTIVE',            1),
  (4,  'IT Lab 02',            'LAB',        35,  'Block B - 1st Floor',   'Networking lab with Cisco routers and cybersecurity tools.',      'Mon-Fri 08:00-21:00', 'ACTIVE',            1),
  (5,  'HD Projector Unit 1',  'EQUIPMENT', NULL, 'AV Store Room',         'Portable HD projector 4000 lumens. Deliver to any room.',         'Mon-Fri 08:00-18:00', 'ACTIVE',            1),
  (6,  'Seminar Room B',       'ROOM',       50,  'Block A - 2nd Floor',   'Mid-size room with smart board and breakout seating.',            'Mon-Sat 08:00-19:00', 'ACTIVE',            1),
  (7,  'Exam Hall 1',          'ROOM',      200,  'Block E - Ground Floor', 'Large exam hall with individual desks and CCTV.',                 'Mon-Sun 06:00-22:00', 'ACTIVE',            1),
  (8,  'CS Lab 02',            'LAB',        40,  'Block B - 2nd Floor',   'Mirror of CS Lab 01. Same software configuration.',              'Mon-Sat 07:00-22:00', 'UNDER_MAINTENANCE', 1),
  (9,  'HDMI Cable Set',       'EQUIPMENT', NULL, 'AV Store Room',         'Set of 5 HDMI cables (1m, 2m, 5m).',                             'Mon-Fri 08:00-18:00', 'ACTIVE',            1),
  (10, 'Board Room',           'ROOM',       10,  'Block D - 4th Floor',   'Private board room for senior meetings. Requires dean approval.', 'Mon-Fri 09:00-17:00', 'ACTIVE',            1);

-- ============================================================
-- BOOKINGS  (use dates well in the future so no conflicts)
-- ============================================================
INSERT IGNORE INTO bookings
  (id, resource_id, requester_id, approved_by, title, purpose,
   start_time, end_time, attendees, status, admin_notes, created_at, updated_at)
VALUES
  (1,  1, 2, 1, 'CS301 Weekly Lecture',          'Weekly lecture for CS301 - Data Structures',
   DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 9 HOUR,
   DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 11 HOUR,
   80,  'APPROVED', 'Confirmed. Please set up projector beforehand.', NOW(), NOW()),

  (2,  2, 3, 1, 'FYP Lab Session',               'Final year project group development session',
   DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 13 HOUR,
   DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 17 HOUR,
   10,  'APPROVED', 'Approved. Please clean up after use.', NOW(), NOW()),

  (3,  3, 2, NULL, 'Team Meeting - Project Alpha','Weekly sync for software engineering project',
   DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 10 HOUR,
   DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 11 HOUR + INTERVAL 30 MINUTE,
   8,   'PENDING', NULL, NOW(), NOW()),

  (4,  6, 5, NULL, 'AI Workshop',                 'Introduction to Machine Learning workshop',
   DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 9 HOUR,
   DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 13 HOUR,
   45,  'PENDING', NULL, NOW(), NOW()),

  (5,  4, 3, 1, 'Network Security Lab',           'Hands-on lab for IT Security module',
   DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 14 HOUR,
   DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 18 HOUR,
   30,  'APPROVED', NULL, NOW(), NOW()),

  (6,  1, 5, 1, 'Guest Lecture - Cloud Computing','Industry expert talk on Cloud Architecture',
   DATE_ADD(NOW(), INTERVAL 8 DAY) + INTERVAL 14 HOUR,
   DATE_ADD(NOW(), INTERVAL 8 DAY) + INTERVAL 16 HOUR,
   100, 'APPROVED', 'Room reserved. AV team notified.', NOW(), NOW()),

  (7,  2, 2, 1, 'Database Lab Practice',          'Extra practice session for Database module',
   DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 10 HOUR,
   DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 12 HOUR,
   20,  'REJECTED', 'Lab already booked for internal use during this slot.', NOW(), NOW()),

  (8,  3, 5, NULL, 'FYP Supervisor Meeting',      'Monthly meeting with FYP supervisor',
   DATE_ADD(NOW(), INTERVAL 9 DAY) + INTERVAL 15 HOUR,
   DATE_ADD(NOW(), INTERVAL 9 DAY) + INTERVAL 16 HOUR,
   4,   'PENDING', NULL, NOW(), NOW());

-- ============================================================
-- TICKETS  (only valid categories: MAINTENANCE, ELECTRICAL, PLUMBING, IT, SAFETY, OTHER)
-- ============================================================
INSERT IGNORE INTO tickets
  (id, created_by, assigned_to, resource_id, title, description,
   category, priority, status, preferred_contact, resolution_notes,
   created_at, updated_at, resolved_at)
VALUES
  (1, 2, 4, 2, 'Projector not working in CS Lab 01',
   'The ceiling projector is not displaying output. Tried multiple cables and laptops. Error light blinks red.',
   'IT', 'HIGH', 'IN_PROGRESS', '0722345678', NULL,
   NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY, NULL),

  (2, 3, NULL, 1, 'AC not cooling in Lecture Hall A',
   'Air conditioning is running but not cooling. Room temperature is very high during afternoon lectures.',
   'MAINTENANCE', 'MEDIUM', 'OPEN', '0733456789', NULL,
   NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY, NULL),

  (3, 5, 4, 4, 'Network switch down in IT Lab 02',
   'Network switch in row 3 is down. Workstations 25-35 have no internet connection.',
   'IT', 'CRITICAL', 'RESOLVED', '0755678901', 'Replaced faulty switch. All stations back online.',
   NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),

  (4, 2, NULL, 3, 'Whiteboard markers missing - Conference Room 1',
   'No working markers in Conference Room 1. Whiteboard is not usable. Please restock urgently.',
   'OTHER', 'LOW', 'OPEN', '0722345678', NULL,
   NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, NULL),

  (5, 3, 4, 2, 'PCs very slow - CS Lab 01 stations 1-10',
   'Computers 1-10 are extremely slow. Antivirus scan shows multiple infections. Needs reimaging.',
   'IT', 'HIGH', 'IN_PROGRESS', '0733456789', NULL,
   NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 2 DAY, NULL),

  (6, 5, 4, NULL, 'Broken chair in Block A corridor Level 2',
   'A chair leg is completely snapped off. It is a safety hazard. Please remove and replace immediately.',
   'SAFETY', 'MEDIUM', 'CLOSED', '0755678901', 'Broken chair removed and replaced with new one.',
   NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),

  (7, 2, NULL, 1, 'Microphone feedback in Lecture Hall A',
   'Microphone produces loud feedback above 50% volume. Very disruptive during lectures.',
   'ELECTRICAL', 'HIGH', 'OPEN', '0722345678', NULL,
   NOW(), NOW(), NULL),

  (8, 3, 4, NULL, 'Toilet blockage - Ladies Block B Level 1',
   'Toilet is blocked and out of order since yesterday morning. Affects all staff on that floor.',
   'PLUMBING', 'CRITICAL', 'RESOLVED', '0733456789', 'Plumber cleared blockage. Fully operational.',
   NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY);

-- ============================================================
-- COMMENTS
-- ============================================================
INSERT IGNORE INTO comments
  (id, ticket_id, author_id, body, is_internal, created_at, updated_at)
VALUES
  (1, 1, 4, 'Checked the projector. The lamp needs replacement. Part has been ordered, arrives in 2 days.',       FALSE, NOW() - INTERVAL 1 DAY,    NOW() - INTERVAL 1 DAY),
  (2, 1, 2, 'Thank you Kamal. Please let me know as soon as it is fixed — I have a lab demo on Friday.',          FALSE, NOW() - INTERVAL 12 HOUR,  NOW() - INTERVAL 12 HOUR),
  (3, 3, 4, 'Switch replaced. All 10 workstations are back online. Please verify and confirm.',                    FALSE, NOW() - INTERVAL 1 DAY,    NOW() - INTERVAL 1 DAY),
  (4, 3, 5, 'Confirmed — all stations working perfectly. Thank you for the fast fix!',                            FALSE, NOW() - INTERVAL 20 HOUR,  NOW() - INTERVAL 20 HOUR),
  (5, 5, 4, 'Workstations 1-5 have been reimaged and are working. Starting on 6-10 now.',                        FALSE, NOW() - INTERVAL 2 DAY,    NOW() - INTERVAL 2 DAY),
  (6, 5, 1, 'Please prioritise — CS301 lab exam is on Friday morning.',                                           TRUE,  NOW() - INTERVAL 2 DAY,    NOW() - INTERVAL 2 DAY),
  (7, 7, 1, 'Logged with AV team. Inspection scheduled for Monday 9am.',                                          FALSE, NOW(),                      NOW()),
  (8, 8, 4, 'Plumber has been contacted. Expected arrival within 2 hours.',                                       FALSE, NOW() - INTERVAL 4 DAY,    NOW() - INTERVAL 4 DAY);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT IGNORE INTO notifications
  (id, user_id, type, title, message, is_read, ref_type, ref_id, created_at)
VALUES
  (1,  2, 'BOOKING_UPDATE', 'Booking Approved',       'Your booking "CS301 Weekly Lecture" has been approved.',                                FALSE, 'BOOKING', 1, NOW() - INTERVAL 2 DAY),
  (2,  3, 'BOOKING_UPDATE', 'Booking Approved',       'Your booking "FYP Lab Session" has been approved.',                                      FALSE, 'BOOKING', 2, NOW() - INTERVAL 1 DAY),
  (3,  2, 'BOOKING_UPDATE', 'Booking Rejected',       'Your booking "Database Lab Practice" was rejected. Reason: Lab already booked.',         TRUE,  'BOOKING', 7, NOW() - INTERVAL 3 DAY),
  (4,  4, 'ASSIGNMENT',     'Ticket Assigned to You', '"Projector not working in CS Lab 01" has been assigned to you.',                         FALSE, 'TICKET',  1, NOW() - INTERVAL 3 DAY),
  (5,  4, 'ASSIGNMENT',     'Ticket Assigned to You', '"Network switch down in IT Lab 02" has been assigned to you.',                           TRUE,  'TICKET',  3, NOW() - INTERVAL 7 DAY),
  (6,  5, 'TICKET_UPDATE',  'Ticket Resolved',        'Your ticket "Network switch down in IT Lab 02" has been resolved.',                      FALSE, 'TICKET',  3, NOW() - INTERVAL 1 DAY),
  (7,  2, 'COMMENT_ADDED',  'New Comment on Ticket',  'Kamal Silva commented on your ticket "Projector not working in CS Lab 01".',             FALSE, 'TICKET',  1, NOW() - INTERVAL 1 DAY),
  (8,  4, 'ASSIGNMENT',     'Ticket Assigned to You', '"PCs very slow - CS Lab 01 stations 1-10" has been assigned to you.',                    FALSE, 'TICKET',  5, NOW() - INTERVAL 5 DAY),
  (9,  3, 'BOOKING_UPDATE', 'Booking Approved',       'Your booking "Network Security Lab" has been approved.',                                  TRUE,  'BOOKING', 5, NOW() - INTERVAL 2 DAY),
  (10, 5, 'BOOKING_UPDATE', 'Booking Approved',       'Your booking "Guest Lecture - Cloud Computing" has been approved.',                       FALSE, 'BOOKING', 6, NOW() - INTERVAL 1 DAY),
  (11, 3, 'TICKET_UPDATE',  'Ticket Closed',          'Your ticket "Broken chair in Block A corridor" has been closed. Issue resolved.',         TRUE,  'TICKET',  6, NOW() - INTERVAL 3 DAY),
  (12, 3, 'TICKET_UPDATE',  'Ticket Resolved',        'Your ticket "Toilet blockage" has been resolved.',                                        FALSE, 'TICKET',  8, NOW() - INTERVAL 2 DAY);

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================
INSERT IGNORE INTO notification_preferences
  (user_id, booking_updates, ticket_updates, comment_alerts, assignments, system_alerts)
VALUES
  (1, TRUE,  TRUE,  TRUE,  TRUE,  TRUE),
  (2, TRUE,  TRUE,  TRUE,  TRUE,  TRUE),
  (3, TRUE,  TRUE,  TRUE,  FALSE, TRUE),
  (4, TRUE,  TRUE,  TRUE,  TRUE,  TRUE),
  (5, TRUE,  FALSE, TRUE,  TRUE,  TRUE);

SELECT '✅ CampusFlow sample data inserted successfully!' AS status;
SELECT CONCAT('Users: ', COUNT(*)) AS info FROM users;
SELECT CONCAT('Resources: ', COUNT(*)) AS info FROM resources;
SELECT CONCAT('Bookings: ', COUNT(*)) AS info FROM bookings;
SELECT CONCAT('Tickets: ', COUNT(*)) AS info FROM tickets;
SELECT CONCAT('Notifications: ', COUNT(*)) AS info FROM notifications;