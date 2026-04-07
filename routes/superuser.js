const express = require('express');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');
const Warden = require('../models/Warden');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const { auth, authorize } = require('../middleware/auth');
const { userValidation, announcementValidation } = require('../middleware/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(authorize('superuser'));

// Get superuser dashboard with system-wide analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const totalStudents = await Student.countDocuments();
    const totalWardens = await Warden.countDocuments();
    const totalHostels = await Hostel.countDocuments();
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ isAvailable: false });

    // Get complaint statistics
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });

    // Get leave statistics
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });

    // Get hostel-wise occupancy
    const hostelOccupancy = await Hostel.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: 'hostel',
          as: 'rooms'
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'hostel',
          as: 'students'
        }
      },
      {
        $project: {
          name: 1,
          totalRooms: 1,
          availableRooms: 1,
          studentCount: { $size: '$students' },
          occupancyRate: {
            $cond: {
              if: { $gt: ['$totalRooms', 0] },
              then: {
                $multiply: [
                  { $divide: [{ $size: '$students' }, '$totalRooms'] },
                  100
                ]
              },
              else: 0
            }
          }
        }
      }
    ]);

    // Get recent activities
    const recentComplaints = await Complaint.find()
      .populate('student', 'name studentId')
      .populate('hostel', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentLeaves = await Leave.find()
      .populate('student', 'name studentId')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalWardens,
          totalHostels,
          totalRooms,
          occupiedRooms,
          occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0,
          totalComplaints,
          pendingComplaints,
          resolvedComplaints,
          totalLeaves,
          pendingLeaves,
          approvedLeaves
        },
        hostelOccupancy,
        recentComplaints,
        recentLeaves
      }
    });

  } catch (error) {
    console.error('Get superuser dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get all students with their room details
router.get('/all-students', async (req, res) => {
  try {
    const { search, hostel, course, year, room } = req.query;
    const { page = 1, limit = 50 } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    if (hostel) filter.hostel = hostel;
    if (course) filter.course = { $regex: course, $options: 'i' };
    if (year) filter.year = parseInt(year);
    if (room) filter.room = room;

    const students = await Student.find(filter)
      .populate('room', 'roomNumber capacity fee type')
      .populate('hostel', 'name')
      .sort({ studentId: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// User Management Routes

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const { page = 1, limit = 50 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .populate('profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Create a new user
router.post('/users', userValidation, async (req, res) => {
  try {
    const { username, phone, role, profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create profile based on role
    let profile;
    if (role === 'student') {
      const Student = require('../models/Student');
      profile = new Student(profileData);
      await profile.save();
    } else if (role === 'warden') {
      const Warden = require('../models/Warden');
      profile = new Warden(profileData);
      await profile.save();
    }

    // Create user
    const user = new User({
      username,
      phone,
      role,
      profile: profile ? profile._id : null,
      profileType: role === 'superuser' ? null : role.charAt(0).toUpperCase() + role.slice(1),
      password: 'temp_password' // In production, generate proper password
    });

    await user.save();

    const populatedUser = await User.findById(user._id).populate('profile');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: populatedUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).populate('profile');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Hostel Management Routes

// Get all hostels
router.get('/hostels', async (req, res) => {
  try {
    const hostels = await Hostel.find({})
      .populate('warden', 'name employeeId')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: hostels
    });

  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({ message: 'Error fetching hostels' });
  }
});

// Create a new hostel
router.post('/hostels', async (req, res) => {
  try {
    const hostel = new Hostel(req.body);
    await hostel.save();

    const populatedHostel = await Hostel.findById(hostel._id)
      .populate('warden', 'name employeeId');

    res.status(201).json({
      success: true,
      message: 'Hostel created successfully',
      data: populatedHostel
    });

  } catch (error) {
    console.error('Create hostel error:', error);
    res.status(500).json({ message: 'Error creating hostel' });
  }
});

// Update hostel
router.put('/hostels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedHostel = await Hostel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    ).populate('warden', 'name employeeId');

    if (!updatedHostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.json({
      success: true,
      message: 'Hostel updated successfully',
      data: updatedHostel
    });

  } catch (error) {
    console.error('Update hostel error:', error);
    res.status(500).json({ message: 'Error updating hostel' });
  }
});

// Room Management Routes

// Get all rooms
router.get('/rooms', async (req, res) => {
  try {
    const { hostel, isAvailable } = req.query;
    const { page = 1, limit = 50 } = req.query;

    const filter = {};
    if (hostel) filter.hostel = hostel;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const rooms = await Room.find(filter)
      .populate('hostel', 'name')
      .populate('occupants', 'name studentId')
      .sort({ hostel: 1, roomNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Room.countDocuments(filter);

    res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

// Create a new room
router.post('/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('hostel', 'name')
      .populate('occupants', 'name studentId');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: populatedRoom
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Error creating room' });
  }
});

// Update room
router.put('/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    )
    .populate('hostel', 'name')
    .populate('occupants', 'name studentId');

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom
    });

  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Error updating room' });
  }
});

// System-wide announcements
router.post('/announcements', announcementValidation, async (req, res) => {
  try {
    const announcementData = {
      ...req.body,
      author: req.user._id,
      targetAudience: 'all'
    };

    const announcement = new Announcement(announcementData);
    await announcement.save();

    await announcement.populate('author', 'username role');

    res.status(201).json({
      success: true,
      message: 'System announcement posted successfully',
      data: announcement
    });

  } catch (error) {
    console.error('Create system announcement error:', error);
    res.status(500).json({ message: 'Error creating announcement' });
  }
});

module.exports = router;
