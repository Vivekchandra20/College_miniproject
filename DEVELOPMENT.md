# Development Guide & Next Steps

## Getting Started with Development

### For First-Time Setup

1. **Read the documentation** (in order):
   - [QUICKSTART.md](QUICKSTART.md) - Quick 5-minute setup
   - [SETUP.md](SETUP.md) - Detailed configuration
   - [FEATURES.md](FEATURES.md) - Understand features
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
   - [FILES.md](FILES.md) - File reference

2. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm install
   npm start
   
   # Terminal 2 - Frontend  
   cd frontend
   npm install
   npm run dev
   ```

3. **Test the application**
   - Create accounts and test messaging
   - Check real-time features
   - Explore the code

## Development Workflow

### Adding a New Feature

1. **Plan the Feature**
   - Write requirements
   - Design the flow
   - Check impact on existing code

2. **Backend Implementation**
   - Add/modify model (if needed)
   - Create controller function
   - Add routes
   - Add middleware (if auth needed)
   - Test with Postman/curl

3. **Frontend Implementation**
   - Create components
   - Add UI in pages
   - Connect to API service
   - Add styling
   - Test in browser

4. **Real-Time Features** (if needed)
   - Add Socket.IO handlers
   - Update socket service
   - Test with multiple clients

## Common Development Tasks

### Adding a New API Endpoint

**Backend**:

1. Update model in `models/[Model].js` if needed:
   ```javascript
   // Add field if necessary
   newField: { type: String, default: null }
   ```

2. Create controller function in `controllers/[name]Controller.js`:
   ```javascript
   const myFunction = async (req, res) => {
     try {
       // implementation
     } catch (error) {
       // error handling
     }
   };
   ```

3. Add route in `routes/[name]Routes.js`:
   ```javascript
   router.post('/endpoint', authMiddleware, myFunction);
   ```

4. Test the endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/endpoint \
     -H "Authorization: Bearer token" \
     -H "Content-Type: application/json" \
     -d '{"field":"value"}'
   ```

### Adding a New React Component

**Frontend**:

1. Create file in `src/components/[Name].jsx`:
   ```javascript
   const [Name] = ({ props }) => {
     // component logic
     return (
       // JSX
     );
   };
   export default [Name];
   ```

2. Use in parent component:
   ```javascript
   import [Name] from '../components/[Name]';
   
   // Inside OtherComponent
   <[Name] prop={value} />
   ```

3. Style with Tailwind CSS classes

### Adding a New Page

1. Create file in `src/pages/[Name]Page.jsx`
2. Add routing logic in `App.jsx`
3. Add navigation link

## Testing

### Backend Testing with Curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@example.com",
    "password":"password123",
    "confirmPassword":"password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'

# Get chats (use token from login)
curl -X GET http://localhost:5000/api/chats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Frontend Testing

1. **Chrome DevTools**
   - F12 to open
   - Console for errors
   - Network tab for API calls
   - Application tab for localStorage

2. **Test Matrix**
   - Different screen sizes
   - Multiple browser tabs
   - Different browsers (Chrome, Firefox, Safari)
   - Network throttling (Slow 3G)

### Browser Console Testing

```javascript
// Check Socket.IO connection
io.engine.on('upgrade', (transport) => console.log('Upgraded to', transport.name));

// Check stored data
localStorage.getItem('authToken');
localStorage.getItem('user');

// Check API calls
fetch('http://localhost:5000/api/auth/me', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
}).then(r => r.json()).then(console.log);
```

## Feature Implementation Roadmap

### Current Phase ✅
- [x] User authentication (register, login)
- [x] One-to-one messaging
- [x] Group messaging
- [x] Real-time message delivery
- [x] Typing indicators
- [x] Online/offline status
- [x] Read receipts

### Phase 2: File & Message Features

```javascript
// TODO: Add file sharing
// 1. Add upload endpoint
// 2. Store file URL in message
// 3. Display file preview in UI
// 4. Add download button

// TODO: Add message reactions
// 1. Add reactions array to Message model
// 2. Add reaction endpoints
// 3. Update Socket.IO for reactions
// 4. Display emoji reactions in UI

// TODO: Add message forwarding
// 1. Create forward endpoint
// 2. Copy message to target chat
// 3. Mark as forwarded
```

### Phase 3: Voice & Video

```javascript
// TODO: Implement video calling
// 1. Install WebRTC library
// 2. Handle call initiation events
// 3. Setup peer connection
// 4. Stream video/audio
// 5. Add call UI components

// TODO: Add voice calls
// Similar to video but audio only
```

### Phase 4: Advanced Features

```javascript
// TODO: Search functionality
// 1. Add search endpoint with MongoDB fulltext search
// 2. Add search UI in chat list
// 3. Display search results

// TODO: Message encryption
// 1. Encrypt on client before sending
// 2. Decrypt on client after receiving
// 3. Store encrypted in database

// TODO: User blocking
// 1. Add blocklist to User model
// 2. Check permissions before messaging
// 3. Hide blocked user from searches
```

