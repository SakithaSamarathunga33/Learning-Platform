# 🎓 Learning Platform

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/license-MIT-yellow.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D%2014.0.0-green.svg" />
  <img src="https://img.shields.io/badge/java-%3E%3D%2017.0.0-orange.svg" />
  <img src="https://img.shields.io/badge/made%20with-love-red.svg" />
  <br />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/mongodb-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" />
</div>

<p align="center">
  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3" alt="Learning Platform Banner" width="1200" height="400" />
</p>

## 📋 Overview

PAF2 is a comprehensive learning platform that connects students with courses, mentors, and educational resources. The application helps users browse available courses, track their learning progress, and engage with a community of experts. Administrators can manage users, content, and gain insights through analytics.

## ✨ Features

### 🧑‍🎓 For Students
- **Course Browsing**: Explore expert-led courses designed for practical skill development
- **1-on-1 Mentorship**: Get personalized guidance from experienced mentors
- **User Profiles**: Manage personal information and track learning progress
- **Responsive Design**: Fully responsive interface for mobile and desktop
- **Authentication**: Register and login with email/password or Google OAuth

### 👨‍💼 For Administrators
- **User Management**: Add, edit, and manage user accounts
- **Content Management**: Create and organize educational content
- **Analytics Dashboard**: Track user engagement and course popularity
- **Media Upload**: Manage educational media using Cloudinary integration
- **Secure Access Control**: Role-based permissions system

## 🛠️ Technologies

### Frontend
- **Next.js**: React framework for server-side rendering and static site generation
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Hooks**: State and lifecycle management for function components
- **Responsive Design**: Mobile-first approach for all device types
- **Cloudinary Integration**: Cloud-based media management

### Backend
- **Spring Boot**: Java-based framework for building robust backend services
- **MongoDB**: NoSQL database for storing application data
- **JWT Authentication**: Secure token-based authentication
- **Google OAuth2**: Social login integration
- **Spring Security**: Role-based access control

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Java JDK 17 or higher
- MongoDB
- Maven
- npm or yarn

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/PAF2.git

# Navigate to the server directory
cd PAF2/server

# Install dependencies with Maven
mvn clean install

# Start the Spring Boot server
mvn spring-boot:run
```

### Frontend Setup
```bash
# Navigate to the frontend directory
cd PAF2/frontend

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3030` to see the application running!

## 📊 API Endpoints

The API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/init-admin` - Initialize admin user

### User Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete a user
- `PUT /api/users/upload` - Upload user profile picture

### Courses
- `GET /api/courses` - Get all courses (with filtering)
- `GET /api/courses/:id` - Get a single course
- `POST /api/courses` - Add a new course (admin only)
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course

### Media
- `POST /api/media/upload` - Upload media files
- `GET /api/media` - Get all media files
- `DELETE /api/media/:id` - Delete a media file

## 👥 User Roles

- **Student**: Browse courses, access learning materials, interact with mentors
- **Mentor**: Create content, provide guidance to students
- **Admin**: Full access to all features including user management and analytics

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication and supports:
- Traditional email/password login
- Google OAuth login
- Role-based access control for protected routes
- Secure token handling with proper expiration

## 💾 Database Schema

The application uses MongoDB with the following main collections:
- **Users**: User profiles with authentication details
- **Courses**: Course listings with details and content
- **Media**: Uploaded files and their metadata
- **Mentorship**: Mentorship sessions and relationships

## ⚙️ Environment Variables

The application requires the following environment variables:

### Backend (application.properties)
```properties
# MongoDB Configuration
spring.data.mongodb.uri=${MONGODB_URI}

# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}

# Google OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}

# Cloudinary Configuration
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 🔮 Future Features

- **Interactive Assessments**: Self-paced quizzes and assignments
- **Certificate Generation**: Digital certificates for course completion
- **Community Forum**: Discussion boards for collaborative learning
- **Mobile Application**: Native mobile apps for iOS and Android
- **AI-Powered Recommendations**: Personalized course suggestions
- **Live Sessions**: Real-time virtual classroom experiences

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

Your Name – your.email@example.com

Project Link: https://github.com/yourusername/PAF2

---

<p align="center">Made with ❤️ for learners and educators</p> 
