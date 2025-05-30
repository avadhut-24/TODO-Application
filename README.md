# Task Management Application

A full-stack task management application with real-time updates using React, Node.js, and Socket.IO.

## Project Structure

```
.
├── frontend/          # React frontend application
├── backend/           # Node.js backend server
├── docker-compose.yml # Docker configuration
└── README.md         # This file
```

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
mongoURL=mongodb://localhost:27017/your_database_name

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

## Development Setup

1. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd ../frontend
   npm run dev
   ```

## Docker Setup

To run the application using Docker:

1. Make sure Docker and Docker Compose are installed
2. Create the necessary `.env` files as described above
3. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:5000

## Features

- User authentication (signup/login)
- Task management
- Real-time updates using Socket.IO
- Responsive design
- Docker support

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Vite
  - Socket.IO Client

- Backend:
  - Node.js
  - Express
  - TypeScript
  - MongoDB
  - Socket.IO
  - JWT Authentication

- DevOps:
  - Docker
  - Docker Compose
  - Nginx 