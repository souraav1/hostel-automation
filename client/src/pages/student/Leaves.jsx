import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StudentLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'Personal',
    destination: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

  const leaveTypes = [
    'Emergency',
    'Medical',
    'Personal',
    'Academic',
    'Other'
  ];

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);

      const response = await api.get(`/student/leaves/me?${params}`);
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeave = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setCreateLoading(true);
      
      // Prepare the data to send, only including emergency contact if all fields are filled
      const leaveData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
        type: formData.type,
      };

      // Only add destination if it has a value
      if (formData.destination && formData.destination.trim()) {
        leaveData.destination = formData.destination.trim();
      }

      // Only add emergency contact if all fields are filled
      if (formData.emergencyContact.name && formData.emergencyContact.name.trim() && 
          formData.emergencyContact.phone && formData.emergencyContact.phone.trim() && 
          formData.emergencyContact.relation && formData.emergencyContact.relation.trim()) {
        leaveData.emergencyContact = {
          name: formData.emergencyContact.name.trim(),
          phone: formData.emergencyContact.phone.trim(),
          relation: formData.emergencyContact.relation.trim()
        };
      }

      const response = await api.post('/student/leaves', leaveData);
      
      toast.success('Leave application submitted successfully!');
      setShowCreateModal(false);
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
        type: 'Personal',
        destination: '',
        emergencyContact: {
          name: '',
          phone: '',
          relation: ''
        }
      });
      fetchLeaves();
    } catch (error) {
      console.error('Error creating leave:', error);
      
      // Get detailed error messages
      let errorMessage = 'Failed to submit leave application';
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(e => e.msg).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave/Outing Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Apply for and track your leave requests
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
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
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
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
        </CardContent>
      </Card>

      {/* Leaves List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : leaves.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave applications found</h3>
            <p className="text-gray-500 mb-4">
              {Object.values(filters).some(f => f) 
                ? 'No applications match your current filters.'
                : 'You haven\'t submitted any leave applications yet.'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
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
                        Applied on {new Date(leave.createdAt).toLocaleDateString()}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Leave Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Submit Leave Application"
        size="lg"
      >
        <form onSubmit={handleCreateLeave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <Input
              label="Destination (Optional)"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="Where are you going?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Please provide a detailed reason for your leave..."
              required
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Name"
                value={formData.emergencyContact.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                }))}
                placeholder="Contact name"
              />
              <Input
                label="Phone"
                value={formData.emergencyContact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                }))}
                placeholder="Phone number"
              />
              <Input
                label="Relation"
                value={formData.emergencyContact.relation}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, relation: e.target.value }
                }))}
                placeholder="Relationship"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createLoading}
              className="flex-1"
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentLeaves;
