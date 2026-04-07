import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, User, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuperuserUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    isActive: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.current]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.isActive !== '') params.append('isActive', filters.isActive);
      params.append('page', pagination.current);
      params.append('limit', '20');

      const response = await api.get(`/superuser/users?${params}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await api.put(`/superuser/users/${userId}/status`, {
        isActive: !currentStatus
      });
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.profile?.name?.toLowerCase().includes(searchLower) ||
      user.profile?.studentId?.toLowerCase().includes(searchLower) ||
      user.profile?.employeeId?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return <Badge variant="info">Student</Badge>;
      case 'warden':
        return <Badge variant="warning">Warden</Badge>;
      case 'superuser':
        return <Badge variant="danger">Superuser</Badge>;
      default:
        return <Badge variant="default">{role}</Badge>;
    }
  };

  const getProfileInfo = (user) => {
    if (!user.profile) return null;
    
    if (user.role === 'student') {
      return (
        <div className="text-sm text-gray-600">
          <p><strong>Course:</strong> {user.profile.course}</p>
          <p><strong>Year:</strong> {user.profile.year}</p>
          {user.profile.room && (
            <p><strong>Room:</strong> {user.profile.room.roomNumber}</p>
          )}
        </div>
      );
    } else if (user.role === 'warden') {
      return (
        <div className="text-sm text-gray-600">
          <p><strong>Qualification:</strong> {user.profile.qualification}</p>
          <p><strong>Experience:</strong> {user.profile.experience} years</p>
          {user.profile.assignedHostel && (
            <p><strong>Hostel:</strong> {user.profile.assignedHostel.name}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage system users and their access
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="warden">Warden</option>
                <option value="superuser">Superuser</option>
              </select>

              <select
                value={filters.isActive}
                onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ role: '', isActive: '' })}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'student').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Building2 className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Wardens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'warden').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm || Object.values(filters).some(f => f)
                ? 'No users match your current filters.'
                : 'No users are registered in the system.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.profile?.name || user.username}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {user.username} • {user.profile?.studentId || user.profile?.employeeId || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRoleBadge(user.role)}
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="mb-4">
                  {getProfileInfo(user)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <p>Phone: {user.phone}</p>
                    <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <Button
                    variant={user.isActive ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                  >
                    {user.isActive ? (
                      <>
                        <ToggleLeft className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <ToggleRight className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing page {pagination.current} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                  disabled={pagination.current === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                  disabled={pagination.current === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuperuserUsers;
