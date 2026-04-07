const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  address: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    trim: true
  },
  allergies: [{
    type: String,
    trim: true
  }],
  admissionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
studentSchema.index({ studentId: 1 });
studentSchema.index({ hostel: 1 });

// Update room availability when student is assigned/unassigned
studentSchema.post('save', async function() {
  if (this.isModified('room') || this.isModified('hostel')) {
    const Room = mongoose.model('Room');
    const oldRoom = this.isModified('room') ? 
      await Room.findById(this.get('room', null, { getters: false })) : null;
    const newRoom = this.room ? await Room.findById(this.room) : null;
    
    // Update old room availability
    if (oldRoom && oldRoom._id.toString() !== newRoom?._id.toString()) {
      oldRoom.occupants = oldRoom.occupants.filter(
        occupant => occupant.toString() !== this._id.toString()
      );
      oldRoom.isAvailable = oldRoom.occupants.length < oldRoom.capacity;
      await oldRoom.save();
    }
    
    // Update new room availability
    if (newRoom && (!oldRoom || newRoom._id.toString() !== oldRoom._id.toString())) {
      if (!newRoom.occupants.includes(this._id)) {
        newRoom.occupants.push(this._id);
      }
      newRoom.isAvailable = newRoom.occupants.length < newRoom.capacity;
      await newRoom.save();
    }
  }
});

module.exports = mongoose.model('Student', studentSchema);
