# MERN Real-Time Messaging Application - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack Details](#tech-stack-details)
3. [Code Organization](#code-organization)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Real-Time Features](#real-time-features)
7. [Security Implementation](#security-implementation)
8. [Best Practices](#best-practices)

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components (ChatList, ChatWindow, MessageItem)      │  │
│  │  State Management (Context API / AuthContext)        │  │
│  │  Services (API calls, Socket.IO events)              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
                    HTTP + WebSocket (Socket.IO)
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes (authRoutes, chatRoutes, messageRoutes)      │  │
│  │  Controllers (Business Logic)                        │  │
│  │  Models (Mongoose Schemas)                           │  │
│  │  Middlewares (Auth, Validation)                      │  │
│  │  Socket.IO Server (Real-Time)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
                      MongoDB Database
```

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── LoginPage
├── RegisterPage
└── ChatPage
    ├── ChatList (Left Sidebar)
    │   ├── SearchBar
    │   └── ChatListItem[] (ChatList component)
    │       ├── Avatar
    │       ├── ChatName
    │       └── LastMessage Preview
    │
    └── ChatWindow (Main Area)
        ├── ChatHeader
        │   ├── Avatar
        │   ├── UserInfo
        │   └── ActionButtons
        │
        ├── MessageContainer
        │   └── MessageItem[]
        │       ├── Avatar
        │       ├── Content
        │       ├── Timestamp
        │       └── Actions (Edit/Delete)
        │
        └── InputArea
            ├── AttachmentButton
            ├── TextInput
            ├── EmojiButton
            └── SendButton
```

## Tech Stack Details

### Frontend Technologies

#### React.js
- **Version:** 18.2.0
- **Usage:** UI framework for building interactive components
- **Key Features Used:**
  - Functional components with hooks
  - Context API for state management
  - useEffect for side effects
  - useRef for DOM access
  - useCallback for memoization

#### Tailwind CSS
- **Version:** 3.3.0
- **Usage:** Utility-first CSS framework
- **Benefits:**
  - Rapid UI development
  - Consistent styling
  - Responsive design with breakpoints
  - Dark mode ready

#### Axios
- **Version:** 1.3.0
- **Usage:** HTTP client for API requests
- **Configuration:**
  - Automatic header injection for auth tokens
  - Request/response interceptors
  - Error handling

#### Socket.IO Client
- **Version:** 4.5.4
- **Usage:** Real-time bidirectional communication
- **Events:** Message delivery, typing indicators, user status

### Backend Technologies

#### Node.js & Express.js
- **Node.js Version:** v14+
- **Express.js Version:** 4.18.2
- **Usage:** Server framework for REST APIs
- **Structure:**
  - Route handlers
  - Middleware stack
  - Error handling

#### Socket.IO Server
- **Version:** 4.5.4
- **Usage:** Real-time WebSocket communication
- **Features:**
  - Bidirectional communication
  - Event-based messaging
  - Room support for groups
  - Automatic reconnection

#### MongoDB & Mongoose
- **MongoDB:** Document database
- **Mongoose:** ODM for MongoDB
- **Features:**
  - Schema validation
  - Pre/post hooks
  - Middleware
  - Population for references

#### JWT (JSON Web Tokens)
- **Library:** jsonwebtoken
- **Usage:** Stateless authentication
- **Features:**
  - Token generation
  - Token verification
  - Expiration handling (7 days)

#### bcryptjs
- **Version:** 2.4.3
- **Usage:** Password hashing
- **Configuration:** Salt rounds = 10

## Code Organization

### Backend Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
│
├── models/
│   ├── User.js              # User schema with methods
│   ├── Chat.js              # Chat (one-to-one & groups)
│   └── Message.js           # Message schema
│
├── controllers/
│   ├── authController.js    # Auth logic (register, login, logout)
│   ├── chatController.js    # Chat operations
│   └── messageController.js # Message operations
│
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── chatRoutes.js        # Chat endpoints
│   └── messageRoutes.js     # Message endpoints
│
├── middlewares/
│   └── authMiddleware.js    # JWT verification, token generation
│
├── utils/
│   └── socketHandlers.js    # Socket.IO event handlers
│
├── server.js                # Main server file with Express & Socket.IO setup
├── package.json             # Dependencies
└── .env                     # Environment variables
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatList.jsx       # Chat list item
│   │   ├── ChatWindow.jsx     # Main chat interface
│   │   ├── MessageItem.jsx    # Single message
│   │   ├── UserStatus.jsx     # User online status
│   │   └── GroupChatModal.jsx # Group creation
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state management
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx      # Login form
│   │   ├── RegisterPage.jsx   # Registration form
│   │   └── ChatPage.jsx       # Main chat page
│   │
│   ├── services/
│   │   ├── api.js            # Axios instance & API calls
│   │   └── socket.js         # Socket.IO client & events
│   │
│   ├── utils/
│   │   └── helpers.js        # Helper functions & utilities
│   │
│   ├── App.jsx               # Root component
│   ├── App.css               # App styles
│   ├── index.css             # Global styles with Tailwind
│   └── main.jsx              # React entry point
│
├── index.html               # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS plugins
└── package.json            # Dependencies
```

## Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  username: String (unique, 3-20 chars),
  email: String (unique, valid format),
  password: String (hashed with bcryptjs),
  profilePic: String (optional, URL),
  isOnline: Boolean (default: false),
  lastSeen: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Chat Model

```javascript
{
  _id: ObjectId,
  users: [ObjectId] (references to User),
  isGroupChat: Boolean (default: false),
  chatName: String (optional, for groups),
  groupAdmin: ObjectId (reference to User, optional),
  groupDescription: String (optional),
  groupPic: String (optional, URL),
  lastMessage: ObjectId (reference to Message, optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Message Model

```javascript
{
  _id: ObjectId,
  sender: ObjectId (reference to User),
  chat: ObjectId (reference to Chat),
  content: String (1-10000 chars),
  readBy: [
    {
      user: ObjectId (reference to User),
      readAt: Date
    }
  ],
  edited: Boolean (default: false),
  editedAt: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "profilePic": null
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "isOnline": true
  }
}
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

### Chat Endpoints

#### Get All Chats
```http
GET /api/chats
Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "chats": [
    {
      "_id": "chat_id",
      "users": [...],
      "isGroupChat": false,
      "lastMessage": {...},
      "updatedAt": "timestamp"
    }
  ]
}
```

#### Create One-to-One Chat
```http
POST /api/chats/access
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "targetUserId": "user_id"
}

Response:
{
  "success": true,
  "chat": {...}
}
```

#### Create Group Chat
```http
POST /api/chats/group
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "chatName": "Project Team",
  "members": ["user_id_1", "user_id_2", "user_id_3"]
}

Response:
{
  "success": true,
  "message": "Group chat created successfully",
  "chat": {...}
}
```

### Message Endpoints

#### Get Messages
```http
GET /api/messages/:chatId?limit=50&skip=0
Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "messages": [...],
  "total": 100,
  "hasMore": true
}
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "chatId": "chat_id",
  "content": "Hello, how are you?"
}

