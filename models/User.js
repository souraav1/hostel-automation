const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'warden', 'superuser'],
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'profileType'
  },
  profileType: {
    type: String,
    enum: ['Student', 'Warden'],
    required: function() {
      return this.role !== 'superuser';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
