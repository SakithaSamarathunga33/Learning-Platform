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
  <img src="https://img.shields.io/badge/OpenRouter-5046E5?style=for-the-badge&logo=openai&logoColor=white" />
</div>

<p align="center">
  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3" alt="Learning Platform Banner" width="1200" height="400" />
</p>

## 📋 Overview

This is a comprehensive learning platform that connects students with courses, mentors, and educational resources. The application helps users browse available courses, track their learning progress, and engage with a community of experts. Administrators can manage users, content, and gain insights through analytics.

## ✨ Features

### 🧑‍🎓 For Students
- **Course Browsing**: Explore expert-led courses designed for practical skill development
- **1-on-1 Mentorship**: Get personalized guidance from experienced mentors
- **User Profiles**: Manage personal information and track learning progress
- **Responsive Design**: Fully responsive interface for mobile and desktop
- **Authentication**: Register and login with email/password or Google OAuth
- **Real-time Messaging**: Exchange messages with other users and mentors
- **AI Assistant**: Get immediate help from an AI chatbot for quick questions
- **Feedback System**: Submit feedback, feature requests, and bug reports with star ratings

### 👨‍💼 For Administrators
- **User Management**: Add, edit, and manage user accounts
- **Content Management**: Create and organize educational content
- **Analytics Dashboard**: Track user engagement and course popularity
- **Media Upload**: Manage educational media using Cloudinary integration
- **Secure Access Control**: Role-based permissions system
- **Feedback Management**: Review, respond to, and track user feedback

## 🛠️ Technologies

### Frontend
- **Next.js**: React framework for server-side rendering and static site generation
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Hooks**: State and lifecycle management for function components
- **Responsive Design**: Mobile-first approach for all device types
- **Cloudinary Integration**: Cloud-based media management
- **OpenRouter API**: AI model integration for the intelligent chatbot assistant

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
- OpenRouter API key (for AI Assistant functionality)

### Backend Setup
```bash
# Clone the repository
git clone (https://github.com/SakithaSamarathunga33/Learning-Platform.git)

# Navigate to the server directory
cd server

# Install dependencies with Maven
mvn clean install

# Start the Spring Boot server
mvn spring-boot:run
```

### Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create .env file with required variables (including NEXT_PUBLIC_OPENROUTER_API_KEY)
# See .env.example for required variables

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
- `GET /api/users/username/:username` - Get a user by username
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete a user
- `PUT /api/users/upload` - Upload user profile picture

### Courses
- `GET /api/courses` - Get all courses (with filtering)
- `GET /api/courses/:id` - Get a single course
- `POST /api/courses` - Add a new course (admin only)
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course

### Messages
- `GET /api/messages/conversations` - Get all user conversations
- `GET /api/messages/conversation/:username` - Get messages with a specific user
- `POST /api/messages/send/:username` - Send a message to a user
- `DELETE /api/messages/:id` - Delete a specific message
- `PUT /api/messages/:id/read` - Mark a message as read

### Feedback
- `POST /api/feedback` - Submit new feedback
- `GET /api/feedback` - Get all feedback (admin only)
- `GET /api/feedback/:id` - Get feedback by ID
- `GET /api/feedback/my-feedback` - Get current user's feedback
- `GET /api/feedback/status/:status` - Get feedback by status (admin only)
- `PUT /api/feedback/:id` - Update feedback
- `PUT /api/feedback/:id/status` - Update feedback status (admin only)
- `DELETE /api/feedback/:id` - Delete feedback (admin only)
- `GET /api/feedback/stats` - Get feedback statistics (admin only)

### Media
- `POST /api/media/upload` - Upload media files
- `GET /api/media` - Get all media files
- `DELETE /api/media/:id` - Delete a media file

## 🤖 AI Assistant

The platform features an intelligent AI chatbot assistant powered by the DeepSeek Chat v3 model via OpenRouter:

- **Instant Help**: Provides immediate responses to student questions
- **Context-Aware**: Maintains conversation history for contextually relevant responses
- **Specialized Knowledge**: Handles both general inquiries and platform-specific questions
- **24/7 Availability**: Always available to assist users when human mentors are offline
- **Adaptive Responses**: Uses fallback mechanisms when API connectivity issues occur
- **Time & Date Queries**: Handles special queries like current time and date directly

## 💬 Messaging System

The platform includes a comprehensive messaging system for communication:

- **User-to-User Chat**: Direct messaging between students, mentors, and administrators
- **Conversation Management**: Organized interface showing all active conversations
- **Message Editing**: Users can edit their messages with clear visual indicators
- **Delete Functionality**: Ability to remove messages from conversations
- **Optimistic Updates**: Immediate UI updates with background synchronization
- **Offline Support**: Local storage of messages for offline access
- **Real-time Feedback**: Typing indicators and read status for enhanced interaction

## 📝 Feedback Management System

The platform includes a complete feedback management system:

- **User Feedback Submission**: Users can submit feedback with ratings, titles, and descriptions
- **Categorized Feedback**: Supports different types like feature requests, bug reports, and course feedback
- **Rating System**: Star-based rating system to quantify user satisfaction
- **Feedback History**: Users can view and track their submitted feedback
- **Admin Response**: Administrators can review, respond to, and manage user feedback
- **Status Tracking**: Feedback can be marked as pending, reviewed, resolved, or rejected
- **Analytics Dashboard**: Administrators can see feedback statistics and trends
- **Export Capability**: Export feedback data to CSV for offline analysis

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
- **Messages**: User-to-user communications with metadata
- **Feedbacks**: User feedback, ratings, and admin responses

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

### Frontend (.env)
```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Auth Configuration
NEXT_PUBLIC_AUTH_CALLBACK_URL=http://localhost:3030/auth/callback
NEXTAUTH_URL=http://localhost:3030
NEXTAUTH_SECRET=your_secret_key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret

# AI Integration
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
```

## 🔮 Future Features

- **Interactive Assessments**: Self-paced quizzes and assignments
- **Certificate Generation**: Digital certificates for course completion
- **Community Forum**: Discussion boards for collaborative learning
- **Mobile Application**: Native mobile apps for iOS and Android
- **AI-Powered Recommendations**: Personalized course suggestions
- **Live Sessions**: Real-time virtual classroom experiences
- **AI Tutor Integration**: Expanded AI capabilities for personalized learning paths
- **Group Messaging**: Support for multi-user conversations and study groups
- **Advanced Media Messaging**: Share documents, images, and recordings in chats
- **Advanced Feedback Analytics**: Sentiment analysis and trend visualization for feedback
- **Automated Feedback Categorization**: AI-powered categorization of user feedback

---

<p align="center">Made with ❤️ for learners and educators</p> 
