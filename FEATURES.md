# Real-Time Messaging Application - Features Guide

## Feature Overview

This guide explains all features and how to use them effectively.

## 1. User Authentication

### Registration
1. Click "Register" on the login page
2. Enter:
   - Username (3-20 characters, must be unique)
   - Email (valid email format, must be unique)
   - Password (minimum 6 characters)
   - Confirm Password (must match password)
3. Click "Register"
4. You'll be automatically logged in and redirected to chat page

### Login
1. Enter your email and password
2. Check "Remember Me" to stay logged in
3. Click "Login"
4. You'll be redirected to the main chat page

### Logout
1. (Feature to be implemented) Click user menu
2. Select "Logout"
3. You'll be logged out and redirected to login page

## 2. One-to-One Messaging

### Starting a Direct Chat
1. From the chat list, look for an option to start a new chat
2. Enter the username or email of the person you want to chat with
3. The chat will be created/opened
4. You can now send and receive messages in real-time

### Sending Messages
1. Type your message in the input field at the bottom
2. You can see:
   - Attachment button (📎) - for future file sharing
   - Text input area
   - Emoji button (😊) - for emoji selection
   - Send button
3. Click "Send" or press Enter (configurable)
4. The message appears instantly for both users

### Message Features
- **Timestamps**: Each message shows when it was sent
- **Read Receipts**: See when your messages are read
- **Typing Indicators**: "User is typing..." appears while they compose
- **Message Editing**: Hover over your message and click ✎ to edit
- **Message Deletion**: Hover over your message and click 🗑 to delete
- **Edited Indicator**: Shows "(edited)" if a message was modified

### User Status
- **Online Status**: Green dot (🟢) means user is online
- **Last Seen**: Shows when user was last active
- Updates in real-time as users come online/offline

## 3. Group Messaging

### Creating a Group Chat
1. Click the create chat button (✎) in the top right
2. Fill in:
   - Group Name (e.g., "Project Team")
   - Select Members (choose people to add)
3. Click "Create"
4. The group chat is created with you as the admin

### Group Features
- **Group Name**: Displayed prominently in the header
- **Member List**: See all group members
- **Admin Controls** (admins only):
  - Add new members
  - Remove members
  - Edit group name
  - Delete group

### Group Notifications
- See when members join/leave
- See who sent each message
- Know when group admins make changes

## 4. Real-Time Features

### Typing Indicators
- When someone is composing a message, you see: "username is typing..."
- Clears automatically after 3 seconds of inactivity
- Works for both one-to-one and group chats

### Online Status
- See a green dot (🟢) next to online users
- See "Last seen [time]" for offline users
- Status updates automatically

### Message Delivery
- Messages appear instantly in real-time
- No page refresh needed
- Works even while user is typing

### Read Receipts
- See who has read your messages
- Hover over a message to see read details (in group chats)

## 5. Chat Management

### Chat List Features
- **Search**: Search chats by name or username
- **Sort**: Recent chats appear at the top
- **Last Message Preview**: Quickly see the last message
- **Unread Count**: Badge shows unread messages (when implemented)

### Chat Selection
- Click any chat to open it
- The selected chat highlights
- Messages load automatically

### Auto-Marking as Read
- Messages are marked as read when you open the chat
- Read status syncs in real-time

## 6. Messages Features

### Message Display
- **Sender Avatar**: Color-coded for each user
- **Sender Name**: In group chats (not in one-to-one)
- **Message Content**: Full text with word wrapping
- **Timestamp**: Precise time in HH:MM format
- **Read Status**: Indicates if message was read

### Message Actions
1. **Hover** over your own messages to see options
2. **Edit** (✎): Change message content
   - Updated messages show "(edited)"
   - Edit modal appears
3. **Delete** (🗑): Remove message permanently
   - Confirmation is optional (implement if needed)

### Message Search (Future)
- Search through chat history
- Filter by sender
- Filter by date range

## 7. User Profile

### Profile Information
- Username
- Email
- Profile picture (placeholder avatar with initials)
- Online status

### Profile Updates (Future)
- Change profile picture
- Update profile information
- Change password
- Privacy settings

## 8. Advanced Features

### Block Users (Future)
- Block/unblock users
- Blocked users can't message you
- Blocked users don't see your status

