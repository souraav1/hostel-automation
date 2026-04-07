import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  MapPin, 
  Wifi, 
  Car,
  Coffee,
  Dumbbell,
  BookOpen,
  Star
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StudentRooms = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const response = await api.get('/student/hostels');
      setHostels(response.data.data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      toast.error('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (hostelId) => {
    try {
      setLoading(true);
      const response = await api.get(`/student/rooms/${hostelId}`);
      setSelectedHostel(response.data.data.hostel);
      setRooms(response.data.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    setBookingRoom(room);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    try {
      setBookingLoading(true);
      const response = await api.post('/student/bookings/pay', {
        roomId: bookingRoom._id
      });

      toast.success('Room booked successfully!');
      setShowBookingModal(false);
      setBookingRoom(null);
      
      // Refresh rooms
      if (selectedHostel) {
        fetchRooms(selectedHostel.id);
      }
    } catch (error) {
      console.error('Error booking room:', error);
      toast.error(error.response?.data?.message || 'Failed to book room');
    } finally {
      setBookingLoading(false);
    }
  };

  const getFacilityIcon = (facility) => {
    switch (facility.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'gym':
        return <Dumbbell className="h-4 w-4" />;
      case 'library':
        return <BookOpen className="h-4 w-4" />;
      case 'common room':
        return <Coffee className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  if (loading && !selectedHostel) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hostel Rooms</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse and book available rooms in our hostels
        </p>
      </div>

      {!selectedHostel ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hostels.map((hostel) => (
            <Card
              key={hostel._id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => fetchRooms(hostel._id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-primary-600" />
                    {hostel.name}
                  </CardTitle>
                  <Badge variant="success">
                    {hostel.availableRooms} available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {hostel.description}
                </p>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Facilities:</p>
                  <div className="flex flex-wrap gap-2">
                    {hostel.facilities?.map((facility) => (
                      <div
                        key={facility}
                        className="flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {getFacilityIcon(facility)}
                        <span className="ml-1">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Total Rooms: {hostel.totalRooms}</span>
                  <span>Warden: {hostel.warden?.name || 'Not assigned'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hostel Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-primary-600" />
                    {selectedHostel.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedHostel.availableRooms} of {selectedHostel.totalRooms} rooms available
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedHostel(null)}
                >
                  Back to Hostels
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rooms Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card key={room._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        Room {room.roomNumber}
                      </CardTitle>
                      <Badge variant={room.isAvailable ? 'success' : 'danger'}>
                        {room.isAvailable ? 'Available' : 'Occupied'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="font-medium">{room.type}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Capacity:</span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {room.occupants.length}/{room.capacity}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Floor:</span>
                        <span className="font-medium">{room.floor}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Monthly Fee:</span>
                        <span className="font-bold text-lg text-primary-600">
                          ₹{room.fee}
                        </span>
                      </div>

                      {room.amenities && room.amenities.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.map((amenity) => (
                              <span
                                key={amenity}
                                className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {room.isAvailable && (
                        <Button
                          onClick={() => handleBookRoom(room)}
                          className="w-full mt-4"
                        >
                          Book Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Confirm Room Booking"
      >
        {bookingRoom && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Room Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Room Number:</span>
                  <span className="font-medium">{bookingRoom.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{bookingRoom.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Fee:</span>
                  <span className="font-bold text-primary-600">₹{bookingRoom.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hostel:</span>
                  <span className="font-medium">{selectedHostel?.name}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a demo booking system. In a real application, 
                this would redirect to a payment gateway for processing the booking fee.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowBookingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmBooking}
                loading={bookingLoading}
                className="flex-1"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentRooms;
