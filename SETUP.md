# MERN Real-Time Messaging Application - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (local or cloud) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

## Project Structure

```
collegeMiniProject/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the backend folder (copy from `.env.example`):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/messaging-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

#### For MongoDB Atlas (Cloud):

If using MongoDB Atlas instead of local MongoDB:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/messaging-app?retryWrites=true&w=majority
```

### Step 4: Start MongoDB (if local)

**On Windows:**
```bash
mongod
```

**On macOS:**
```bash
brew services start mongodb-community
```

**On Linux:**
```bash
sudo systemctl start mongod
```

### Step 5: Start Backend Server

```bash
npm start
```

Or for development with hot reload:

```bash
npm run dev
```

You should see:
```
✓ MongoDB connected successfully
✓ User joined with socket
Server running on port: 5000
```

## Frontend Setup

### Step 1: Navigate to Frontend Directory

In a **new terminal window**, navigate to the frontend:

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the frontend folder (copy from `.env.example`):

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=Messaging App
VITE_APP_VERSION=1.0.0
```

### Step 4: Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE ...  ready in ... ms

➜  Local:   http://localhost:5173/
```

## Accessing the Application

1. Open your browser and navigate to: `http://localhost:5173`
2. You'll see the login page
3. Click "Register" to create a new account
4. Fill in the registration form and submit
5. You'll be logged in and can start messaging

## Testing the Application

### Test User 1:
- **Username:** testuser1
- **Email:** testuser1@example.com
- **Password:** password123

### Test User 2:
- **Username:** testuser2
- **Email:** testuser2@example.com
- **Password:** password123

To test messaging:
1. Open the app in two different browser windows
2. Register/login as different users
3. Start a conversation and see real-time messaging in action

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Chats
- `GET /api/chats` - Get all chats
- `POST /api/chats/access` - Get/create one-to-one chat
- `POST /api/chats/group` - Create group chat
- `GET /api/chats/:id` - Get chat details
- `PUT /api/chats/:id/add-user` - Add user to group
- `PUT /api/chats/:id/remove-user` - Remove user from group

### Messages
- `GET /api/messages/:chatId` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `PUT /api/messages/:id/read` - Mark as read
- `PUT /api/messages/chat/:chatId/read-all` - Mark all as read
- `DELETE /api/messages/:id` - Delete message

## Socket.IO Events

### Client to Server
- `join` - Join with userId
- `send-message` - Send a message
- `typing` - User typing
- `stop-typing` - Stop typing
- `message-read` - Mark message as read

### Server to Client
- `receive-message` - New message
- `user-typing` - User typing
- `user-stopped-typing` - User stopped
- `user-online` - User came online
- `user-offline` - User went offline
- `message-read-receipt` - Read receipt

## Troubleshooting

### Issue: MongoDB connection failed

**Solution:**
- Ensure MongoDB is running: `mongod` (local) or check MongoDB Atlas connection string
- Check `MONGODB_URI` in `.env` is correct
- Try resetting MongoDB on local: `mongod --repair`

### Issue: Port already in use

**Solution:**
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env to a different port
```

### Issue: Node modules not found

**Solution:**
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Socket connection failed

**Solution:**
- Ensure backend is running on `http://localhost:5000`
- Check CORS configuration in `backend/server.js`
- Clear browser cache and reload

### Issue: CORS errors

**Solution:**
Update `CLIENT_URL` in backend `.env`:
```
CLIENT_URL=http://localhost:5173
```

## Development Tips

### Code Style
- Use ES6+ features (arrow functions, template literals, destructuring)
- Follow async/await pattern instead of callbacks
- Use meaningful variable and function names
- Add comments for complex logic

### Debugging
- Use browser DevTools for frontend debugging
- Use `console.log()` for backend debugging
- Check browser console for Socket.IO events
- Check server terminal for API errors

### Testing
- Test with different user accounts
- Test one-to-one and group messaging
- Test real-time features with multiple windows
- Test error scenarios

## Performance Optimization

1. **Frontend:**
   - Implement message pagination (lazy loading)
   - Optimize re-renders with React.memo()
   - Use useCallback for event handlers

2. **Backend:**
   - Add database indexing
   - Implement caching for frequently accessed data
   - Use pagination for message retrieval

3. **General:**
   - Minimize bundle size with code splitting
   - Use gzip compression on server

## Security Checklist

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Protected API routes with middleware
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ⚠️ TODO: Rate limiting for API endpoints
- ⚠️ TODO: HTTPS for production
- ⚠️ TODO: Content Security Policy (CSP)
- ⚠️ TODO: SQL injection prevention (using MongoDB)

## Deployment

### Backend Deployment (Heroku/AWS/Azure)

1. Set environment variables on hosting platform
2. Ensure `NODE_ENV=production`
3. Use MongoDB Atlas for database
4. Deploy using `git push heroku main` or platform CLI

### Frontend Deployment (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Vercel/Netlify
3. Set environment variables in platform settings
4. Update `VITE_API_URL` to production backend URL

## Additional Features to Implement

- [ ] Message search functionality
- [ ] User profile pages
- [ ] Profile picture upload
- [ ] Message reactions
- [ ] Message forwarding
- [ ] Call history
- [ ] Block user functionality
- [ ] Message encryption
- [ ] Admin dashboard
- [ ] User authentication with Google/GitHub

## Resources

- [MERN Stack Guide](https://www.mongodb.com/languages/mean-stack)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console/terminal error messages
3. Check API endpoint documentation
4. Verify environment variables are set correctly

## License

MIT License - Feel free to use this for personal and commercial projects

---

**Happy Coding!** 🚀

For updates and improvements, consider implementing:
- User presence (who's online)
- Message encryption
- File sharing
- Video/voice calls
- Dark mode
- Notification system
