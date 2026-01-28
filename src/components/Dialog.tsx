import type React from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="max-h-full w-full flex items-center justify-center" 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Dialog;