// scripts/generate-credentials.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');
const Warden = require('../models/Warden');

const generateCredentials = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');
    console.log('✅ Connected to MongoDB');

    // Get all wardens with their hostels
    const wardens = await Warden.find({})
      .populate('assignedHostel', 'name')
      .sort({ employeeId: 1 });

    // Get all students with their hostels and phone numbers from User model
    const students = await Student.find({})
      .populate('hostel', 'name')
      .populate('room', 'roomNumber')
      .sort({ studentId: 1 });

    // Get phone numbers from User model
    const studentUsers = await User.find({ role: 'student' });
    const phoneMap = {};
    studentUsers.forEach(user => {
      phoneMap[user.profile.toString()] = user.phone;
    });

    // Generate warden credentials file
    let wardenContent = `WARDEN LOGIN CREDENTIALS
========================

Format: Name | Employee ID | Phone Number | Assigned Hostel
------------------------------------------------------------

`;

    wardens.forEach(warden => {
      const hostelName = warden.assignedHostel ? warden.assignedHostel.name : 'Not Assigned';
      const phone = warden.phone || 'No Phone';
      wardenContent += `${warden.name.padEnd(20)} | ${warden.employeeId.padEnd(8)} | ${phone.padEnd(15)} | ${hostelName}\n`;
    });

    wardenContent += `\n\nLOGIN INSTRUCTIONS:
- Username: Use Employee ID (e.g., EMP001)
- Phone: Use the phone number exactly as shown above
- Example: Username: EMP001, Phone: +919876543210\n`;

    // Generate student credentials file
    let studentContent = `STUDENT LOGIN CREDENTIALS
=========================

Format: Name | Student ID | Phone Number | Hostel | Room
--------------------------------------------------------

`;

    // Group students by hostel for better organization
    const studentsByHostel = {};
    students.forEach(student => {
      const hostelName = student.hostel ? student.hostel.name : 'Not Assigned';
      if (!studentsByHostel[hostelName]) {
        studentsByHostel[hostelName] = [];
      }
      studentsByHostel[hostelName].push(student);
    });

    // Write students grouped by hostel
    Object.keys(studentsByHostel).sort().forEach(hostelName => {
      studentContent += `\n--- ${hostelName.toUpperCase()} ---\n`;
      studentsByHostel[hostelName].forEach(student => {
        const roomNumber = student.room ? student.room.roomNumber : 'Not Assigned';
        const phone = phoneMap[student._id.toString()] || 'No Phone';
        studentContent += `${student.name.padEnd(20)} | ${student.studentId.padEnd(10)} | ${phone.padEnd(15)} | ${hostelName.padEnd(18)} | Room ${roomNumber}\n`;
      });
    });

    studentContent += `\n\nLOGIN INSTRUCTIONS:
- Username: Use Student ID (e.g., 2024001)
- Phone: Use the phone number exactly as shown above
- Example: Username: 2024001, Phone: +919876543001\n`;

    // Write files
    const credentialsDir = path.join(__dirname, '..', 'credentials');
    if (!fs.existsSync(credentialsDir)) {
      fs.mkdirSync(credentialsDir);
    }

    const wardenFile = path.join(credentialsDir, 'warden-credentials.txt');
    const studentFile = path.join(credentialsDir, 'student-credentials.txt');

    fs.writeFileSync(wardenFile, wardenContent);
    fs.writeFileSync(studentFile, studentContent);

    console.log(`\n🎉 Credential files generated successfully!`);
    console.log(`📁 Warden credentials: ${wardenFile}`);
    console.log(`📁 Student credentials: ${studentFile}`);
    
    console.log(`\n📊 Summary:`);
    console.log(`- ${wardens.length} wardens`);
    console.log(`- ${students.length} students`);
    console.log(`- ${Object.keys(studentsByHostel).length} hostels`);

  } catch (error) {
    console.error('❌ Error generating credentials:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

generateCredentials();