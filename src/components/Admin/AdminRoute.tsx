
import React from 'react';
import AdminProtectedRoute from './AdminProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  return (
    <AdminProtectedRoute requireValidSession={true}>
      {children}
    </AdminProtectedRoute>
  );
};

export default AdminRoute;
