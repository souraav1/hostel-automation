const express = require('express');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');
const Warden = require('../models/Warden');
const Complaint = require('../models/Complaint');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { announcementValidation } = require('../middleware/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(authorize('warden'));

// Get warden dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const wardenId = req.user.profile._id;
    const warden = await Warden.findById(wardenId).populate('assignedHostel');

    if (!warden.assignedHostel) {
      return res.status(400).json({ 
        message: 'No hostel assigned to you' 
      });
    }

    const hostelId = warden.assignedHostel._id;

    // Get pending complaints count
    const pendingComplaints = await Complaint.countDocuments({
      hostel: hostelId,
      status: 'Pending'
    });

    // Get pending leave requests count
    const pendingLeaves = await Leave.countDocuments({
      status: 'Pending'
    });

    // Get total students in hostel
    const totalStudents = await Student.countDocuments({
      hostel: hostelId
    });

    // Get room occupancy data
    const totalRooms = await Room.countDocuments({ hostel: hostelId });
    const occupiedRooms = await Room.countDocuments({ 
      hostel: hostelId, 
      isAvailable: false 
    });

    // Get recent complaints
    const recentComplaints = await Complaint.find({ hostel: hostelId })
      .populate('student', 'name studentId room')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent leave requests from students in this hostel
    const hostelStudents = await Student.find({ hostel: hostelId }).select('_id');
    const studentIds = hostelStudents.map(student => student._id);
    
    const recentLeaves = await Leave.find({ 
      student: { $in: studentIds },
      status: 'Pending' 
    })
      .populate('student', 'name studentId room hostel')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        warden: {
          name: warden.name,
          employeeId: warden.employeeId
        },
        hostel: warden.assignedHostel,
        stats: {
          pendingComplaints,
          pendingLeaves,
          totalStudents,
          totalRooms,
          occupiedRooms,
          availableRooms: totalRooms - occupiedRooms,
          occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0
        },
        recentComplaints,
        recentLeaves
      }
    });

  } catch (error) {
    console.error('Get warden dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get all complaints for the warden's assigned hostel
router.get('/complaints', async (req, res) => {
  try {
    const wardenId = req.user.profile._id;
    const warden = await Warden.findById(wardenId);
    const { status, category, priority } = req.query;

    if (!warden.assignedHostel) {
      return res.status(400).json({ 
        message: 'No hostel assigned to you' 
      });
    }

    const filter = { hostel: warden.assignedHostel };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate('student', 'name studentId room')
      .populate('assignedTo', 'username role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: complaints
    });

  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

// Update a complaint's status
router.put('/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    const wardenId = req.user.profile._id;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify warden has access to this complaint's hostel
    const warden = await Warden.findById(wardenId);
    if (!warden.assignedHostel || 
        warden.assignedHostel.toString() !== complaint.hostel.toString()) {
      return res.status(403).json({ 
        message: 'You can only update complaints for your assigned hostel' 
      });
    }

    const updateData = { status };
    if (status === 'Resolved' && resolution) {
      updateData.resolution = {
        description: resolution.description,
        resolvedBy: wardenId,
        resolvedAt: new Date()
      };
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    )
    .populate('student', 'name studentId room')
    .populate('assignedTo', 'username role');

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: updatedComplaint
    });

  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Error updating complaint' });
  }
});

// Get all leave applications for students in warden's hostel
router.get('/leaves', async (req, res) => {
  try {
    const wardenId = req.user.profile._id;
    const warden = await Warden.findById(wardenId).populate('assignedHostel');
    const { status, type } = req.query;

    if (!warden.assignedHostel) {
      return res.status(400).json({ 
        message: 'No hostel assigned to you' 
      });
    }

    // Get all students in the hostel
    const students = await Student.find({ 
      hostel: warden.assignedHostel._id 
    }).select('_id');

    const studentIds = students.map(student => student._id);

    const filter = { student: { $in: studentIds } };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const leaves = await Leave.find(filter)
      .populate('student', 'name studentId room')
      .populate('approvedBy', 'username role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaves
    });

  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Error fetching leave applications' });
  }
});

// Approve or reject a leave application
router.put('/leaves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const wardenId = req.user.profile._id;

    const leave = await Leave.findById(id).populate('student');
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    // Verify warden has access to this student's hostel
    const warden = await Warden.findById(wardenId);
    if (!warden.assignedHostel || 
        warden.assignedHostel.toString() !== leave.student.hostel.toString()) {
      return res.status(403).json({ 
        message: 'You can only approve leaves for students in your assigned hostel' 
      });
    }

    const updateData = { 
      status,
      approvedBy: wardenId,
      approvedAt: new Date()
    };

    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    )
    .populate('student', 'name studentId room')
    .populate('approvedBy', 'username role');

    res.json({
      success: true,
      message: `Leave application ${status.toLowerCase()} successfully`,
      data: updatedLeave
    });

  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({ message: 'Error updating leave application' });
  }
});

// Get student directory for the warden's hostel
router.get('/students', async (req, res) => {
  try {
    const wardenId = req.user.profile._id;
    const warden = await Warden.findById(wardenId);
    const { search, room } = req.query;

    if (!warden.assignedHostel) {
      return res.status(400).json({ 
        message: 'No hostel assigned to you' 
      });
    }

    const filter = { hostel: warden.assignedHostel };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    if (room) {
      filter.room = room;
    }

    const students = await Student.find(filter)
      .populate('room', 'roomNumber capacity type')
      .sort({ room: 1, studentId: 1 });

    res.json({
      success: true,
      data: students
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Post a new announcement for the warden's hostel
router.post('/announcements', announcementValidation, async (req, res) => {
  try {
    const wardenId = req.user.profile._id;
    const warden = await Warden.findById(wardenId);

    if (!warden.assignedHostel) {
      return res.status(400).json({ 
        message: 'No hostel assigned to you' 
      });
    }

    const announcementData = {
      ...req.body,
      author: wardenId,
      targetHostel: warden.assignedHostel,
      targetAudience: 'students'
    };

    const announcement = new Announcement(announcementData);
    await announcement.save();

    await announcement.populate('author', 'username role');
    await announcement.populate('targetHostel', 'name');

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: announcement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Error creating announcement' });
  }
});

// Get warden's own announcements
router.get('/announcements', async (req, res) => {
  try {
    const wardenId = req.user.profile._id;

    const announcements = await Announcement.find({ author: wardenId })
      .populate('targetHostel', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('Get my announcements error:', error);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

module.exports = router;
