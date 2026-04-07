import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WardenLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [actionData, setActionData] = useState({
    status: '',
    rejectionReason: ''
  });

  const leaveTypes = [
    'Emergency',
    'Medical',
    'Personal',
    'Academic',
    'Other'
  ];

  const statuses = ['Pending', 'Approved', 'Rejected'];

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);

      const response = await api.get(`/warden/leaves?${params}`);
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (e) => {
    e.preventDefault();
    
    if (!actionData.status) {
      toast.error('Please select an action');
      return;
    }

    if (actionData.status === 'Rejected' && !actionData.rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.put(`/warden/leaves/${selectedLeave._id}`, {
        status: actionData.status,
        rejectionReason: actionData.status === 'Rejected' ? actionData.rejectionReason : undefined
      });

      toast.success(`Leave application ${actionData.status.toLowerCase()} successfully!`);
      setShowActionModal(false);
      setSelectedLeave(null);
      setActionData({ status: '', rejectionReason: '' });
      fetchLeaves();
    } catch (error) {
      console.error('Error updating leave:', error);
      toast.error(error.response?.data?.message || 'Failed to update leave application');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (leave, action) => {
    setSelectedLeave(leave);
    setActionData({
      status: action,
      rejectionReason: ''
    });
    setShowActionModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="pending">{status}</Badge>;
      case 'Approved':
        return <Badge variant="approved">{status}</Badge>;
      case 'Rejected':
        return <Badge variant="rejected">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredLeaves = leaves.filter(leave => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      leave.student.name.toLowerCase().includes(searchLower) ||
      leave.student.studentId.toLowerCase().includes(searchLower) ||
      leave.type.toLowerCase().includes(searchLower) ||
      leave.reason.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leave Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage student leave applications
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leave applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ status: '', type: '' })}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaves List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredLeaves.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave applications found</h3>
            <p className="text-gray-500">
              {Object.values(filters).some(f => f) || searchTerm
                ? 'No applications match your current filters.'
                : 'No leave applications have been submitted yet.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLeaves.map((leave) => (
            <Card key={leave._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(leave.status)}
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {leave.type} Leave
                      </h3>
                      <p className="text-sm text-gray-500">
                        Applied by {leave.student.name} ({leave.student.studentId}) on {new Date(leave.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(leave.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {getDuration(leave.startDate, leave.endDate)} days
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Reason:</p>
                  <p className="text-gray-700">{leave.reason}</p>
                </div>

                {leave.destination && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Destination:</p>
                    <p className="text-gray-700">{leave.destination}</p>
                  </div>
                )}

                {leave.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Rejection Reason:</h4>
                    <p className="text-sm text-red-700">{leave.rejectionReason}</p>
                  </div>
                )}

                {leave.approvedAt && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Approved on:</strong> {new Date(leave.approvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {leave.status === 'Pending' && (
                  <div className="mt-4 flex space-x-3">
                    <Button
                      onClick={() => openActionModal(leave, 'Approved')}
                      variant="success"
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => openActionModal(leave, 'Rejected')}
                      variant="danger"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={`${actionData.status} Leave Application`}
        size="md"
      >
        {selectedLeave && (
          <form onSubmit={handleLeaveAction} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Student:</strong> {selectedLeave.student.name} ({selectedLeave.student.studentId})</p>
                <p><strong>Type:</strong> {selectedLeave.type}</p>
                <p><strong>Duration:</strong> {getDuration(selectedLeave.startDate, selectedLeave.endDate)} days</p>
                <p><strong>Dates:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              </div>
            </div>

            {actionData.status === 'Rejected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={actionData.rejectionReason}
                  onChange={(e) => setActionData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Confirm:</strong> Are you sure you want to {actionData.status.toLowerCase()} this leave application?
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowActionModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={actionLoading}
                variant={actionData.status === 'Approved' ? 'success' : 'danger'}
                className="flex-1"
              >
                {actionData.status} Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default WardenLeaves;
