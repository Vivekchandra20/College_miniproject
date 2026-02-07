# 403 Forbidden Error Debugging Guide

## Overview
This document provides a comprehensive guide to debugging 403 Forbidden errors in the MERN messaging application, particularly for REST API calls related to messages while Socket.IO connections work fine.

---

## Authentication Flow

### 1. Frontend → Backend Token Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User logs in/registers                                      │
│  2. Backend returns JWT token                                   │
│  3. Token stored in localStorage                               │
│     └─ localStorage.getItem('authToken')                       │
│                                                                  │
│  4. API requests made with Axios                               │
│     └─ Request interceptor adds: Authorization: Bearer <token> │
│        config.headers.Authorization = `Bearer ${token}`        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

                            HTTP Request
                                 ↓
                    Header: Authorization: Bearer <JWT>

┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Request arrives at authMiddleware                           │
│  2. Extract token: authHeader.split(' ')[1]                    │
│  3. Verify with JWT_SECRET                                     │
│  4. Attach userId to req.userId                                │
│  5. Call next() to proceed                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

                         Route Handler
                                 ↓
                    Return response with data
```

---

## Common 403 Errors and Solutions

### Error 1: Missing Authorization Header

**Symptom:**
```
POST /api/messages 403 Forbidden
Response: "No authorization header provided"
```

**Root Cause:**
- Token not stored in localStorage
- Request interceptor not attaching token
- Token is null or undefined

**Debug Steps:**
```javascript
// In browser console:
localStorage.getItem('authToken')  // Should print token, not null

// In browser Network tab:
// Check request headers → see "Authorization: Bearer <token>"
```

**Solution:**
1. Verify login success
2. Check `localStorage.setItem('authToken', token)` in AuthContext
3. Ensure token is stored immediately after login

---

### Error 2: Invalid Token Format

**Symptom:**
```
401 Unauthorized
Response: "Invalid authorization header format. Use: Authorization: Bearer <token>"
```

**Root Cause:**
- Authorization header not "Bearer <token>" format
- Missing space between "Bearer" and token
- Extra characters in token

**Debug Steps:**
```
1. Open DevTools → Network tab
2. Select a request to /api/messages
3. Check Headers → Authorization
4. Should show: "Bearer eyJhbGc..." (not "Bearertoken" or "token" alone)
```

**Solution:**
Check frontend api.js request interceptor:
```javascript
config.headers.Authorization = `Bearer ${token}`;  // ✓ Correct format
// NOT:
config.headers.Authorization = token;              // ✗ Wrong
config.headers.Authorization = `Bearer${token}`;   // ✗ Missing space
```

---

### Error 3: Invalid or Expired Token

**Symptom:**
```
401 Unauthorized
Response: "Invalid or expired token"
```

**Root Cause:**
- JWT signature mismatch (JWT_SECRET changed)
- Token expired (7 days old)
- Token corrupted or tampered

**Debug Steps:**
```bash
# Check backend .env
echo $JWT_SECRET  # Should output the secret key

# Verify same secret is used for signing and verification
# Check backend/middlewares/authMiddleware.js:
# Line: jwt.verify(token, jwtSecret);
```

**Solution:**
1. Ensure JWT_SECRET matches between login (generateToken) and verification
2. Log JWT_SECRET (first 10 chars only!) to verify it's loaded
3. Re-login to get fresh token if old one expired

---

### Error 4: 403 Access Denied to Chat

**Symptom:**
```
GET /api/messages/:chatId 403 Forbidden
Response: "You do not have access to this chat"
```

**Root Cause:**
- Token is valid, BUT user is not part of the chat
- Chat was deleted or user removed
- User ID mismatch in database

**Debug Steps:**
```javascript
// In browser console after login:
const user = JSON.parse(localStorage.getItem('user'));
console.log('Current user ID:', user.id);

// Check backend logs:
// [Messages] User <userId> not in chat <chatId>
// Chat users: 507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012
```

**Solution:**
1. Verify user is added to the chat in the database
2. Check Chat.users array contains the current user's ID
3. Ensure IDs match exactly (string comparison needed)

---

## Step-by-Step Debugging Procedure

### When You Get 403 Error:

#### Step 1: Frontend Checks
```javascript
// In browser DevTools console:

// Check 1: Is token stored?
const token = localStorage.getItem('authToken');
console.log('Token exists:', !!token);
console.log('Token length:', token?.length);  // Should be > 100

// Check 2: Is user object stored?
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('User ID:', user?.id);

// Check 3: Is interceptor adding header?
// (Open Network tab and make a request to /api/messages)
// Click request → Headers tab → Request Headers
// Look for: Authorization: Bearer <very_long_string>
```

#### Step 2: Backend Checks
```bash
# Terminal running backend server:

# Check 1: Is JWT_SECRET set?
printenv JWT_SECRET  # or echo $JWT_SECRET

# Check 2: Watch backend logs:
# npm run dev  # Should show logs like:
# [Auth] User authenticated: 607f1f77bcf86cd799439011 | Path: GET /api/messages/:chatId
# [Messages] GET messages | Chat: 507f1f77bcf86cd799439012 | User: 607f1f77bcf86cd799439011
```

#### Step 3: Database Checks
```javascript
// In MongoDB shell or Atlas UI:

