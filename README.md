# CampusFlow — Smart Campus Operations Hub
<<<<<<< HEAD

> IT3030 Programming and Frameworks (PAF) Assignment 2026 — Group 58

CampusFlow is a full-stack web application designed to streamline campus operations at SLIIT. It provides a centralized platform for managing facility bookings, support tickets, resources, and real-time notifications — all with role-based access control.

---
=======
IT3030 PAF Assignment 2026 — Group 58
>>>>>>> 126d09b709bd70fbb002c4b9aca98d178a3e6c01

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 17 |
| Frontend | React 18, Vite, Tailwind CSS |
| Database | MySQL 8 (Aiven Cloud) |
| Auth | JWT + Google OAuth2 + Microsoft OAuth2 |
| File Storage | Cloudinary |
| Email | Gmail SMTP |
| CI/CD | GitHub Actions |

---

## Features

- JWT + Google/Microsoft OAuth2 authentication
- Role-based access: Admin, User, Technician
- Resource management (rooms, labs, equipment)
- Slot-based facility booking with conflict detection
- QR code check-in for approved bookings
- Support ticket system with image attachments
- Real-time in-app notifications with user preferences
- Admin analytics dashboard (usage stats, SLA timers)

---

## Prerequisites

Make sure you have these installed before running the project:

- **Java 17** — [Download](https://adoptium.net/)
- **Maven 3.8+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

> No local MySQL installation required — the project uses Aiven Cloud MySQL.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ayeshsenadheera7/IT3030-PAF-2026-smart-campus-group58.git
cd IT3030-PAF-2026-smart-campus-group58
```

---

### 2. Configure Environment Variables



---

### 3. Run the Backend

Open a terminal and run:

```bash
cd backend
mvn spring-boot:run
```

Wait until you see:

```
Started CampusFlowApplication on port 8080
```

The backend API will be available at: `http://localhost:8080`

---

### 4. Run the Frontend

Open a **second terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173`

> ⚠️ Both backend and frontend must be running at the same time.

---

### 5. Login

Open your browser and go to: `http://localhost:5173`

Use one of the following sample accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusflow.lk | Password@123 |
| User | john.perera@sliit.lk | Password@123 |
| Technician | kamal.silva@campusflow.lk | Password@123 |

Or login with **Google OAuth2** using your Google account.

---

## Project Structure

```
IT3030-PAF-2026-smart-campus-group58/
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/com/smartcampus/
│   │   ├── controller/       # REST controllers
│   │   ├── service/          # Business logic
│   │   ├── repository/       # JPA repositories
│   │   ├── entity/           # Database entities
│   │   ├── dto/              # Request/response DTOs
│   │   ├── security/         # JWT + OAuth2 config
│   │   └── config/           # App configuration
│   └── src/main/resources/
│       └── application.properties
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Shared components
│   │   ├── api/              # API client modules
│   │   ├── context/          # React context providers
│   │   └── routes/           # Route guards
│   └── package.json
├── database/
│   ├── schema.sql            # Database schema
│   └── sample_data.sql       # Sample data
└── .github/workflows/
    └── ci-cd.yml             # GitHub Actions CI/CD
```

---

## API Endpoints

| Module | Base URL |
|--------|----------|
| Auth | `/api/auth` |
| Users | `/api/admin/users` |
| Resources | `/api/resources` |
| Bookings | `/api/bookings` |
| Tickets | `/api/tickets` |
| Notifications | `/api/notifications` |
| Dashboard | `/api/dashboard` |

---

## Group Members

| Student ID | Name | Module |
|------------|------|--------|
| IT23836518 | Deepthika H.M.L.S | Resource Management + QR Check-in |
| IT23820982 | Kalhara W A D S | Booking Management + Notification Preferences |
| IT23841772 | R.D.I.H.Rajapaksha | Support Tickets + SLA Timer |
| IT23668768 | SENADHEERA D A R S | Auth, Infrastructure & Analytics |

---

## References

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Aiven MySQL](https://aiven.io/mysql)
- [Cloudinary](https://cloudinary.com/documentation)
- [JWT.io](https://jwt.io/introduction)
