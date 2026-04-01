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
      default: '',
      maxlength: [10000, 'Message cannot exceed 10000 characters'],
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    senderPublicKey: {
      type: String,
      default: null,
    },
    cipherText: {
      type: String,
      default: null,
    },
    nonce: {
      type: String,
      default: null,
    },
    encryptedKeys: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        key: {
          type: String,
          required: true,
        },
        keyNonce: {
          type: String,
          required: true,
        },
      },
    ],
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
    select: 'username email profilePic publicKey',
  }).populate({
    path: 'readBy.user',
    select: 'username email',
  });
  next();
});

messageSchema.pre('validate', function (next) {
  if (!this.isEncrypted && !this.content) {
    return next(new Error('Message content cannot be empty'));
  }

  if (this.isEncrypted) {
    if (!this.cipherText || !this.nonce || !this.encryptedKeys || this.encryptedKeys.length === 0) {
      return next(new Error('Encrypted message payload is incomplete'));
    }
  }

  return next();
});

module.exports = mongoose.model('Message', messageSchema);
