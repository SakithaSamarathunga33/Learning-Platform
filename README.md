# 🐾 Pet Care Management System

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/license-MIT-yellow.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D%2014.0.0-green.svg" />
  <img src="https://img.shields.io/badge/made%20with-love-red.svg" />
  <br />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/mongodb-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=java&logoColor=white" />
  <img src="https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white" />
</div>

<p align="center">
  <img src="https://images.unsplash.com/photo-1444212477490-ca407925329e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80" alt="Pet Care Banner" />
</p>

## 📋 Overview

A comprehensive pet care management system that connects pet owners with pet shops and services. This application helps users browse available pets, book appointments, manage their pet ownership journey, and allows administrators to manage inventory, appointments, and analytics.

## ✨ Features

### 🐕 For Customers
- **Pet Browsing**: Browse available pets by type, gender, and price range
- **Appointment Booking**: Schedule appointments to meet pets or get services
- **User Profiles**: Manage personal information and view appointment history
- **Responsive Design**: Fully responsive interface for mobile and desktop
- **Authentication**: Register, login with email/password or Google OAuth

### 👨‍💼 For Administrators
- **Pet Management**: Add, edit, and manage pet listings with default images for each type
- **Appointment Tracking**: View, update, and manage all customer appointments
- **Branch Management**: Track activities across multiple branches
- **Employee Management**: Manage employee records and assignments
- **Analytics Dashboard**: Visualize sales, appointments, and popular pet types with predictions

## 🛠️ Technologies

### Frontend
- **Next.js**: React framework for server-side rendering and static site generation
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Framer Motion**: Animation library for React
- **React Icons**: Icon library for React applications
- **Chart.js**: JavaScript charting library for analytics visualizations
- **Cloudinary**: Cloud-based image management

### Backend
- **Spring Boot**: Java-based framework for building robust backend services
- **MongoDB**: NoSQL database for storing application data
- **JWT**: JSON Web Tokens for secure authentication
- **Google OAuth2**: For social login functionality
- **Spring Security**: For securing endpoints and managing user roles

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
git clone https://github.com/SakithaSamarathunga33/THE-PET.git

# Navigate to the server directory
cd server

# Install dependencies with Maven
mvn clean install

# Set up environment variables in application.properties or via environment
# MongoDB URI, JWT Secret, Google OAuth credentials, etc.

# Start the Spring Boot server
mvn spring-boot:run
```

### Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL and Cloudinary credentials

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
- `POST /api/auth/init-admin` - Initialize admin user (first-time setup)

### User Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete a user
- `PUT /api/users/upload` - Upload user profile picture

### Pets
- `GET /api/pets` - Get all pets (with filtering)
- `GET /api/pets/:id` - Get a single pet
- `POST /api/pets` - Add a new pet
- `PUT /api/pets/:id` - Update a pet
- `DELETE /api/pets/:id` - Delete a pet
- `POST /api/pets/upload` - Upload pet images

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get a single appointment
- `POST /api/appointments` - Create an appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment
- `GET /api/appointments/branch/:branchName` - Get branch appointments

### Analytics
- `GET /api/analytics/branch` - Get branch analytics and predictions
- `GET /api/analytics/sales` - Get sales analytics
- `GET /api/analytics/appointments` - Get appointment statistics

## 👥 User Roles

- **Customer**: Browse pets, book appointments, view own appointments
- **Employee**: Manage appointments, view branch data
- **Admin**: Full access to all features including analytics, employee management

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication and supports:
- Traditional email/password login
- Google OAuth login (for customer accounts)
- Role-based access control for protected routes
- Secure token handling and validation

## 💾 Database Schema

The application uses MongoDB with the following main collections:
- **Users**: User profiles with authentication details
- **Pets**: Pet listings with details and images
- **Appointments**: Customer appointments for services
- **Branches**: Shop branch information
- **Employees**: Staff member records

## 🔮 Future Features

- **Pet Health Records**: Track pet vaccinations and medical history
- **E-commerce Integration**: Purchase pet supplies online
- **Pet Adoption Process**: Streamline the pet adoption paperwork
- **Push Notifications**: Send reminders for appointments
- **Social Sharing**: Share pet listings on social media
- **In-app Chat**: Direct communication between customers and staff

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

Sakitha Samarathunga – sakithaudarashmika63@gmail.com

Project Link: https://github.com/SakithaSamarathunga33/THE-PET.git

---

<p align="center">Made with ❤️ for pets and their owners</p> 