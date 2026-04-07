// scripts/fix-room-availability.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');

const fixRoomAvailability = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');
    console.log('✅ Connected to MongoDB');

    // Get all hostels
    const hostels = await Hostel.find({});
    
    for (const hostel of hostels) {
      console.log(`\n🏠 Processing ${hostel.name}...`);
      
      // Get all rooms for this hostel
      const rooms = await Room.find({ hostel: hostel._id });
      console.log(`Found ${rooms.length} rooms`);
      
      let availableCount = 0;
      let occupiedCount = 0;
      
      // Fix each room's availability
      for (const room of rooms) {
        // Get actual students in this room
        const studentsInRoom = await Student.find({ room: room._id });
        
        // Update room occupants array
        room.occupants = studentsInRoom.map(s => s._id);
        
        // Update availability based on actual occupancy
        room.isAvailable = room.occupants.length < room.capacity;
        
        if (room.isAvailable) {
          availableCount++;
        } else {
          occupiedCount++;
        }
        
        await room.save();
        
        const status = room.isAvailable ? '✅ Available' : '❌ Occupied';
        console.log(`  Room ${room.roomNumber}: ${room.occupants.length}/${room.capacity} ${status}`);
      }
      
      // Update hostel's available room count
      hostel.availableRooms = availableCount;
      await hostel.save();
      
      console.log(`📊 ${hostel.name} Summary:`);
      console.log(`  - Total Rooms: ${rooms.length}`);
      console.log(`  - Available: ${availableCount}`);
      console.log(`  - Occupied: ${occupiedCount}`);
    }

    // Now let's free up some rooms to make them available for booking
    console.log('\n🔓 Making some rooms available for demonstration...');
    
    // For each hostel, make sure at least 3-5 rooms are available
    for (const hostel of hostels) {
      const occupiedRooms = await Room.find({ 
        hostel: hostel._id, 
        isAvailable: false 
      }).limit(3);
      
      let freedRooms = 0;
      for (const room of occupiedRooms) {
        // Remove students from this room (move them to other rooms or make them unassigned)
        const studentsInRoom = await Student.find({ room: room._id });
        
        for (const student of studentsInRoom) {
          student.room = null;
          await student.save();
        }
        
        // Clear room occupants and make it available
        room.occupants = [];
        room.isAvailable = true;
        await room.save();
        
        freedRooms++;
        console.log(`  🔓 Freed Room ${room.roomNumber} in ${hostel.name}`);
      }
      
      // Update hostel available count
      const newAvailableCount = await Room.countDocuments({ 
        hostel: hostel._id, 
        isAvailable: true 
      });
      
      hostel.availableRooms = newAvailableCount;
      await hostel.save();
      
      console.log(`  📈 ${hostel.name} now has ${newAvailableCount} available rooms`);
    }

    console.log('\n🎉 Room availability fixed successfully!');
    console.log('\n📋 Current Status:');
    
    // Show final status
    for (const hostel of hostels) {
      const totalRooms = await Room.countDocuments({ hostel: hostel._id });
      const availableRooms = await Room.countDocuments({ 
        hostel: hostel._id, 
        isAvailable: true 
      });
      const occupiedRooms = totalRooms - availableRooms;
      
      console.log(`${hostel.name}: ${availableRooms}/${totalRooms} available (${occupiedRooms} occupied)`);
    }

  } catch (error) {
    console.error('❌ Error fixing room availability:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

fixRoomAvailability();