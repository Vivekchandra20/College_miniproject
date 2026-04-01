/**
 * ChatWindow Component
 * Displays messages and input for a selected chat
 */

import React, { useState, useEffect, useRef } from 'react';
import { messageAPI, chatAPI } from '../services/api';
import {
  messageEvents,
  typingEvents,
  callEvents,
  webRTCEvents,
  getSocket,
} from '../services/socket';
import { useAuth } from '../context/AuthContext';
import MessageItem from './MessageItem';
import { formatTime, getAvatarColor, getAvatarInitials, debounce } from '../utils/helpers';
import {
  getOrCreateKeypair,
  encryptMessageForRecipients,
  decryptMessageForUser,
  buildEncryptedPayloadFromMessage,
} from '../utils/e2ee';

const ChatWindow = ({ chat, onChatUpdated }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [callStatus, setCallStatus] = useState('idle');
  const [incomingCall, setIncomingCall] = useState(null);
  const [callError, setCallError] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const remoteStreamsRef = useRef(new Map());
  const callStatusRef = useRef('idle');
  const incomingCallRef = useRef(null);
  const keypairRef = useRef(null);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    (async () => {
      try {
        const keypair = await getOrCreateKeypair(user.id);
        keypairRef.current = keypair;

        if (!user.publicKey || user.publicKey !== keypair.publicKey) {
          try {
            await chatAPI.getChatById(chat._id).then((response) => {
              if (response.data?.chat) {
                onChatUpdated?.(response.data.chat);
              }
            });
          } catch (error) {
            // Ignore refresh errors
          }
        }
      } catch (error) {
        console.warn('[ChatWindow] Failed to initialize E2EE keypair');
      }
    })();
  }, [user?.id, chat._id, onChatUpdated]);

  const updateRemoteStreams = () => {
    const streamEntries = Array.from(remoteStreamsRef.current.entries()).map(
      ([userId, stream]) => ({ userId, stream })
    );
    setRemoteStreams(streamEntries);
  };

  const ensureLocalStream = async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      setCallError('Microphone access denied or unavailable');
      throw error;
    }
  };

  const createPeerConnection = (targetUserId) => {
    if (peerConnectionsRef.current.has(targetUserId)) {
      return peerConnectionsRef.current.get(targetUserId);
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        webRTCEvents.sendIceCandidate(targetUserId, event.candidate);
      }
    };

    peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        remoteStreamsRef.current.set(targetUserId, stream);
        updateRemoteStreams();
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(peerConnection.connectionState)) {
        remoteStreamsRef.current.delete(targetUserId);
        updateRemoteStreams();
      }
    };

    peerConnectionsRef.current.set(targetUserId, peerConnection);
    return peerConnection;
  };

  const closeAllConnections = () => {
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();
    updateRemoteStreams();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  };

  const endCall = (notifyTargets = []) => {
    notifyTargets.forEach((targetUserId) => {
      callEvents.rejectCall(targetUserId);
    });

    closeAllConnections();
    setCallStatus('idle');
    setIncomingCall(null);
    setCallError(null);
  };

  /**
   * Scroll to bottom
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRecipientsForChat = () => {
    const recipients = chat.users.map((chatUser) => ({
      userId: chatUser._id,
      publicKey: chatUser.publicKey,
    }));

    return recipients;
  };

  const decryptMessage = async (message) => {
    if (!message.isEncrypted) {
      return message;
    }

    const keypair = keypairRef.current || (user?.id ? await getOrCreateKeypair(user.id) : null);
    if (!keypair) {
      return { ...message, content: '[Encrypted message]' };
    }

    const senderPublicKey = message.sender?.publicKey || message.senderPublicKey;
    if (!senderPublicKey) {
      return { ...message, content: '[Encrypted message]' };
    }

    const payload = buildEncryptedPayloadFromMessage(message);
    const decrypted = await decryptMessageForUser(payload, user?.id, keypair, senderPublicKey);

    return {
      ...message,
      content: decrypted || '[Encrypted message]',
    };
  };

  /**
   * Fetch messages
   */
  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log(`[ChatWindow] Fetching messages for chat: ${chat._id}`);
      
      const response = await messageAPI.getMessages(chat._id, 50, 0);
      console.log(`[ChatWindow] Messages fetched successfully:`, response.data.messages?.length || 0);
      
      const fetchedMessages = response.data.messages || [];
      const decryptedMessages = await Promise.all(
        fetchedMessages.map((msg) => decryptMessage(msg))
      );
      setMessages(decryptedMessages);

      // Mark all as read
      try {
        await messageAPI.markChatAsRead(chat._id);
        console.log(`[ChatWindow] Chat marked as read: ${chat._id}`);
      } catch (readError) {
        console.warn('[ChatWindow] Failed to mark chat as read:', readError.response?.status, readError.response?.data?.message);
      }
    } catch (error) {
      console.error('[ChatWindow] Failed to fetch messages:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message,
      });
      
      alert(`Failed to load messages: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize messages and listeners
   */
  useEffect(() => {
    fetchMessages();

    // Listen for incoming messages
    const handleNewMessage = async (data) => {
      if (data.chatId === chat._id) {
        const decryptedMessage = await decryptMessage(data.message);
        setMessages((prev) => [...prev, decryptedMessage]);
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      if (data.chatId === chat._id) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.chatId === chat._id) {
        setTypingUsers((prev) =>
          prev.filter((name) => name !== data.username)
        );
      }
    };

    messageEvents.onMessageReceived(handleNewMessage);
    typingEvents.onUserTyping(handleUserTyping);
    typingEvents.onUserStoppedTyping(handleUserStoppedTyping);

    scrollToBottom();

    return () => {
      const socket = getSocket();
      socket.off('receive-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
    };
  }, [chat._id]);

  useEffect(() => {
    const handleIncomingCall = (data) => {
      if (data?.callData?.callType !== 'voice') {
        return;
      }

      if (data?.callData?.chatId !== chat._id) {
        return;
      }

      if (callStatusRef.current !== 'idle') {
        callEvents.rejectCall(data.from);
        return;
      }

      setIncomingCall({ from: data.from, callData: data.callData });
    };

    const handleCallAccepted = async (data) => {
      if (callStatusRef.current !== 'outgoing') {
        return;
      }

      if (data?.callData?.chatId !== chat._id) {
        return;
      }

      try {
        await ensureLocalStream();
        const peerConnection = createPeerConnection(data.from);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        webRTCEvents.sendOffer(data.from, offer);
        setCallStatus('in-call');
      } catch (error) {
        setCallError('Failed to start call');
      }
    };

    const handleCallRejected = (data) => {
      if (callStatusRef.current === 'idle') {
        return;
      }

      endCall();
    };

    const handleOffer = async (data) => {
      if (
        callStatusRef.current === 'idle' &&
        (!incomingCallRef.current || incomingCallRef.current.from !== data.from)
      ) {
        return;
      }

      try {
        await ensureLocalStream();
        const peerConnection = createPeerConnection(data.from);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        webRTCEvents.sendAnswer(data.from, answer);
        setCallStatus('in-call');
      } catch (error) {
        setCallError('Failed to answer call');
      }
    };

    const handleAnswer = async (data) => {
      const peerConnection = peerConnectionsRef.current.get(data.from);
      if (!peerConnection) {
        return;
      }

      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        setCallError('Failed to connect call');
      }
    };

    const handleIceCandidate = async (data) => {
      const peerConnection = peerConnectionsRef.current.get(data.from);
      if (!peerConnection) {
        return;
      }

      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.warn('[ChatWindow] ICE candidate error:', error.message);
      }
    };

    callEvents.onIncomingCall(handleIncomingCall);
    callEvents.onCallAccepted(handleCallAccepted);
    callEvents.onCallRejected(handleCallRejected);
    webRTCEvents.onOffer(handleOffer);
    webRTCEvents.onAnswer(handleAnswer);
    webRTCEvents.onIceCandidate(handleIceCandidate);

    return () => {
      const socket = getSocket();
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-rejected', handleCallRejected);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      closeAllConnections();
    };
  }, [chat._id]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Debounced typing handler
   */
  const handleTyping = debounce(() => {
    const recipientIds = chat.users
      .filter((u) => u._id !== user?.id)
      .map((u) => u._id);

    typingEvents.stopTyping(chat._id, recipientIds);
    setTypingUsers([]);
  }, 3000);

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (input.length === 0 && e.target.value.length > 0) {
      // User started typing
      const recipientIds = chat.users
        .filter((u) => u._id !== user?.id)
        .map((u) => u._id);

      typingEvents.startTyping(chat._id, recipientIds, user?.username);
    }

    handleTyping();
  };

  /**
   * Handle send message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || !user) {
      console.warn('[ChatWindow] Cannot send message: input empty or user not set');
      return;
    }

    try {
      console.log(`[ChatWindow] Sending message to chat: ${chat._id} | Content length: ${input.trim().length}`);

      let recipients = getRecipientsForChat();
      let missingKeys = recipients.filter((recipient) => !recipient.publicKey);

      if (missingKeys.some((recipient) => recipient.userId === user?.id)) {
        try {
          const keypair = await getOrCreateKeypair(user.id);
          keypairRef.current = keypair;
          await chatAPI.getChatById(chat._id).then((response) => {
            if (response.data?.chat) {
              onChatUpdated?.(response.data.chat);
              recipients = response.data.chat.users.map((chatUser) => ({
                userId: chatUser._id,
                publicKey: chatUser.publicKey,
              }));
              missingKeys = recipients.filter((recipient) => !recipient.publicKey);
            }
          });
        } catch (error) {
          // Ignore refresh errors
        }
      }

      if (missingKeys.length > 0) {
        try {
          const refreshedChat = await chatAPI.getChatById(chat._id);
          if (refreshedChat.data?.chat) {
            onChatUpdated?.(refreshedChat.data.chat);
            recipients = refreshedChat.data.chat.users.map((chatUser) => ({
              userId: chatUser._id,
              publicKey: chatUser.publicKey,
            }));
            missingKeys = recipients.filter((recipient) => !recipient.publicKey);
          }
        } catch (error) {
          // Ignore refresh errors and fall through to alert
        }
      }

      if (missingKeys.length > 0) {
        const missingLabels = missingKeys
          .map((recipient) => chat.users.find((u) => u._id === recipient.userId)?.username || recipient.userId)
          .join(', ');
        alert(`Cannot send encrypted message. Missing encryption keys for: ${missingLabels}`);
        return;
      }

      const senderKeypair = keypairRef.current || (user?.id ? await getOrCreateKeypair(user.id) : null);
      if (!senderKeypair) {
        alert('Encryption keys are not ready. Please try again.');
        return;
      }

      const encryptedPayload = await encryptMessageForRecipients(
        input.trim(),
        recipients,
        senderKeypair
      );

      const response = await messageAPI.sendMessage({
        chatId: chat._id,
        encrypted: encryptedPayload,
      });

      const message = {
        ...response.data.message,
        content: input.trim(),
        isEncrypted: true,
      };
      console.log(`[ChatWindow] Message sent successfully | ID: ${message._id}`);

      setMessages((prev) => [...prev, message]);
      setInput('');

      // Stop typing indicator
      const recipientIds = chat.users
        .filter((u) => u._id !== user?.id)
        .map((u) => u._id);

      typingEvents.stopTyping(chat._id, recipientIds);

      // Emit via socket
      messageEvents.sendMessage(chat._id, response.data.message, recipientIds);
    } catch (error) {
      console.error('[ChatWindow] Failed to send message:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message,
      });
      
      // Show user-friendly error
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send message';
      alert(`Error sending message: ${errorMsg}`);
    }
  };

  const handleStartVoiceCall = async () => {
    if (!user || callStatus !== 'idle') {
      return;
    }

    const recipientIds = chat.users
      .filter((u) => u._id !== user?.id)
      .map((u) => u._id);

    if (recipientIds.length === 0) {
      return;
    }

    try {
      setCallError(null);
      setCallStatus('outgoing');
      await ensureLocalStream();

      recipientIds.forEach((recipientId) => {
        callEvents.initiateCall(recipientId, {
          chatId: chat._id,
          callType: 'voice',
          isGroup: chat.isGroupChat,
          callerId: user.id,
          callerName: user.username,
          participantIds: recipientIds,
        });
      });
    } catch (error) {
      setCallStatus('idle');
      setCallError('Unable to access microphone');
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) {
      return;
    }

    try {
      await ensureLocalStream();
      setCallStatus('in-call');
      callEvents.acceptCall(
        {
          chatId: chat._id,
          callType: 'voice',
          isGroup: incomingCall.callData?.isGroup || false,
        },
        incomingCall.from
      );
      setIncomingCall(null);
    } catch (error) {
      setCallError('Unable to access microphone');
    }
  };

  const handleRejectCall = () => {
    if (!incomingCall) {
      return;
    }

    callEvents.rejectCall(incomingCall.from);
    setIncomingCall(null);
    setCallStatus('idle');
  };

  /**
   * Handle delete message
   */
  const handleDeleteMessage = async (messageId) => {
    try {
      console.log(`[ChatWindow] Deleting message: ${messageId}`);
      await messageAPI.deleteMessage(messageId);
      console.log(`[ChatWindow] Message deleted successfully: ${messageId}`);
      
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageId)
      );
    } catch (error) {
      console.error('[ChatWindow] Failed to delete message:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message,
      });
      alert(`Failed to delete message: ${error.response?.data?.message || error.message}`);
    }
  };

  /**
   * Handle edit message
   */
  const handleEditMessage = async (messageId, newContent) => {
    try {
      const messageToEdit = messages.find((msg) => msg._id === messageId);
      if (messageToEdit?.isEncrypted) {
        alert('Encrypted messages cannot be edited.');
        return;
      }
      console.log(`[ChatWindow] Editing message: ${messageId}`);
      const response = await messageAPI.editMessage(messageId, newContent);
      console.log(`[ChatWindow] Message edited successfully: ${messageId}`);
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? response.data.message : msg
        )
      );
    } catch (error) {
      console.error('[ChatWindow] Failed to edit message:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message,
      });
      alert(`Failed to edit message: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleClearChat = async () => {
    const confirmed = window.confirm('Clear all messages in this chat? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await messageAPI.clearChat(chat._id);
      setMessages([]);
      onChatUpdated?.({ _id: chat._id, lastMessage: null, updatedAt: new Date().toISOString() });
      setShowMenu(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to clear chat');
    }
  };

  // Get chat name
  const chatName = chat.isGroupChat
    ? chat.chatName
    : chat.users.find((u) => u._id !== user?.id)?.username || 'Unknown User';

  const otherUser = chat.users.find((u) => u._id !== user?.id);
  const isOnline = otherUser?.isOnline;
  const avatarColor = getAvatarColor(chatName);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {chat.groupPic || otherUser?.profilePic ? (
              <img
                src={chat.groupPic || otherUser?.profilePic}
                alt={chatName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getAvatarInitials(chatName)
            )}
          </div>
          <div>
            <h2 className="font-bold text-dark">{chatName}</h2>
            {!chat.isGroupChat && otherUser && (
              <p className="text-xs text-gray-500">
                {isOnline ? '🟢 Online' : `Last seen ${formatTime(otherUser.lastSeen)}`}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 relative">
          <button
            onClick={handleStartVoiceCall}
            disabled={callStatus !== 'idle'}
            className="p-2 hover:bg-light rounded-full transition disabled:opacity-50"
            title="Voice call"
          >
            📞
          </button>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-2 hover:bg-light rounded-full transition"
            title="More options"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <button
                onClick={handleClearChat}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl"
              >
                Clear all chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-light">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message._id}
              message={message}
              isOwn={message.sender._id === user?.id}
              onDelete={handleDeleteMessage}
              onEdit={handleEditMessage}
            />
          ))
        )}
        {typingUsers.length > 0 && (
          <div className="text-xs text-gray-500 italic p-2">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Call Modal */}
      {(incomingCall || callStatus !== 'idle' || callError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-light mx-auto flex items-center justify-center text-2xl">
                📞
              </div>
              <h3 className="mt-4 text-lg font-semibold text-dark">
                {incomingCall
                  ? 'Incoming voice call'
                  : callStatus === 'outgoing'
                  ? 'Calling...'
                  : 'Voice call in progress'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {incomingCall
                  ? incomingCall.callData?.callerName || 'User'
                  : chat.isGroupChat
                  ? chat.chatName
                  : chat.users.find((u) => u._id !== user?.id)?.username || 'User'}
              </p>
              {callError && (
                <p className="text-sm text-red-600 mt-2">{callError}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              {incomingCall && (
                <button
                  onClick={handleRejectCall}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-light"
                >
                  Reject
                </button>
              )}
              {incomingCall && (
                <button
                  onClick={handleAcceptCall}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Accept
                </button>
              )}
              {!incomingCall && callStatus === 'outgoing' && (
                <button
                  onClick={() => {
                    const recipientIds = chat.users
                      .filter((u) => u._id !== user?.id)
                      .map((u) => u._id);
                    endCall(recipientIds);
                  }}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Cancel
                </button>
              )}
              {!incomingCall && callStatus === 'in-call' && (
                <button
                  onClick={() => {
                    const recipientIds = chat.users
                      .filter((u) => u._id !== user?.id)
                      .map((u) => u._id);
                    endCall(recipientIds);
                  }}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Hang up
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remote Audio Streams */}
      {remoteStreams.map(({ userId, stream }) => (
        <audio
          key={userId}
          autoPlay
          playsInline
          ref={(element) => {
            if (element) {
              element.srcObject = stream;
            }
          }}
        />
      ))}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <button
            type="button"
            className="p-2 hover:bg-light rounded-full transition"
            title="Add attachment"
          >
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-light rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            className="p-2 hover:bg-light rounded-full transition"
            title="Send emoji"
          >
            😊
          </button>
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
