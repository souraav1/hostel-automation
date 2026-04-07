const express = require('express');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');
const Complaint = require('../models/Complaint');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const { auth, authorize } = require('../middleware/auth');
const { complaintValidation, leaveValidation } = require('../middleware/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(authorize('student'));

// Get all hostels with available room counts
router.get('/hostels', async (req, res) => {
  try {
    const hostels = await Hostel.find({})
      .populate('warden', 'name employeeId')
      .select('name totalRooms availableRooms description facilities warden');

    res.json({
      success: true,
      data: hostels
    });
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({ message: 'Error fetching hostels' });
  }
});

// Get available rooms for a specific hostel
router.get('/rooms/:hostelId', async (req, res) => {
  try {
    const { hostelId } = req.params;

    // Verify hostel exists
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Get all rooms for this hostel (both available and occupied)
    const rooms = await Room.find({ 
      hostel: hostelId
    })
    .populate('occupants', 'name studentId')
    .select('roomNumber capacity occupants fee type floor amenities isAvailable');

    res.json({
      success: true,
      data: {
        hostel: {
          id: hostel._id,
          name: hostel.name,
          totalRooms: hostel.totalRooms,
          availableRooms: hostel.availableRooms
        },
        rooms
      }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

// Book a room (simulate payment and booking)
router.post('/bookings/pay', async (req, res) => {
  try {
    const { roomId } = req.body;
    const studentId = req.user.profile._id;

    // Verify room exists and is available
    const room = await Room.findById(roomId).populate('hostel');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isAvailable) {
      return res.status(400).json({ message: 'Room is no longer available' });
    }

    // Check if student already has a room
    const student = await Student.findById(studentId);
    if (student.room) {
      return res.status(400).json({ message: 'You already have a room allocated' });
    }

    // Simulate payment processing
    // In a real application, integrate with payment gateway
    
    // Allocate room to student
    room.occupants.push(studentId);
    room.isAvailable = room.occupants.length < room.capacity;
    await room.save();

    // Update student's room and hostel
    student.room = roomId;
    student.hostel = room.hostel._id;
    await student.save();

    res.json({
      success: true,
      message: 'Room booked successfully',
      data: {
        room: {
          id: room._id,
          roomNumber: room.roomNumber,
          hostel: room.hostel.name,
          fee: room.fee
        }
      }
    });

  } catch (error) {
    console.error('Book room error:', error);
    res.status(500).json({ message: 'Error booking room' });
  }
});

// Create a new complaint
router.post('/complaints', complaintValidation, async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const student = await Student.findById(studentId).populate('hostel');

    if (!student.hostel) {
      return res.status(400).json({ 
        message: 'You must be allocated to a hostel to file complaints' 
      });
    }

    const complaintData = {
      ...req.body,
      student: studentId,
      hostel: student.hostel._id
    };

    const complaint = new Complaint(complaintData);
    await complaint.save();

    // Populate the complaint with student details
    await complaint.populate('student', 'name studentId room');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });

  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Error creating complaint' });
  }
});

// Get all complaints filed by the logged-in student
router.get('/complaints/me', async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const { status, category } = req.query;

    const filter = { student: studentId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate('hostel', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: complaints
    });

  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

// Apply for leave
router.post('/leaves', leaveValidation, async (req, res) => {
  try {
    const studentId = req.user.profile._id;

    const leaveData = {
      ...req.body,
      student: studentId
    };

    const leave = new Leave(leaveData);
    await leave.save();

    // Populate the leave with student details
    await leave.populate('student', 'name studentId room');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave
    });

  } catch (error) {
    console.error('Apply leave error:', error);
    
    // If it's a validation error from mongoose, send the specific error message
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    // If it's a custom error from pre-save hook
    if (error.message.includes('date')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error applying for leave' });
  }
});

// Get all leave applications for the logged-in student
router.get('/leaves/me', async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const { status, type } = req.query;

    const filter = { student: studentId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const leaves = await Leave.find(filter)
      .populate('student', 'name studentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaves
    });

  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ message: 'Error fetching leave applications' });
  }
});

// Get announcements for the student's hostel
router.get('/announcements', async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const student = await Student.findById(studentId).populate('hostel');

    if (!student.hostel) {
      return res.status(400).json({ 
        message: 'You must be allocated to a hostel to view announcements' 
      });
    }

    const announcements = await Announcement.find({
      $or: [
        { targetHostel: student.hostel._id },
        { targetAudience: 'students' }
      ],
      isActive: true,
      $or: [
        { validUntil: { $exists: false } },
        { validUntil: { $gte: new Date() } }
      ]
    })
    .populate('author', 'username role')
    .populate('targetHostel', 'name')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Get student profile
router.get('/profile', async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const student = await Student.findById(studentId)
      .populate('room', 'roomNumber capacity fee type')
      .populate('hostel', 'name warden');

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router;
