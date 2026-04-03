
# 🎟️ Online Event Ticket Booking System

A full-stack web application that enables users to explore, book, and manage event tickets, while allowing organizers and admins to create and manage events efficiently.

---

## 📌 Overview

The **Online Event Ticket Booking System** is designed to simplify the process of event discovery and ticket booking. It provides a seamless experience for users and a powerful management system for organizers and admins.

This project follows a **modern full-stack architecture** using React for the frontend and Spring Boot for the backend, with secure authentication using JWT.

---

## 🚀 Features

### 👤 User Features

* User registration and login
* Browse all available events
* View event details
* Book tickets for events
* View booking history
* Secure authentication using JWT

### 🧑‍💼 Organizer/Admin Features

* Create new events
* Update event details
* Delete events
* Manage all events
* Role-based access control

### 🔐 Security

* JWT-based authentication
* Protected routes and APIs
* Role-based authorization (USER / ADMIN / ORGANIZER)

---

## 🏗️ Tech Stack

### Frontend

* React (with Vite)
* Axios
* React Router

### Backend

* Spring Boot (Java)
* Spring Security
* JWT Authentication

### Database

* MySQL

### Deployment

* Frontend: Vercel
* Backend: Render

---

## 📂 Project Structure

```bash
event-booking-system/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.jsx
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── security/
│   └── config/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/event-booking-system.git
cd event-booking-system
```

---

### 2. Backend Setup (Spring Boot)

#### Configure MySQL

Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/event_db
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

#### Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on:

```
http://localhost:8080
```

---

### 3. Frontend Setup (React + Vite)

#### Install dependencies

```bash
cd frontend
npm install
```

#### Create `.env`

```
VITE_API_BASE_URL=http://localhost:8080/api
```

#### Run frontend

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔐 Authentication Flow

1. User logs in with credentials
2. Backend validates and generates JWT token
3. Token stored in localStorage
4. Token sent with every API request

```
Authorization: Bearer <token>
```

---

## 🔄 Application Workflow

### User Flow

* Register/Login
* Browse events
* Select event
* Book tickets
* View bookings

### Admin Flow

* Login
* Create/Update/Delete events
* Manage system

---

## 📡 API Endpoints

### Authentication

* `POST /api/auth/register` → Register user
* `POST /api/auth/login` → Login

### Events

* `GET /api/events` → Get all events
* `GET /api/events/{id}` → Get event by ID
* `POST /api/events` → Create event
* `PUT /api/events/{id}` → Update event
* `DELETE /api/events/{id}` → Delete event

### Bookings

* `POST /api/bookings` → Book ticket
* `GET /api/bookings/my` → User bookings
* `DELETE /api/bookings/{id}` → Cancel booking

---

## 🗄️ Database Design

### Tables

* Users
* Events
* Bookings

### Relationships

* One User → Many Bookings
* One Event → Many Bookings

---
##Screenshots

## 🧠 Key Concepts Used

* REST API architecture
* Layered backend design (Controller → Service → Repository)
* JWT authentication
* Axios interceptors
* CORS configuration
* Database relationships (Foreign Keys)
* Environment variables

---

## ⚠️ Common Issues & Fixes

| Issue                | Solution                             |
| -------------------- | ------------------------------------ |
| CORS Error           | Allow frontend URL in backend config |
| 403 Forbidden        | Check JWT token / role               |
| DB Connection Failed | Verify MySQL setup                   |

---

## 📈 Future Enhancements

* 🎟️ Seat selection system
* 💳 Payment integration
* 📡 Live events
* 📊 Analytics dashboard
* 📩 Notifications

---

## 📖 What We Have Implemented So Far

* Full user authentication system (JWT)
* Event management (CRUD operations)
* Ticket booking system
* Role-based authorization
* Frontend-backend integration
* Deployment-ready structure
* API-based architecture

---

## 📌 Project Summary

> This is a full-stack event booking system built using React, Spring Boot, and MySQL, implementing secure JWT authentication and a scalable architecture to handle users, events, and bookings efficiently.

---

## 👨‍💻 Author

* Fahad
* GitHub: [https://github.com/fahad-011](https://github.com/fahad-011)

---

## ⭐ Support

If you like this project:

* ⭐ Star the repository
* 🍴 Fork it
* 🚀 Share it
