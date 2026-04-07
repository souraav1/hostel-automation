import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // 💡 Import it


// Components
import Navbar from './components/Navbar';
import { LoadingSpinner } from './components/Loading';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Student Pages
import StudentRooms from './pages/student/Rooms';
import StudentComplaints from './pages/student/Complaints';
import StudentLeaves from './pages/student/Leaves';

// Warden Pages
import WardenComplaints from './pages/warden/Complaints';
import WardenLeaves from './pages/warden/Leaves';
import WardenStudents from './pages/warden/Students';
import WardenAnnouncements from './pages/warden/Announcements';

// Superuser Pages
import SuperuserStudents from './pages/superuser/Students';
import SuperuserHostels from './pages/superuser/Hostels';
import SuperuserUsers from './pages/superuser/Users';
import SuperuserSystem from './pages/superuser/System';



// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Student Routes */}
            <Route
              path="/student/rooms"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <StudentRooms />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/complaints"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <StudentComplaints />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/leaves"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <StudentLeaves />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Warden Routes */}
            <Route
              path="/warden/complaints"
              element={
                <ProtectedRoute allowedRoles={['warden']}>
                  <Layout>
                    <WardenComplaints />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/warden/leaves"
              element={
                <ProtectedRoute allowedRoles={['warden']}>
                  <Layout>
                    <WardenLeaves />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/warden/students"
              element={
                <ProtectedRoute allowedRoles={['warden']}>
                  <Layout>
                    <WardenStudents />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/warden/announcements"
              element={
                <ProtectedRoute allowedRoles={['warden']}>
                  <Layout>
                    <WardenAnnouncements />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Superuser Routes */}
            <Route
              path="/superuser/students"
              element={
                <ProtectedRoute allowedRoles={['superuser']}>
                  <Layout>
                    <SuperuserStudents />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superuser/hostels"
              element={
                <ProtectedRoute allowedRoles={['superuser']}>
                  <Layout>
                    <SuperuserHostels />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superuser/users"
              element={
                <ProtectedRoute allowedRoles={['superuser']}>
                  <Layout>
                    <SuperuserUsers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superuser/system"
              element={
                <ProtectedRoute allowedRoles={['superuser']}>
                  <Layout>
                    <SuperuserSystem />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
