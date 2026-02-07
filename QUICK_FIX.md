# 403 Error Quick Fix Guide

**If you're getting 403 Forbidden on message API calls, follow these steps:**

## Immediate Actions (Try These First)

### 1. Clear Cache and Re-Login (60 seconds)
```bash
# In browser DevTools console:
localStorage.clear()
sessionStorage.clear()
location.reload()

# Then login again
```

### 2. Restart Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev  # or npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev  # or yarn dev
```

### 3. Check Token is Saved (10 seconds)
```javascript
// In browser console:
const token = localStorage.getItem('authToken');
console.log('Token saved:', !!token);
console.log('Token length:', token?.length);  // Should be > 100
```

---

## Verify Authorization Header Sent (30 seconds)

1. **Open DevTools** → Network tab
2. **Make a request** to /api/messages
3. **Click the request**
4. **Go to Headers section**
5. **Look for:** `Authorization: Bearer eyJhbGc...`

**Not there?** → Token not in localStorage (re-login)

---

## Common Causes & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `No authorization header` | Token missing | Login again |
| `Invalid auth header format` | Wrong format | Restart frontend |
| `Invalid or expired token` | Bad JWT_SECRET | Restart backend, re-login |
| `You do not have access` | Not in chat | Add to chat in UI |

---

## Verify Backend Setup

```bash
# Check JWT_SECRET is set:
echo $JWT_SECRET

# If empty, update .env:
# JWT_SECRET=your_secret_key_here
# Then: npm run dev
```

---

## Test with Postman

1. **Login:** POST `http://localhost:5000/api/auth/login`
   - Body: `{"email":"user@example.com","password":"pass"}`
   - Copy the `token` from response

2. **Get Messages:** GET `http://localhost:5000/api/messages/chatId`
   - Headers: `Authorization: Bearer <paste_token>`
   - Should get 200 response

3. **If getting 403:**
   - Check MongoDB: is user in `Chat.users` array?
   - Run: `db.chats.findOne({_id: ObjectId("chatId")})`

---

## Last Resort

If nothing works:
1. Delete `.env.example` file if it exists
2. Create fresh `.env` with all variables
3. Restart backend: `npm run dev`
4. Restart frontend: `npm run dev`
5. Clear browser cache and re-login
6. Check backend logs for error details

---

**See DEBUG_GUIDE.md for comprehensive debugging steps!**

