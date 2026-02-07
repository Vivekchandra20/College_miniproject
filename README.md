# Real-Time Messaging Application - MERN Stack

A secure, scalable, real-time chat application built with MongoDB, Express.js, React.js, and Node.js with Socket.IO for instant message delivery.

## Features

### User Authentication
- User registration and login with JWT
- Secure password hashing with bcrypt
- Protected routes and API endpoints
- User session management

### Real-Time Messaging
- One-to-one chat between users
- Group chat with multiple users
- Real-time message delivery via WebSockets
- Typing indicators
- Online/offline user status
- Message timestamps

### Message Management
- Persistent message storage in MongoDB
- Chat history with pagination
- Read/unread message status
- Delete and update messages

### Group Chats
- Create and manage group chats
- Add/remove users from groups
- Admin permissions and controls
- Group names and descriptions

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing

### Frontend
- **React.js** - UI library
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.IO Client** - WebSocket client
- **Vite** - Build tool

## Project Structure

```
collegeMiniProject/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── chatController.js  # Chat logic
│   │   └── messageController.js # Message logic
│   ├── middlewares/
│   │   └── authMiddleware.js   # JWT verification
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Chat.js            # Chat schema
│   │   └── Message.js         # Message schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── chatRoutes.js      # Chat endpoints
│   │   └── messageRoutes.js   # Message endpoints
│   ├── utils/
│   │   └── socketHandlers.js  # Socket.IO handlers
│   ├── .env                   # Environment variables
│   ├── .gitignore             # Git ignore file
│   ├── package.json           # Dependencies
│   └── server.js              # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React context
│   │   ├── pages/             # Page components
│   │   ├── services/          # API & Socket services
│   │   ├── utils/             # Helper functions
│   │   ├── App.jsx            # Main app component
│   │   ├── App.css            # App styles
│   │   ├── index.css          # Global styles
│   │   └── main.jsx           # React entry point
│   ├── index.html             # HTML template
│   ├── package.json           # Dependencies
│   ├── vite.config.js         # Vite configuration
│   └── .gitignore             # Git ignore file
│
└── README.md                  # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/messaging-app
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Chats
- `GET /api/chats` - Get all chats for user
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat details
- `POST /api/chats/group` - Create group chat
- `PUT /api/chats/:id/add-user` - Add user to group
- `PUT /api/chats/:id/remove-user` - Remove user from group

### Messages
- `GET /api/messages/:chatId` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

## Socket.IO Events

### Emitted Events
- `send-message` - Send a message
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `user-online` - User comes online
- `user-offline` - User goes offline
- `create-group` - Create group chat

### Received Events
- `receive-message` - New message received
- `user-typing` - User is typing
- `user-stopped-typing` - User stopped typing
- `user-online` - User came online
- `user-offline` - User went offline

## Best Practices Implemented

✅ Clean, modular, and scalable code structure
✅ Proper error handling and validation
✅ Async/await for asynchronous operations
✅ JWT-based authentication
✅ Secure password hashing
✅ Environment variables for configuration
✅ RESTful API design
✅ Real-time updates with Socket.IO
✅ Responsive UI with Tailwind CSS
✅ Component-based React architecture

## Running the Application

1. Install MongoDB and ensure it's running
2. Start backend: `cd backend && npm install && npm start`
3. Start frontend: `cd frontend && npm install && npm run dev`
4. Open http://localhost:5173

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use environment variables from hosting platform
3. Build frontend: `npm run build`
4. Deploy frontend to static hosting (Vercel, Netlify)
5. Deploy backend to cloud platform (Heroku, AWS, Azure)

## License

MIT

## Author

Your Name - College Mini Project

---

**Happy Coding!** 🚀