### Notification Settings (Future)
- Sound notifications
- Desktop notifications
- Notification timing preferences

### Message Encryption (Future)
- End-to-end encryption
- Secure message storage
- Encrypted attachments

### Call Features (Future)
- Voice calls
- Video calls
- Screen sharing
- Call history

## Usage Tips

### Best Practices
1. **Clear Messaging**: Be concise and clear
2. **Check Status**: Verify user is online before urgent messages
3. **Group Organization**: Keep groups focused on specific topics
4. **Notification Control**: Customize notifications per chat
5. **Privacy**: Use secure passwords and enable 2FA (future)

### Performance Optimization
1. **Clear Old Chats**: Archive or delete old conversations
2. **Manage Groups**: Keep group member count reasonable
3. **File Management**: Delete unnecessary shared files (future)
4. **Search Efficiently**: Use specific keywords when searching

### Keyboard Shortcuts (Future)
- `Enter` - Send message
- `Shift+Enter` - New line in message
- `Ctrl+A` - Select all in message
- `Ctrl+B` - Bold text
- `Ctrl+I` - Italic text

## Troubleshooting

### Messages Not Sending
1. Check internet connection
2. Verify backend is running
3. Check browser console for errors
4. Try refreshing the page

### Not Receiving Messages
1. Ensure you're in the correct chat
2. Check if recipient is online
3. Verify Socket.IO connection (DevTools > Network > WS)
4. Refresh the page

### User Status Not Updating
1. Wait 5-10 seconds for status update
2. Check WebSocket connection
3. Refresh the page
4. Restart the server

### Messages Appearing Out of Order
1. Check service timestamps on server
2. Verify database is working correctly
3. Check for network latency issues
4. Refresh the chat

### Typing Indicator Not Showing
1. Verify WebSocket is connected
2. Check browser's Socket.IO events (DevTools)
3. Ensure the event listener is active
4. Check server logs for errors

## Feature Roadmap

### Phase 1 (Current)
- ✅ User authentication
- ✅ One-to-one messaging
- ✅ Group messaging
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Read receipts

### Phase 2 (Planned)
- [ ] File sharing/attachments
- [ ] Message reactions (👍 ❤️ 😂)
- [ ] Message forwarding
- [ ] Message pinning
- [ ] Chat muting
- [ ] User blocking

### Phase 3 (Planned)
- [ ] Voice calls
- [ ] Video calls
- [ ] Screen sharing
- [ ] Call recording
- [ ] Call history

### Phase 4 (Planned)
- [ ] Message search
- [ ] Chat backup
- [ ] Export conversations
- [ ] Dark mode
- [ ] Multiple device sync

### Phase 5 (Planned)
- [ ] End-to-end encryption
- [ ] Message expiration
- [ ] Two-factor authentication
- [ ] Biometric login
- [ ] User presence location

## API Response Examples

### Successful Message Send
```javascript
{
  success: true,
  message: {
    _id: "507f1f77bcf86cd799439011",
    sender: {
      _id: "507f1f77bcf86cd799439012",
      username: "john_doe",
      email: "john@example.com",
      profilePic: null
    },
    chat: "507f1f77bcf86cd799439013",
    content: "Hello world!",
    readBy: [
      { user: "507f1f77bcf86cd799439012" }
    ],
    edited: false,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  }
}
```

### Chat List Response
```javascript
{
  success: true,
  chats: [
    {
      _id: "507f1f77bcf86cd799439014",
      users: [
        {
          _id: "507f1f77bcf86cd799439012",
          username: "john_doe",
          email: "john@example.com",
          isOnline: true,
          lastSeen: "2024-01-15T10:35:00Z"
        }
      ],
      isGroupChat: false,
      lastMessage: {
        _id: "507f1f77bcf86cd799439011",
        content: "Hello world!",
        createdAt: "2024-01-15T10:30:00Z"
      },
      updatedAt: "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Security Reminders

- ✅ Never share your password
- ✅ Log out on shared computers
- ✅ Don't use personal info in passwords
- ✅ Enable browser security features
- ✅ Keep your browser updated
- ✅ Report suspicious activity
- ⚠️ Disable message notifications in browser history
- ⚠️ Use VPN for extra security on public Wi-Fi

---

**For more information, check SETUP.md and ARCHITECTURE.md files**
