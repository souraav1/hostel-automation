const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  fee: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Quad'],
    required: true
  },
  floor: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });

// Update hostel's available rooms when room availability changes
roomSchema.post('save', async function() {
  if (this.isModified('isAvailable') || this.isModified('occupants')) {
    const Hostel = mongoose.model('Hostel');
    const hostel = await Hostel.findById(this.hostel);
    if (hostel) {
      await hostel.updateAvailableRooms();
    }
  }
});

module.exports = mongoose.model('Room', roomSchema);
