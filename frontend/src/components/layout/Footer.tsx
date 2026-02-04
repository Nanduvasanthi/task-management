import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Task Management. All rights reserved.</p>
        <p className="text-gray-400 mt-2">A simple and effective task management application</p>
        <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-400">
          <a href="/" className="hover:text-white">Home</a>
          <a href="/login" className="hover:text-white">Login</a>
          <a href="/register" className="hover:text-white">Register</a>
          <a href="/dashboard" className="hover:text-white">Dashboard</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
