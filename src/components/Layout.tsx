import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-dvh relative w-full flex flex-col gap-4 items-center justify-center p-2 overflow-hidden">
      <div className="h-full w-full flex items-center justify-center overflow-hidden">
        {children}
      </div>
      <div className="flex md:hidden">
        TODO: mobile menu
      </div>
    </div>
  );
};

export default Layout;