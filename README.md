# Hostel Automation System

A comprehensive full-stack web application for managing college hostel operations, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Student Portal
- **Room Booking**: Browse and book available rooms with real-time availability
- **Complaint System**: Submit and track complaints with status updates
- **Leave Management**: Apply for leaves and track approval status
- **Announcements**: View hostel announcements and notices

### Warden Portal
- **Dashboard**: Overview of hostel statistics and pending tasks
- **Complaint Management**: Review, update status, and resolve student complaints
- **Leave Approval**: Approve or reject student leave applications
- **Student Directory**: View and manage students in assigned hostel
- **Announcements**: Post notices for students in their hostel

### Superuser Portal
- **System Overview**: System-wide analytics and statistics
- **User Management**: Manage students, wardens, and system users
- **Hostel Management**: Add, edit, and manage hostels and rooms
- **Global Administration**: Complete system control and monitoring

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Express Validator** for input validation
- **Bcryptjs** for password hashing

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hostel-management-system
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel-management
JWT_SECRET=your-super-secret-jwt-key-here
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For Windows
net start MongoDB

# For macOS (with Homebrew)
brew services start mongodb-community

# For Linux
sudo systemctl start mongod
```

### 6. Seed the Database (Optional)

To populate the database with sample data:

```bash
npm run seed
```

This will create:
- 4 sample hostels (Gautam, Sattal, Neelkanth, Panchachuli)
- Sample wardens and students
- Test users for all roles

### 7. Start the Application

#### Option 1: Run Backend and Frontend Separately

```bash
# Terminal 1 - Start Backend
npm run dev

# Terminal 2 - Start Frontend
npm run client
```

#### Option 2: Run Both Together

```bash
npm run dev-full
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Demo Credentials

After seeding the database, you can use these credentials to login:

### Student
- **Username**: 2024001
- **Phone**: Any valid phone number (e.g., +91-9876543001)

### Warden
- **Username**: EMP001
- **Phone**: Any valid phone number (e.g., +91-9876543210)

### Superuser
- **Username**: admin
- **Phone**: Any valid phone number (e.g., +91-9876543999)

**Note**: The system uses OTP-based authentication. The OTP will be displayed in the backend console for demo purposes.

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to user's phone
- `POST /api/auth/verify-otp` - Verify OTP and login

### Student Routes
- `GET /api/student/hostels` - Get all hostels
- `GET /api/student/rooms/:hostelId` - Get rooms for specific hostel
- `POST /api/student/bookings/pay` - Book a room
- `POST /api/student/complaints` - Create complaint
- `GET /api/student/complaints/me` - Get student's complaints
- `POST /api/student/leaves` - Apply for leave
- `GET /api/student/leaves/me` - Get student's leave applications

### Warden Routes
- `GET /api/warden/dashboard` - Get warden dashboard data
- `GET /api/warden/complaints` - Get hostel complaints
- `PUT /api/warden/complaints/:id` - Update complaint status
- `GET /api/warden/leaves` - Get leave applications
- `PUT /api/warden/leaves/:id` - Approve/reject leave
- `GET /api/warden/students` - Get hostel students
- `POST /api/warden/announcements` - Create announcement

### Superuser Routes
- `GET /api/superuser/dashboard` - Get system dashboard
- `GET /api/superuser/all-students` - Get all students
- `GET /api/superuser/hostels` - Manage hostels
- `GET /api/superuser/users` - Manage users
- `GET /api/superuser/rooms` - Manage rooms

## Project Structure

```
hostel-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth)
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main App component
│   └── package.json
├── models/                # MongoDB schemas
├── routes/                # Express routes
├── middleware/            # Custom middleware
├── scripts/               # Utility scripts
├── server.js              # Main server file
└── package.json
```

## Key Features Explained

### Authentication System
- OTP-based authentication for security
- JWT tokens for session management
- Role-based access control (Student, Warden, Superuser)

### Database Design
- Comprehensive schemas for all entities
- Proper relationships and indexing
- Data validation and constraints

### Real-time Updates
- Room availability updates automatically
- Complaint and leave status tracking
- Hostel occupancy monitoring

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Modern, clean UI/UX
- Accessible components

## Development

### Adding New Features

1. **Backend**: Add new routes in `/routes` directory
2. **Frontend**: Create new components in `/client/src/components`
3. **Database**: Update schemas in `/models` if needed

### Code Style

- Use ES6+ features
- Follow React best practices
- Consistent naming conventions
- Proper error handling

## Deployment

### Production Setup

1. Set `NODE_ENV=production` in environment variables
2. Use a production MongoDB instance
3. Set up proper JWT secrets
4. Configure CORS for your domain
5. Use PM2 or similar for process management

### Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository or contact the development team.

---

**Note**: This is a demo application. In a production environment, implement proper security measures, payment gateways, SMS services, and other production-ready features.
