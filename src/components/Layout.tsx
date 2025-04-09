import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#0A0B14]">
      <Navbar />
      <main className="content-container pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
