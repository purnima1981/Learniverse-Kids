import React from 'react';

export default function LearniverseIllustration() {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4">
      <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
        <div className="rounded-md overflow-hidden">
          <img 
            src="/src/assets/illustration-1.png" 
            alt="Student learning math" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
        <div className="rounded-md overflow-hidden">
          <img 
            src="/src/assets/illustration-2.png" 
            alt="Student learning astronomy" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
        <div className="rounded-md overflow-hidden">
          <img 
            src="/src/assets/illustration-3.png" 
            alt="Student learning geography" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
        <div className="rounded-md overflow-hidden">
          <img 
            src="/src/assets/illustration-4.png" 
            alt="Student learning history" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}