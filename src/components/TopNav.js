import React from 'react';

const TopNav = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Memory Scrapbook</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, User!</span>
          </div>
        </div>
      </div>
  );
};

export default TopNav;
