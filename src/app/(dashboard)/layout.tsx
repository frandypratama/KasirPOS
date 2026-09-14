import { useAuth } from '@/components/auth/Auth-provider';
import ProtectedRoute from '@/components/auth/Protected-route';
import SideBar from '@/components/layouts/SideBar';
import React from 'react';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen lg:flex '>
      <SideBar />
      <main className='min-w-0 flex-1 p-4 sm:p-6 lg:p-8'>
        <ProtectedRoute>{children}</ProtectedRoute>
      </main>
    </div>
  );
}

export default DashboardLayout;
