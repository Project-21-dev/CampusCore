# SchoolSync Backend API

Complete Spring Boot REST API for the SchoolSync School Management System.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access (Admin, Teacher, Student)
- **User Management**: CRUD operations for students and teachers
- **Admission Management**: Online admission form submission and status tracking
- **Attendance Management**: Mark and track student attendance
- **Fee Management**: Create, update, and track fee payments
- **Enrollment Management**: Manage student enrollments
- **Results Management**: Upload and manage student exam results

## Tech Stack

- **Framework**: Spring Boot 4.0.2
- **Database**: MySQL
- **Security**: Spring Security with JWT
- **ORM**: Spring Data JPA / Hibernate
- **Build Tool**: Maven
- **Java Version**: 21

## Prerequisites

- JDK 21 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Database Setup

1. Create a MySQL database named `SchoolSync`:
```sql
CREATE DATABASE SchoolSync;
```

2. Update database credentials in `src/main/resources/application.properties` if needed:
```properties
spring.datasource.username=root
spring.datasource.password=cdac
```

## Installation & Running

1. Clone the repository
2. Navigate to the backend directory:
```bash
cd SchoolSync
```

3. Build the project:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The API will start on `http://localhost:5287`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/health` - Health check

### User Management
- `GET /api/user/students` - Get all students
- `GET /api/user/students/{id}` - Get student by ID
- `POST /api/user/students` - Create new student
- `PUT /api/user/students/{id}` - Update student
- `DELETE /api/user/students/{id}` - Delete student

### Admission
- `POST /api/admission/apply` - Submit admission application
- `GET /api/admission/check-status` - Check admission status
- `GET /api/admission/all` - Get all admissions (Admin)
- `PUT /api/admission/{id}` - Update admission status
- `DELETE /api/admission/{id}` - Delete admission

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/all` - Get all attendance records
- `GET /api/attendance/student/{studentId}` - Get student attendance

### Results
- `POST /api/result/upload` - Upload result
- `GET /api/result/all` - Get all results
- `GET /api/result/student/{studentId}` - Get student results
- `PUT /api/result/{id}` - Update result
- `DELETE /api/result/{id}` - Delete result

### Fee Management
- `POST /api/studentmanagement/fee` - Create fee
- `GET /api/studentmanagement/fee/all` - Get all fees
- `GET /api/studentmanagement/fee/student/{studentId}` - Get student fees
- `PUT /api/studentmanagement/fee/{id}` - Update fee
- `PUT /api/studentmanagement/fee/pay/{id}` - Pay fee
- `DELETE /api/studentmanagement/fee/{id}` - Delete fee

### Enrollment Management
- `POST /api/studentmanagement/enrollment` - Create enrollment
- `GET /api/studentmanagement/enrollment/all` - Get all enrollments
- `PUT /api/studentmanagement/enrollment/{id}` - Update enrollment
- `DELETE /api/studentmanagement/enrollment/{id}` - Delete enrollment

## Project Structure

```
src/main/java/com/schoolsync/
├── config/          # Security and application configuration
├── controller/      # REST API controllers
├── dto/            # Data Transfer Objects
├── entity/         # JPA entities
├── repository/     # Spring Data JPA repositories
├── service/        # Business logic services
└── util/           # Utility classes (JWT, etc.)
```

## Database Schema

The application automatically creates the following tables:
- `users` - User authentication data
- `students` - Student information
- `teachers` - Teacher information
- `admissions` - Admission applications
- `attendance` - Attendance records
- `results` - Exam results
- `fees` - Fee records
- `enrollments` - Student enrollments

## CORS Configuration

The API is configured to accept requests from:
- http://localhost:5173 (Vite)
- http://localhost:3000 (React)
- http://localhost:5287 (Frontend)

## Default Credentials

After first run, you can create users through the registration endpoint. Default roles available:
- Admin
- Teacher
- Student

## Notes

- The application uses BCrypt for password encryption
- JWT tokens expire after 24 hours
- Database schema is auto-updated on application startup (`spring.jpa.hibernate.ddl-auto=update`)
