import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    roomNumber: '',
    priority: 'Medium'
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

      const response = await api.get(`/student/complaints/me?${params}`);
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreateLoading(true);
      const response = await api.post('/student/complaints', formData);
      
      toast.success('Complaint submitted successfully!');
      setShowCreateModal(false);
      setFormData({
        category: '',
        description: '',
        roomNumber: '',
        priority: 'Medium'
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error creating complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setCreateLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your hostel complaints
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Complaint
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
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
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

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ status: '', category: '' })}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-500 mb-4">
              {Object.values(filters).some(f => f) 
                ? 'No complaints match your current filters.'
                : 'You haven\'t submitted any complaints yet.'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Complaint
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
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
                        Submitted on {new Date(complaint.createdAt).toLocaleDateString()}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Complaint Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Submit New Complaint"
        size="lg"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Room Number (Optional)"
            value={formData.roomNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
            placeholder="Enter room number if applicable"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Describe the issue in detail..."
              required
            />
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
              Submit Complaint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentComplaints;
