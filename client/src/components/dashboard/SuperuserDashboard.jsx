import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import Badge from '../Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuperuserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/superuser/dashboard');
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

  const { stats, hostelOccupancy, recentComplaints, recentLeaves } = dashboardData;

  const quickActions = [
    {
      title: 'Manage Students',
      description: 'View and manage all students',
      icon: Users,
      href: '/superuser/students',
      color: 'bg-blue-500',
      count: stats.totalStudents
    },
    {
      title: 'Hostel Management',
      description: 'Manage hostels and rooms',
      icon: Building2,
      href: '/superuser/hostels',
      color: 'bg-green-500',
      count: stats.totalHostels
    },
    {
      title: 'User Management',
      description: 'Manage system users',
      icon: Users,
      href: '/superuser/users',
      color: 'bg-purple-500',
      count: stats.totalWardens
    },
    {
      title: 'System Analytics',
      description: 'View system-wide analytics',
      icon: BarChart3,
      href: '/superuser/system',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Wardens</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWardens}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hostels</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHostels}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resolved Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedComplaints}</p>
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
                      <Badge variant="info">
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
        {/* Hostel Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Hostel Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hostelOccupancy.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hostel data available</p>
            ) : (
              <div className="space-y-4">
                {hostelOccupancy.map((hostel) => (
                  <div key={hostel._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{hostel.name}</h4>
                      <Badge variant={hostel.occupancyRate > 80 ? 'success' : hostel.occupancyRate > 60 ? 'warning' : 'danger'}>
                        {hostel.occupancyRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Rooms</p>
                        <p className="font-medium">{hostel.totalRooms}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Students</p>
                        <p className="font-medium">{hostel.studentCount}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min(hostel.occupancyRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recent Complaints */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recent Complaints</h4>
                {recentComplaints.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent complaints</p>
                ) : (
                  <div className="space-y-2">
                    {recentComplaints.slice(0, 3).map((complaint) => (
                      <div key={complaint._id} className="p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium">{complaint.category}</p>
                        <p className="text-gray-600">
                          {complaint.student.name} • {complaint.hostel.name}
                        </p>
                        <Badge variant={
                          complaint.status === 'Pending' ? 'pending' :
                          complaint.status === 'In Progress' ? 'in-progress' :
                          'resolved'
                        } size="sm">
                          {complaint.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Leaves */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recent Leave Applications</h4>
                {recentLeaves.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent leave applications</p>
                ) : (
                  <div className="space-y-2">
                    {recentLeaves.slice(0, 3).map((leave) => (
                      <div key={leave._id} className="p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium">{leave.type} Leave</p>
                        <p className="text-gray-600">
                          {leave.student.name} • {new Date(leave.startDate).toLocaleDateString()}
                        </p>
                        <Badge variant={
                          leave.status === 'Pending' ? 'pending' :
                          leave.status === 'Approved' ? 'approved' :
                          'rejected'
                        } size="sm">
                          {leave.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperuserDashboard;
