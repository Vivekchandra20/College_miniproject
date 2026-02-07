# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- ✅ Node.js installed
- ✅ MongoDB running (local or Atlas)
- ✅ Terminal/Command prompt

### Step 1: Backend Setup (2 min)

```bash
cd backend
npm install
npm start
```

You should see: "✓ Server running on port 5000"

### Step 2: Frontend Setup (2 min)

Open a **new terminal** window:

```bash
cd frontend
npm install
npm run dev
```

You should see: "➜ Local: http://localhost:5173/"

### Step 3: Open the App (1 min)

1. Go to http://localhost:5173 in your browser
2. Register a new account
3. Open the app in another browser window with a different account
4. Start messaging! 💬

## 📁 Project Structure at a Glance

```
collegeMiniProject/
├── backend/                    # Node.js + Express server
│   ├── server.js              # Main entry point
│   ├── package.json           # Dependencies
│   └── .env                   # Config (create from .env.example)
│
├── frontend/                   # React app
│   ├── src/
│   │   ├── App.jsx           # Root component
│   │   ├── pages/            # Login, Register, Chat
│   │   ├── components/       # UI components
│   │   ├── services/         # API & WebSocket
│   │   └── context/          # Auth state
│   ├── package.json
│   └── index.html
│
├── README.md                  # Overview
├── SETUP.md                   # Detailed setup guide
├── FEATURES.md               # Feature documentation
└── ARCHITECTURE.md           # Technical details
```

## 🔧 Common Commands

### Backend
```bash
cd backend

# Install dependencies
npm install

# Start server
npm start

# Start with hot reload
npm run dev
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Quick Test

### Test User 1
- Email: `testuser1@example.com`
- Password: `password123`
- Username: `testuser1`

### Test User 2
- Email: `testuser2@example.com`
- Password: `password123`
- Username: `testuser2`

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check MongoDB is running: `mongod` |
| Port 5000 in use | Change PORT in `.env` or kill process |
| Frontend won't load | Verify backend is running on 5000 |
| Messages not sending | Make sure both frontend & backend are running |
| Socket not connected | Check browser console & refresh page |

## 📚 Documentation Map

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview & features |
| [SETUP.md](SETUP.md) | Detailed installation & setup |
| [FEATURES.md](FEATURES.md) | How to use each feature |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical implementation details |

## 🎯 Next Steps

1. ✅ Run the application (see steps above)
2. ✅ Test with two user accounts
3. 📖 Read [FEATURES.md](FEATURES.md) to learn all features
4. 🔍 Explore the code in `backend/` and `frontend/`
5. 🚀 Deploy to production (see [SETUP.md](SETUP.md))

## 📱 Demo Features

- ✅ Real-time messaging (Socket.IO)
- ✅ One-to-one chats
- ✅ Group chats
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message timestamps
- ✅ Edit & delete messages
- ✅ User authentication with JWT

## 🔐 Default Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/messaging-app
JWT_SECRET=your_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 💡 Pro Tips

- 🔄 Use two browser windows to test real-time features
- 📱 Test responsive design by resizing window
- 🔍 Check browser console for errors
- 📊 Check server terminal for API logs
- 🧪 Test with different user accounts

## 🚀 Production Deployment

For deploying to production, see [SETUP.md - Deployment Section](SETUP.md#deployment)

## 📞 Need Help?

1. Check [SETUP.md](SETUP.md#troubleshooting) for troubleshooting
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
3. Check browser console (F12) for error messages
4. Check server terminal for server-side errors

## 📝 License

MIT - Feel free to use for personal or commercial projects

---

**Ready to code?** Start with Backend → Frontend → Open browser → Register → Chat! 🎉

Need more details? Check the full documentation in SETUP.md and ARCHITECTURE.md