Response:
{
  "success": true,
  "message": {
    "_id": "message_id",
    "sender": {...},
    "content": "Hello, how are you?",
    "createdAt": "timestamp"
  }
}
```

## Real-Time Features

### Socket.IO Events

#### Client-to-Server Events

```javascript
// Join with userId
socket.emit('join', userId);

// Send message
socket.emit('send-message', {
  chatId,
  message,
  recipientIds
});

// Typing indicator
socket.emit('typing', {
  chatId,
  recipientIds,
  username
});

// Stop typing
socket.emit('stop-typing', {
  chatId,
  recipientIds
});

// Message read receipt
socket.emit('message-read', {
  messageId,
  chatId,
  senderIds
});
```

#### Server-to-Client Events

```javascript
// Receive message
socket.on('receive-message', (data) => {
  // { chatId, message, senderSocket }
});

// User typing
socket.on('user-typing', (data) => {
  // { chatId, username, userId }
});

// User stopped typing
socket.on('user-stopped-typing', (data) => {
  // { chatId, userId }
});

// User came online
socket.on('user-online', (data) => {
  // { userId, status: 'online' }
});

// User went offline
socket.on('user-offline', (data) => {
  // { userId, status: 'offline' }
});

// Read receipt
socket.on('message-read-receipt', (data) => {
  // { messageId, chatId, readBy }
});
```

## Security Implementation

### Password Security
```javascript
// Hashing
const salt = await bcryptjs.genSalt(10);
password = await bcryptjs.hash(password, salt);

// Verification
const isValid = await bcryptjs.compare(enteredPassword, hashedPassword);
```

### JWT Authentication
```javascript
// Token Generation
const token = jwt.sign(
  { userId },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token Verification (Middleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.userId = decoded.userId;
```

### Protected Routes
```javascript
// Middleware checks JWT before allowing access
router.post('/logout', authMiddleware, logoutUser);
```

### Input Validation
```javascript
// Server-side validation
if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  return res.status(400).json({
    success: false,
    message: 'Valid email required'
  });
}
```

## Best Practices

### Frontend Best Practices

1. **Component Structure**
   - Keep components small and focused
   - Use functional components with hooks
   - Avoid prop drilling with Context API

2. **State Management**
   - Use Context API for global state
   - Keep local state for UI-specific data
   - Avoid unnecessary re-renders with useCallback

3. **API Calls**
   - Use a service layer (api.js)
   - Handle errors gracefully
   - Show loading states to users
   - Use request/response interceptors

4. **Performance**
   - Lazy load components
   - Memoize expensive computations
   - Debounce frequent events (typing)
   - Paginate message loading

5. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels
   - Ensure keyboard navigation
   - Support screen readers

### Backend Best Practices

1. **Code Organization**
   - Separate concerns (routes, controllers, models)
   - Use middleware for cross-cutting concerns
   - Keep business logic in controllers

2. **Database**
   - Use indexes for frequent queries
   - Populate references efficiently
   - Use validation at schema level
   - Implement soft deletes where needed

3. **Error Handling**
   - Use try-catch blocks
   - Return meaningful error messages
   - Log errors for debugging
   - Validate all inputs

4. **Security**
   - Hash passwords with bcryptjs
   - Use JWT for stateless auth
   - Validate all inputs
   - Use CORS properly
   - Secure environment variables

5. **API Design**
   - RESTful endpoints
   - Consistent response format
   - Proper HTTP status codes
   - Versioning for API changes

### General Best Practices

1. **Code Quality**
   - Use meaningful names
   - Write small, focused functions
   - Add comments for complex logic
   - Follow DRY principle

2. **Testing**
   - Write unit tests
   - Test error scenarios
   - Use integration tests
   - Test security features

3. **Documentation**
   - Document APIs
   - Comment complex code
   - Maintain README
   - Create architecture docs

4. **Performance**
   - Monitor response times
   - Use caching strategically
   - Optimize database queries
   - Bundle and minify code

---

**This documentation provides a comprehensive overview of the MERN messaging application architecture, implementation details, and best practices for development and maintenance.**
