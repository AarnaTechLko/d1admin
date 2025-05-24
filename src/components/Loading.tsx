import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white-100">
      <div className="flex">
        {/* Logo with zigzag animation */}
        <div className="logo-container">
          <img
            src="/logo.png" // Replace with your logo URL
            alt="Logo"
            className="logo animate-zigzag"
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
