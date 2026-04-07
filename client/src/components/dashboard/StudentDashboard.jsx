import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  AlertCircle, 
  Calendar, 
  Bell,
  User,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import Badge from '../Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    complaints: 0,
    leaves: 0,
    pendingComplaints: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

const fetchDashboardData = async () => {
  try {
    // ✨ Use Promise.allSettled to prevent one failure from stopping others
    const results = await Promise.allSettled([
      api.get('/student/profile'),
      api.get('/student/announcements?limit=3'), // Keep the optimization!
      api.get('/student/complaints/me'),
      api.get('/student/leaves/me')
    ]);

    const [profileRes, announcementsRes, complaintsRes, leavesRes] = results;

    // ✅ Check the status of each promise individually
    if (profileRes.status === 'fulfilled') {
      setProfile(profileRes.value.data.data);
    } else {
      console.error("Profile fetch failed:", profileRes.reason);
      toast.error('Could not load profile information.');
    }

    if (announcementsRes.status === 'fulfilled') {
      setAnnouncements(announcementsRes.value.data.data);
    } else {
      console.error("Announcements fetch failed:", announcementsRes.reason);
      // You could show a toast here too, but it might be too noisy.
    }

    // Safely get data for stats, falling back to an empty array on failure
    const complaintsData = complaintsRes.status === 'fulfilled' ? complaintsRes.value.data.data : [];
    const leavesData = leavesRes.status === 'fulfilled' ? leavesRes.value.data.data : [];

    setStats({
      complaints: complaintsData.length,
      leaves: leavesData.length,
      pendingComplaints: complaintsData.filter(c => c.status === 'Pending').length,
      pendingLeaves: leavesData.filter(l => l.status === 'Pending').length
    });

  } catch (error) {
    // This catch block is now a safety net for totally unexpected errors
    console.error('An unexpected error occurred in fetchDashboardData:', error);
    toast.error('An unexpected error occurred.');
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Book Room',
      description: 'Find and book available rooms',
      icon: Building2,
      href: '/student/rooms',
      color: 'bg-blue-500'
    },
    {
      title: 'Raise Complaint',
      description: 'Report issues or problems',
      icon: AlertCircle,
      href: '/student/complaints',
      color: 'bg-red-500'
    },
    {
      title: 'Apply for Leave',
      description: 'Submit leave applications',
      icon: Calendar,
      href: '/student/leaves',
      color: 'bg-green-500'
    },
    {
      title: 'View Announcements',
      description: 'Check latest hostel notices',
      icon: Bell,
      href: '/student/announcements',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-medium">{profile.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Course</p>
                <p className="font-medium">{profile.course}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year</p>
                <p className="font-medium">{profile.year}</p>
              </div>
            </div>
            
            {profile.room && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Hostel</p>
                    <p className="font-medium">{profile.hostel?.name || 'Not allocated'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Room</p>
                    <p className="font-medium">{profile.room.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Room Fee</p>
                    <p className="font-medium">₹{profile.room.fee}/month</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.complaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Leave/Outing Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.leaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Leaves</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center mb-2">
                    <div className={`p-2 ${action.color} rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="ml-3 font-medium text-gray-900">{action.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Announcements
              </span>
              <Link
                to="/student/announcements"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                    <Badge variant="info" size="sm">
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;
