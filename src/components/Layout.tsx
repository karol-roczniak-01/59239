import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { useNavigate } from "@tanstack/react-router";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    window.history.back();
  };

  const handleForward = () => {
    window.history.forward();
  };

  const handleHome = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="h-dvh relative w-full flex flex-col gap-4 items-center justify-center p-2 overflow-hidden">
      <div className="h-full w-full flex items-center justify-center overflow-hidden">
        {children}
      </div>
      <div className="md:hidden grid grid-cols-3 border w-full">
        <Button 
          onClick={handleBack}
          className="border-none"
          aria-label="Go back"
        >
          <ChevronLeft size={16}/>
        </Button>
        <Button 
          onClick={handleHome}
          className="border-none"
          aria-label="Go home"
        >
          <Home size={16}/>
        </Button>
        <Button 
          onClick={handleForward}
          className="border-none"
          aria-label="Go forward"
        >
          <ChevronRight size={16}/>
        </Button>
      </div>
    </div>
  );
};

export default Layout;