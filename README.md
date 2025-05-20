# Financial Document Management System 📊

## Overview
A comprehensive financial document management solution with web and mobile interfaces. The system allows clients to upload documents, accountants to process them, and administrators to manage users and oversee operations.

## Features

### Web Application
- **Multi-User System** 👥:
  - Admin Dashboard: User management and system oversight
  - Accountant Portal: Document processing and client management

- **Document Management** 📄:
  - Document upload and categorization
  - Status tracking (New, Processed, Rejected)
  - Metadata management
  - Search and filter capabilities

- **User Management** 👤:
  - User role management (Admin, Accountant, Client)
  - Account creation and management
  - Delete request handling

### Mobile Application 📱
- Secure authentication
- Client Access
- Document upload functionality
- Upload history tracking
- Real-time status updates

## Technology Stack 🛠️

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Middleware for role-based access

### Frontend (Web)
- React.js
- Modern UI components
- Responsive design
- Real-time updates

### Mobile App
- React Native with Expo
- Native file handling
- Camera integration
- Secure storage

## Installation 💻

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Mobile App Setup
```bash
cd mobile/MyExpoApp
npm install
expo start
```

## Environment Variables ⚙️

### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## Project Structure 📁
```
├── backend/
│   ├── controllers/   # Business logic
│   ├── middleware/    # Auth & validation
│   ├── models/        # Database schemas
│   └── routes/        # API endpoints
├── frontend/
│   ├── public/        # Static files
│   └── src/
│       ├── components/# React components
│       └── api/       # API integration
└── mobile/
    └── MyExpoApp/    # React Native app
        ├── screens/   # Mobile screens
        └── api/       # Mobile API
```

## API Endpoints 🔌

### Authentication
- POST /api/auth/signin - Sign in

### Documents
- GET /api/documents - List documents
- POST /api/documents - Upload document
- PATCH /api/documents/:id/processed - Mark as processed
- PATCH /api/documents/:id/rejected - Mark as rejected

### Users
- GET /api/accountants - List accountants
- GET /api/clients - List clients
- POST /api/clients - Add client
- DELETE /api/clients/:id - Remove client

## Key Features 🔑
- **Secure Authentication**: JWT-based authentication system
- **Role-Based Access**: Different permissions for admin, accountant, and client
- **Document Processing**: Complete document lifecycle management
- **Real-time Updates**: Instant status updates for all users
- **Mobile Integration**: Companion app for document upload
- **Search & Filter**: Advanced document search capabilities
- **Responsive Design**: Works on all devices and screen sizes

## Security Features 🔒
- JWT Authentication
- Role-based access control
- Secure password hashing
- Protected routes
- Input validation
- Rate limiting
- CORS protection

## Contributing 🤝
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

