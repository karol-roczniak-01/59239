import { useMatches, Link, useLocation } from "@tanstack/react-router";

const Path = () => {
  const location = useLocation();

  // Build breadcrumb items from current pathname
  const segments = location.pathname.split("/").filter(Boolean);
  
  // Create array of breadcrumb items
  const breadcrumbs = [
    { pathname: "/", label: "Home", depth: 0 }
  ];

  // Build full path for each segment
  segments.forEach((segment, index) => {
    const pathname = "/" + segments.slice(0, index + 1).join("/");
    breadcrumbs.push({
      pathname,
      label: segment,
      depth: index + 1
    });
  });

  return (
    <div className="absolute z-20 top-2 left-2 flex-col gap-0 hidden md:flex">
      {breadcrumbs.map((item) => {
        const isActive = location.pathname === item.pathname;

        return (
          <Link
            key={item.pathname}
            to={item.pathname as any}
            className="text-sm capitalize hover:underline"
            disabled={isActive}
            style={{ 
              opacity: isActive ? 0.5 : 1,
              cursor: isActive ? "not-allowed" : "pointer",
              pointerEvents: isActive ? "none" : "auto",
              paddingLeft: `${item.depth * 6}px`
            }}
          >
            {item.depth > 0 && "└─ "}{item.label}
          </Link>
        );
      })}
    </div>
  );
};

export default Path;
