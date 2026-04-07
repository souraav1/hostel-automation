const mongoose = require('mongoose');

const wardenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  assignedHostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: 0
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
wardenSchema.index({ employeeId: 1 });
wardenSchema.index({ assignedHostel: 1 });

// Update hostel's warden when warden is assigned
wardenSchema.post('save', async function() {
  if (this.isModified('assignedHostel')) {
    const Hostel = mongoose.model('Hostel');
    
    // Remove warden from old hostel
    const oldHostel = this.isModified('assignedHostel') ? 
      await Hostel.findOne({ warden: this._id }) : null;
    if (oldHostel) {
      oldHostel.warden = null;
      await oldHostel.save();
    }
    
    // Assign warden to new hostel
    if (this.assignedHostel) {
      const newHostel = await Hostel.findById(this.assignedHostel);
      if (newHostel) {
        newHostel.warden = this._id;
        await newHostel.save();
      }
    }
  }
});

module.exports = mongoose.model('Warden', wardenSchema);
