// scripts/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');
const Warden = require('../models/Warden');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Hostel.deleteMany({});
    await Room.deleteMany({});
    await Student.deleteMany({});
    await Warden.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create hostels
    const hostels = await Hostel.insertMany([
      { name: 'Gautam Hostel', totalRooms: 50, availableRooms: 50, description: 'Premium hostel', facilities: ['WiFi','Laundry','Gym','Common Room'] },
      { name: 'Sattal Lodge', totalRooms: 40, availableRooms: 40, description: 'Comfortable hostel', facilities: ['WiFi','Laundry','Library','Garden'] },
      { name: 'Neelkanth Hostel', totalRooms: 60, availableRooms: 60, description: 'Modern hostel', facilities: ['WiFi','Laundry','Gym','Study Hall','Cafeteria'] },
      { name: 'Panchachuli Hostel', totalRooms: 45, availableRooms: 45, description: 'Traditional hostel', facilities: ['WiFi','Laundry','Common Room','Parking'] }
    ]);
    console.log('🏠 Created hostels');

    // Create wardens
    const wardens = await Warden.insertMany([
      { name: 'Dr. Rajesh Kumar', employeeId: 'EMP001', assignedHostel: hostels[0]._id, email: 'rajesh.kumar@college.edu', phone: '+919876543210', qualification: 'Ph.D.', experience: 15 },
      { name: 'Mrs. Priya Sharma', employeeId: 'EMP002', assignedHostel: hostels[1]._id, email: 'priya.sharma@college.edu', phone: '+919876543211', qualification: 'M.A.', experience: 12 },
      { name: 'Mr. Amit Singh', employeeId: 'EMP003', assignedHostel: hostels[2]._id, email: 'amit.singh@college.edu', phone: '+919876543212', qualification: 'M.Sc.', experience: 10 },
      { name: 'Dr. Sunita Verma', employeeId: 'EMP004', assignedHostel: hostels[3]._id, email: 'sunita.verma@college.edu', phone: '+919876543213', qualification: 'Ph.D.', experience: 18 }
    ]);
    console.log('👨‍💼 Created wardens');

    // Link wardens to hostels
    for (let i = 0; i < hostels.length; i++) {
      hostels[i].warden = wardens[i]._id;
      await hostels[i].save();
    }

    // Create rooms
    const rooms = [];
    const roomTypes = ['Single', 'Double', 'Triple', 'Quad'];
    for (const hostel of hostels) {
      const hostelRooms = [];
      const floors = 3;
      const roomsPerFloor = Math.ceil(hostel.totalRooms / floors);

      for (let floor = 1; floor <= floors; floor++) {
        for (let r = 1; r <= roomsPerFloor; r++) {
          if (hostelRooms.length >= hostel.totalRooms) break;
          const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
          const capacity = type === 'Single' ? 1 : type === 'Double' ? 2 : type === 'Triple' ? 3 : 4;
          const fee = type === 'Single' ? 15000 : type === 'Double' ? 12000 : type === 'Triple' ? 10000 : 8000;

          hostelRooms.push({
            roomNumber: `${floor}${r.toString().padStart(2,'0')}`,
            hostel: hostel._id,
            capacity,
            fee,
            type,
            floor,
            amenities: ['Bed','Study Table','Wardrobe','Fan'],
            occupants: [],
            isAvailable: true
          });
        }
      }

      const createdRooms = await Room.insertMany(hostelRooms);
      rooms.push(...createdRooms);
    }
    console.log('🚪 Created rooms');

    // Create students
    const students = await Student.insertMany([
      { name: 'Amit Kumar', studentId: '2024001', course: 'B.Tech CSE', year: 1, email: 'amit.kumar@student.edu', phone: '+919876543001' },
      { name: 'Priya Singh', studentId: '2024002', course: 'B.Tech ECE', year: 1, email: 'priya.singh@student.edu', phone: '+919876543002' },
      { name: 'Rahul Sharma', studentId: '2023001', course: 'B.Tech CSE', year: 2, email: 'rahul.sharma@student.edu', phone: '+919876543003' },
      { name: 'Sneha Gupta', studentId: '2023002', course: 'B.Tech IT', year: 2, email: 'sneha.gupta@student.edu', phone: '+919876543004' },
      { name: 'Vikash Patel', studentId: '2022001', course: 'B.Tech ME', year: 3, email: 'vikash.patel@student.edu', phone: '+919876543005' },
      { name: 'Anjali Verma', studentId: '2022002', course: 'B.Tech CE', year: 3, email: 'anjali.verma@student.edu', phone: '+919876543006' }
    ]);
    console.log('👨‍🎓 Created students');

    // Create User accounts
// Users for students
const studentUsers = students.map(s => ({
  username: s.studentId,
  password: 'temp_password',
  role: 'student',
  phone: s.phone || '+910000000000', // fallback just in case
  profile: s._id,
  profileType: 'Student'
}));

// Users for wardens
const wardenUsers = wardens.map(w => ({
  username: w.employeeId,
  password: 'temp_password',
  role: 'warden',
  phone: w.phone || '+910000000001', // fallback
  profile: w._id,
  profileType: 'Warden'
}));

// Superuser
const superuser = {
  username: 'admin',
  password: 'admin123',
  role: 'superuser',
  phone: '+919876543999'
};

await User.insertMany([...studentUsers, ...wardenUsers, superuser]);


    // Allocate students to rooms
    const availableRooms = rooms.filter(r => r.isAvailable);
    for (let i = 0; i < Math.min(students.length, availableRooms.length); i++) {
      const student = students[i];
      const room = availableRooms[i];
      student.room = room._id;
      student.hostel = room.hostel;
      await student.save();

      room.occupants.push(student._id);
      room.isAvailable = room.occupants.length < room.capacity;
      await room.save();
    }

    console.log('🏠 Allocated students to rooms');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📋 Sample Login Credentials:');
    console.log('Student: 2024001 (Amit Kumar)');
    console.log('Warden: EMP001 (Dr. Rajesh Kumar)');
    console.log('Superuser: admin');
    console.log('📱 Use any phone number for OTP verification');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

seedData();
