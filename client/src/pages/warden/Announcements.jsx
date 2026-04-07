import React, { useState, useEffect } from 'react';
import { Plus, Bell, Calendar, User, Filter, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WardenAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Medium',
    validUntil: ''
  });

  const priorities = ['Low', 'Medium', 'High'];

  useEffect(() => {
    fetchAnnouncements();
  }, [priorityFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/warden/announcements');
      setAnnouncements(response.data.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreateLoading(true);
      const response = await api.post('/warden/announcements', formData);
      
      toast.success('Announcement posted successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        priority: 'Medium',
        validUntil: ''
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to create announcement');
    } finally {
      setCreateLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'text-gray-600 bg-gray-100';
      case 'Medium':
        return 'text-blue-600 bg-blue-100';
      case 'High':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      announcement.title.toLowerCase().includes(searchLower) ||
      announcement.content.toLowerCase().includes(searchLower)
    );
  }).filter(announcement => {
    if (!priorityFilter) return true;
    return announcement.priority === priorityFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage announcements for your hostel students
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Priority:</span>
              </div>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
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
                onClick={() => setPriorityFilter('')}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || priorityFilter
                ? 'No announcements match your current filters.'
                : 'You haven\'t posted any announcements yet.'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Posted on {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    <Badge variant={announcement.isActive ? 'success' : 'default'}>
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>Posted by {announcement.author?.username || 'Unknown'}</span>
                  </div>
                  
                  {announcement.validUntil && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Valid until {new Date(announcement.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                    <div className="space-y-1">
                      {announcement.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">📎</span>
                          <span>{attachment.filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Announcement"
        size="lg"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter announcement title"
            required
          />

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={6}
              placeholder="Enter announcement content..."
              required
            />
          </div>

          <Input
            label="Valid Until (Optional)"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
            helperText="Leave empty for no expiration"
          />

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This announcement will be visible to all students in your assigned hostel.
            </p>
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
              Post Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WardenAnnouncements;
