import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import WardenDashboard from '../components/dashboard/WardenDashboard';
import SuperuserDashboard from '../components/dashboard/SuperuserDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'warden':
        return <WardenDashboard />;
      case 'superuser':
        return <SuperuserDashboard />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Unable to determine user role.</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening in your {user?.role} dashboard today.
        </p>
      </div>
      
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
