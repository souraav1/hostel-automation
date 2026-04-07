import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, MapPin, User, Phone, Mail, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuperuserStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    hostel: '',
    course: '',
    year: '',
    room: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchStudents();
  }, [filters, pagination.current]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.hostel) params.append('hostel', filters.hostel);
      if (filters.course) params.append('course', filters.course);
      if (filters.year) params.append('year', filters.year);
      if (filters.room) params.append('room', filters.room);
      params.append('page', pagination.current);
      params.append('limit', '20');

      const response = await api.get(`/superuser/all-students?${params}`);
      setStudents(response.data.data.students);
      setPagination(response.data.data.pagination);
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
      student.room?.roomNumber.toLowerCase().includes(searchLower) ||
      student.hostel?.name.toLowerCase().includes(searchLower)
    );
  });

  const getUniqueValues = (field) => {
    const values = students
      .map(student => student[field])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return values;
  };

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
        <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all students across all hostels
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
                placeholder="Search students..."
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
                value={filters.hostel}
                onChange={(e) => setFilters(prev => ({ ...prev, hostel: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Hostels</option>
                {getUniqueValues('hostel').map(hostel => (
                  <option key={hostel._id} value={hostel._id}>{hostel.name}</option>
                ))}
              </select>

              <select
                value={filters.course}
                onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Courses</option>
                {getUniqueValues('course').map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Years</option>
                {getUniqueValues('year').map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>

              <select
                value={filters.room}
                onChange={(e) => setFilters(prev => ({ ...prev, room: e.target.value }))}
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
                onClick={() => setFilters({ hostel: '', course: '', year: '', room: '' })}
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
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
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
                <p className="text-sm font-medium text-gray-500">Allocated</p>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hostels</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getUniqueValues('hostel').length}
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
              {searchTerm || Object.values(filters).some(f => f)
                ? 'No students match your current filters.'
                : 'No students are registered in the system.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium">{student.course}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">{student.year}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Hostel</p>
                    <p className="font-medium">{student.hostel?.name || 'Not allocated'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Room</p>
                    <p className="font-medium">
                      {student.room ? `${student.room.roomNumber} (${student.room.type})` : 'Not allocated'}
                    </p>
                  </div>
                </div>

                {(student.email || student.phone) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Admission Date</p>
                  <p className="text-sm">
                    {new Date(student.admissionDate).toLocaleDateString()}
                  </p>
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

export default SuperuserStudents;
