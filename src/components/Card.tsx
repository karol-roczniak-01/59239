import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div className={twMerge("md:w-sm w-full h-fit max-h-full flex flex-col border-primary border", className)}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <div className={twMerge("shrink-0 p-2 border-b border-primary", className)}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className }: CardContentProps) => {
  return (
    <div className={twMerge("overflow-auto flex-1 min-h-0 p-2", className)}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className }: CardFooterProps) => {
  return (
    <div className={twMerge("shrink-0 p-2 border-t border-primary", className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };