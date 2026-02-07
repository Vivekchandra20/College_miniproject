/**
 * Message Model
 * Stores individual messages in conversations
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a sender'],
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'Message must belong to a chat'],
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      minlength: [1, 'Message cannot be empty'],
      maxlength: [10000, 'Message cannot exceed 10000 characters'],
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Pre-populate sender and user details
 */
messageSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'sender',
    select: 'username email profilePic',
  }).populate({
    path: 'readBy.user',
    select: 'username email',
  });
  next();
});

module.exports = mongoose.model('Message', messageSchema);
