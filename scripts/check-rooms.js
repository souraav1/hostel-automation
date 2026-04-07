// scripts/check-rooms.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const Student = require('../models/Student');

const checkRooms = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');
    console.log('✅ Connected to MongoDB');

    // Check a specific hostel's rooms
    const hostel = await Hostel.findOne({ name: 'Sattal Lodge' });
    if (!hostel) {
      console.log('❌ Hostel not found');
      return;
    }

    console.log(`\n🏠 Checking rooms for ${hostel.name}:`);
    
    const rooms = await Room.find({ hostel: hostel._id })
      .populate('occupants', 'name studentId')
      .limit(10); // Just check first 10 rooms

    rooms.forEach(room => {
      const status = room.isAvailable ? '✅ Available' : '❌ Occupied';
      console.log(`Room ${room.roomNumber}: ${room.occupants.length}/${room.capacity} ${status}`);
    });

    console.log(`\n📊 Total rooms checked: ${rooms.length}`);
    console.log(`Available rooms: ${rooms.filter(r => r.isAvailable).length}`);
    console.log(`Occupied rooms: ${rooms.filter(r => !r.isAvailable).length}`);

  } catch (error) {
    console.error('❌ Error checking rooms:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

checkRooms();