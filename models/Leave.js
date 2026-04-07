const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  type: {
    type: String,
    enum: ['Emergency', 'Medical', 'Personal', 'Academic', 'Other'],
    default: 'Personal'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  destination: {
    type: String,
    trim: true
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
leaveSchema.index({ student: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1 });
leaveSchema.index({ createdAt: -1 });

// Validation for date ranges
leaveSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (this.startDate < today) {
    return next(new Error('Start date cannot be in the past'));
  }

  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
