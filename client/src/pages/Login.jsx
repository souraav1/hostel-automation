import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Building2, User, Phone } from 'lucide-react'; // Using Phone icon again
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '', // ✨ Ensure this is 'phone', not 'password'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    // ✨ Call login with username and phone
    const result = await login(formData.username, formData.phone);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard'); // Redirect after successful login
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative bg-gray-100"
      style={{ 
        backgroundImage: 'url("/background.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* White Header Bar */}
      <div className="bg-white shadow-sm py-4 px-6">
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Hostel Automation System" 
            className="h-12 w-auto mr-4"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hostel Automation System</h1>
            <p className="text-sm text-gray-600">Student & Staff Portal</p>
          </div>
        </div>
      </div>

      {/* Background Image Fallback */}
      <img 
        src="/background.webp" 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover -z-10"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.style.backgroundColor = '#f3f4f6';
        }}
      />
      
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>

      {/* Login Form Container */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl">
          <CardHeader><CardTitle className="text-center text-gray-800">Login to your account</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Username (Student/Employee ID)"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
                placeholder="Enter your ID"
                icon={<User className="h-5 w-5 text-gray-400" />}
              />
              {/* ✨ This input is for the phone number */}
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                placeholder="Enter your phone number"
                icon={<Phone className="h-5 w-5 text-gray-400" />}
              />
              <Button type="submit" className="w-full" loading={loading} disabled={loading}>
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;