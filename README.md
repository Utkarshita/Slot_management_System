# Slot Management System

A full-stack web application developed to streamline the scheduling and management of **Internal Assessment (IA)** and **Laboratory Continuous Assessment (Lab CA)** at **K. J. Somaiya College of Engineering**.

The application provides dedicated portals for **Faculty** and **Students**, enabling faculty members to efficiently schedule examinations while allowing students to view their examination timetables through an interactive calendar interface.

---

## Features

### Faculty Portal

- Secure faculty authentication using **JWT**
- Book IA and Lab CA examination slots
- Manage bookings for multiple academic years
- Edit and delete existing bookings
- Automatic slot conflict detection
- Send email notifications after successful booking
- Interactive calendar for managing schedules

### Student Portal

- Student login using Somaiya email
- View IA and Lab CA schedules
- Interactive calendar interface
- Filter timetable by division and laboratory batch

### Interactive Calendar

- Built using **FullCalendar**
- Displays booked examination slots
- Organized by academic year, division, and batch
- Responsive calendar interface

### Role-Based Access Control

#### Faculty

- Book Slots
- Edit Slots
- Delete Slots
- View Calendar

#### Students

- View Calendar

---

# Key Functionalities

- JWT Authentication
- Faculty-only slot management
- Student timetable portal
- Real-time slot conflict validation
- Email notifications using Nodemailer
- Responsive React UI
- RESTful API architecture
- MongoDB database integration

---

# Tech Stack

## Frontend

- React.js
- Vite
- React Router DOM
- Axios
- FullCalendar
- Lucide React
- HTML5
- CSS3

## Backend

- Node.js
- Express.js
- JWT
- Nodemailer

## Database

- MongoDB
- Mongoose

## Additional Packages

- dotenv
- body-parser
- cors

---

#  Authentication

Faculty authentication is implemented using **JSON Web Tokens (JWT)**.

After successful login:

- JWT token is generated
- Token is stored securely in Local Storage
- Protected routes validate the token
- Unauthorized users are redirected to the login page

---

# Email Notifications

After a slot is successfully booked, faculty members can send email notifications containing:

- Faculty Name
- Course
- Division
- Batch
- Date
- Time
- Venue

using **Nodemailer**.

---

# Slot Conflict Detection

Before creating a booking, the application validates:

- Date
- Start Time
- End Time
- Venue

If another booking already exists for the selected venue during the chosen time, the request is rejected, preventing scheduling conflicts.

---