## Debugging Guide

### Common Issues & Solutions

#### Socket.IO Not Connected

```javascript
// Check connection in browser console
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected!'));
socket.on('disconnect', () => console.log('Disconnected!'));
socket.on('connect_error', () => console.log('Error!'));
```

#### Messages Not Loading

```javascript
// Check in browser console
fetch('http://localhost:5000/api/messages/chatId')
  .then(r => r.json())
  .then(console.log);
```

#### Backend Crashes

```bash
# Check server logs
# Look for error messages in terminal
# Common issues:
# - MongoDB not running
# - Port already in use
# - Missing environment variables
```

#### CORS Errors

```javascript
// Check backend CORS configuration in server.js
// Verify CLIENT_URL in .env
// Browser console shows: "Access to XMLHttpRequest blocked by CORS"
```

## Code Quality Guidelines

### Code Style

```javascript
// ✅ Good
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

// ❌ Bad
const formatDate = d => new Date(d).toLocaleDateString();

// Always use:
// - Descriptive variable names
// - Arrow functions
// - Template literals
// - Const/let (not var)
// - Async/await (not .then())
```

### Component Guidelines

```javascript
// ✅ Good: Small, focused component
const MessageItem = ({ message, onDelete }) => {
  return <div>{message.content}</div>;
};

// ❌ Bad: Too much logic in one component
const MessageList = ({ messages, user, chat, ... }) => {
  // 200 lines of code
};
```

### Error Handling

```javascript
// ✅ Good
try {
  const response = await api.get('/messages');
  setMessages(response.data);
} catch (error) {
  console.error('Error fetching messages:', error);
  setError('Failed to load messages');
}

// ❌ Bad
const messages = await api.get('/messages');
setMessages(messages.data);
```

## Performance Optimization

### Frontend

1. **Lazy Loading**
   ```javascript
   const ChatWindow = React.lazy(() => import('./ChatWindow'));
   ```

2. **Memoization**
   ```javascript
   const MessageItem = React.memo(({ message }) => {
     return <div>{message.content}</div>;
   });
   ```

3. **Debouncing**
   ```javascript
   const handleTyping = debounce(() => {
     stopTyping();
   }, 3000);
   ```

### Backend

1. **Database Indexes**
   ```javascript
   // In model
   user Schema.index({ email: 1 });
   ```

2. **Pagination**
   ```javascript
   // Limit returned messages
   const messages = await Message.find()
     .limit(50)
     .skip(skip);
   ```

3. **Caching**
   ```javascript
   // Cache user data temporarily
   const cache = new Map();
   ```

## Deployment Checklist

Before deploying to production:

- [ ] Update `NODE_ENV` to "production"
- [ ] Set strong `JWT_SECRET`
- [ ] Configure `MONGODB_URI` for Atlas
- [ ] Set `CLIENT_URL` to production URL
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Run security audit
- [ ] Test all features
- [ ] Performance testing
- [ ] Load testing
- [ ] Set up monitoring/logging
- [ ] Create deployment documentation

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
git add .
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/feature-name

# Create pull request on GitHub
# Review and merge when ready

# Update main
git checkout main
git pull origin main
```

## Resources for Learning

**MongoDB**
- [MongoDB University Course](https://university.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

**Express.js**
- [Express.js Guide](https://expressjs.com/guide/)
- [REST API Best Practices](https://restfulapi.net/)

**React**
- [React Documentation](https://react.dev/learn)
- [React Hooks Guide](https://react.dev/reference/react)

**Socket.IO**
- [Socket.IO Tutorial](https://socket.io/get-started/chat)
- [Socket.IO API](https://socket.io/docs/v4/server-api/)

**Tailwind CSS**
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Component Library](https://tailwindui.com/)

**WebRTC** (for future video calls)
- [WebRTC Documentation](https://webrtc.org/)
- [WebRTC Tutorial](https://www.html5rocks.com/en/tutorials/webrtc/basics/)

## Support & Help

### Getting Help

1. **Check Documentation**
   - Review SETUP.md, FEATURES.md, ARCHITECTURE.md
   - Search error message online

2. **Browser Console**
   - F12 in browser
   - Check for error messages
   - Check Network tab for API calls

3. **Server Terminal**
   - Check for backend error logs
   - Verify connections to MongoDB
   - Check port availability

4. **Stack Overflow**
   - Search for your error
   - Ask with specific error message
   - Include code snippets

### Reporting Issues

When reporting an issue, include:
- Error message (full stack trace)
- Steps to reproduce
- Expected vs. actual behavior
- Environment (OS, Node version, etc.)
- Browser/DevTools information

---

**Happy Coding!** 🚀

Remember: Keep it simple, test thoroughly, and document your changes!
