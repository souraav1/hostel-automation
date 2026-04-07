import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  AlertCircle, 
  Users, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import Badge from '../Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WardenDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/warden/dashboard');
      console.log('Dashboard data received:', response.data.data);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load dashboard data.</p>
      </div>
    );
  }

  const { hostel, stats, recentComplaints, recentLeaves } = dashboardData;

  const quickActions = [
    {
      title: 'Manage Complaints',
      description: 'Review and resolve complaints',
      icon: AlertCircle,
      href: '/warden/complaints',
      color: 'bg-red-500',
      count: stats.pendingComplaints
    },
    {
      title: 'Leave Requests',
      description: 'Approve or reject leave applications',
      icon: Calendar,
      href: '/warden/leaves',
      color: 'bg-green-500',
      count: stats.pendingLeaves
    },
    {
      title: 'Student Directory',
      description: 'View and manage students',
      icon: Users,
      href: '/warden/students',
      color: 'bg-blue-500',
      count: stats.totalStudents
    },
    {
      title: 'Announcements',
      description: 'Post hostel announcements',
      icon: Building2,
      href: '/warden/announcements',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hostel Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            {dashboardData.warden?.name} - {hostel.name} Warden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupied Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupiedRooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available Rooms</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableRooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="text-2xl font-bold text-primary-600">{stats.occupancyRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Leaves</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
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
                <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
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
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 ${action.color} rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {action.count !== undefined && (
                      <Badge variant={action.count > 0 ? 'warning' : 'success'}>
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Recent Complaints
              </span>
              <Link
                to="/warden/complaints"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent complaints</p>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{complaint.category}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {complaint.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {complaint.student.name} • Room {complaint.student.room?.roomNumber || 'N/A'}
                        </p>
                      </div>
                      <Badge variant={
                        complaint.status === 'Pending' ? 'pending' :
                        complaint.status === 'In Progress' ? 'in-progress' :
                        'resolved'
                      }>
                        {complaint.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Leave Requests
              </span>
              <Link
                to="/warden/leaves"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeaves.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent leave requests</p>
            ) : (
              <div className="space-y-3">
                {recentLeaves.map((leave) => (
                  <div
                    key={leave._id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{leave.type} Leave</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {leave.reason}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {leave.student.name} • {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        leave.status === 'Pending' ? 'pending' :
                        leave.status === 'Approved' ? 'approved' :
                        'rejected'
                      }>
                        {leave.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WardenDashboard;
