# 403 Error Resolution Checklist

Use this checklist to ensure your authentication and message API are working correctly.

## Pre-Deployment Checks

### Environment Setup
- [ ] Backend `.env` file exists with:
  - [ ] `PORT=5000`
  - [ ] `NODE_ENV=development` (dev) or `production` (prod)
  - [ ] `MONGODB_URI=mongodb://localhost:27017/messaging-app` (or your DB URL)
  - [ ] `JWT_SECRET=<a-long-random-secret-key>` (NOT the default!)
  - [ ] `CLIENT_URL=http://localhost:5173`
- [ ] Frontend `.env` file exists (or .env.local) with:
  - [ ] `VITE_API_URL=http://localhost:5000/api`
- [ ] No duplicate `.env.example` files in root directories

### Database Setup
- [ ] MongoDB is running
- [ ] Database exists and has collections
- [ ] At least one test user exists in DB

### Server Status
- [ ] Backend starts without errors: `npm run dev`
  - [ ] Shows "Server running on port 5000"
  - [ ] Shows "Connected to MongoDB"
  - [ ] JWT_SECRET is loaded (check logs)
- [ ] Frontend starts without errors: `npm run dev`
  - [ ] Shows compilation successful
  - [ ] Dev server running on localhost:5173

---

## Feature Testing

### Authentication Flow
- [ ] **Register Page**
  - [ ] Can access /register
  - [ ] Form validation works
  - [ ] Can create new user
  - [ ] Redirects to chat page on success
  - [ ] Token stored in localStorage

- [ ] **Login Page**
  - [ ] Can access /login
  - [ ] Can login with correct credentials
  - [ ] Redirects to chat page on success
  - [ ] Token stored in localStorage
  - [ ] Token format is long string (> 100 chars)

### Message API (Most Critical for 403 Errors)
- [ ] **Get Messages (GET /api/messages/:chatId)**
  - [ ] Select a chat → messages load
  - [ ] Console shows `[API Request] GET /api/messages | Token present: Yes`
  - [ ] Backend shows `[Auth] User authenticated`
  - [ ] Backend shows `[Messages] GET messages | Chat: ... | User: ...`
  - [ ] Response code: 200 ✓ (NOT 403 or 401)

- [ ] **Send Message (POST /api/messages)**
  - [ ] Type message and send
  - [ ] Console shows `[API Request] POST /api/messages | Token present: Yes`
  - [ ] Message appears immediately
  - [ ] Backend shows `[Messages] POST message | Chat: ... | User: ...`
  - [ ] Backend shows `[Messages] Message created successfully`
  - [ ] Response code: 201 ✓ (NOT 403 or 401)

- [ ] **Delete Message (DELETE /api/messages/:id)**
  - [ ] Can delete own message
  - [ ] Console shows token is present
  - [ ] Message disappears from UI
  - [ ] Response code: 200 ✓ (NOT 403 or 401)

- [ ] **Edit Message (PUT /api/messages/:id)**
  - [ ] Can edit own message
  - [ ] Updated text appears in UI
  - [ ] Response code: 200 ✓ (NOT 403 or 401)

### Chat Operations
- [ ] **Get All Chats (GET /api/chats)**
  - [ ] Chat list loads after login
  - [ ] Response code: 200 ✓
  - [ ] Shows all user's chats

- [ ] **Create Chat (POST /api/chats/access)**
  - [ ] Can start new 1-to-1 chat
  - [ ] Response code: 200 or 201 ✓

- [ ] **Create Group Chat (POST /api/chats/group)**
  - [ ] Can create group chat
  - [ ] Can add multiple users
  - [ ] Response code: 201 ✓

### Real-Time Features
- [ ] **Socket.IO Connection**
  - [ ] Connects on login
  - [ ] Shows user online status
  - [ ] Typing indicators work
  - [ ] Real-time message sync works

---

## Debugging Verification

### Browser Console Checks
Open DevTools → Console and verify logs appear:
```
✓ [API Request] GET /api/chats | Token present: Yes
✓ [API Request] GET /api/messages/... | Token present: Yes
✓ [API Request] POST /api/messages | Token present: Yes
✓ [API Response] 200 GET /api/chats
✓ [ChatWindow] Fetching messages for chat: ...
✓ [ChatWindow] Messages fetched successfully: ...
✓ [ChatWindow] Sending message to chat: ...
✓ [ChatWindow] Message sent successfully
```

