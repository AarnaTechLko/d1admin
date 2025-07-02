import React from 'react';
import Image from 'next/image';
import logo1 from "@/public/images/logo1/logo.webp";

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="flex">
        {/* Logo with bounce or custom animation */}
        <div className="animate-bounce">
          <Image
            src={logo1}
            alt="Logo"
            width={150}
            height={150}
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
