import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Building2, AlertCircle, Calendar, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuperuserSystem = () => {
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      const response = await api.get('/superuser/dashboard');
      setSystemData(response.data.data);
    } catch (error) {
      console.error('Error fetching system data:', error);
      toast.error('Failed to load system data');
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

  if (!systemData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load system data.</p>
      </div>
    );
  }

  const { stats, hostelOccupancy, recentComplaints, recentLeaves } = systemData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive system overview and analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Hostels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHostels}</p>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaint Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
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
                <AlertCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resolved Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved Leaves</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Leaves</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hostel Occupancy Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Hostel Occupancy Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hostelOccupancy.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hostel data available</p>
          ) : (
            <div className="space-y-4">
              {hostelOccupancy.map((hostel) => (
                <div key={hostel._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{hostel.name}</h4>
                    <div className="flex items-center space-x-4">
                      <Badge variant={hostel.occupancyRate > 80 ? 'success' : hostel.occupancyRate > 60 ? 'warning' : 'danger'}>
                        {hostel.occupancyRate.toFixed(1)}% Occupied
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Total Rooms</p>
                      <p className="font-medium">{hostel.totalRooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available Rooms</p>
                      <p className="font-medium text-green-600">{hostel.availableRooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="font-medium">{hostel.studentCount}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        hostel.occupancyRate > 80 ? 'bg-green-500' :
                        hostel.occupancyRate > 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(hostel.occupancyRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Recent Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent complaints</p>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((complaint) => (
                  <div key={complaint._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{complaint.category}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {complaint.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {complaint.student.name} • {complaint.hostel.name}
                        </p>
                      </div>
                      <Badge variant={
                        complaint.status === 'Pending' ? 'pending' :
                        complaint.status === 'In Progress' ? 'in-progress' :
                        'resolved'
                      } size="sm">
                        {complaint.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leave Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Leave Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeaves.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent leave applications</p>
            ) : (
              <div className="space-y-3">
                {recentLeaves.map((leave) => (
                  <div key={leave._id} className="p-3 bg-gray-50 rounded-lg">
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
                      } size="sm">
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

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">System Status</p>
              <p className="text-lg font-bold text-blue-900">Operational</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Database</p>
              <p className="text-lg font-bold text-green-900">Connected</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">API Status</p>
              <p className="text-lg font-bold text-purple-900">Active</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Last Updated</p>
              <p className="text-lg font-bold text-orange-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperuserSystem;
