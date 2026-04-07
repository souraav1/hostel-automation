const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// OTP validation rules
const otpValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('phone')
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  handleValidationErrors
];

const verifyOtpValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  handleValidationErrors
];

// Complaint validation rules
const complaintValidation = [
  body('category')
    .isIn(['Electrical', 'Plumbing', 'Internet', 'Furniture', 'Cleaning', 'Security', 'Other'])
    .withMessage('Invalid complaint category'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('roomNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Room number cannot be empty'),
  handleValidationErrors
];

// Leave application validation rules
const leaveValidation = [
  body('startDate')
    .custom((value) => {
      if (!value || value.trim() === '') {
        throw new Error('Start date is required');
      }
      return true;
    }),
  body('endDate')
    .custom((value) => {
      if (!value || value.trim() === '') {
        throw new Error('End date is required');
      }
      return true;
    }),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage('Reason must be between 10 and 300 characters'),
  body('type')
    .optional()
    .isIn(['Emergency', 'Medical', 'Personal', 'Academic', 'Other'])
    .withMessage('Invalid leave type'),
  body('destination')
    .optional()
    .trim(),
  body('emergencyContact.name')
    .optional()
    .trim(),
  body('emergencyContact.phone')
    .optional()
    .trim(),
  body('emergencyContact.relation')
    .optional()
    .trim(),
  handleValidationErrors
];

// Announcement validation rules
const announcementValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Content must be between 10 and 1000 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority level'),
  handleValidationErrors
];

// User validation rules
const userValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters'),
  body('phone')
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('role')
    .isIn(['student', 'warden', 'superuser'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  otpValidation,
  verifyOtpValidation,
  complaintValidation,
  leaveValidation,
  announcementValidation,
  userValidation
};