**Not seeing logs?** → Check if console is selecting correct frame and page reloaded

### Network Tab Checks
1. Open DevTools → Network tab
2. Make a message API call
3. Click the request
4. Check Headers section → Request Headers:
```
✓ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✓ Content-Type: application/json
```

**Not seeing Authorization header?** → Token not in localStorage

### Backend Log Checks
Watch the backend terminal for:
```
✓ [Auth] User authenticated: 607f1f... | Path: GET /api/messages/...
✓ [Messages] GET messages | Chat: 507f1f... | User: 607f1f...
✓ [Messages] Found X messages for chat...
```

**Not seeing [Auth] logs?** → Middleware not executing (routes issue)
**Seeing access denied logs?** → User not in chat.users array

---

## 403 Error Troubleshooting

If you see `403 Forbidden` error:

1. **Check Token Exists**
   ```javascript
   // Browser console:
   console.log(localStorage.getItem('authToken'));
   // Should print long string, NOT null
   ```
   - [ ] Token exists
   - [ ] If missing → re-login

2. **Check Authorization Header**
   - [ ] DevTools Network tab
   - [ ] Click message API request
   - [ ] Headers → Request Headers
   - [ ] See `Authorization: Bearer ...`
   - [ ] If missing → restart frontend

3. **Check Backend Logs**
   - [ ] See `[Auth] User authenticated` in logs
   - [ ] If missing → token is invalid/expired
   - [ ] Solution: re-login

4. **Check Chat Access**
   - [ ] See `[Messages] User ... not in chat` in logs
   - [ ] This means token is valid but user not in this chat
   - [ ] Solution: Add user to chat or create new chat

5. **Check User is in Chat**
   ```javascript
   // MongoDB console:
   db.chats.findOne({_id: ObjectId("...")}).users
   // Should include current user's ID
   ```
   - [ ] User exists in chat.users array
   - [ ] If missing → add user to chat

---

## Common Issues Resolution

| Issue | Check | Fix |
|-------|-------|-----|
| 403 on all requests | No token log | Re-login |
| 403 on messages only | Token works for chats | User not in chat - check DB |
| 401 error | Invalid header format | Restart frontend |
| Works then fails | Token expired | Re-login |
| Works in Postman, not in app | localStorage empty | Check login flow |
| Socket connects, REST fails | Different auth issue | Check JWT_SECRET |

---

## Performance Checks

- [ ] Message load time < 2 seconds
- [ ] Message send time < 1 second
- [ ] No lag on typing indicators
- [ ] No duplicate messages from socket + REST
- [ ] No memory leaks in browser (DevTools Performance tab)

---

## Security Checks

- [ ] JWT_SECRET is unique and strong (not default)
- [ ] Token not visible in Network tab plaintext? (should be in Bearer header only)
- [ ] Cannot access API without token
- [ ] Cannot access other users' chats (403 error)
- [ ] Cannot edit/delete other users' messages (403 error)
- [ ] No sensitive info in error messages shown to users

---

## Production Readiness

- [ ] All console.logs removed or use proper logging
- [ ] Error messages don't expose system details
- [ ] CORS properly configured (not `*`)
- [ ] JWT_SECRET changed from default
- [ ] NODE_ENV=production
- [ ] Database credentials secured
- [ ] HTTPS enabled (if deployed)
- [ ] Rate limiting implemented
- [ ] Request validation on all endpoints

---

## Post-Deployment Verification

- [ ] Can login from production URL
- [ ] Can send/receive messages
- [ ] No 403 errors in production logs
- [ ] Performance acceptable
- [ ] Error alerts working
- [ ] Backup of database working

---

## Notes

Record any issues found:
```
Issue: ___________________________
Date: ____________________________
Resolution: _______________________
```

---

## Success Criteria

✓ All message API calls return 200/201 (not 403)
✓ Token present in all requests (check Network tab)
✓ Backend logs show successful authentication
✓ User can send, edit, delete messages
✓ Real-time socket connections work
✓ No errors in browser console
✓ Comprehensive logging helps with future debugging

---

**Start here if getting 403 errors:** See [QUICK_FIX.md](QUICK_FIX.md)
**Detailed debugging:** See [DEBUG_GUIDE.md](DEBUG_GUIDE.md)
**Implementation details:** See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

