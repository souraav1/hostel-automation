const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  warden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden'
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  availableRooms: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  facilities: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Update availableRooms when rooms are added/removed
hostelSchema.methods.updateAvailableRooms = async function() {
  const Room = mongoose.model('Room');
  const totalRooms = await Room.countDocuments({ hostel: this._id });
  const occupiedRooms = await Room.countDocuments({ 
    hostel: this._id, 
    isAvailable: false 
  });
  
  this.availableRooms = totalRooms - occupiedRooms;
  await this.save();
};

module.exports = mongoose.model('Hostel', hostelSchema);
