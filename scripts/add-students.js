// scripts/add-students.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');
const Warden = require('../models/Warden');

const addStudentsToAllHostels = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');
        console.log('✅ Connected to MongoDB');

        // Get all hostels
        const hostels = await Hostel.find({}).populate('warden');
        console.log(`Found ${hostels.length} hostels`);

        // Student data for each hostel
        const studentsByHostel = {
            'Gautam Hostel': [
                { name: 'Arjun Mehta', studentId: '2024010', course: 'B.Tech CSE', year: 1, email: 'arjun.mehta@student.edu', phone: '+919876543010' },
                { name: 'Kavya Reddy', studentId: '2024011', course: 'B.Tech ECE', year: 1, email: 'kavya.reddy@student.edu', phone: '+919876543011' },
                { name: 'Rohit Jain', studentId: '2023010', course: 'B.Tech CSE', year: 2, email: 'rohit.jain@student.edu', phone: '+919876543012' },
                { name: 'Pooja Agarwal', studentId: '2023011', course: 'B.Tech IT', year: 2, email: 'pooja.agarwal@student.edu', phone: '+919876543013' }
            ],
            'Sattal Lodge': [
                { name: 'Karan Singh', studentId: '2024020', course: 'B.Tech ME', year: 1, email: 'karan.singh@student.edu', phone: '+919876543020' },
                { name: 'Riya Sharma', studentId: '2024021', course: 'B.Tech CE', year: 1, email: 'riya.sharma@student.edu', phone: '+919876543021' },
                { name: 'Deepak Kumar', studentId: '2023020', course: 'B.Tech EE', year: 2, email: 'deepak.kumar@student.edu', phone: '+919876543022' },
                { name: 'Neha Gupta', studentId: '2023021', course: 'B.Tech CSE', year: 2, email: 'neha.gupta@student.edu', phone: '+919876543023' },
                { name: 'Sanjay Patel', studentId: '2022020', course: 'B.Tech ME', year: 3, email: 'sanjay.patel@student.edu', phone: '+919876543024' }
            ],
            'Neelkanth Hostel': [
                { name: 'Aarav Malhotra', studentId: '2024030', course: 'B.Tech CSE', year: 1, email: 'aarav.malhotra@student.edu', phone: '+919876543030' },
                { name: 'Ishita Bansal', studentId: '2024031', course: 'B.Tech IT', year: 1, email: 'ishita.bansal@student.edu', phone: '+919876543031' },
                { name: 'Varun Chopra', studentId: '2023030', course: 'B.Tech ECE', year: 2, email: 'varun.chopra@student.edu', phone: '+919876543032' },
                { name: 'Shreya Kapoor', studentId: '2023031', course: 'B.Tech CE', year: 2, email: 'shreya.kapoor@student.edu', phone: '+919876543033' },
                { name: 'Ankit Yadav', studentId: '2022030', course: 'B.Tech EE', year: 3, email: 'ankit.yadav@student.edu', phone: '+919876543034' },
                { name: 'Priyanka Joshi', studentId: '2022031', course: 'B.Tech CSE', year: 3, email: 'priyanka.joshi@student.edu', phone: '+919876543035' }
            ],
            'Panchachuli Hostel': [
                { name: 'Harsh Agrawal', studentId: '2024040', course: 'B.Tech ME', year: 1, email: 'harsh.agrawal@student.edu', phone: '+919876543040' },
                { name: 'Sakshi Tiwari', studentId: '2024041', course: 'B.Tech ECE', year: 1, email: 'sakshi.tiwari@student.edu', phone: '+919876543041' },
                { name: 'Nikhil Saxena', studentId: '2023040', course: 'B.Tech IT', year: 2, email: 'nikhil.saxena@student.edu', phone: '+919876543042' },
                { name: 'Aditi Mishra', studentId: '2023041', course: 'B.Tech CSE', year: 2, email: 'aditi.mishra@student.edu', phone: '+919876543043' },
                { name: 'Gaurav Singh', studentId: '2022040', course: 'B.Tech CE', year: 3, email: 'gaurav.singh@student.edu', phone: '+919876543044' }
            ]
        };

        let totalStudentsAdded = 0;

        for (const hostel of hostels) {
            console.log(`\n📍 Processing ${hostel.name}...`);

            const studentsForHostel = studentsByHostel[hostel.name] || [];
            if (studentsForHostel.length === 0) {
                console.log(`No students defined for ${hostel.name}`);
                continue;
            }

            // Get available rooms for this hostel
            const availableRooms = await Room.find({
                hostel: hostel._id,
                isAvailable: true
            }).limit(studentsForHostel.length);

            console.log(`Found ${availableRooms.length} available rooms`);

            // Create students for this hostel
            const createdStudents = [];
            for (let i = 0; i < Math.min(studentsForHostel.length, availableRooms.length); i++) {
                const studentData = studentsForHostel[i];
                const room = availableRooms[i];

                // Create student
                const student = new Student({
                    ...studentData,
                    room: room._id,
                    hostel: hostel._id,
                    address: `${hostel.name} Area, College Campus`,
                    bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][Math.floor(Math.random() * 8)],
                    emergencyContact: {
                        name: `${studentData.name.split(' ')[0]} Parent`,
                        phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                        relation: 'Father'
                    }
                });

                await student.save();
                createdStudents.push(student);

                // Update room
                room.occupants.push(student._id);
                room.isAvailable = room.occupants.length < room.capacity;
                await room.save();

                // Create user account
                const user = new User({
                    username: studentData.studentId,
                    password: 'temp_password',
                    role: 'student',
                    phone: studentData.phone,
                    profile: student._id,
                    profileType: 'Student'
                });

                await user.save();

                console.log(`✅ Added ${student.name} (${student.studentId}) to Room ${room.roomNumber}`);
            }

            totalStudentsAdded += createdStudents.length;

            // Update hostel's available rooms count
            const totalRooms = await Room.countDocuments({ hostel: hostel._id });
            const occupiedRooms = await Room.countDocuments({
                hostel: hostel._id,
                isAvailable: false
            });

            hostel.availableRooms = totalRooms - occupiedRooms;
            await hostel.save();

            console.log(`📊 ${hostel.name}: ${createdStudents.length} students added, ${hostel.availableRooms} rooms still available`);
        }

        console.log(`\n🎉 Successfully added ${totalStudentsAdded} students across all hostels!`);
        console.log('\n📋 New Login Credentials:');

        // Show sample credentials for each hostel
        for (const [hostelName, students] of Object.entries(studentsByHostel)) {
            if (students.length > 0) {
                console.log(`${hostelName}: ${students[0].studentId} (${students[0].name})`);
            }
        }

    } catch (error) {
        console.error('❌ Error adding students:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
};

addStudentsToAllHostels();