// Check the chat document:
db.chats.findOne({ _id: ObjectId("507f1f77bcf86cd799439012") });

// Output should show:
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  users: [
    ObjectId("607f1f77bcf86cd799439011"),  // Current user
    ObjectId("707f1f77bcf86cd799439013")   // Other user
  ],
  ...
}

// Verify current user ID is in the users array!
```

---

## Browser DevTools Debugging

### Console Logs to Monitor

The application now includes detailed logging. Open browser console and look for:

```
[API Request] GET /api/messages/607f1f... | Token present: Yes
[Auth] User authenticated: 607f1f... | Path: GET /api/messages/607f1f...
[Messages] GET messages | Chat: 507f1f... | User: 607f1f...
[ChatWindow] Fetching messages for chat: 507f1f...
[ChatWindow] Messages fetched successfully: 5
```

### Network Tab Analysis

1. **Make a request to /api/messages/:chatId**
2. **Click the request in Network tab**
3. **Go to "Headers" tab**
4. **Check Request Headers section:**

```
✓ Correct:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2OTc4MTczMTYsImV4cCI6MTY5ODQyMjExNn0.abcdef...

✗ Wrong:
Authorization: Bearer null
Authorization: null
(no Authorization header)
```

---

## Postman Testing

### Setup a Request with Token

1. **Login First:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body:
     ```json
     {
       "email": "user@example.com",
       "password": "password123"
     }
     ```
   - Copy the returned `token` value

2. **Get Messages:**
   - Method: GET
   - URL: `http://localhost:5000/api/messages/607f1f77bcf86cd799439012`
   - Headers tab → Add:
     ```
     Key: Authorization
     Value: Bearer <paste_token_here>
     ```

3. **Expected Response (200):**
   ```json
   {
     "success": true,
     "messages": [...]
   }
   ```

---

## Environment Configuration Checklist

### Backend `.env`

```bash
✓ PORT=5000
✓ NODE_ENV=development
✓ MONGODB_URI=mongodb://localhost:27017/messaging-app
✓ JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
✓ CLIENT_URL=http://localhost:5173
```

**Verify:**
```bash
# Restart backend after changing .env
npm run dev
```

### Frontend `.env` (if using Vite)

```bash
✓ VITE_API_URL=http://localhost:5000/api
```

**Verify:**
```javascript
// In browser console:
console.log(import.meta.env.VITE_API_URL);  // Should print http://localhost:5000/api
```

---

## Quick Fixes Checklist

- [ ] **Backend restarted** after changing .env?
- [ ] **Frontend restarted** after changing .env?
- [ ] **JWT_SECRET** is set in backend .env?
- [ ] **User re-logged in** to get fresh token?
- [ ] **Token visible** in localStorage? (`localStorage.getItem('authToken')`)
- [ ] **Authorization header sent** in Network tab requests?
- [ ] **User is added to chat** in MongoDB?
- [ ] **Check console logs** for detailed error messages?

---

## Common Issues Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| No Authorization header | Token not in localStorage | Login again, check setItem call |
| Invalid header format | Missing "Bearer " prefix | Check api.js interceptor format |
| 401 Unauthorized | Bad JWT_SECRET or expired token | Restart backend, re-login |
| 403 User not in chat | User not added to Chat.users | Verify in MongoDB, recreate chat |
| Token is null | Login failed silently | Check login response in Network tab |
| Works on reload, fails on nav | Token not persisting | Check localStorage in DevTools |

---

## Testing the Fix

### 1. Login
```
POST /api/auth/login
Headers: Content-Type: application/json
Body: {"email": "user@example.com", "password": "password"}

✓ Response: 200 + token
```

### 2. Get Chats
```
GET /api/chats
Headers: Authorization: Bearer <token>

✓ Response: 200 + chats array
```

### 3. Get Messages
```
GET /api/messages/<chatId>
Headers: Authorization: Bearer <token>

✓ Response: 200 + messages array
✗ Response: 403 → User not in chat (check DB)
✗ Response: 401 → Invalid token (re-login)
```

### 4. Send Message
```
POST /api/messages
Headers: Authorization: Bearer <token>
Body: {"chatId": "<id>", "content": "Hello!"}

✓ Response: 201 + message object
✗ Response: 403 → User not in chat
✗ Response: 401 → Invalid token
```

---

## Getting Help

If you're still getting 403 errors:

1. **Check backend logs** for detailed error information
2. **Check browser console** for client-side errors
3. **Verify token exists**: `localStorage.getItem('authToken')`
4. **Verify Authorization header** in Network tab
5. **Check MongoDB** for user in chat.users
6. **Restart both frontend and backend** after .env changes
7. **Clear browser cache** and re-login

---

## Code References

- **Frontend token storage:** [AuthContext.jsx](frontend/src/context/AuthContext.jsx#L35)
- **Frontend token sending:** [api.js](frontend/src/services/api.js#L18)
- **Backend token verification:** [authMiddleware.js](backend/middlewares/authMiddleware.js)
- **Message routes:** [messageRoutes.js](backend/routes/messageRoutes.js)
- **Message controller:** [messageController.js](backend/controllers/messageController.js)

