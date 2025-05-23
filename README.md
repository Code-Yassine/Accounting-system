# Financial Document Management System 📊

## Overview
A comprehensive financial document management solution with web and mobile interfaces. The system allows clients to upload documents, accountants to process them, and administrators to manage users and oversee operations.

---

## 🚀 Features

### Web Application
- **Multi-User System** 👥
  - Admin Dashboard: User management, system oversight, and request approvals
  - Accountant Portal: Document processing, client management, and status tracking
- **Document Management** 📄
  -  manage financial documents
  - change Status (New, Processed, Rejected)
  - Metadata management, search, and filter
- **User Management** 👤
  - Role-based access (Admin, Accountant, Client)
  - Account creation, activation/deactivation, and delete request handling
- **Security** 🔒
  - JWT authentication, protected routes, and input validation
  - Rate limiting and CORS protection
- **Real-time Updates**
  - Instant status

### Mobile Application 📱
- Secure authentication and client access
- Document upload with camera and file support
- Upload history and real-time status updates
- Native file handling and  storage 

---

## 🛠️ Technology Stack

### Backend
- Node.js, Express.js, MongoDB
- JWT Authentication
- Middleware for role-based access
- Centralized error handling

### Frontend (Web)
- React.js (with hooks)
- Modern UI components (responsive, accessible)
- Real-time updates (fetch, state management)

### Mobile App
- React Native with Expo
- Native file/camera integration
- Secure storage

---

## 💻 Installation & Setup

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

---

## ⚙️ Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

---

## 📁 Project Structure
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

---

## 🔌 API Endpoints (Sample)

### Authentication
- `POST /api/auth/signin` - Sign in web
- `POST /api/mobile/signin` - Sign in mobile

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `PATCH /api/documents/:id/processed` - Mark as processed
- `PATCH /api/documents/:id/rejected` - Mark as rejected
- `PUT /api/documents/:id` - Modify document metadata

### Users

#### Accountants
- `GET /api/accountants` - List all accountants
- `POST /api/accountants` - Add a new accountant
- `GET /api/accountants/:id` - Get accountant details
- `PUT /api/accountants/:id` - Update accountant information
- `DELETE /api/accountants/:id` - Remove an accountant

#### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Add a new client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client information
- `DELETE /api/clients/:id` - Remove a client

---

## 🔑 Key Features
- **Document Processing**: Complete document lifecycle management
- **Real-time Updates**: add the notifications for the system
- **Search & Filter**: Advanced document search capabilities
- **Responsive Design**: Works on all devices and screen sizes
- **Centralized Error Handling**: Consistent error responses across backend and frontend

---

## 🔒 Security Features
- JWT Authentication
- Role-based access control
- Secure password hashing
- Protected routes
- CORS protection

---

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact & Support
For questions, issues, or feature requests, please open an issue or contact the maintainer.

---

## 📅 Last Updated
May 23, 2025

