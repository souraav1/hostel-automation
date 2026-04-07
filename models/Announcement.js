const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetHostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  targetAudience: {
    type: String,
    enum: ['students', 'wardens', 'all'],
    default: 'students'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validUntil: {
    type: Date
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
announcementSchema.index({ targetHostel: 1 });
announcementSchema.index({ isActive: 1 });
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ validUntil: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
