import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WardenComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [updateData, setUpdateData] = useState({
    status: '',
    resolution: ''
  });

  const categories = [
    'Electrical',
    'Plumbing',
    'Internet',
    'Furniture',
    'Cleaning',
    'Security',
    'Other'
  ];

  const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await api.get(`/warden/complaints?${params}`);
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    
    if (!updateData.status) {
      toast.error('Please select a status');
      return;
    }

    if (updateData.status === 'Resolved' && !updateData.resolution.trim()) {
      toast.error('Please provide a resolution description');
      return;
    }

    try {
      setUpdateLoading(true);
      const response = await api.put(`/warden/complaints/${selectedComplaint._id}`, {
        status: updateData.status,
        resolution: updateData.resolution ? { description: updateData.resolution } : undefined
      });

      toast.success('Complaint updated successfully!');
      setShowUpdateModal(false);
      setSelectedComplaint(null);
      setUpdateData({ status: '', resolution: '' });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to update complaint');
    } finally {
      setUpdateLoading(false);
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      resolution: complaint.resolution?.description || ''
    });
    setShowUpdateModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'In Progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="pending">{status}</Badge>;
      case 'In Progress':
        return <Badge variant="in-progress">{status}</Badge>;
      case 'Resolved':
        return <Badge variant="resolved">{status}</Badge>;
      case 'Closed':
        return <Badge variant="default">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'text-gray-600 bg-gray-100';
      case 'Medium':
        return 'text-blue-600 bg-blue-100';
      case 'High':
        return 'text-orange-600 bg-orange-100';
      case 'Urgent':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      complaint.student.name.toLowerCase().includes(searchLower) ||
      complaint.student.studentId.toLowerCase().includes(searchLower) ||
      complaint.category.toLowerCase().includes(searchLower) ||
      complaint.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage student complaints for your hostel
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
                placeholder="Search complaints..."
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
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ status: '', category: '', priority: '' })}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-500">
              {Object.values(filters).some(f => f) || searchTerm
                ? 'No complaints match your current filters.'
                : 'No complaints have been submitted yet.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Card key={complaint._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(complaint.status)}
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {complaint.category} Issue
                      </h3>
                      <p className="text-sm text-gray-500">
                        Submitted by {complaint.student.name} ({complaint.student.studentId}) on {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    {getStatusBadge(complaint.status)}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700">{complaint.description}</p>
                  {complaint.roomNumber && (
                    <p className="text-sm text-gray-500 mt-2">
                      Room: {complaint.roomNumber}
                    </p>
                  )}
                </div>

                {complaint.resolution && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Resolution:</h4>
                    <p className="text-sm text-green-700">{complaint.resolution.description}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Resolved on {new Date(complaint.resolution.resolvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => openUpdateModal(complaint)}
                    variant="primary"
                    size="sm"
                  >
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Complaint Status"
        size="md"
      >
        {selectedComplaint && (
          <form onSubmit={handleUpdateComplaint} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Complaint Details</h4>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Category:</strong> {selectedComplaint.category}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Student:</strong> {selectedComplaint.student.name} ({selectedComplaint.student.studentId})
              </p>
              <p className="text-sm text-gray-600">
                <strong>Description:</strong> {selectedComplaint.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={updateData.status}
                onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {updateData.status === 'Resolved' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Description *
                </label>
                <textarea
                  value={updateData.resolution}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, resolution: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Describe how the issue was resolved..."
                  required
                />
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowUpdateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateLoading}
                className="flex-1"
              >
                Update Status
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default WardenComplaints;
