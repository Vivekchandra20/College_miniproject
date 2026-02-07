/**
 * Chat Model
 * Stores chat conversations (one-to-one and groups)
 */

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    chatName: {
      type: String,
      default: null,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    groupDescription: {
      type: String,
      default: null,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    groupPic: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Pre-populate users and lastMessage
 */
chatSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'users',
    select: 'username email profilePic isOnline lastSeen',
  }).populate({
    path: 'lastMessage',
  }).populate({
    path: 'groupAdmin',
    select: 'username email',
  });
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
