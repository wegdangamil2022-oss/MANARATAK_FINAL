import React from 'react';

interface PhoneContainerProps {
  children: React.ReactNode;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 w-full flex flex-col text-right selection:bg-[var(--mn-accent)]/30">
      {children}
    </div>
  );
};
