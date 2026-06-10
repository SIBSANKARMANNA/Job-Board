# 🚀 Internship Job Board Platform

A full-stack Internship Job Board application built with **Node.js, Express, MongoDB, React, JWT Authentication, Redis Caching, and Swagger API Documentation**.

The platform enables employers to post internship opportunities, applicants to discover and apply for internships, and administrators to manage the platform through role-based access control.

---

## 📌 Features

### 🌐 Public Features

- View all internship openings
- Search internships by keyword
- Filter internships by:
  - Location
  - Internship Type (Remote / Onsite / Hybrid)
  - Skills
- Sort internships by:
  - Newest
  - Oldest
  - Highest Stipend
  - Lowest Stipend
- Pagination support for scalable data loading

---

### 👨‍🎓 Applicant Features

- Register & Login
- JWT-based Authentication
- View available internships
- Apply for internships
- Submit:
  - Cover Letter
  - Resume URL
- View all submitted applications
- Track application status:
  - Pending
  - Reviewed
  - Shortlisted
  - Rejected
  - Accepted

---

### 🏢 Employer Features

- Register & Login
- Create internship postings
- Update internship postings
- Delete internship postings
- View all posted internships
- View applicants for each internship
- Review applicant details
- Update application status
- Add employer notes

---

### 👨‍💼 Admin Features

- Full employer permissions
- Access platform statistics
- Manage users
- Moderate internships

---

## 🔐 Authentication & Authorization

Implemented using:

- JWT Authentication
- Password Hashing with bcryptjs
- Protected Routes
- Role-Based Access Control (RBAC)

### Roles

```text
applicant
employer
admin
```

---

## 🛡 Security Best Practices

### Authentication

- JWT Access Tokens
- Protected APIs
- Role-based route restrictions

### Validation

Implemented using:

- Joi
- Validator.js

Validates:

- Emails
- Passwords
- Query parameters
- Request bodies

### Input Protection

- Request validation middleware
- Centralized error handling
- MongoDB injection prevention
- Secure password hashing

---

## ⚡ Scalability Features

### Pagination

Implemented for:

- Internship listings
- Employer postings

Example:

```http
GET /api/v1/internships?page=1&limit=10
```

---

### Caching

Implemented using Redis.

Cached endpoints include:

- Internship listings
- User-specific application data

Benefits:

- Reduced database load
- Faster response times
- Improved scalability

---

### Logging

Implemented using Winston.

Logs:

- Application events
- Redis connection status
- Runtime errors

---

### Modular Architecture

```text
src/
├── controllers/
├── models/
├── routes/
│   └── v1/
├── middleware/
├── validators/
├── utils/
├── config/
└── app.js
```

Designed to support:

- Additional modules
- API versioning
- Future microservices migration

---

## 🧱 Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Joi
- Validator.js
- Redis
- Winston
- Swagger

### Frontend

- React.js
- React Router
- Axios
- Context API
- React Hot Toast

---

# API Versioning

```text
/api/v1
```

Future versions can be added without breaking existing clients.

Example:

```text
/api/v2
```

---

# API Documentation

Swagger UI available at:

```text
http://localhost:5000/api-docs
```

Provides:

- Endpoint testing
- Request/response schemas
- Authentication support

---

# Database Schema

## User

```javascript
{
  name,
  email,
  password,
  role,
  companyName,
  skills,
  bio,
  isActive
}
```

---

## Internship

```javascript
{
  title,
  companyName,
  description,
  location,
  type,
  stipend,
  duration,
  skills,
  openings,
  applicationDeadline,
  postedBy,
  applicationsCount
}
```

---

## Application

```javascript
{
  internship,
  applicant,
  coverLetter,
  resumeUrl,
  status,
  employerNote
}
```

---

# REST API Endpoints

## Authentication

### Register

```http
POST /api/v1/auth/register
```

### Login

```http
POST /api/v1/auth/login
```

### Current User

```http
GET /api/v1/auth/me
```

### Update Profile

```http
PATCH /api/v1/auth/me
```

---

## Internships

### Get All Internships

```http
GET /api/v1/internships
```

Supports:

```http
?page=1
&limit=10
&search=react
&location=dhaka
&type=remote
&skills=react,node
&sort=newest
```

---

### Get Internship Details

```http
GET /api/v1/internships/:id
```

---

### Create Internship

```http
POST /api/v1/internships
```

Role:

```text
Employer / Admin
```

---

### Update Internship

```http
PATCH /api/v1/internships/:id
```

Role:

```text
Owner / Admin
```

---

### Delete Internship

```http
DELETE /api/v1/internships/:id
```

Role:

```text
Owner / Admin
```

---

### Employer Postings

```http
GET /api/v1/internships/employer/my-postings
```

Role:

```text
Employer / Admin
```

---

### Get Internship Applications

```http
GET /api/v1/internships/:id/applications
```

Role:

```text
Employer / Admin
```

---

## Applications

### Apply for Internship

```http
POST /api/v1/internships/:id/apply
```

Role:

```text
Applicant
```

---

### My Applications

```http
GET /api/v1/applications/my-applications
```

Role:

```text
Applicant
```

---

### Update Application Status

```http
PATCH /api/v1/applications/:id/status
```

Role:

```text
Employer / Admin
```

Statuses:

```text
reviewed
shortlisted
rejected
accepted
```

---

# Frontend Features

## Applicant Dashboard

- Browse internships
- Apply for internships
- Track application status

---

## Employer Dashboard

- Create internship postings
- Edit postings
- Delete postings
- View applicants
- Manage application status
- Paginated postings list

---

## UI Best Practices Used

### Infinite Data Loading Ready

Backend supports:

```text
Pagination
Sorting
Filtering
```

making it easy to implement:

- Infinite Scrolling
- Load More Buttons
- Virtualized Lists

---

### Conditional Rendering

Used throughout the UI for:

- Role-based dashboards
- Loading states
- Empty states
- Protected actions

---

### Reusable Components

Examples:

```text
InternshipForm
ApplicationsPanel
StatsPanel
ProtectedRoute
Navbar
```

---

# Environment Variables

## Backend

```env
PORT=5000

MONGODB_URI=mongodb://localhost:27017/internship-board

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## Frontend

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

# Installation

## Backend

```bash
git clone <repository-url>

cd backend

npm install

npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Future Scalability Improvements

### Microservices

Possible separation:

```text
Auth Service
Internship Service
Application Service
Notification Service
```

---

### Load Balancing

Deploy multiple API instances behind:

- Nginx
- AWS ALB
- Cloudflare

---

### Database Scaling

- MongoDB Replica Sets
- Read Replicas
- Sharding

---

### Event-Driven Architecture

Future integration:

```text
RabbitMQ
Kafka
BullMQ
```

for:

- Email notifications
- Application updates
- Analytics

---

# Project Highlights

✅ JWT Authentication  
✅ Role-Based Access Control  
✅ RESTful API Design  
✅ Swagger Documentation  
✅ MongoDB + Mongoose  
✅ Redis Caching  
✅ Winston Logging  
✅ Joi Validation  
✅ Pagination & Filtering  
✅ Scalable Folder Structure  
✅ React Frontend  
✅ Employer & Applicant Dashboards  
✅ Production-Oriented Best Practices

---

## Author

Developed as a scalable Internship Job Board platform demonstrating:

- Backend Architecture
- Authentication & Authorization
- API Design
- Database Modeling
- Caching Strategies
- Frontend Integration
- Software Scalability Principles