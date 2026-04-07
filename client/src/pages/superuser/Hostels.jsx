import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Users, MapPin, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuperuserHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    totalRooms: '',
    description: '',
    address: '',
    facilities: []
  });

  const [facilityInput, setFacilityInput] = useState('');

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superuser/hostels');
      setHostels(response.data.data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      toast.error('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHostel = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.totalRooms) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreateLoading(true);
      const response = await api.post('/superuser/hostels', {
        ...formData,
        totalRooms: parseInt(formData.totalRooms),
        availableRooms: parseInt(formData.totalRooms)
      });
      
      toast.success('Hostel created successfully!');
      setShowCreateModal(false);
      setFormData({
        name: '',
        totalRooms: '',
        description: '',
        address: '',
        facilities: []
      });
      fetchHostels();
    } catch (error) {
      console.error('Error creating hostel:', error);
      toast.error(error.response?.data?.message || 'Failed to create hostel');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditHostel = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.totalRooms) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setEditLoading(true);
      const response = await api.put(`/superuser/hostels/${selectedHostel._id}`, {
        ...formData,
        totalRooms: parseInt(formData.totalRooms)
      });
      
      toast.success('Hostel updated successfully!');
      setShowEditModal(false);
      setSelectedHostel(null);
      setFormData({
        name: '',
        totalRooms: '',
        description: '',
        address: '',
        facilities: []
      });
      fetchHostels();
    } catch (error) {
      console.error('Error updating hostel:', error);
      toast.error(error.response?.data?.message || 'Failed to update hostel');
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = (hostel) => {
    setSelectedHostel(hostel);
    setFormData({
      name: hostel.name,
      totalRooms: hostel.totalRooms.toString(),
      description: hostel.description || '',
      address: hostel.address || '',
      facilities: hostel.facilities || []
    });
    setShowEditModal(true);
  };

  const addFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facilityInput.trim()]
      }));
      setFacilityInput('');
    }
  };

  const removeFacility = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facility)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage hostels and their configurations
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hostel
        </Button>
      </div>

      {/* Hostels List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : hostels.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hostels found</h3>
            <p className="text-gray-500 mb-4">
              No hostels have been created yet.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Hostel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel) => (
            <Card key={hostel._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-primary-600" />
                    {hostel.name}
                  </CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(hostel)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hostel.description && (
                    <p className="text-sm text-gray-600">{hostel.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Rooms</p>
                      <p className="font-medium">{hostel.totalRooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available</p>
                      <p className="font-medium text-green-600">{hostel.availableRooms}</p>
                    </div>
                  </div>

                  {hostel.warden && (
                    <div>
                      <p className="text-sm text-gray-500">Warden</p>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm">{hostel.warden.name}</span>
                      </div>
                    </div>
                  )}

                  {hostel.address && (
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm">{hostel.address}</span>
                      </div>
                    </div>
                  )}

                  {hostel.facilities && hostel.facilities.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Facilities</p>
                      <div className="flex flex-wrap gap-1">
                        {hostel.facilities.map((facility) => (
                          <Badge key={facility} variant="info" size="sm">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Occupancy Rate</span>
                      <span className="font-medium">
                        {hostel.totalRooms > 0 
                          ? (((hostel.totalRooms - hostel.availableRooms) / hostel.totalRooms) * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ 
                          width: `${hostel.totalRooms > 0 
                            ? ((hostel.totalRooms - hostel.availableRooms) / hostel.totalRooms) * 100 
                            : 0
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Hostel Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Hostel"
        size="lg"
      >
        <form onSubmit={handleCreateHostel} className="space-y-4">
          <Input
            label="Hostel Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter hostel name"
            required
          />

          <Input
            label="Total Rooms *"
            type="number"
            value={formData.totalRooms}
            onChange={(e) => setFormData(prev => ({ ...prev, totalRooms: e.target.value }))}
            placeholder="Enter total number of rooms"
            min="1"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Enter hostel description"
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter hostel address"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facilities
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                placeholder="Add facility"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
              />
              <Button type="button" onClick={addFacility} variant="secondary">
                Add
              </Button>
            </div>
            {formData.facilities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.facilities.map((facility) => (
                  <Badge key={facility} variant="info" size="sm">
                    {facility}
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="ml-1 text-xs hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
              Create Hostel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Hostel Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Hostel"
        size="lg"
      >
        <form onSubmit={handleEditHostel} className="space-y-4">
          <Input
            label="Hostel Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter hostel name"
            required
          />

          <Input
            label="Total Rooms *"
            type="number"
            value={formData.totalRooms}
            onChange={(e) => setFormData(prev => ({ ...prev, totalRooms: e.target.value }))}
            placeholder="Enter total number of rooms"
            min="1"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Enter hostel description"
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter hostel address"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facilities
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                placeholder="Add facility"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
              />
              <Button type="button" onClick={addFacility} variant="secondary">
                Add
              </Button>
            </div>
            {formData.facilities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.facilities.map((facility) => (
                  <Badge key={facility} variant="info" size="sm">
                    {facility}
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="ml-1 text-xs hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={editLoading}
              className="flex-1"
            >
              Update Hostel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperuserHostels;
