import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, MapPin, User, Phone, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WardenStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [roomFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roomFilter) params.append('room', roomFilter);

      const response = await api.get(`/warden/students?${params}`);
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower) ||
      student.course.toLowerCase().includes(searchLower) ||
      student.room?.roomNumber.toLowerCase().includes(searchLower)
    );
  });

  const getUniqueRooms = () => {
    const rooms = students
      .filter(student => student.room)
      .map(student => student.room.roomNumber)
      .filter((room, index, self) => self.indexOf(room) === index)
      .sort();
    return rooms;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage students in your assigned hostel
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
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Room Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Room:</span>
              </div>
              
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Rooms</option>
                {getUniqueRooms().map(room => (
                  <option key={room} value={room}>Room {room}</option>
                ))}
              </select>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRoomFilter('')}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Allocated Rooms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.room).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <User className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unallocated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => !s.room).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              {searchTerm || roomFilter
                ? 'No students match your current filters.'
                : 'No students are currently assigned to your hostel.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.studentId}</p>
                    </div>
                  </div>
                  <Badge variant={student.room ? 'success' : 'warning'}>
                    {student.room ? 'Allocated' : 'Unallocated'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium">{student.course}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">{student.year}</p>
                  </div>

                  {student.room && (
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-medium">
                          {student.room.roomNumber} ({student.room.type})
                        </span>
                      </div>
                    </div>
                  )}

                  {student.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm">{student.email}</span>
                      </div>
                    </div>
                  )}

                  {student.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm">{student.phone}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500">Admission Date</p>
                    <p className="text-sm">
                      {new Date(student.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {student.emergencyContact && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>Name:</strong> {student.emergencyContact.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Phone:</strong> {student.emergencyContact.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Relation:</strong> {student.emergencyContact.relation}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WardenStudents;
